# Hosted agent environment

This page records the confirmed hosted coding-agent runtime contract discovered through a constant-first reverse-engineering pass over `source-atlas/surface-index.json` and the corresponding `copilot-cli-pkg/app.js` anchors. It is the source-anchored internals page for hosted-runtime environment surfaces and the operational contracts they feed.

The scope is narrower than generic feature gates or observability: it explains which high-signal environment variables and provider/client constants form real hosted runtime contracts, and which ones are only allowlist, redaction, forwarding, or bundled-SDK surfaces.

Because `app.js` is bundled and minified, line numbers are approximate anchors for the analyzed bundle. Treat minified names as search handles, not public APIs.

## Source anchors

| File | Approximate lines | Symbol or string | Semantic meaning |
|---|---:|---|---|
| `copilot-cli-pkg/app.js` | `~239` | `_8r=["fix","fix-pr-comment","task"]` | Allowed values for `COPILOT_AGENT_ACTION`. Unknown values are ignored before entering the settings envelope. |
| `copilot-cli-pkg/app.js` | `~239` | `d$`, `TWe()` | Hosted coding-agent settings builder and environment-to-settings envelope. |
| `copilot-cli-pkg/app.js` | `~239` | `Ife`, `Y7`, `R8r(...)` | Secret environment names and non-secret/forwardable environment allowlists used by redaction and child-process environment construction. |
| `copilot-cli-pkg/app.js` | `~4150` | `s7n()` | Parses `COPILOT_AGENT_FIREWALL_LOG_FILE`, redacts secrets, filters repeated or redirected records, and attaches blocked request summaries to trajectory/final output paths. |
| `copilot-cli-pkg/app.js` | `~4207` | `q7n(...)`, `Abt.readMcpConfigFromEnv(...)` | Hosted-agent MCP bootstrap: GitHub MCP headers, default toolsets, user-provided MCP env JSON, and default server injection. |
| `copilot-cli-pkg/app.js` | `~4207` | `hbt`, `Kle(...)`, `rAr(...)` | OIDC token discovery and injection for MCP server configs that reference `GITHUB_COPILOT_OIDC_*`, `GITHUB_AGENTIC_APP_OIDC_*`, or `GITHUB_COPILOT_OIDC_MCP_TOKEN`. |
| `copilot-cli-pkg/app.js` | `~5742` | `Eco()` | OpenTelemetry env resolver for Copilot-specific OTel switches and standard OTLP endpoint detection. |
| `copilot-cli-pkg/app.js` | `~3399` | `L3.fromSSEResponse(...)` | Bundled Anthropic SDK SSE parser accepts managed-agent event families such as `agent.*`, `session.status_*`, and `span.model_request_*`. |
| `copilot-cli-pkg/app.js` | `~3399-3405`, `~4895-4902` | `managed-agents-2026-04-01`, `/v1/agents`, `/v1/environments`, `/v1/memory_stores` | Bundled Anthropic beta client resources for managed agents, environments, memory stores, user profiles, and related streams. |

## Hosted coding-agent settings envelope

`TWe()` constructs a `d$` settings builder from hosted-agent environment variables, then returns `t.build()`. This is the densest constant cluster in the current atlas and is more than a flat env list: it maps CI/job metadata, GitHub repository identity, problem statement, model/provider settings, validation controls, retry policy, and diagnostics into a single runtime settings object.

### GitHub and repository identity

| Environment variable | Settings target or behavior |
|---|---|
| `GITHUB_SERVER_URL`, `GITHUB_HOST`, `GITHUB_HOST_PROTOCOL` | GitHub host metadata; `setGithubServerUrl` can derive host/protocol when not already set. |
| `GITHUB_TOKEN` | Main GitHub token in `settings.github.token`. |
| `GITHUB_REPOSITORY`, `GITHUB_REPOSITORY_ID`, `GITHUB_REPOSITORY_OWNER`, `GITHUB_REPOSITORY_OWNER_ID` | Repository name, id, owner name, and owner id. |
| `COPILOT_AGENT_BRANCH_NAME`, `COPILOT_AGENT_BASE_COMMIT` | Repository branch and commit used by the hosted job. |
| `COPILOT_AGENT_COMMIT_LOGIN`, `COPILOT_AGENT_COMMIT_EMAIL` | Commit author/login metadata. |
| `COPILOT_AGENT_PUSH`, `COPILOT_AGENT_SIGN_COMMITS` | Boolean controls for repository read/write and signing behavior. |
| `COPILOT_AGENT_PR_COMMIT_COUNT` | Parsed integer placed under GitHub PR metadata. |
| `COPILOT_AGENT_ACTOR`, `COPILOT_AGENT_ACTOR_ID` | Actor login and numeric actor id. |

