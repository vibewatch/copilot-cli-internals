# Latest subsystem and module review

> This rolling review is regenerated when the weekly updater detects a package transition. Each package root, module entrypoint, or new multi-member event/RPC namespace must be classified before a fully automated update PR can be considered complete.

Generated: `2026-07-20T01:29:40.359Z`

Package transition: `1.0.54` -> `1.0.71`

## Candidate 1: `package-root:assets`

- Kind: `package-root`
- Evidence: `assets/copilot.png` is loaded as the default native canvas-window icon.
- Decision: `not-a-subsystem`
- Documentation: N/A
- Source confirmation: `Ufi()` in `app.js` ~4402 searches package asset paths; the directory contains presentation data, not an independent lifecycle.

## Candidate 2: `package-root:builtin`

- Kind: `package-root`
- Evidence: Contains `customize-cloud-agent/SKILL.md` packaged prompt content.
- Decision: `not-a-subsystem`
- Documentation: N/A
- Source confirmation: The file is a packaged skill/instruction artifact; skill loading and invocation are already covered, and no separate runtime manager is introduced by this root.

## Candidate 3: `package-root:napi-oop-runtime`

- Kind: `package-root`
- Evidence: Package-local `napi-oop-runtime` `1.0.9`, `COPILOT_RUNTIME_OOP`, `NAPI_OOP_SOCKET`, manifest binding, sync worker, callbacks, and handle finalization.
- Decision: `new-page`
- Documentation: [Out-of-process native runtime bridge](../01-runtime-lifecycle/out-of-process-native-runtime.md)
- Source confirmation: `app.js` ~15-63 selects `$st()` instead of `runtime.node`; the vendored `dist/index.js` implements protocol version 1, framed MessagePack peer calls, platform endpoints, worker/Atomics synchronization, callbacks, and cleanup.

## Candidate 4: `package-root:sea-loader.js`

- Kind: `package-root`
- Evidence: Recovered SEA main loader now exists beside the expanded package.
- Decision: `existing-page`
- Documentation: [Loader and bootstrap workflows](../01-runtime-lifecycle/loader-bootstrap.md)
- Source confirmation: `sea-loader.js` selects/extracts cached package versions and imports package `index.js`; it extends the existing loader chain rather than creating a separate reader-facing subsystem.

## Candidate 5: `package-root:tgrep`

- Kind: `package-root`
- Evidence: Packaged `tgrep` `0.1.21` binary plus feature/eligibility, index, server, status, telemetry, and ripgrep fallback paths in `app.js`.
- Decision: `new-page`
- Documentation: [Indexed repository search with tgrep and ripgrep](../03-tools-integrations-security/indexed-search-tgrep-and-ripgrep.md)
- Source confirmation: `app.js` ~122-124, ~5040, and ~5781 implement repository thresholds, virtual-filesystem exclusions, `serve`/`status`, warm start, incremental indexing, restart limits, and fallback beneath the existing grep tool.

## Candidate 6: `package-root:voice-engine.worker.js`

- Kind: `package-root`
- Evidence: New worker entrypoint used by the current voice engine client/server architecture.
- Decision: `existing-page`
- Documentation: [Voice runtime server and transcription pipeline](../01-runtime-lifecycle/voice-runtime-workers-and-transcription.md)
- Source confirmation: The voice runtime page documents the current dedicated engine boundary and distinguishes it from the removed microphone/Foundry worker layout.

## Candidate 7: `package-root:voice-server.js`

- Kind: `package-root`
- Evidence: Dedicated local voice server selected by `COPILOT_VOICE_SERVER_MODE` and reached over a version/user-scoped endpoint.
- Decision: `existing-page`
- Documentation: [Voice runtime server and transcription pipeline](../01-runtime-lifecycle/voice-runtime-workers-and-transcription.md)
- Source confirmation: `app.js` ~4402-4404 and `voice-server.js` expose the connect-or-spawn, framed RPC, lifecycle, and cleanup already owned by the voice runtime page.

## Candidate 8: `package-root:webview`

- Kind: `package-root`
- Evidence: Empty resolver anchor plus adjacent native `@webviewjs/webview` package used by local canvas windows.
- Decision: `existing-page`
- Documentation: [MCP Apps and canvas bridge](../03-tools-integrations-security/mcp-apps-and-canvas-bridge.md)
- Source confirmation: `app.js` ~4402 (`Ffi`, `Ofi`, `Dfi`, window manager) implements platform gating, temporary WebContext data, per-session/instance windows, reconnect state, close RPC, and cleanup as the local canvas renderer.

## Candidate 9: `package-module:copilot-sdk/toolSet.d.ts`

- Kind: `package-module`
- Evidence: Public `ToolSet` builder and `BuiltInTools.Isolated` contract exported from the SDK.
- Decision: `existing-page`
- Documentation: [Copilot SDK extension bridge](../03-tools-integrations-security/copilot-sdk-extension-bridge.md)
- Source confirmation: `copilot-sdk/index.d.ts` exports the builder; `types.d.ts` accepts it for `availableTools`/`excludedTools`; `toolSet.d.ts` defines source-qualified built-in/MCP/custom filters and the isolated-tool contract.

## Candidate 10: `package-module:definitions/sidekick/`

- Kind: `package-module`
- Evidence: New `session-search`, `cloud-session-search`, and `github-context-memory` definitions and feature gates.
- Decision: `existing-page`
- Documentation: [Memory and dynamic context board](../02-context-model-loop/memory-and-context-board.md)
- Source confirmation: The YAML definitions share the existing sidekick manager/inbox lifecycle but add local/cloud prior-session retrieval and memory-change triggers; `app.js` ~124, 608, and 2757 resolves their gates and tool availability.

## Decision contract

- `new-page` means a distinct lifecycle, entrypoint, state model, protocol, or trust boundary received focused source-anchored documentation.
- `existing-page` means the candidate materially extends the linked owning subsystem page.
- `not-a-subsystem` means the path is package content or presentation data without an independent runtime lifecycle.
