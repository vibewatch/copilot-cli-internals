# Feature gates and rollout logic in Copilot CLI

This document explains how “gates” work in the extracted `@github/copilot` CLI bundle. In this bundle, “gate” mostly means **feature availability control**: a feature starts from a built-in availability tier, then can be changed by environment variables, settings, programmatic overrides, and sometimes remote experiment assignment.

There is also one literal MCP permission-gate flag path. That path is covered separately below.

## Source anchors

`app.js` is bundled/minified, so the documentation uses semantic aliases as the primary names and keeps the generated symbols only as version-specific lookup aids for the analyzed `@github/copilot` bundle (they will shift across releases).

| Area | Semantic alias | Minified anchor | Approx. line | What it does |
|---|---|---:|---:|---|
| Settings/env inputs | `enabledFeatureFlags`, legacy settings, `COPILOT_CLI_ENABLED_FEATURE_FLAGS`, per-flag env | native create-input fields, `RMe`, `Jpt()`, `Zpt()` | 124 | Supplies local gate inputs to the native feature service. |
| Static gate table | Availability tiers and known keys | `vG`, `S.featureFlagsAvailabilityJson()` | 124 | Loads the native availability map used to derive known flags and defaults. |
| Native-backed feature service | Local snapshot, config/env overrides, experiment-aware lookup | `EG`, `S.featureFlagService*` | 124 | Owns resolved local flags, experiment flags, listeners, assignment context, reset, and lookup methods. |
| Static service factory | Static/headless service construction | `_4n(...)`, `yde(...)` | 124 | Creates `EG` without the live auth-driven experiment coordinator. |
| Live experiment coordinator | Auth subscription, TAS fetch, cache refresh | `lCe`, `cCe(...)` | 3387 | Applies remote experiment responses to `EG` and refreshes cached assignments. |
| Experiment mapping | Defined experiment keys and legacy mapping | `y4n`, `RMi`, native JSON maps | 124 | Maps selected local feature names to experiment parameters. |
| Experiment request filters | Version/audience/plan/tracking filters | `ncn(...)`, `acn(...)` | 3385-3387 | Builds TAS request filters and cache keys. |
| Assignment context | Primary and secondary assignment context | `EG.captureSecondaryAssignmentContext(...)` and snapshot methods | 124 | Captures assignment context and exposes it to later API requests. |
| Repo/team gate | `isTeamRepositoryAllowlisted(cwd)` | `RRe(...)`, native `featureFlagsIsTeamRepoSlug` | 4446 | Resolves `owner/repo` and checks the native allowlist. |
| CLI construction | main `.action(...)` | main `.action(...)` | 5774-5781 | Builds `{isStaff,isExperimental,isTeam,config}` and creates the feature service. |
| MCP permission gate | Raw hosted-agent MCP permission mode | `Kfr`, `m4t(...)`, `copilot_swe_agent_mcp_permission_gate` | 2603 | Checks the separate raw environment mechanism used by hosted MCP setup. |

## Can the original names be recovered?

Not from this extracted package alone. The published package includes `app.js` but no `app.js.map` or `sourcesContent`, and the only `sourceMappingURL` hits in `app.js` are embedded CSS/vendor artifacts. `package.json` points to `github/copilot-cli` and records build commit `3286dc4`; exact pre-minification names would require that source tree or a matching sourcemap.

What is recoverable is a set of **semantic names** derived from call sites, data flow, string constants, schemas, and side effects. These should be treated as analysis aliases, not proven source identifiers.

