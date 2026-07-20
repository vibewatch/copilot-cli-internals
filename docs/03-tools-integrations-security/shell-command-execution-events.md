# Shell command execution events

Shell execution begins after the generic tool pipeline selects `bash` or `powershell`. In Copilot CLI `1.0.71`, JavaScript coordinates a native `shellManager*` runtime that spawns process-backed commands, tracks sync/async/detached work, buffers large output, sends completion notifications, and shuts down shell sessions.

Read [Built-in tools, execution events, and results](built-in-tools-execution-events.md) for the generic tool lifecycle before the shell callback. Read [Sandbox implementation](sandboxing.md) for MXC policy enforcement. Read [Terminal setup and shell environment](../01-runtime-lifecycle/terminal-setup-and-shell-environment.md) for keyboard/multiline setup, which is intentionally separate from command execution.

The important implementation point is that **terminal setup, shell tool registration, and shell process execution are three different layers**. `/terminal-setup` only configures human input. The current model-visible shell suite is execute/read/stop/list; interactive `write_bash` and `write_powershell` are no longer registered.

| Shell layer | Owned here? | Notes |
|---|---:|---|
| Terminal keybinding setup | no | Runtime lifecycle concern; affects human input only. |
| Shell tool registration | partly | Tool names are assembled in runtime tool assembly; shell manager provides the suite. |
| Process execution | yes | Native process manager, queues, task state, output buffering, and cancellation. |
| Sandbox policy | adjacent | Shell execution calls into sandbox adapters when enabled; detailed policy lives in `sandboxing.md`. |

Because `app.js` is bundled/minified, symbol names are unstable. Line references below are searchable anchors in this extracted build and will shift across releases.

## Source anchors

| Semantic alias | Minified anchor | Approx. `app.js` line | Role |
|---|---|---:|---|
| Shell manager | `Qpe`, `S.shellManagerCreate(...)` | 206 | JS owner for native manager handles, session wrappers, task records, queues, restoration, and notifications. |
| Native lifecycle calls | `shellManagerRestoreDetached`, `shellManagerMarkAsyncShouldNotify`, `shellManagerGetExecution` | 206-213 | Restores and updates native execution state without a JS PTY parser. |
| Shell config | `vy.bash`, `vy.powerShell` | 2574 | Defines execute/read/stop/list names; no current write-input tool name is present. |
| Tool assembly | `s.getShellTool(...)`, `s.getOtherTools(...)` | 608 | Returns the execute tool plus supporting read/stop/list tools. |
| Sandbox process adapter | `rde(...)`, `S.sandboxBuildPolicy(...).spawn(...)` | 122 | Spawns through native sandbox policy and adapts native stdout/stderr/stdin handles to Node streams. |
| Session shell RPC | `session.shell.exec`, `session.shell.kill` | 167 | Exposes controlled shell execution to SDK/server session clients. |
| Task restoration | `restoreDetachedExecutions()` | 206 | Rehydrates detached shell records from `TaskRegistry` and native manager state. |

## Current 1.0.71 execution model

```mermaid
flowchart TD
    Tool["bash / powershell"] --> JS[Qpe shell context]
    JS --> Native[shellManager native handle]
    Native --> Sandbox{sandbox enabled?}
    Sandbox -->|yes| Policy[sandboxBuildPolicy.spawn]
    Sandbox -->|no| Process[lightweight process spawn]
    Policy --> Streams[stdout / stderr / stdin adapters]
    Process --> Streams
    Streams --> Buffer[large-output buffer]
    Native --> Tasks[TaskRegistry + detached restoration]
    Tasks --> Notify[completion notification]
```

The shell config constructors now carry four model-visible names per shell family:

| Shell | Execute | Read | Stop | List |
|---|---|---|---|---|
| Bash | `bash` | `read_bash` | `stop_bash` | `list_bash` |
| PowerShell | `powershell` | `read_powershell` | `stop_powershell` | `list_powershell` |

Release `1.0.62` switched command execution to lightweight process spawning and removed interactive input via `write_bash`. Strings such as `write_bash` remain in event-display and compatibility parsing code, but the current shell config and tool factory do not expose them to the model.