`COPILOT_AGENT_ACTOR_TYPE`, `COPILOT_AGENT_EVENT_URL`, and `COPILOT_AGENT_EVENT_TYPE` appear in the constant/allowlist surface but were not observed as direct `TWe()` settings inputs in this bundle. They should be treated as environment-forwarding or redaction surfaces until a call path proves otherwise.

### Problem and job metadata

| Environment variable | Settings target or behavior |
|---|---|
| `COPILOT_AGENT_PROMPT` | Problem statement. |
| `COPILOT_AGENT_CONTENT_FILTER_MODE` | Problem content filter mode. |
| `COPILOT_CUSTOM_AGENT` | Custom agent name for the problem envelope. |
| `COPILOT_AGENT_ACTION` | Problem action, but only when it is one of `fix`, `fix-pr-comment`, or `task`. |
| `COPILOT_AGENT_JOB_ID` | Service instance id; falls back to a generated UUID when absent. |
| `COPILOT_JOB_NONCE`, `COPILOT_JOB_EVENT_TYPE` | Hosted job nonce and job event type. |
| `COPILOT_AGENT_RUNTIME_VERSION` | Agent runtime version. |
| `COPILOT_AGENT_SESSION_ID`, `COPILOT_AGENT_PREVIOUS_SESSION_IDS` | Current and previous Copilot session ids. |
| `COPILOT_AGENT_CALLBACK_URL` | Callback URL under service callback settings. |

### Model, provider, and service credentials

| Environment variable | Settings target or behavior |
|---|---|
| `COPILOT_AGENT_MODEL`, `COPILOT_MODEL_FAMILY` | Agent model and model-family selectors. |
| `COPILOT_API_URL`, `GITHUB_COPILOT_INTEGRATION_ID`, `GITHUB_COPILOT_API_TOKEN`, `CAPI_HMAC_KEY` | Copilot API URL, integration id, API token, and HMAC key. |
| `AIP_SWE_AGENT_TOKEN`, `ANTHROPIC_API_KEY` | Alternate/provider credentials present in the hosted envelope. |
| `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_API_ENDPOINT`, `AZURE_OPENAI_API_VERSION` | OpenAI/Azure OpenAI provider settings. |
| `CAPI_AZURE_KEY_VAULT_URI`, `AZURE_OPENAI_KEY_VAULT_URI`, `AZURE_OPENAI_KEY_VAULT_SECRET_NAME` | Key Vault inputs for Copilot and Azure OpenAI credentials. |
| `GITHUB_MCP_SERVER_TOKEN` | GitHub MCP server token passed into settings. |
| `GITHUB_UPLOADS_URL`, `GITHUB_DOWNLOADS_URL`, `SECRET_SCANNING_URL` | GitHub service endpoint overrides. |
| `BLACKBIRD_MODE` | Blackbird mode, defaulting to `initial-search` when absent. |
| `SWEBENCH_BASE_COMMIT` | SWE-bench base commit. |

### Feature flags, retry policy, and runtime controls

| Environment variable | Settings target or behavior |
|---|---|
| `COPILOT_FEATURE_FLAGS` | Comma-separated flags; each is enabled in the settings builder. |
| `COPILOT_EXPERIMENTS` | Comma-separated `name:treatment` entries. |
| `COPILOT_AGENT_ERROR_CODES_TO_RETRY` | Comma-separated integers parsed into `retryPolicy.errorCodesToRetry`. Non-integer entries become `NaN` candidates; no filtering was observed in this parser. |
| `COPILOT_AGENT_REQUEST_HEADERS` | JSON object for provider request headers; invalid JSON is silently ignored. |
| `COPILOT_AGENT_TIMEOUT_MIN`, `COPILOT_AGENT_START_TIME_SEC` | Parsed into timeout and start-time milliseconds when numeric. |
| `COPILOT_LARGE_OUTPUT_MAX_BYTES` | Parsed numeric large-output cap. |
| `COPILOT_DEPENDABOT_TIMEOUT` | Dependabot timeout, defaulting to `240` when unset or invalid. |
| `COPILOT_USE_SESSIONS`, `COPILOT_USE_ASYNC_SESSIONS` | Boolean session-mode controls. |
| `COPILOT_TRACE_PARENT` | Traceparent carried into the settings envelope. |
| `COPILOT_EVENTS_LOG_DIRECTORY` | Enables event-recorder JSONL output. |
| `CPD_SAVE_TRAJECTORY_OUTPUT` | Trajectory output file path consumed by the trajectory recorder. |

### Validation-tool toggles

The validation-tool env toggles are conditional. `TWe()` only applies them when `COPILOT_FEATURE_FLAGS` contains the feature key represented by `w8r`, which resolves to `copilot_swe_agent_validation_tool_settings`.