| Semantic alias | Current anchor | Confidence | Why |
|---|---|---:|---|
| Native availability map | `vG`, `S.featureFlagsAvailabilityJson()` | High | Directly loads the current tier map from `runtime.node`. |
| Native-backed feature service | `EG`, `S.featureFlagServiceCreate(...)` | High | Constructor input includes staff/experimental/team context, config, local overrides, environment, and experiment overrides. |
| Local snapshot lookup | `EG.getLegacyFlag`, `getAllFlags`, `getAllExpFlagsSync` | High | Reads the native-returned snapshot without waiting for remote assignment. |
| Experiment-aware lookup | `EG.getFlag`, `getFlagWithExpOverride`, `getExpFlag` | High | Calls native async feature/experiment lookup methods. |
| Static factory | `_4n(...)`, `yde(...)` | High | Creates `EG` without attaching the live auth coordinator. |
| Live experiment coordinator | `lCe` | High | Subscribes to auth, retrieves TAS assignments, updates `EG`, and schedules cache refresh. |
| Live factory | `cCe(...)` | High | Couples `EG` and `lCe` and forwards retrieval telemetry. |
| Experiment cache | `aCe`, `exp-cache` | High | Persists schema-versioned assignment responses and reads them by audience hash. |
| Team repository gate | `RRe(...)`, `S.featureFlagsIsTeamRepoSlug(...)` | High | Resolves repository identity and delegates allowlist evaluation to native code. |
| Hosted MCP permission flag | `Kfr`, `m4t(...)` | High | Reads the distinct `COPILOT_PERMISSION_MODE` / raw MCP permission-gate path. |

Semantic names remain useful in diagrams and prose, but current source lookup should start from the anchors above. Older aliases from earlier extracted builds should not be searched as if they were current `1.0.71` identifiers.

## Gate inputs

The main CLI action builds the gate context before starting sessions:

```mermaid
flowchart TD
    Settings["settings/config loaded by ZDr"] --> Experimental["isExperimental\n--experimental or settings.experimental"]
    Managed["managed config loaded by ho"] --> Staff["isStaff\nmanaged staff === true"]
    Cwd["current working directory"] --> Repo["resolve GitHub owner/repo"]
    Repo --> Team["isTeam\nsha256(owner/repo) in embedded allowlist"]

    Experimental --> GateInput["gate context"]
    Staff --> GateInput
    Team --> GateInput
    Settings --> GateInput
    GateInput --> Service["LiveFeatureFlagService or StaticFeatureFlagService"]
```

The important inputs are:

- `isStaff`: loaded from the CLI’s managed config (`ho.load(...).staff === true`). This is intentionally separate from ordinary user settings.
- `isExperimental`: `--experimental` if provided, otherwise `settings.experimental`, otherwise `false`.
- `isTeam`: a repo allowlist check. `isTeamRepositoryAllowlisted(process.cwd())` resolves the GitHub repo, lowercases `owner/name`, hashes it with SHA-256 via `sha256Hex(...)`, and checks two embedded hashes in `TEAM_REPOSITORY_HASH_ALLOWLIST`.
- `config`: the normal settings object, which can contain explicit feature flag overrides.
- `streamerMode` and auth/user fields: used for remote experiment audience/telemetry context, especially staff audience filters.

## Built-in availability tiers

The table `FEATURE_AVAILABILITY_TIERS` maps each known CLI flag to an availability tier. The resolver `resolveAvailabilityTiers(isStaff,isExperimental,isTeam)` converts those tiers to booleans.

| Tier in `FEATURE_AVAILABILITY_TIERS` | Resolved value |
|---|---|
| `on` | Always `true`. |
| `off` | Always `false`. |
| `staff` | `true` only when `isStaff` is true. |
| `team` | `true` only when `isTeam` is true. |
| `experimental` | `true` only when `isExperimental` is true. |
| `staff-or-experimental` | `true` when either `isStaff` or `isExperimental` is true. |

Examples from the embedded table:

| Flag | Tier | Meaning in this bundle |
|---|---|---|
| `SESSION_STORE` | `on` | Local session store support is always enabled. |
| `MCP_TASKS` | `experimental` | MCP task protocol support only appears in experimental mode or explicit overrides. |
| `MULTI_TURN_AGENTS` | `experimental` | Multi-turn subagents require experimental/override/experiment enablement. |
| `copilot-feature-agentic-memory` | `on` | Enables the service-backed agentic memory path unless the explicit disabled flag is set. |
| `copilot-feature-agentic-memory-disabled` | `off` | Explicitly disables the cloud memory path when enabled. |
| `copilot_feature_agentic_memory_user_scoped` | `staff` | Allows user-scoped memory behavior when no repository scope is available. |
| `COPILOT_SUBCONSCIOUS` | `team` | Enables the dynamic context board, `rem-agent`, `/subconscious`, and shutdown consolidation paths. |
| `BACKGROUND_SESSIONS` | `staff-or-experimental` | Enabled for staff or experimental mode. |
| `REMOTE_KICKSTART` | `team` | Requires the hashed repo/team allowlist unless explicitly overridden. |
| `MCP_APPS` | `experimental` | Enables MCP Apps UI extension passthrough and related `mcp-apps` capability negotiation. |
| `SECURITY_REVIEW` | `experimental` | Enables the `/security-review` slash command and `security-review` built-in agent. |
| `TARGETED_VALIDATION_PROMPT` | `off` | Gates targeted validation prompt behavior. |
| `SANDBOX` | `off` | Hides the local `/sandbox` command unless explicitly enabled by gate overrides. |
| `CLOUD_SESSION_STORE` | `staff` | Staff-gated cloud session store. |
| `TOOL_SEARCH` | `off` | Disabled by default. |

```mermaid
flowchart TD
    Table["FEATURE_AVAILABILITY_TIERS static table"] --> Tier{"tier"}
    Tier -->|on| AlwaysOn["true"]
    Tier -->|off| AlwaysOff["false"]
    Tier -->|staff| Staff["isStaff"]
    Tier -->|team| Team["isTeam"]
    Tier -->|experimental| Exp["isExperimental"]
    Tier -->|staff-or-experimental| StaffExp["isStaff || isExperimental"]
    AlwaysOn --> Base["base flag map"]
    AlwaysOff --> Base
    Staff --> Base
    Team --> Base
    Exp --> Base
    StaffExp --> Base
```

## Override precedence

After the tier resolver builds a base flag map, later sources can override it.

```mermaid
flowchart TD
    Base["1. FEATURE_AVAILABILITY_TIERS\nresolveAvailabilityTiers(...)"] --> EnvList["2. COPILOT_CLI_ENABLED_FEATURE_FLAGS\nforce listed canonical flags true"]
    EnvList --> EnvPerFlag["3. Per-flag env vars\nFLAG=true / FLAG=false"]
    EnvPerFlag --> Settings["4. settings overrides\nenabledFeatureFlags or feature_flags.enabled"]
    Settings --> Programmatic["5. programmatic flagOverrides"]
    Programmatic --> LocalResult["local featureFlags snapshot"]
    LocalResult --> Remote["6. selected remote experiment overrides\nvia featureFlagService.getFlag"]
```

The practical precedence is:

1. **Static tier defaults** from `FEATURE_AVAILABILITY_TIERS`, resolved by `resolveAvailabilityTiers(...)`.
2. **`COPILOT_CLI_ENABLED_FEATURE_FLAGS`**: comma-separated canonical flag names, normalized with `normalizeFeatureFlagName(...)`, force flags on.
3. **Per-flag environment variables**: each canonical flag name can be set directly, for example `MCP_TASKS=true` or `MULTI_TURN_AGENTS=false`.
4. **Settings overrides**:
   - `enabledFeatureFlags`: map of feature name to boolean.
   - `feature_flags.enabled`: legacy/list style that only turns flags on.
5. **Programmatic `flagOverrides`** supplied to the feature service.
6. **Remote experiment override** for flags listed in `LEGACY_FLAG_TO_EXPERIMENT_PARAM`, but only when callers ask the service asynchronously through `getFlag(...)` / `getFlagWithExpOverride(...)` / helper methods.

One subtle but important point: `getAllFlags()` returns the local resolved snapshot. It does **not** wait for remote experiment assignment. Runtime code that needs experiment-aware values must call the feature service.

## Live vs static feature service

There are two feature-service implementations:

| Service | Created by | Behavior |
|---|---|---|
| `LiveFeatureFlagService` | `new LiveFeatureFlagService(context)` | Live service used in normal CLI modes. It resolves local flags immediately, subscribes to auth changes, fetches remote experiment assignments, and notifies listeners. |
| `StaticFeatureFlagService` | `createStaticFeatureFlagService(context)` | Static service used when the CLI starts server/headless-style paths. It resolves immediately from local settings/env plus explicit experiment env overrides and does not fetch remote assignments. |

