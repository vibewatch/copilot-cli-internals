# Settings and configuration persistence

## MVP placement

> **Why this page is here:** This page belongs to [Tools, integrations, and security](README.md). It documents an action boundary: how tools, MCP/plugins/SDK/IDE/web bridges, policies, approvals, redaction, hooks, or sandboxing become safe runtime behavior. Pair it with [Context and model loop](../02-context-model-loop/README.md) for what the model sees and [Sessions, persistence, and remote](../04-sessions-persistence-remote/README.md) for how events/results persist.

This document explains how the extracted Copilot CLI bundle loads, merges, migrates, and writes settings/configuration. In the analyzed `app.js`, configuration is not one file or one object. It is a family of stores and runtime overlays covering user settings, location permissions, MCP/LSP config, plugin state, sandbox policy, URL permissions, trusted folders, feature flags, auth metadata, terminal setup prompts, and session runtime options.

Because `app.js` is bundled/minified, symbol names are unstable. Line references below are searchable anchors in the extracted bundle and will shift across releases.

## Source anchors

| Semantic alias | Minified anchor | Approx. `app.js` line | Role |
|---|---|---:|---|
| Config root resolution | `Vs(...)`, `configDir`, `COPILOT_HOME`, `.copilot` | 234 | Runtime config root comes from explicit settings, env var, or home directory. |
| Store factory | `load`, `write`, `writeKey`, `path`, `directoryFiles` | 236 | Reusable JSON/config store helper with caching and key writes. |
| Store kinds | `DEFAULT`, `SETTINGS`, `MCP`, `LSP`, `LOCATION_PERMISSIONS` | 236 | Multiple logical config stores exist. |
| User settings schema | `allowedUrls`, `deniedUrls`, `disabledMcpServers`, `enabledMcpServers`, `sandbox`, `trustedFolders` | 236, 239 | Settings schema covers permissions, URLs, MCP, sandbox, plugins, UI, and more. |
| Plugin persistence | `installedPlugins`, `enabledPlugins`, `writeKey` | 528 | Plugin manager writes installed/enabled plugin state. |
| URL permissions | `allowedUrls`, `deniedUrls`, `addAllowedUrl`, `addDeniedUrl` | 555 | URL allow/deny entries are persisted in settings. |
| MCP persistence | `disabledMcpServers`, `enabledMcpServers`, `mcp-config.json` | 4945, 4949, 7717 | MCP server enablement and config are stored separately. |
| Sandbox persistence | `sandbox`, `resolvedRuntimeSettings()`, `/sandbox enable` | 1254, 1333 | Sandbox enablement is read/written via runtime settings. |
| Trusted folders | `trustedFolders`, `isFolderTrusted`, `addTrustedFolder` | 6021 | Trusted folders are normalized and persisted. |
| Terminal setup | `askedSetupTerminals` | 4512 | “Already asked” prompts are persisted to avoid repeated setup prompts. |
| Config migration | `config.json`, `settings.json`, `Settings migration` | 7441-7443 | Legacy config can be migrated/merged into settings. |
| Relocation files | `session-state`, `session-store.db`, `installed-plugins`, `mcp-config`, `permissions-config` | 7445 | State/config files are relocated into `.copilot` roots. |
| CLI options | `--config-dir`, `--additional-mcp-config`, `--allow-url`, `--allow-all-urls` | 7774, 8221 | CLI options override or augment persisted config. |

## Configuration roots

The root path helper resolves the Copilot config/state home in this order:

1. explicit runtime `configDir` if present;
2. `COPILOT_HOME` environment variable;
3. default `~/.copilot` directory.

The same helper is reused across settings, MCP config, LSP config, permissions config, state, plugin cache, session state, and migration paths. The bundle also supports tilde expansion and relative-path normalization for user-supplied paths.

## Store families

The config store factory defines logical store kinds equivalent to:

| Store kind | Purpose |
|---|---|
| `config` / default | Main user/runtime configuration. |
| `settings` | User settings-style keys, often migrated from legacy config. |
| `mcp` | MCP server configuration. |
| `lsp` | Language server configuration. |
| `permissions` | Location-scoped permission persistence. |