Sync commands can still exceed `initial_wait` and move to background; async and detached commands remain tracked with shell IDs, PIDs, output state, and completion notifications. `restoreDetachedExecutions()` reconstructs detached records after a context rebuild, while native manager generation checks reject stale JS contexts after reconfiguration.

Sandboxed commands use the same process-oriented model. `rde(...)` asks the native sandbox policy to spawn, adapts its handles to Node streams, emits sandbox telemetry, and kills a partially created process if setup fails.

## Historical 1.0.54 PTY/process implementation

The remaining sections preserve the previous dual-backend design for package-delta research. They are not the active `1.0.71` architecture: the PTY branch and model-visible write-input tools described below were removed in `1.0.62`.

### Historical runtime assembly

Shell tools are assembled lazily from the session tool configuration. The assembly path around `Wjs(...)` checks whether `toolConfig.shellContext` already exists. If not, it builds one and stores it back on the config so later tool initialization shares the same shell context.

```mermaid
flowchart TD
    ToolInit[Tool initialization] --> Existing{"shellContext already exists?"}
    Existing -->|yes| Reuse[Reuse existing ShellToolManager]
    Existing -->|no| Config[Resolve shellConfig or default Bash]
    Config --> Backend{"sandbox disabled and SHELL_SPAWN_BACKEND enabled?"}
    Backend -->|yes| ProcessFactory[Non-TTY process session factory]
    Backend -->|no| PtyFactory[Interactive PTY session factory]
    ProcessFactory --> Manager[Create shell manager]
    PtyFactory --> Manager
    Manager --> Tools[Return shell/read/write/stop/list tools]
```

Backend selection has two notable consequences:

| Backend | Capability flags | Consequence |
|---|---|---|
| Interactive PTY (`dve`) | `ttySupport: true`, `terminalInput: true` | Exposes the write-input tool, can keep shell state across async commands, and supports interactive programs. |
| Process spawn (`hCt`) | `ttySupport: false`, `terminalInput: false` | Runs each command in a fresh child process, omits the write-input tool, and warns that shell state does not persist. |

The non-TTY backend is only selected when sandboxing is disabled and the `SHELL_SPAWN_BACKEND` feature flag is enabled. When sandboxing is enabled, the shell path stays on the PTY/session factory because the sandbox adapter lives on that branch.

### Historical tool suite

The shell manager generates a small family of tools from the active `ShellConfig`.

| Shell type | Execute | Read | Write | Stop | List |
|---|---|---|---|---|---|
| Bash | `bash` | `read_bash` | `write_bash` | `stop_bash` | `list_bash` |
| PowerShell | `powershell` | `read_powershell` | `write_powershell` | `stop_powershell` | `list_powershell` |

`write_*` is only emitted when the backend advertises `terminalInput: true`. `read_*`, `stop_*`, and `list_*` are emitted for both backends.

The execute tool schema includes:

| Field | Meaning |
|---|---|
| `command` | Shell command text. |
| `description` | Short human-readable summary used for task lists and notifications. |
| `shellId` | Optional identifier for an async session. Reusing a shell ID reuses the session when the backend supports it. |
| `mode` | `sync` by default, or `async` for background execution. |
| `detach` | Optional async-only path that starts a fully detached process and logs output to a file. |
| `initial_wait` | Sync wait budget in seconds before a still-running command is moved to background. |

### Historical main execution flow

The shell manager serializes work per `shellId` with an execution queue. This prevents two commands from being injected into the same shell at the same time.

```mermaid
sequenceDiagram
    participant Model
    participant Tool as Shell tool callback
    participant Queue as Per-shell queue
    participant Manager as Shell manager
    participant Session as Shell session
    participant Tasks as TaskRegistry
    participant UI as UI/system events

    Model->>Tool: command, description, mode, shellId, initial_wait
    Tool->>Queue: enqueue by shellId
    Queue->>Manager: executeShellToolCallback
    Manager->>Session: getOrCreateSession(cwd, shellId)
    Manager->>Tasks: register/update shell task
    alt async + detach
        Manager->>Session: tryExecuteDetachedCommand(command, logPath)
        Session-->>Manager: spawned and released
        Manager->>Tasks: detached shell task with logPath
    else async attached
        Manager->>Session: tryExecuteAsyncCommand(command)
        Session-->>Manager: shellId and initial output
        Manager->>Tasks: running attached background task
    else sync
        Manager->>Session: executeCommand(command, initial_wait)
        alt completed before timeout
            Session-->>Manager: output + exitCode
            Manager->>Manager: shutdown sync session
        else timeout or user promotion
            Manager->>Tasks: mark as background + retain task
            Session-->>Manager: shell remains attached
        end
    end
    Session-->>UI: partial output / completion callbacks
```