```mermaid
flowchart TD
    MainAction["main CLI action"] --> ServerCheck{"server/headless?"}
    ServerCheck -->|yes| Static["createStaticFeatureFlagService(...)"]
    ServerCheck -->|no| Live["new LiveFeatureFlagService(...)"]

    Static --> Snapshot["getAllFlags local snapshot"]
    Live --> Snapshot
    Live --> Auth["subscribeToAuth(authManager)"]
    Auth --> ExpFetch["retrieve experiment response"]
    ExpFetch --> ExpFlags["expFlags + assignment context"]
```

## Remote experiment flow

The `LiveFeatureFlagService` starts with local flags, then waits for authentication. On auth changes:

1. If there is no Copilot user, telemetry endpoint, or tracking ID, it resets remote experiment state.
2. It builds filters with `buildExperimentRequestFilters(...)`, including:
   - CLI version;
   - prerelease status;
   - audience (`github`, `microsoft`, or `external`-style categorization);
   - experimental opt-in;
   - extension/client name (`CopilotCLI`);
   - first-launch timestamp;
   - Copilot plan.
3. It calls the experiment/TAS client.
4. It extracts parameters from the `default` config in the response.
5. It stores assignment context and wakes waiters.
6. `getFlag(...)` can use those experiment parameters to override selected legacy feature flags.

```mermaid
sequenceDiagram
    participant CLI as CLI startup
    participant FF as LiveFeatureFlagService
    participant Auth as Auth manager
    participant TAS as Experiment service
    participant Runtime as Runtime caller

    CLI->>FF: new LiveFeatureFlagService({isStaff,isExperimental,isTeam,config})
    CLI->>Runtime: pass getAllFlags() snapshot
    CLI->>FF: subscribeToAuth(Auth)
    Auth-->>FF: copilotUser + telemetry endpoint
    FF->>TAS: getExperimentsResponse(filters, randomizationUnit)
    TAS-->>FF: Features, Flights, Configs, AssignmentContext
    FF->>FF: expFlags = default Config parameters
    Runtime->>FF: await getFlag("MULTI_TURN_AGENTS")
    FF-->>Runtime: remote boolean if present, otherwise local snapshot value
```

Flags in the `LEGACY_FLAG_TO_EXPERIMENT_PARAM` mapping can be remote-overridden. Examples include:

- `GPT_FOR_SUBAGENTS`;
- `GPT_5_4_MINI_FOR_EXPLORE`;
- `DYNAMIC_INSTRUCTIONS_RETRIEVAL`;
- `SKILLS_INSTRUCTIONS`;
- `WEBSOCKET_RESPONSES`;
- `RUBBER_DUCK_AGENT`;
- `REPLACEMENT_BLOCKS`;
- `MULTI_TURN_AGENTS`;
- `SESSION_BASED_SUBAGENTS`.

Other flags are local/snapshot-only unless some specific code path reads a different raw flag source.

## Snapshot gates vs service gates

The bundle uses two styles of checks:

| Style | Example | Behavior |
|---|---|---|
| Snapshot lookup | `isLocalFeatureFlagEnabled(settings, "MCP_TASKS")` or `featureFlags.MCP_TASKS` | Uses the local `featureFlags` object already merged into runtime settings. No remote wait. |
| Service lookup | `await featureFlagService.getFlag("REPLACEMENT_BLOCKS")` | Can wait for remote experiment assignment and use mapped experiment overrides. |
| Helper wrapper | `resolveExpFlag(expName, legacyName)` | Calls `resolveExperimentBackedFlag(...)`, which uses `featureFlagService.getFlagWithExpOverride(...)` when available, otherwise falls back to snapshot flags. |
| Raw environment lookup | `COPILOT_FEATURE_FLAGS` parsing | Separate from canonical CLI gate service; used by some agent/MCP-specific paths. |