Each store has helpers for:

| Helper | Role |
|---|---|
| `load(scope, settings)` | Read and parse a JSON/config file. |
| `write(object, scope, settings)` | Merge/write an object. |
| `writeKey(key, value, scope, settings)` | Set/delete one key in a store. |
| `path(scope)` | Compute the on-disk path. |
| `directoryFiles(...)` | Enumerate files in a config directory. |

The store helper caches loaded values by `configDir` and scope when caching is enabled. It also supports both `.json` and extensionless legacy file names.

## `writeKey` semantics

`writeKey` is used heavily because many commands update one setting without replacing the entire file.

Its behavior is roughly:

1. Resolve the store path for a scope and runtime settings.
2. If the target value is `undefined` and the file does not exist, delete the cache entry and return.
3. Load existing JSON or start with `{}`.
4. Apply normalization/validation transforms if configured.
5. Set `object[key] = value`, or delete the key if value is `undefined`.
6. Validate the resulting object.
7. Update cache when validation succeeds; clear cache if validation fails.
8. Write the file with restricted mode.

This allows commands like `/sandbox enable`, MCP enable/disable, URL permission additions, and plugin installs to mutate settings incrementally.

## User settings schema

The user settings schema is broad. Evidence anchors show support for:

| Setting area | Example keys |
|---|---|
| UI/display | `theme`, `colorMode`, `renderMarkdown`, `footer`, `statusLine`, `screenReader`. |
| Model/runtime | `model`, `effortLevel`, `continueOnAutoMode`, `stream`, `streamerMode`. |
| URLs | `allowedUrls`, `deniedUrls`. |
| Plugins | `installedPlugins`, `enabledPlugins`, `extraKnownMarketplaces`. |
| MCP | `disabledMcpServers`, `enabledMcpServers`. |
| Sandbox | `sandbox.enabled`, filesystem policy, raw `policy`, raw `config`. |
| Skills/agents | `skillDirectories`, `disabledSkills`, custom-agent settings. |
| Hooks | `disableAllHooks`, `hooks`. |
| Trust/auth metadata | `trustedFolders`, `lastLoggedInUser`, `loggedInUsers`, `copilotTokens`. |
| UX suppression | `askedSetupTerminals`, `suppressInitFolders`, first-launch flags. |

The schema is `passthrough()` in several places, meaning future keys can survive parsing even when the current bundle does not explicitly understand them.

## Runtime settings versus persisted settings

The session object stores `runtimeSettings` and exposes `resolvedRuntimeSettings()`. Slash commands use that to write to the correct config root. Examples:

| Command/path | Persisted key |
|---|---|
| `/sandbox enable` / `/sandbox disable` | `sandbox.enabled`. |
| `/init suppress` | `suppressInitFolders`. |
| reset approvals | location-scoped permissions and allow-all state. |
| auto-mode continuation | `continueOnAutoMode`. |
| terminal setup prompt | `askedSetupTerminals`. |

This distinction matters when the CLI is launched with a non-default `configDir` or with session-specific runtime settings.

## Permission persistence

Permissions are split across several persistence paths:

| Permission class | Persistence behavior |
|---|---|
| Tool approvals | Session-scoped and location-scoped approval stores. |
| Path permissions | Allowed directories and all-paths mode are runtime/session state plus settings. |
| URL permissions | `allowedUrls` and `deniedUrls` in settings. |
| MCP server enablement | `disabledMcpServers` and `enabledMcpServers`. |
| Trusted folders | `trustedFolders` list in user settings. |
| Allow-all mode | Runtime/session flag, reset by `/reset-allowed-tools`/approval reset paths. |

The URL manager persists allow/deny entries through `Is.writeKey("allowedUrls", ...)` and `Is.writeKey("deniedUrls", ...)`. Deny rules take precedence in the CLI help text and permission logic.

## URL settings

URL settings are protocol-aware. The CLI help states:

- domains without protocol default to HTTPS;
- approving `https://example.com` does not approve `http://example.com`;
- `--allow-url` and `--deny-url` accept URL/domain patterns;
- `--allow-all-urls` enables unrestricted URL access;
- `--allow-all` / `--yolo` are equivalent to all tools, all paths, and all URLs.

Persisted settings hold `allowedUrls` and `deniedUrls`, while runtime flags can set unrestricted mode for a session.

## MCP settings

MCP config is loaded from multiple sources, including:

- user `~/.copilot/mcp-config.json`;
- workspace `.mcp.json`;
- installed plugins with MCP servers;
- built-in/default GitHub MCP config;
- additional runtime MCP config via `--additional-mcp-config`.

Server enable/disable state is stored separately with `disabledMcpServers` and `enabledMcpServers`. The `/mcp disable` path adds a server to `disabledMcpServers` and removes it from `enabledMcpServers`. The `/mcp enable` path does the inverse and may explicitly persist built-in enabled servers.

## Plugin settings

Plugin install persists two related settings:

| Key | Purpose |
|---|---|
| `installedPlugins` | Full installed plugin records: name, marketplace, version, install timestamp, enabled flag, cache path, and source. |
| `enabledPlugins` | Enablement map used during config merging. |

The plugin cache itself lives under state (`installed-plugins`) while plugin/user config lives in config/settings stores. This avoids mixing package cache with editable user config.

## Sandbox settings

The sandbox config schema includes:

- `sandbox.enabled`;
- filesystem `readwritePaths`, `readonlyPaths`, `deniedPaths`;
- `clearPolicyOnExit`;
- raw `policy` and raw `config` objects;
- `addCurrentWorkingDirectory`.

The `/sandbox` slash command reads and writes `sandbox.enabled` through `resolvedRuntimeSettings()`. The shell spawn path later reads sandbox config/policy to construct platform sandbox behavior.

## Trusted folders

Trusted-folder persistence is implemented by a small helper that:

1. loads `trustedFolders` from user settings;
2. canonicalizes/realpaths candidate paths;
3. checks whether the candidate is inside an existing trusted folder;
4. adds the normalized path only if it is not already covered;
5. writes `trustedFolders` back with `writeKey`.

This prevents duplicates and makes trust checks robust against path normalization differences.

## Migration and relocation

The bundle includes migration logic for legacy `config.json` / `config` files and settings-style keys.

The migration path:

- reads `config.json` or `config`;
- accepts either JSON object format or simple `KEY=VALUE` lines;
- canonicalizes legacy key names;
- compares values with existing `settings.json`;
- warns if both files contain conflicting values;
- writes migrated settings;
- preserves unknown/remaining keys where appropriate.

A later relocation helper treats these as state files:

- `session-state`;
- `session-store.db`;
- `command-history-state`;
- `command-history-state.json`;
- `installed-plugins`.

And these as config files:

- `config.json`;
- `config`;
- `mcp-config`;
- `lsp-config`;
- `permissions-config`;
- `copilot-instructions.md`;
- `mcp-oauth-config`;
- `hooks`.

## Precedence model

The exact merge order is distributed, but the effective precedence is:

1. built-in defaults;
2. persisted user settings/config;
3. workspace/repository config where applicable;
4. plugin-provided config contributions;
5. environment variables such as `COPILOT_HOME` and feature flag overrides;
6. CLI flags such as `--config-dir`, `--allow-url`, `--allow-all-urls`, `--plugin-dir`, and `--additional-mcp-config`;
7. session runtime changes made by slash commands or UI actions.

Some sources merge maps (`enabledPlugins`, marketplaces), some append arrays (additional MCP config, plugin dirs), and some override booleans directly (`sandbox.enabled`, `continueOnAutoMode`).

## Relationship to other docs

- `integrations-permissions-config.md` gives the broad integration view.
- `permission-system-design.md` explains how persisted approvals are interpreted.
- `plugin-extension-architecture.md` explains plugin install/cache state.
- `mcp-support-implementation.md` explains MCP config merging.
- `sandboxing.md` explains how persisted sandbox settings affect shell execution.
