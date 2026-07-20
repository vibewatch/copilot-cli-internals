# Voice runtime server and transcription pipeline

This document drills into the voice backend below [`voice-mode-foundry-local.md`](voice-mode-foundry-local.md). In Copilot CLI `1.0.71`, the interactive process is a client of a reusable local voice server. Microphone capture and Foundry transcription are no longer shipped as `voice-mic.worker.js` and `voice-foundry.worker.js`; those files existed in the `1.0.54` baseline and are preserved later on this page only as historical context.

The current package splits responsibility across:

- `app.js`, which resolves the endpoint, connects or spawns the server, and owns TUI state;
- a detached CLI child running in `COPILOT_VOICE_SERVER_MODE`;
- the native runtime boundary used by the voice engine;
- `voice-installer.worker.js` and `foundry-local-sdk`, which still support runtime installation.

Because `app.js` is bundled/minified, line numbers are approximate. Exact strings and semantic aliases are the stable search anchors.

## Source anchors

| Semantic alias | Minified anchor | Approx. location | Role |
|---|---|---:|---|
| Endpoint resolver | `Axn(...)`, `copilot-voice` | `app.js` ~4402 | Builds a version/user-scoped Unix socket or Windows named pipe and PID-file path. |
| Boot sanitizer | `Dyi(...)`, `Myi(...)` | `app.js` ~4404 | Copies only valid voice settings and normalizes device identity to `{ name, occurrence }`. |
| Server spawn | `Txn(...)`, `COPILOT_VOICE_SERVER_MODE` | `app.js` ~4404 | Launches a detached, hidden CLI child with sanitized boot data. |
| Connect or spawn | `kxn(...)` | `app.js` ~4404 | Reuses a live server, retries connection, and recovers from stale PID/socket state. |
| Engine client factory | `Nxn(...)` | `app.js` ~4404 | Selects the dedicated server path or the fallback engine worker path. |
| TUI controller | `Fxn(...)` | `app.js` ~4404 | Starts the engine, subscribes to snapshots/connection state, and shuts it down through the shared shutdown service. |
| Slash command | `voice-models`, `voice-devices`, `voiceActivation` | `app.js` ~2438 | Opens pickers or toggles the engine through the current activation API. |
| Runtime installer | `voice-installer.worker.js`, `foundry-local-sdk` | package worker | Retains the isolated install/update path for local Foundry dependencies. |

## High-level pipeline

```mermaid
flowchart TD
    User[User holds space / toggles dictation] --> UI[TUI voice controller]
    UI --> Endpoint[Axn endpoint + PID file]
    Endpoint --> Existing{live server?}
    Existing -->|yes| Socket[connect over framed JSON-RPC]
    Existing -->|no| Spawn[Txn detached CLI child]
    Spawn --> Socket
    Socket --> Server[copilot-voice engine]
    Server --> Installer[voice-installer worker]
    Server --> Native[native capture and Foundry runtime]
    Native -->|preview/final text| Server
    Server --> UI
```

The split keeps native capture and model work out of the TUI. The endpoint includes the CLI version so incompatible releases do not share a server. The child is detached with ignored stdio and `windowsHide:true`; connection setup then uses a PID file plus bounded retries to distinguish a slow start from stale state.

The boot payload deliberately avoids forwarding the entire settings object. `Dyi(...)` preserves only `enabled`, `selectedModel`, and a validated `selectedDevice`. Device identity uses a display name plus duplicate-name occurrence index instead of a transient platform device number.

`Fxn(...)` tracks the engine client, snapshot, connection state, and fatal error. It registers a pre-shutdown callback, disposes stale connections, and can reacquire an engine after a lost connection.

## Historical 1.0.54 worker architecture

The sections below document the superseded baseline for package-delta research. They do not describe the active `1.0.71` package: `voice-mic.worker.js` and `voice-foundry.worker.js` were removed when capture/transcription moved behind the dedicated engine boundary.

### Historical main-thread controller in app.js

The voice controller created by `qHo(...)` is the runtime coordinator. It keeps a small state machine in React state:

| State | Meaning |
|---|---|
| `off` | No active voice runtime, mic, or Foundry client. |
| `preparing` | Runtime/model checks are in progress before a first activation. |
| `installing` | The installer worker is downloading or updating Foundry Local. |
| `warming` | Runtime is present and the model/mic/client are being opened. |
| `ready` | A selected model is loaded and the mic source is ready for recordings. |
| `error` | Activation or backend operation failed. |