```mermaid
flowchart TD
    FeatureNeed["Feature check"] --> Kind{"How does code check it?"}
    Kind --> Snapshot["featureFlags / li(settings,name)"]
    Kind --> Service["featureFlagService.getFlag(name)"]
    Kind --> RawEnv["COPILOT_FEATURE_FLAGS raw list"]

    Snapshot --> LocalOnly["local snapshot only"]
    Service --> RemoteAware{"name mapped in LEGACY_FLAG_TO_EXPERIMENT_PARAM?"}
    RemoteAware -->|yes| ExpOverride["remote boolean can override"]
    RemoteAware -->|no| LocalOnly
    RawEnv --> Separate["separate ad-hoc gate path"]
```

Representative examples:

- `MULTI_TURN_AGENTS`: background task/subagent paths call `resolveExpFlag("copilot_cli_multi_turn_agents", "MULTI_TURN_AGENTS")`, so this can be experiment-aware.
- `DYNAMIC_INSTRUCTIONS_RETRIEVAL`: resolved through `resolveExpFlag(...)`, then additional runtime eligibility checks decide whether embedding retrieval actually starts.
- `MCP_TASKS`: MCP client capabilities check `isLocalFeatureFlagEnabled(settings, "MCP_TASKS")`, so it behaves like a local snapshot/settings gate in the observed path.
- `SHELL_ERROR_CLASSIFICATION`: shell tools call `featureFlagService.getFlag("SHELL_ERROR_CLASSIFICATION")`; if there is no experiment mapping for that flag, it returns the local resolved value.
- `REMOTE_KICKSTART`: background remote session start checks `featureFlagService.getFlag("REMOTE_KICKSTART")`; in the static table it is `team` gated.
- `SANDBOX`: the slash-command builder receives `sandboxEnabled` and exposes `/sandbox` only when this local gate is true. The command then toggles `settings.sandbox.enabled`; see [`sandboxing.md`](../03-tools-integrations-security/sandboxing.md).
- `TGREP`: `copilot_cli_tgrep` enables indexed repository search after repository size/filesystem eligibility checks; `USE_TGREP` can force or disable it. See [`indexed-search-tgrep-and-ripgrep.md`](../03-tools-integrations-security/indexed-search-tgrep-and-ripgrep.md).
- `SESSION_SEARCH_SIDEKICK_AGENT` and `CLOUD_SESSION_SEARCH_SIDEKICK_AGENT`: experiment-aware checks select local or cloud prior-session retrieval sidekicks. See [`memory-and-context-board.md`](../02-context-model-loop/memory-and-context-board.md).
- Agentic memory and subconscious behavior combine service flags, local settings, repository/user scope, and sidekick gates; see [`memory-and-context-board.md`](../02-context-model-loop/memory-and-context-board.md) for the dedicated memory flow.

## Assignment-context headers

The experiment system also carries assignment context through API headers:

- API responses may include `X-Copilot-API-Exp-Assignment-Context`.
- `captureApiExperimentAssignmentContext(headers, featureFlagService)` captures that value into the service as a secondary assignment context.
- Copilot API clients send `X-Copilot-Client-Exp-Assignment-Context` on future requests when an assignment context is present.

```mermaid
sequenceDiagram
    participant API as Copilot API
    participant Client as Copilot client
    participant FF as Feature service

    API-->>Client: response header X-Copilot-API-Exp-Assignment-Context
    Client->>FF: captureSecondaryAssignmentContext(...)
    Client->>FF: getLatestAssignmentIfPresent()
    FF-->>Client: assignment context
    Client->>API: request header X-Copilot-Client-Exp-Assignment-Context
```

This header path is about experiment assignment continuity and telemetry/request context. It is not the same as directly flipping the local `featureFlags` snapshot.

## The repo/team gate

The `team` tier is not a generic account/team API check in this bundle. It is a repository allowlist:

```mermaid
flowchart TD
    Cwd["process.cwd()"] --> Repo["J_(cwd) resolves git remote owner/name"]
    Repo --> Full["lowercase owner/name"]
    Full --> Hash["SHA-256 via sha256Hex(...)"]
    Hash --> Allowlist["TEAM_REPOSITORY_HASH_ALLOWLIST"]
    Allowlist --> Team{"isTeam?"}
```