The task state stored by the manager includes the command text, description, execution mode, started/completed timestamps, PID, status, notification preference, and whether the task should remain visible after completion.

### Historical sync, async, promotion, and detach

The shell tool has four materially different behaviors.

| Mode | Attachment | Session behavior | Task behavior |
|---|---|---|---|
| `sync` completes before `initial_wait` | Attached | Runs command, reads final output, then shuts down sync session. | Usually removed from active shell tasks after completion. |
| `sync` exceeds `initial_wait` | Attached | Leaves command running in the session. | Converts to background shell task and may notify on completion. |
| `sync` promoted by user | Attached | Resolver returns early with a model-hidden "moved to background" message. | Marks the same task as background and retained. |
| `async` | Attached | Starts command and returns a `shellId`; session remains available for `read_*`, `write_*`, and `stop_*`. | Registered as running background shell task. |
| `async` + `detach` | Detached | Starts an independent OS process, writes PID/log files, then releases session resources. | Registered as detached task with `logPath`; progress is read from the log file. |

The promotion path is implemented with `promotableSyncShells` and `syncShellPromotionResolvers`. The session-level background-task APIs consult shell promotion first-class alongside agent task promotion, which is why a timed-out or promoted command can appear in the same UI surface as a background subagent.

### Historical interactive PTY backend

The PTY-backed session keeps a real shell process alive and wraps each command with markers.

```mermaid
flowchart TD
    Create[Create PTY shell] --> Init[Initialize shell environment]
    Init --> Wrap[Wrap command with output and done markers]
    Wrap --> Send[Send command text to PTY]
    Send --> Xterm[xterm parser normalizes terminal output]
    Xterm --> Buffer[Large-output buffer]
    Buffer --> Read[readOutput]
    Read --> Marker{"done marker observed?"}
    Marker -->|no| Poll[Continue polling / allow read tool]
    Marker -->|yes| Result[Return output and exit code]
```

Observed implementation details:

- The session uses an xterm `Terminal` object with zero scrollback to parse terminal data and respond to terminal control queries.
- Raw ANSI sequences are stripped/normalized before appending model-visible output.
- Commands are wrapped with a printed-output marker and a `___BEGIN___COMMAND_DONE_MARKER___<exitCode>` completion marker.
- The output buffer ignores shell preamble before the printed-output marker and ignores content after the done marker.
- PowerShell receives a small initialization profile that simplifies the prompt and sets UTF-8 output defaults.
- Bash initialization clears prompts and history state; in non-interactive profile mode it can source `BASH_ENV` before clearing prompt variables.
- `write_*` uses `trySendInput(...)` and converts text or key notation into terminal input, then `read_*` retrieves the resulting output.
- On Windows shutdown, a running PTY command triggers a process-tree kill through `taskkill.exe`; otherwise the PTY process is killed directly.

The PTY backend is the only path that can support interactive command-line programs because it owns a TTY and can send input after the command starts.

### Historical non-TTY process backend

The process backend is a separate session implementation. It spawns a new child process for each command instead of injecting commands into a long-lived TTY.

```mermaid
flowchart TD
    Execute[executeCommand] --> Spawn[spawn child process]
    Spawn --> Stdout[stdout pipe]
    Spawn --> Stderr[stderr pipe]
    Stdout --> Buffer[Large-output buffer]
    Stderr --> Buffer
    Spawn --> Exit[exit/close event]
    Exit --> Complete[buildOutput + commandCompleteCallback]
```

Key differences from the PTY backend:

- `trySendInput(...)` always returns false, so no write-input tool is exposed.
- Bash commands are run as `bash --norc --noprofile -c <command>` using the shell config process flags.
- PowerShell commands are run with `-NonInteractive -Command` and wrapper logic that maps `$?`/`$LASTEXITCODE` to the process exit code.
- stdout and stderr are appended into the same output buffer.
- Partial-output callbacks are throttled to roughly 100 ms.
- On Unix shutdown, the runtime sends `SIGTERM` to the process group and follows with `SIGKILL` after 5 seconds.

This backend is useful for simpler, isolated command execution. It is less suitable for commands that require shell state, REPL input, TTY control, or follow-up interaction.

### Historical large output handling

Both shell backends use the same `BW` output buffer. The buffer starts in memory and switches to a temp file when output exceeds the configured threshold.

```mermaid
flowchart TD
    Output[Command output chunk] --> Threshold{"under maxOutputSizeBytes?"}
    Threshold -->|yes| Memory[Append to memory buffer]
    Threshold -->|no| File[Switch to temp file]
    File --> Preview[Maintain preview/tail]
    Memory --> Snapshot[readOutput/buildOutput]
    Preview --> Snapshot
    Snapshot --> Result{"large output?"}
    Result -->|no| Inline[Return full output]
    Result -->|yes| Saved[Return preview + largeOutputFilePath + total bytes]
```

The formatter reports that output was saved and suggests using grep/read tools against the saved file. For detached commands, the primary long-running output location is the detached log file (`copilot-detached-<shellId>-<timestamp>.log`) plus a sibling `.pid` file.

### Historical read, write, stop, and list tools

The supporting shell tools are thin adapters over manager/session state.

| Tool | Main behavior |
|---|---|
| `read_*` | Waits for `delay`, reads output from an attached session, or reads detached progress from the log path. Invalid delay values are rejected. |
| `write_*` | Sends input to a running attached PTY session, then reads output after a delay. Not available for non-TTY backend. |
| `stop_*` | Stops an attached session by shutting down the shell, or cancels a detached task by using its registered PID/log metadata. |
| `list_*` | Lists active shell sessions/tasks with shell ID, command, mode, PID, status, attachment mode, and unread-output hints. |

The manager tracks three overlapping views:

| State map/set | Meaning |
|---|---|
| `sessions` | Live shell session objects keyed by shell ID. |
| `currentExecutions` | Commands currently running or recently completed in attached sessions. |
| `detachedSessions` | Shell IDs whose command was detached and no longer has an attached session. |
| `retainedAttachedShellTasks` | Completed attached tasks that remain visible because they were async, timed out, or promoted. |
| `recentShutdowns` | Short-lived diagnostics for explaining later read/stop attempts against a missing shell ID. |

### Historical completion notifications

When background-task notifications are enabled, the manager wires a command-completion callback into each session. Completion updates the tracked task and can trigger a model-visible system notification such as `shell_completed` or `shell_detached_completed` through the broader session event/UI projection path.

The important nuance is that notifications are tied to task state, not to polling. A background command can finish without the model repeatedly calling `read_*`; the next turn can include a system notification telling the model that output is ready.

### Historical error classification

The manager does more than return "shell not found." For read/stop/list operations it classifies missing or stopped shells using recent shutdown information.

Examples of categories include:

- unknown shell ID;
- shell was recently shut down after completion;
- shell was shut down because of an error or cancellation;
- detached task has log/PID state instead of a live attached session.

The classification result becomes both a model-visible error message and telemetry fields such as `shell_error_category`, `shell_operation`, and a restricted diagnostic summary.

### Related docs

- [`built-in-tools-execution-events.md`](built-in-tools-execution-events.md) explains the generic tool lifecycle surrounding shell callbacks.
- [`terminal-setup-and-shell-environment.md`](../01-runtime-lifecycle/terminal-setup-and-shell-environment.md) explains terminal keybinding setup and why it is separate from command execution.
- [`sandboxing.md`](sandboxing.md) explains native sandbox policy construction and process spawning.
- [`system-events-and-ui-projection.md`](../04-sessions-persistence-remote/system-events-and-ui-projection.md) explains shell completion system events.
- [`agent-task-orchestration.md`](../06-agents-automation/agent-task-orchestration.md) explains how shell tasks are projected next to background agent tasks.