The `enable({ modelId })` path serializes work through an internal promise chain so overlapping enable/disable/select operations do not race. It:

1. chooses the requested model ID or the persisted selected model;
2. calls `installer.inspect()`;
3. maps installer states to `runtime-unsupported`, `runtime-missing`, `runtime-outdated`, or a downloaded `location`;
4. checks whether the selected model exists and is cached through `client.listModels()`;
5. constructs an owned `{ client, mic }` pair when needed;
6. opens the microphone source;
7. warms up the Foundry model with `GHo(...)`;
8. sets state to `ready` and fires the “Voice ready” notification after the first warmup.

When the selected model changes, `qHo(...)` cancels any current recording before switching the active model. On fatal backend failure, it aborts the active controller, moves to `error`, and disposes the owned mic/client pair.

### Historical recording bridge: $Ho(...)

`$Ho(...)` is the short-lived object for one recording. It joins a loaded model handle from `GHo(...)` with the microphone source from `HHo(...)`.

Runtime flow:

1. Open a Foundry transcription session through `modelHandle.openSession(callbacks)`.
2. Ensure the microphone source is open.
3. Set the microphone sink to a callback that receives each PCM `Buffer`.
4. For each PCM chunk:
   - call optional `onPcm`;
   - call `session.append(buffer)`;
   - if append fails while active, unset the sink, surface `onError`, and cancel the session.
5. On `stop()`:
   - unset the sink;
   - call `session.stop()`;
   - deliver the final text through `onFinal`.
6. On `cancel()`:
   - unset the sink;
   - call `session.cancel()`;
   - resolve even if cancel itself fails.

This bridge is where audio becomes model input. Everything above it is UI/setup; everything below it is mic or Foundry worker implementation.

### Historical microphone worker

`voice-mic.worker.js` exposes a tiny RPC backend with four methods:

| Method | Behavior |
|---|---|
| `start({ inputDeviceId })` | Loads `@picovoice/pvrecorder-node`, opens `PvRecorder`, starts the read loop. |
| `stop()` | Cancels startup or stops an active recorder, then releases it. |
| `getState()` | Returns `{ open: false }` for idle/starting/stopping and `{ open: true }` for active. |
| `shutdown()` | Stops the recorder and clears event subscribers. |

The worker state machine is:

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> starting: start(device)
    starting --> active: PvRecorder.start + read loop
    starting --> stopping: stop during startup
    active --> stopping: stop
    active --> idle: read error cleanup
    stopping --> idle: teardown finished
    idle --> [*]: shutdown
