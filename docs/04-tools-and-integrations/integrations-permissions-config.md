# Integrations, permissions, auth, and config workflows

This file focuses on the major cross-cutting systems wired into `app.js`: MCP, plugins/extensions, permission rules, authentication/provider selection, login, and update behavior.

## Configuration inputs

`app.js` merges information from command-line flags, environment variables, user config, workspace config, plugin metadata, and runtime state.

```mermaid
flowchart TD
    Flags["CLI flags"] --> RuntimeConfig["runtime configuration"]
    Env["environment variables"] --> RuntimeConfig
    UserConfig["~/.copilot settings and config"] --> RuntimeConfig
    Workspace["workspace files such as .mcp.json"] --> RuntimeConfig
    Plugins["installed plugins and --plugin-dir"] --> RuntimeConfig
    State["persistent state/session store"] --> RuntimeConfig

    RuntimeConfig --> FeatureFlags["feature flags"]
    RuntimeConfig --> Auth["auth and provider config"]
    RuntimeConfig --> MCP["MCP servers"]
    RuntimeConfig --> Permissions["permission rules"]
    RuntimeConfig --> Sessions["session selection"]
    RuntimeConfig --> UI["TUI and output behavior"]
```

## Authentication and provider selection

The CLI can use GitHub Copilot authentication, environment-provided tokens, GitHub CLI credentials, or a custom provider/BYOK configuration. Offline mode requires a local/custom provider and disables network-dependent GitHub features.

```mermaid
flowchart TD
    Start["startup auth/provider setup"] --> OfflineCheck{"COPILOT_OFFLINE?"}
    OfflineCheck -- yes --> ProviderRequired{"custom provider configured?"}
    ProviderRequired -- no --> OfflineError["error: offline needs local provider"]
    ProviderRequired -- yes --> OfflineProvider["use local/custom provider and skip GitHub network features"]

    OfflineCheck -- no --> CustomProvider{"COPILOT_PROVIDER_BASE_URL set?"}
    CustomProvider -- yes --> BYOK["use custom provider config"]
    CustomProvider -- no --> TokenCheck["check COPILOT_GITHUB_TOKEN, GH_TOKEN, GITHUB_TOKEN"]

    TokenCheck --> StoredCreds{"stored credential available?"}
    StoredCreds -- yes --> Authenticated["GitHub Copilot auth manager ready"]
    StoredCreds -- no --> GhCli{"GitHub CLI auth available?"}
    GhCli -- yes --> Authenticated
    GhCli -- no --> NeedsLogin["interactive login or auth error"]

    BYOK --> Runtime["session runtime"]
    OfflineProvider --> Runtime
    Authenticated --> Runtime
    NeedsLogin --> Runtime
```

## `copilot login` workflow

The `login` subcommand uses OAuth device/browser flow and stores the resulting token in the system credential store when possible. If the keychain is unavailable, it can ask whether to store the token in a plaintext config file.

```mermaid
sequenceDiagram
    autonumber
    participant User as User
    participant Login as copilot login
    participant OAuth as GitHub OAuth device flow
    participant Browser as Browser/clipboard helper
    participant Store as Credential store or config
    participant Auth as Auth manager

    User->>Login: copilot login --host optional
    Login->>OAuth: request device code
    OAuth-->>Login: verification URI and user code
    Login->>User: print URL and code
    Login->>Browser: try copy/open helper
    User->>OAuth: authorize in browser
    OAuth-->>Login: token, host, login
    Login->>Store: store token securely
    Store-->>Login: success or unavailable
    alt secure store unavailable
        Login->>User: ask whether plaintext config is acceptable
        User-->>Login: yes or no
        Login->>Store: store current token in config if accepted
    end
    Login->>Auth: login user with token
    Login->>User: signed in successfully
```

## MCP configuration and commands

MCP servers extend Copilot with tools/capabilities. The CLI loads them from multiple sources and exposes `copilot mcp` management commands.

Sources described by the bundled help and code:

- User: `~/.copilot/mcp-config.json`
- Workspace: `.mcp.json`
- Plugin: installed plugins with MCP servers
- Builtin: bundled/default servers, including GitHub MCP behavior controlled by flags
- CLI additions: extra session config and enable/disable flags

```mermaid
flowchart TD
    UserMCP["user mcp-config.json"] --> Merge["merge MCP configuration"]
    WorkspaceMCP["workspace .mcp.json"] --> Merge
    PluginMCP["plugin-provided MCP servers"] --> Merge
    BuiltinMCP["builtin/GitHub MCP settings"] --> Merge
    ExtraMCP["--additional-mcp-config"] --> Merge
    Disabled["--disable-mcp-server"] --> Filter["disable/filter servers"]

    Merge --> Filter
    Filter --> Session["session MCP registry"]
    Session --> Tools["tools exposed to model/session"]

    MCommands["copilot mcp commands"] --> List["list"]
    MCommands --> Get["get"]
    MCommands --> Add["add"]
    MCommands --> Remove["remove"]

    Add --> UserMCP
    Remove --> UserMCP
    List --> Merge
    Get --> Merge
```

### `copilot mcp add` decision flow

```mermaid
flowchart TD
    Add["copilot mcp add"] --> ValidateName["validate server name"]
    ValidateName --> Transport{"transport or URL implies remote?"}

    Transport -- remote --> RequireURL{"URL present and http/https?"}
    RequireURL -- no --> RemoteError["print usage error"]
    RequireURL -- yes --> ParseHeaders["parse --header values"]
    ParseHeaders --> RemoteConfig["create http/sse config"]

    Transport -- local --> RequireCommand{"command provided after --?"}
    RequireCommand -- no --> LocalError["print usage error"]
    RequireCommand -- yes --> ParseEnv["parse --env values"]
    ParseEnv --> LocalConfig["create stdio/local config"]

    RemoteConfig --> ToolFilter["parse --tools filter"]
    LocalConfig --> ToolFilter
    ToolFilter --> Timeout["parse optional timeout"]
    Timeout --> WriteUserConfig["write user MCP config"]
    WriteUserConfig --> Output["print JSON or masked human output"]
```

## Plugin and extension flow

Plugins can contribute skills, agents, hooks, MCP servers, and LSP servers. `app.js` wires plugin metadata into startup and registers plugin commands through the plugin command builder.

```mermaid
flowchart TD
    PluginSources["installed plugins and --plugin-dir"] --> Discover["discover plugin.json metadata"]
    Discover --> Installed["installed plugin records"]
    Installed --> Startup["root startup config"]
    Startup --> Skills["skill directories and disabled skills"]
    Startup --> Agents["custom agents"]
    Startup --> Hooks["hooks"]
    Startup --> PluginMCP["plugin MCP servers"]
    Startup --> LSP["plugin LSP servers"]

    PluginCmd["copilot plugin"] --> Install["install"]
    PluginCmd --> List["list"]
    PluginCmd --> Marketplace["marketplace"]
    PluginCmd --> Uninstall["uninstall"]
    PluginCmd --> Update["update"]
```

Prompt mode can also load extensions when feature flags/config permit it. Interactive mode starts an embedded server and registers extension tools on the foreground session.

```mermaid
flowchart TD
    SessionMode["session starts"] --> FeatureFlag{"EXTENSIONS feature enabled?"}
    FeatureFlag -- no --> Skip["skip extension loader"]
    FeatureFlag -- yes --> LoadConfig["load extension config"]
    LoadConfig --> Mode{"extension mode"}
    Mode -- disabled --> DiscoverOnly["discover but do not augment tools"]
    Mode -- load --> LoadOnly["load extensions without host tool augmentation"]
    Mode -- load_and_augment --> RegisterTools["register extension tools on session"]

    RegisterTools --> ExtensionServer["extension server connections"]
    LoadOnly --> ExtensionServer
    DiscoverOnly --> Session["session continues without extension tools"]
    ExtensionServer --> Session
```

## Permission assembly

