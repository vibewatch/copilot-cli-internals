# Indexed repository search with tgrep and ripgrep

Copilot CLI `1.0.71` can place an indexed `tgrep` backend beneath its existing grep/search tools for sufficiently large repositories. The model does not receive a separate `tgrep` tool. Tool schemas and result handling stay stable while the runtime starts an index server, waits for readiness, selects the executable, injects the index path, and falls back to ripgrep whenever the indexed path is ineligible or unhealthy.

This page documents that backend lifecycle. It is separate from session-store SQLite/FTS indexing, which indexes conversation history rather than repository source files.

## Source anchors

| Area | Semantic alias | Exact/minified anchor | Current location | Role |
|---|---|---|---|---|
| Feature assignment | tgrep experiment | `TGREP = "copilot_cli_tgrep"` | `sdk/index.d.ts` ~6283; `app.js` ~124 | Enables indexed search unless an environment override decides otherwise. |
| Environment controls | Backend overrides | `USE_TGREP`, `USE_TGREP_WARM_START`, `USE_BUILTIN_RIPGREP` | `app.js` ~122, ~5307, ~5781 | Forces/disables indexed startup, controls warm start, or selects PATH ripgrep. |
| Index path | Repository-keyed index | `TMe(...)`, `tgrep-index`, SHA-256 prefix | `app.js` ~122 | Stores each repository index beneath the Copilot cache root. |
| Eligibility | Startup decision | `tgrep skipped: ...`, `count-files`, `kJ` | `app.js` ~122 | Applies gate, git-root, virtual-filesystem, file-count, and force rules. |
| Server process | Index server manager | `Bpt(...)`, `tgrep serve` | `app.js` ~122-124 | Starts or reuses the persistent server and parses incremental-index trace output. |
| Readiness polling | Status probe | `EMe(...)`, `status --index-path` | `app.js` ~124 | Classifies server-not-running, indexing, ready, or unknown with a four-second probe timeout. |
| Search backend choice | Executable selector | `cde()` | `app.js` ~124 | Uses tgrep only when the index is ready and the active search is inside the indexed root. |
| Search argument bridge | Index argument adapter | `$R(...)`, `--index-path` | `sdk/index.js` ~96 | Adds the index path only for compatible grep invocations. |
| Telemetry | Startup/index/server events | `tgrep_startup`, `tgrep_incremental_indexing`, `tgrep_server_error` | `app.js` ~5040 | Records eligibility, latency, file counts, index changes, and server failures. |
| Packaged binary | Indexed grep engine | `tgrep` `0.1.21` | `tgrep/bin/linux-x64/tgrep` | Exposes `index`, `serve`, `search`, `status`, and `count-files` commands. |

## Why tgrep is not another model tool

The model-facing grep/search tool continues to accept familiar pattern, path, glob, output-mode, and context arguments. Runtime helpers choose a backend and adapt compatible ripgrep-style arguments.

```mermaid
flowchart TD
    Tool[Model calls grep/search tool] --> Eligible{tgrep ready and query compatible?}
    Eligible -->|yes| Args[Inject --index-path]
    Args --> Tgrep[tgrep binary]
    Eligible -->|no| Ripgrep[bundled or PATH rg]
    Tgrep --> Shape[Common grep result shaping]
    Ripgrep --> Shape
    Shape --> Policy[Content exclusion / large output / telemetry]
    Policy --> Model[Model-visible result]
```

This keeps permission, content-exclusion, timeout, large-output, and event behavior in the existing grep tool pipeline. Backend selection is an implementation detail unless operators inspect logs or telemetry.

## Eligibility and startup decisions

The startup manager evaluates the repository before launching an index server.

| Check | Behavior when not forced |
|---|---|
| `USE_TGREP=false` | Skip with disabled reason `use_tgrep_false`. |
| TGREP feature assignment false | Skip with disabled reason `feature_flag_false`. |
| No Git root | Skip with `skipped_no_gitroot`. |
| Virtual/network filesystem | Skip to avoid unsuitable watcher/index behavior. |
| `count-files` failure | Record startup failure and use ripgrep. |
| Below file threshold | Skip: fewer than `50,000` files on non-Windows or `10,000` on Windows. |

`USE_TGREP=true` is a force override. It bypasses the feature assignment, git-root requirement, virtual-filesystem exclusion, and normal size threshold after the runtime can resolve/count the working tree.

Virtual filesystem detection includes `.gvfs`, WSL UNC paths on Windows, and filesystem type IDs mapped to 9p, hostfs, VirtualBox shared folders, VMware shared folders, SMB, and CIFS.

## Repository-keyed index storage

`TMe(...)` canonicalizes the repository path, hashes it with SHA-256, truncates the digest to 16 hexadecimal characters, and places the result under:

```text
<Copilot cache home>/tgrep-index/<repo-hash>/
```

The index is therefore shared by CLI sessions for the same canonical root and survives a normal session restart. The packaged binary advertises index files such as metadata, file lists/stamps, trigram data, lookup data, a server lock, and staging directories.

This cache is unrelated to `session-store.db`; deleting one does not delete the other.

## Server startup and reuse

For an eligible root, the runtime starts:

```text
tgrep serve . --index-path <cache>/tgrep-index/<repo-hash> --exclude .git
```

The process is attached to the CLI manager rather than detached. stdout/stderr lines are logged and inspected for two important signals:

- another server already owns the index directory, in which case the new process exits and the runtime reuses the existing server;
- `[trace] stale check` records, which are converted into incremental-index telemetry.

A prior manager instance is disposed before a new root/startup attempt takes ownership. The server process also maintains a filesystem watcher unless the binary is run with its own `--no-watch` option; the CLI invocation shown above does not set that option.

## Readiness and warm start

`EMe(...)` runs a status probe with a four-second timeout:

```text
tgrep status --index-path <index> .
```

Output becomes one of:

| State | Detection |
|---|---|
| `server-not-running` | Status says the server is not running. |
| `in-progress` | Status reports indexed and total file counts. |
| `ready` | Status says indexing is complete. |
| `unknown` | Output is unrecognized, command errors, or the probe times out. |

The manager polls every five seconds with an unreferenced timer. Without warm start it can return while indexing continues; tgrep becomes selectable only after status reaches `ready`.

With `USE_TGREP_WARM_START=true`, startup waits until the index is ready, the server fails, or the manager is stopped. This trades startup latency for having indexed search available on the first eligible query.

## Search selection

`cde()` selects the tgrep executable only when all of these remain true:

- `USE_BUILTIN_RIPGREP` is not `false`;
- `USE_TGREP` is not `false`;
- the server has not suffered a fatal/abnormal failure;
- the index is ready;
- the current search root is inside the indexed repository root.

The argument adapter also rejects incompatible grep modes, including file-list requests and cases where the index cannot represent the requested root/glob combination. Those calls continue through ripgrep.

Setting `USE_BUILTIN_RIPGREP=false` selects `rg` from `PATH` and intentionally prevents tgrep selection. Otherwise fallback uses the packaged ripgrep binary.

## Failure, restart, and fallback

```mermaid
stateDiagram-v2
    [*] --> Ineligible
    Ineligible --> Starting: eligibility passes
    Starting --> Indexing: server starts or existing server reused
    Indexing --> Ready: status reports complete
    Ready --> RipgrepFallback: abnormal exit or kill
    Indexing --> Restarting: server disappears without fatal process signal
    Restarting --> Indexing: restart succeeds
    Restarting --> RipgrepFallback: restart limit reached
    RipgrepFallback --> [*]
```

Observed behavior:

- spawn errors produce `failed` startup and tgrep remains unavailable;
- an abnormal exit code or signal marks the backend failed and immediately disables indexed selection for the process, with logs explicitly mentioning likely OOM kills;
- disappearance of a previously running/reused server can trigger restart attempts;
- restart attempts are capped at three;
- after fatal failure or restart exhaustion, searches use ripgrep instead of repeatedly restarting the indexer;
- disposal stops the process owned by the current manager and clears polling/startup state.

The `1.0.69` changelog describes the same operational goal: bound indexer memory on large monorepos and fall back to ripgrep when the process is killed.

## Resource behavior inside the binary

The packaged `tgrep` binary advertises a bounded initial build:

- `--max-memory`: defaults to 50% of physical RAM, clamped between 512 MB and 16 GB;
- `--max-cpu`: defaults to 50% of logical cores;
- incremental flushes can move index state to disk when memory pressure grows.

The current CLI `serve` invocation relies on those binary defaults rather than passing explicit memory/CPU values.

## Telemetry

| Event | Important fields |
|---|---|
| `tgrep_startup` | outcome, forced-by-env, warm-start, disabled reason, eligibility, file count, startup duration, restricted error text. |
| `tgrep_incremental_indexing` | phase, changed/added/deleted counts, walk/update/total durations. |
| `tgrep_server_error` | error type, exit code, restricted error message. |

These events make backend behavior observable without changing the tool result returned to the model.

## Operational controls and caveats

- `USE_TGREP=false` is the direct troubleshooting escape hatch.
- `USE_TGREP=true` can force startup, but it cannot make a missing/broken binary or failed file count succeed.
- `USE_TGREP_WARM_START=true` may noticeably extend startup while indexing completes.
- The checked-in extraction contains the Linux x64 binary because it came from that platform package. Runtime path construction expects matching platform/architecture payloads in other platform packages.
- Search output still passes through existing content-exclusion and large-output handling; indexing does not bypass those controls.
- The binary is packaged code, while most index internals are only observable through its CLI strings and process behavior. Avoid inferring index format compatibility beyond the current package.

## Related docs

- [Built-in tools, execution events, and results](built-in-tools-execution-events.md) explains the common grep tool lifecycle around either backend.
- [Runtime tool assembly and filtering](runtime-tool-assembly-and-filtering.md) explains why backend selection does not create an additional model-visible tool.
- [Content exclusion and redaction](content-exclusion-and-redaction.md) explains filtering after search execution.
- [Feature gates](../05-hosted-agent-ops/feature-gates.md) explains experiment and environment override resolution.
- [Session-store SQLite indexing](../04-sessions-persistence-remote/session-store-sqlite-indexing.md) covers conversation indexing, which is separate from tgrep repository indexing.