```

Important constants and behavior:

- `O=1600` is passed as the `PvRecorder` frame length.
- `C=15` is passed as the recorder buffered-frame/count argument.
- The default device is `-1` when no `inputDeviceId` is supplied.
- Starting a different device while one is starting/active returns `device-busy`.
- Loading failures become `mic-unavailable` errors with a reinstall hint.
- Opening failures stop/release any partially-created recorder before throwing.
- `runReadLoop(...)` repeatedly awaits `recorder.read()`, converts returned PCM into a `Buffer`, and emits `pcm`.
- Read failures stop and release the recorder, reset state to `idle`, and emit an `error` event.

The worker posts PCM as a transferable event:

| Event | Payload |
|---|---|
| `pcm` | `{ buffer, byteOffset, byteLength }`, transferred back to the parent thread. |
| `error` | Serialized `VoiceBackendError` or generic error. |

`app.js` decodes the `pcm` event back into a `Buffer` before handing it to `HHo(...)`.

### Historical runtime installer worker

`voice-installer.worker.js` is responsible for turning “voice runtime is needed” into a concrete native library location.

### Platform and cache resolution

The worker maps supported Node platform/architecture pairs to Foundry runtime IDs:

| Node key | Foundry runtime directory |
|---|---|
| `win32-x64` | `win-x64` |
| `win32-arm64` | `win-arm64` |
| `linux-x64` | `linux-x64` |
| `darwin-arm64` | `osx-arm64` |

Unsupported pairs throw a user-facing “Voice mode is not supported” error. The cache path is:

```text
<COPILOT_CACHE_HOME or default cache root>/foundry/<hash>/<runtime-dir>
```

The `<hash>` is derived from a schema number and the expected Foundry/ONNX artifacts, so a dependency version change moves the runtime to a new cache directory.

### Version audit

The worker requires two upstream Foundry Local files to have the expected shape:

- `foundry-local-sdk/script/install-utils.cjs` must export `runInstall`.
- `foundry-local-sdk/deps_versions.json` must include:
  - `foundry-local-core.nuget`;
  - `onnxruntime.version`;
  - `onnxruntime-genai.version`.

Those checks are defensive source-shape audits. Their error strings explicitly mention re-running the source audit checklist if the upstream SDK layout changes.

### Download and atomic install

Install flow:

1. Check for `.complete` plus required runtime files.
2. If missing, post `download-started` to the parent.
3. Create a sibling temporary directory named like `.tmp-<runtime>-<pid>-<timestamp>`.
4. Run Foundry Local `runInstall(artifacts, { binDir: tmp })` while suppressing stdout/stderr noise.
5. Verify required files exist in the temporary directory.
6. Write the `.complete` sentinel.
7. Rename the temporary directory into the final cache path.
8. If rename collides with an already-complete runtime, delete the temporary directory and reuse the existing install.

On Windows, the returned location also reports whether `Microsoft.WindowsAppRuntime.Bootstrap.dll` exists. The Foundry worker later uses that to add a `Bootstrap` setting when creating the manager.

### Historical Foundry worker

`voice-foundry.worker.js` is the transcription backend. It exposes these RPC methods:

| Method | Behavior |
|---|---|
| `listModels()` | Reads Foundry catalog models and returns ASR variants with cached/model metadata. |
| `downloadModel({ variantId, downloadId })` | Downloads one variant and emits progress. |
| `deleteModel({ variantId })` | Removes a cached model, unless an active session blocks deletion. |
| `loadModel({ variantId })` | Loads a cached model and returns a `modelGeneration`. |
| `openSession({ sessionId, modelGeneration })` | Opens a streaming or batch transcription session for the loaded model. |
| `appendSession({ sessionId, pcm })` | Appends PCM to the active session. |
| `stopSession({ sessionId })` | Stops the session and returns `{ text }`. |
| `cancelSession({ sessionId })` | Cancels and tears down the active session. |
| `shutdown()` | Cancels active work, unloads the selected model, and clears events. |

### Manager and model lifecycle

The worker initializes `FoundryLocalManager.create(...)` with:

- `appName: "github-copilot-cli"`;
- `libraryPath` from the installer result;
- additional settings `{ AzureCatalogFilter: "'',test" }`;
- `Bootstrap: "true"` on Windows when the installer reports that Windows App Runtime bootstrap is needed.

Model state moves through:

```mermaid
stateDiagram-v2
    [*] --> unloaded
    unloaded --> loading: loadModel(variantId)
    loading --> ready: variant.load()
    loading --> unloaded: load failure
    ready --> loading: load different model with no active session
    ready --> unloaded: delete/unload/shutdown