`isTeamRepositoryAllowlisted(...)` returns `true` only if the current repository hashes to one of the embedded values. Team-tier flags such as `REMOTE_KICKSTART`, `GH_CLI_OVER_MCP`, `NATIVE_CURSOR`, and `SHELL_SPAWN_BACKEND` therefore default on only in those allowlisted repositories, unless explicitly overridden by env/settings/programmatic overrides.

## The literal MCP permission gate

There is a separate raw env gate named `copilot_swe_agent_mcp_permission_gate`:

- `hasMcpPermissionGateFlag(process.env)` checks whether `COPILOT_FEATURE_FLAGS` contains `copilot_swe_agent_mcp_permission_gate`, case-insensitively.
- GitHub MCP configuration calls `resolveGithubMcpUrl(!hasMcpPermissionGateFlag(process.env))`.
- `resolveGithubMcpUrl(true)` appends `/readonly` to the GitHub MCP URL.
- Therefore, when the permission gate flag is **absent**, the default GitHub MCP endpoint is forced to readonly mode.
- When the permission gate flag is **present**, the default GitHub MCP URL is not rewritten to `/readonly` by that helper.

```mermaid
flowchart TD
    Env["COPILOT_FEATURE_FLAGS"] --> Contains{"contains\ncopilot_swe_agent_mcp_permission_gate?"}
    Contains -->|no| Readonly["resolveGithubMcpUrl(true) -> append /readonly"]
    Contains -->|yes| Normal["resolveGithubMcpUrl(false) -> keep base MCP URL"]
    Readonly --> GithubMcp["default GitHub MCP config"]
    Normal --> GithubMcp
```

This path is intentionally separate from `COPILOT_CLI_ENABLED_FEATURE_FLAGS` and the canonical `FEATURE_AVAILABILITY_TIERS` table. It is an ad-hoc raw environment gate used by MCP setup.

The generic permission service, including how MCP tool requests are approved or denied after they are available, is covered in [`tool-path-url-permissions.md`](../03-tools-integrations-security/tool-path-url-permissions.md).

## How gates affect behavior

Gates in this bundle generally do one of four things:

1. **Expose or hide UI/runtime features** — for example status line, voice, prompt frame, background sessions, and `/sandbox`.
2. **Enable tool/runtime capabilities** — for example MCP Tasks, shell spawn backend, focused tools, sidekick/context agents.
3. **Change model/tool prompt content** — for example removing cwd listing, removing parallel-tool prompt text, adding subagent parallelism prompts.
4. **Select implementation paths** — for example WebSocket responses, dynamic instruction retrieval, session-based subagents, multi-turn agents.

The gate usually does not perform permission enforcement by itself. Permission enforcement is handled later by the permissions/rules layer, MCP tool allowlists, auth checks, path/url guards, and tool callbacks. A feature gate decides whether code paths and tools are available; permission gates decide whether an available tool call may run.

## Key takeaways

- The main gate table is `FEATURE_AVAILABILITY_TIERS`; it defines *availability tiers*, not just booleans.
- `resolveAvailabilityTiers(...)` converts availability tiers into local booleans from `isStaff`, `isExperimental`, and `isTeam`.
- `isTeam` is a hashed current-repository allowlist.
- Env/settings/programmatic overrides can force local gate values.
- Remote experiment assignment only affects flags read through the feature-flag service and mapped in `LEGACY_FLAG_TO_EXPERIMENT_PARAM`.
- `getAllFlags()` is a local snapshot; `featureFlagService.getFlag(...)` can be remote/experiment-aware.
- `COPILOT_CLI_ENABLED_FEATURE_FLAGS` and `COPILOT_FEATURE_FLAGS` are different mechanisms in this bundle.
- `SANDBOX` is a local gate for exposing `/sandbox`; it is not the same as the hidden `--cloud` cloud-session feature.
- The MCP permission gate is a raw `COPILOT_FEATURE_FLAGS` check that controls whether the default GitHub MCP URL is readonly.

Related docs: [`sandboxing.md`](../03-tools-integrations-security/sandboxing.md), [`tool-path-url-permissions.md`](../03-tools-integrations-security/tool-path-url-permissions.md), [`sessions-remote-cloud.md`](../04-sessions-persistence-remote/sessions-remote-cloud.md), and [Main feature map](../00-start-here/main-feature-map.md).