Permissions are assembled from config and CLI flags before tools are initialized. Rules cover tools, paths, and URLs. Deny rules generally take precedence over allow rules, and non-interactive mode cannot freely ask the user.

For the detailed subsystem design, including rule precedence, path/URL managers, hooks, session/location approval persistence, remote/RPC prompts, and allow-all behavior, see [`permission-system-design.md`](../05-security-and-policy/permission-system-design.md).

```mermaid
flowchart TD
    Flags["permission flags"] --> Rules["permission rule set"]
    Config["settings and permissions config"] --> Rules
    URLConfig["allowedUrls and deniedUrls"] --> UrlRules["URL rules"]
    PathFlags["--allow-all-paths and temp-dir flags"] --> PathManager["path permissions"]
    ToolFlags["--allow-all-tools, --yolo, allow/deny tools"] --> ToolRules["tool rules"]

    Rules --> PermissionService["permission service"]
    UrlRules --> PermissionService
    PathManager --> PermissionService
    ToolRules --> PermissionService
    ContentExclusion["content exclusion policies"] --> PermissionService

    PermissionService --> ToolRequest{"tool or URL request"}
    ToolRequest --> DenyCheck{"matches deny rule?"}
    DenyCheck -- yes --> Denied["deny request"]
    DenyCheck -- no --> AllowCheck{"matches allow rule or allow-all?"}
    AllowCheck -- yes --> Approved["approve request"]
    AllowCheck -- no --> CanAsk{"interactive and ask-user allowed?"}
    CanAsk -- yes --> PromptUser["ask user for approval"]
    CanAsk -- no --> NoUser["deny or mark user unavailable"]
```

## Non-interactive permission behavior

```mermaid
sequenceDiagram
    autonumber
    participant Session as prompt-mode session
    participant Tool as requested tool
    participant Perms as permission service
    participant User as user prompt

    Session->>Tool: model requests tool execution
    Tool->>Perms: permission.requested
    Perms->>Perms: evaluate allow and deny rules
    alt allow rule found
        Perms-->>Tool: approved
        Tool-->>Session: execute and return result
    else deny rule found
        Perms-->>Tool: denied
    else no rule and prompt mode
        Perms-->>User: no interactive approval available
        Perms-->>Tool: denied or user-not-available
    end
```

## Update behavior

There are two related update flows:

1. automatic update checks prepared by the root runtime/loader wrapper;
2. explicit `copilot update [channel]` command.

The explicit update command checks whether the CLI is running in the supported SEA/native context, loads config, chooses a requested channel, performs update work, and reports the result.

```mermaid
flowchart TD
    UpdateCmd["copilot update optional channel"] --> SeaCheck{"running in supported SEA/native mode?"}
    SeaCheck -- no --> Unsupported["report unsupported update context"]
    SeaCheck -- yes --> LoadConfig["load config/settings"]
    LoadConfig --> ChooseChannel["resolve requested or default channel"]
    ChooseChannel --> Download["download/select update package"]
    Download --> Install["install/cache updated package"]
    Install --> Report["print update result"]
```

## Content exclusion and telemetry

The runtime also wires content exclusion policies and telemetry/logging before creating sessions.

```mermaid
flowchart TD
    ConfigLoad["load config and state"] --> ContentPolicy["parse content exclusion policies"]
    ConfigLoad --> Logging["configure log writer and log level"]
    ConfigLoad --> Telemetry["configure telemetry or no-op/offline service"]

    Offline["offline or custom provider mode"] --> TelemetryDecision{"send GitHub telemetry?"}
    TelemetryDecision -- no --> NoOp["use disabled/no-op telemetry path"]
    TelemetryDecision -- yes --> ActiveTelemetry["standard telemetry service"]

    ContentPolicy --> SessionOptions["session options"]
    Logging --> SessionOptions
    ActiveTelemetry --> SessionOptions
    NoOp --> SessionOptions
```

## Integration summary

`app.js` acts as an orchestration layer. The agentic behavior depends on the session engine and bundled services, but this root file decides which integrations are available, which permissions apply, how the user authenticates, which model/provider is selected, and which runtime mode receives control.