```

The `modelGeneration` number prevents stale UI handles from opening sessions after a model was changed. `app.js` stores the generation returned by `loadModel(...)`; `openSession(...)` rejects with `stale-model` if the currently loaded model no longer matches that generation.

### Streaming vs batch transcription

The worker chooses the transcription mode from the variant alias:

- aliases containing `streaming` use `createLiveTranscriptionSession()`;
- other ASR variants use a temporary WAV file and batch `transcribe(path)`.

Streaming session flow:

1. Create and start the Foundry live transcription session.
2. `appendSession(...)` forwards PCM directly to `foundrySdkSession.append(pcm)`.
3. `runStreamingDrain(...)` reads `foundrySdkSession.getStream()`.
4. Non-final text is appended to `tail`; final text is appended to `committed` and clears `tail`.
5. Each update emits `sessionPreview` with `committed + tail`.
6. `stopSession(...)` calls `foundrySdkSession.stop()` and waits for the drain task, with a timeout.

Batch session flow:

1. Create a temporary file named `voice-foundry-batch-<sessionId>.wav` under `os.tmpdir()` or the configured temp dir.
2. Write a placeholder WAV header.
3. `appendSession(...)` writes PCM chunks and increments data size.
4. `stopSession(...)` finalizes the WAV header.
5. Call `variant.createAudioClient().transcribe(wav.path)` and return `text ?? ""`.
6. Delete the WAV file in `finally`.

Batch mode has no live preview because transcription happens only after the WAV file is finalized.

### Historical main-thread Foundry client wrapper

`cNr` wraps the Foundry worker RPC channel in a main-thread client API:

- `listModels()` forwards `listModels`.
- `downloadModel(variantId, onProgress)` creates a `downloadId`, subscribes to `modelDownloadProgress`, and filters progress by that ID.
- `loadModel(variantId)` returns a handle with `openSession(callbacks)`.
- `dispose()` shuts the worker down and notifies active sessions.

`uNr` is the per-recording session object returned by `openSession(...)`:

| Method/event | Runtime behavior |
|---|---|
| `sessionPreview` event | Delivered as `callbacks.onPreview(text)` while the session is still open. |
| `append(buffer)` | Calls worker `appendSession`; transfers the underlying `ArrayBuffer` when the buffer covers it exactly. |
| `stop()` | Calls worker `stopSession` and delivers `callbacks.onFinal(text)`. |
| `cancel()` | Calls worker `cancelSession`; errors are swallowed because cancel is best-effort cleanup. |
| dispose notification | Marks the session errored and calls `callbacks.onError(...)`. |

This wrapper keeps recording-session state (`open`, `stopping`, `final`, `cancelled`, `errored`) on the main side so UI callbacks cannot fire after terminal states.

### Historical end-to-end dictation sequence

```mermaid
sequenceDiagram
    participant UI as TUI voice keybinding
    participant Hook as qHo controller
    participant Mic as voice-mic.worker.js
    participant Bridge as $Ho recording bridge
    participant Foundry as voice-foundry.worker.js

    UI->>Hook: enable({ modelId })
    Hook->>Foundry: listModels / loadModel
    Hook->>Mic: start(inputDeviceId)
    Mic-->>Hook: pcm events ready
    UI->>Hook: beginRecording(callbacks)
    Hook->>Foundry: openSession(sessionId, modelGeneration)
    Hook->>Bridge: set mic sink
    loop while recording
        Mic-->>Bridge: pcm Buffer
        Bridge->>Foundry: appendSession(sessionId, pcm)
        Foundry-->>UI: sessionPreview(text) for streaming models
    end
    UI->>Bridge: stop()
    Bridge->>Foundry: stopSession(sessionId)
    Foundry-->>UI: final text
```

### Historical failure and cleanup behavior

| Failure point | Handling |
|---|---|
| Runtime unsupported/missing/outdated | `qHo(...)` returns a structured result; `/voice` opens the runtime download/update dialog or reports unsupported platform. |
| Model not selected or not cached | `qHo(...)` returns `no-model-selected` / `model-not-cached`; UI opens the model picker. |
| Mic backend missing | `voice-mic.worker.js` returns `mic-unavailable` with a reinstall hint. |
| Mic read error | Worker emits `error`; `qHo(...)` logs a warning and cancels the current recording so the next recording can recover. |
| Append failure | `$Ho(...)` unsets the mic sink, calls `onError`, and cancels the Foundry session. |
| Stale model generation | Foundry worker rejects `openSession` with `stale-model`; main wrapper cleans up the session handle. |
| Streaming drain timeout | `stopStreaming(...)` fails with `session-timeout` after the timeout wrapper. |
| Windows native dependency missing | Foundry manager initialization maps dependency-load errors to a Visual C++ Redistributable message. |
| Shutdown | `qHo.shutdown()` aborts active state, cancels recording, closes mic, disposes Foundry client, and worker shutdown callbacks clear subscribers. |

### Related docs

- [`voice-mode-foundry-local.md`](voice-mode-foundry-local.md) covers `/voice`, settings, model picker, and TUI affordances.
- [`loader-bootstrap.md`](loader-bootstrap.md) covers the secure native-module routing that makes `foundry-local-sdk` and `@picovoice/pvrecorder-node` loadable from the extracted package.
- [`settings-config-persistence.md`](../03-tools-integrations-security/settings-config-persistence.md) covers the settings helpers used to persist `voice.enabled` and `voice.selectedModel`.
- [`telemetry-update-and-shutdown.md`](../05-hosted-agent-ops/telemetry-update-and-shutdown.md) covers the broader shutdown-service pattern that voice uses for Foundry client disposal.