| Environment variable | Tool id set by `TWe()` |
|---|---|
| `COPILOT_AGENT_USE_CODEQL` | `codeql` |
| `COPILOT_AGENT_USE_CCR` | `codeReview` |
| `COPILOT_AGENT_USE_SECRET_SCANNING` | `secretScanning` |
| `COPILOT_AGENT_USE_DEPENDENCY_VULN` | `advisory` |

This is more precise than a simple “env override exists” statement: without the feature flag, these variables are present in the surface but do not affect the settings builder.

## Environment redaction and forwarding surfaces

The same constant cluster defines two important supporting lists:

- `Ife` contains secret-like env names such as `GITHUB_COPILOT_GITHUB_TOKEN`, `GITHUB_TOKEN`, `GITHUB_COPILOT_API_TOKEN`, `CAPI_HMAC_KEY`, `ANTHROPIC_API_KEY`, `AIP_SWE_AGENT_TOKEN`, `GITHUB_MCP_SERVER_TOKEN`, `GITHUB_PERSONAL_ACCESS_TOKEN`, `GITHUB_VERIFICATION_TOKEN`, `COPILOT_PROVIDER_API_KEY`, and `COPILOT_PROVIDER_BEARER_TOKEN`.
- `Y7` contains hosted-agent env names that are considered safe or necessary for propagation, plus `...Ife`. It includes many `COPILOT_AGENT_*` and provider variables and is reused by helper paths that construct child/process environments.

This distinction explains why some constants appear in `source-atlas/surface-index.json` even when they are not consumed by `TWe()`: the bundle still needs to know their names for redaction, filtering, or propagation.

## Hosted-agent MCP bootstrap

`Abt.readMcpConfigFromEnv(...)` loads user-provided MCP config from `GITHUB_COPILOT_MCP_JSON` only when `GITHUB_COPILOT_3P_MCP_ENABLED=true`. If third-party MCPs are disabled, the method returns an empty `{ mcpServers: {} }` shape and logs that user-provided MCPs are disabled.

When not running in `GITHUB_COPILOT_CLI_MODE=true`, the method injects default MCP servers:

1. A remote GitHub MCP server with headers built by `q7n(...)`.
2. A local Playwright MCP server unless already configured or the `copilot_swe_agent_playwright_use_firewall` feature flag asks the runtime to skip launching it.

`q7n(...)` constructs the GitHub MCP request headers:

| Header | Source or value |
|---|---|
| `Authorization` | `Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}` |
| `X-MCP-Toolsets` | `repos,issues,users,pull_requests,discussions,code_security,secret_protection,actions,web_search`, plus `copilot_spaces` when `COPILOT_MCP_COPILOT_SPACES_ENABLED=true`. |
| `X-MCP-Host` | `github-coding-agent` |
| `X-Initiator` | `agent` |
| `X-MCP-Features` | Adds `issues_granular,pull_requests_granular` for `enableCcaV3TriggerMcpFiltering`. |
| `X-MCP-Exclude-Tools` | Excludes mutating GitHub MCP tools for the granular CCA V3 trigger path. |
| `Copilot-Integration-Id` | From `settings.api.copilot.integrationId` when present. |
| `X-Interaction-Id` | From `GITHUB_COPILOT_INTERACTION_ID` when present. |

If a user-provided server already defines the GitHub MCP server name, the runtime keeps it but overlays the default hosted-agent headers and filter mapping. This means `GITHUB_COPILOT_MCP_JSON` can customize the server while still inheriting hosted-agent authentication and toolset policy.

## MCP OIDC token injection

The OIDC resolver (`hbt`) scans MCP server configuration values and referenced env placeholders for names starting with:

- `GITHUB_COPILOT_OIDC_`
- `GITHUB_AGENTIC_APP_OIDC_`

It treats `GITHUB_COPILOT_OIDC_MCP_TOKEN` specially as the server-token family. A server config with `oidc: true` can request a cached MCP server token; other placeholders can request individual secret tokens. Tokens are fetched through the host-provided `onOIDCAuthRequired` callback, cached per server/plugin association, and injected in two ways:

1. Placeholder replacement for command, args, cwd, env, URL, and headers.
2. For remote `oidc: true` servers without an explicit `Authorization` header, automatic `Authorization: Bearer <cached token>` injection.

The resolver deliberately skips OIDC prefetch when a config contains MCP servers associated with different plugins, because cache keys include plugin identity and mixing plugins could pollute token reuse.

## OpenTelemetry env switches

`Eco()` adds exact env semantics to the broader observability documentation:

| Environment variable | Behavior |
|---|---|
| `COPILOT_OTEL_ENABLED=true` | Enables OpenTelemetry even without an OTLP endpoint. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Enables OTel with the default `otlp-http` exporter when present. |
| `COPILOT_OTEL_FILE_EXPORTER_PATH` | Enables the file exporter; also selects `file` when `COPILOT_OTEL_EXPORTER_TYPE` is unset. |
| `COPILOT_OTEL_EXPORTER_TYPE=file` | Explicitly selects the file exporter. Other values fall back to `otlp-http`. |
| `COPILOT_OTEL_SOURCE_NAME` | Overrides the instrumentation/source name; default is `github.copilot`. |
| `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true` | Enables capture of message/tool content into GenAI OTel attributes. |

If none of `COPILOT_OTEL_ENABLED`, `OTEL_EXPORTER_OTLP_ENDPOINT`, or `COPILOT_OTEL_FILE_EXPORTER_PATH` is present, `Eco()` returns `null` and no OTel bridge is initialized.

## Firewall-log and trajectory output

`s7n()` parses `COPILOT_AGENT_FIREWALL_LOG_FILE` as JSONL. Each non-empty line is secret-filtered before JSON parsing. A record is retained only when:

- `blocked` is truthy,
- `because !== "IPv6AlwaysBlocked"`, and
- `hasBeenRedirected` is false.

The retained fields are `because`, `domains`, `ip`, `originalIp`, `port`, `url`, `ruleSourceComment`, `hasBeenRedirected`, `cmd`, and `blockedAt`. The parser de-duplicates retained records by JSON string and blanks noisy command values such as `root process (pid 0)` or `process with pid ... no longer exists`.

The trajectory recorder (`obt`) appends these blocked request summaries to the final result object when available. `CPD_SAVE_TRAJECTORY_OUTPUT` points the recorder at an XML-ish trajectory file containing assistant messages, tool calls, tool results, subagent boundaries, and redacted values.

## Bundled Anthropic managed-agent surface

The current bundle includes Anthropic SDK resource clients that are not described by the main Copilot runtime docs. Source reading confirms these as bundled client surfaces; it does not by itself prove that the Copilot CLI actively calls every resource.

| Resource surface | Representative endpoints | Beta header |
|---|---|---|
| Environments | `/v1/environments?beta=true`, `/v1/environments/{id}`, `/archive`, `delete` | `managed-agents-2026-04-01` |
| Agents | `/v1/agents?beta=true`, `/v1/agents/{id}`, `/archive`, `/versions` | `managed-agents-2026-04-01` |
| Memory stores | `/v1/memory_stores?beta=true`, `/archive`, nested `memories`, `memory_versions`, `redact` | `managed-agents-2026-04-01` |
| User profiles | `/v1/user_profiles?beta=true`, `/enrollment_url` | `user-profiles-2026-03-24` |
| Files | `/v1/files?beta=true`, `/content`, upload/download/delete | `files-api-2025-04-14` |
| Message batches | `/v1/messages/batches?beta=true`, `/cancel`, `/results_url` streaming download | `message-batches-2024-09-24` |

The bundled SSE parser also accepts an expanded managed-agent event set:

- user-side events: `user.message`, `user.interrupt`, `user.tool_confirmation`, `user.custom_tool_result`;
- agent events: `agent.message`, `agent.thinking`, `agent.tool_use`, `agent.tool_result`, `agent.mcp_tool_use`, `agent.mcp_tool_result`, `agent.custom_tool_use`, `agent.thread_context_compacted`;
- session status events: `session.status_running`, `session.status_idle`, `session.status_rescheduled`, `session.status_terminated`, `session.error`, `session.deleted`;
- tracing events: `span.model_request_start`, `span.model_request_end`.

This event list is a useful future-diff watchpoint. If a later package starts wiring these SDK resources into the Copilot runtime, the constants in `source-atlas/surface-index.json` should make that change visible quickly.

## Practical takeaways

- The highest-signal documentation gap from the constant declarations was not another slash command; it was the hosted-agent environment envelope in `TWe()` plus adjacent redaction/forwarding lists.
- Several constants in `surface-index.json` are scan noise unless interpreted through their usage role. For example, `COPILOT_AGENT_EVENT_URL` and `GITHUB_COPILOT_MCP_JSON_FROM_INPUT` appear in allowlists but not as direct settings-builder inputs in this bundle.
- The MCP constants reveal a hosted-agent-specific policy layer: default GitHub MCP headers, optional Copilot Spaces, third-party MCP enablement, and OIDC token exchange/injection.
- The Anthropic managed-agent constants are currently best documented as bundled SDK/client surface, not as confirmed Copilot CLI product flow.

## Related docs

- [MCP host, transports, and tools](../03-tools-integrations-security/mcp-host-transport-and-tools.md)
- [Coding-agent validation and review toolchain](../03-tools-integrations-security/coding-agent-validation-toolchain.md)
- [Telemetry, update, and shutdown](telemetry-update-and-shutdown.md)
- [Debug bundle and redaction boundaries](debug-bundle-redaction-boundaries.md)
