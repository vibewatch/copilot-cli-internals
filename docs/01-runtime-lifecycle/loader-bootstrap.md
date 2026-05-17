# Loader and bootstrap workflows

This file explains how execution reaches `app.js` and what `app.js` does before entering the main command/runtime flow.

Relevant files:

- `copilot-cli-pkg/npm-loader.js`
- `copilot-cli-pkg/index.js`
- `copilot-cli-pkg/app.js`

The SEA-internal artifacts referenced by the diagrams below (`sea-loader.js` and the embedded `copilot.tgz`) live inside the native `copilot` binary and are not committed to this repository; only the expanded package contents under `copilot-cli-pkg/` are tracked.

## Source anchors

`app.js` is bundled and minified, so the semantic aliases below are documentation names. Loader filenames are stable package anchors, while minified anchors are version-specific lookup aids.

| Semantic alias | Minified anchor | Location | Role |
|---|---|---|---|
| npm launcher | `copilot-cli-pkg/npm-loader.js` | package bin | Selects the native platform package or falls back to the JavaScript loader. |
| JavaScript restart wrapper | `copilot-cli-pkg/index.js`, `COPILOT_RUN_APP`, restart code `75` | package loader | Selects active package version, spawns child runtime, forwards signals, and restarts on update handoff. |
| App bootstrap module | `copilot-cli-pkg/app.js` | bundle entry | Installs restricted module loading, Git safety config, and runtime services before CLI dispatch. |
| Restricted require shim | `createRequire`, app-path containment check | early `app.js` bootstrap | Allows Node built-ins and approved vendored native modules while rejecting resolved paths outside the app directory. |
| Git hardening | `LVe()`, `safe.bareRepository=explicit`, `GIT_CONFIG_COUNT` | early `app.js` bootstrap | Adds environment-backed Git safety configuration. |
| Config migration | `COPILOT_HOME`, XDG `.copilot` migration helpers | early `app.js` bootstrap | Resolves state/config roots and compatibility migration behavior. |

## Distribution layout

The extracted binary is a Node/V8 single executable application (SEA) that carries a loader and a tarball asset. The tarball expands into the `@github/copilot` package.

```mermaid
flowchart TD
    Binary["Native copilot executable"] --> SEA["Node SEA payload"]
    SEA --> SeaLoader["sea-loader.js"]
    SEA --> PackageArchive["copilot.tgz asset"]
    PackageArchive --> Package["expanded @github/copilot package"]
    Package --> NpmLoader["npm-loader.js"]
    Package --> Index["index.js"]
    Package --> App["app.js"]

    Package --> Metadata["package.json"]
    Metadata --> Version["@github/copilot"]
    Metadata --> Bin["bin: copilot -> npm-loader.js"]
```

## npm/native launcher path

When installed as an npm package, the `copilot` bin points at `npm-loader.js`. That loader prefers a platform-native package if available and falls back to the JavaScript loader.

```mermaid
flowchart TD
    Start["user runs copilot"] --> NpmLoader["npm-loader.js"]
    NpmLoader --> NativeCheck{"platform package exists?"}

    NativeCheck -- yes --> NativePkg["@github/copilot-platform-arch"]
    NativePkg --> SpawnNative["spawn native binary with same args"]
    SpawnNative --> NativeRuntime["native SEA runtime"]

    NativeCheck -- no --> NodeVersion{"Node.js >= 24 for JS fallback?"}
    NodeVersion -- no --> Fail["print unsupported Node error"]
    NodeVersion -- yes --> ImportIndex["import ./index.js"]
    ImportIndex --> IndexRuntime["index.js loader wrapper"]
    IndexRuntime --> App["app.js"]
```

## `index.js` update/restart wrapper

The JavaScript loader wrapper does more than import `app.js`. It chooses the active package version, supports auto-update cache locations, spawns a child process with `COPILOT_RUN_APP=1`, forwards signals, and handles restart exit code `75`.

```mermaid
flowchart TD
    IndexStart["index.js starts"] --> EnvCheck{"COPILOT_RUN_APP == 1?"}

    EnvCheck -- yes --> SelectApp["select preferred app.js"]
    SelectApp --> ImportApp["dynamic import app.js"]

    EnvCheck -- no --> AutoUpdateCheck{"auto-update enabled?"}
    AutoUpdateCheck -- yes --> FindCached["find cached/copied package versions"]
    AutoUpdateCheck -- no --> UseBundled["use bundled package"]
    FindCached --> ChooseVersion["choose preferred version"]
    UseBundled --> ChooseVersion

    ChooseVersion --> SpawnChild["spawn child with COPILOT_RUN_APP=1"]
    SpawnChild --> ForwardSignals["forward process signals"]
    SpawnChild --> ExitCode{"child exit code"}

    ExitCode -- normal --> ExitSame["exit with child code"]
    ExitCode -- 75 --> RestartFile["read restart resume JSON"]
    RestartFile --> SpawnChild
```

## Early `app.js` bootstrap

The beginning of `app.js` sets up ESM/CommonJS compatibility and a restricted `require` shim. It allows built-in Node modules and selected vendored native modules, but rejects resolved module paths outside the application directory.

```mermaid
flowchart TD
    AppStart["app.js module evaluation"] --> Imports["import node:module/path/fs/url"]
    Imports --> RootRequire["create __rootRequire"]
    RootRequire --> AppPath["realpath of application directory"]
    AppPath --> NativeRoots["create require roots for vendored native modules"]
    NativeRoots --> RequireShim["define custom require(module)"]

    RequireShim --> ModuleType{"requested module"}
    ModuleType -- "approved vendored native" --> NativeRequire["load via vendored native require"]
    ModuleType -- "Node builtin" --> BuiltinRequire["load builtin"]
    ModuleType -- "regular package" --> ResolvePath["resolve module path"]
    ResolvePath --> InsideCheck{"inside app path?"}
    InsideCheck -- yes --> AppRequire["load module"]
    InsideCheck -- no --> SecurityError["throw security error"]
```

Approved vendored-native module families observed in the bootstrap section include:

- `sharp`
- `clipboard`
- `foundry-local-sdk`
- `@picovoice/pvrecorder-node`
- scoped native dependencies such as `@img/*` and `@teddyzhu/*`

## Git safety hardening

Early in startup, `app.js` adds `safe.bareRepository=explicit` to Git's environment-backed config list. This constrains how Git treats bare repositories during CLI operations.

```mermaid
flowchart TD
    GitSetup["LVe() git setup"] --> ReadCount["read GIT_CONFIG_COUNT"]
    ReadCount --> AlreadySet{"safe.bareRepository already present?"}
    AlreadySet -- yes --> Done["leave environment unchanged"]
    AlreadySet -- no --> AppendKey["append GIT_CONFIG_KEY_N=safe.bareRepository"]
    AppendKey --> AppendValue["append GIT_CONFIG_VALUE_N=explicit"]
    AppendValue --> Increment["increment GIT_CONFIG_COUNT"]
```

## Config and state directory migration

The runtime recognizes `COPILOT_HOME` and XDG locations. The observed XDG migration helper moves selected state/config files from XDG-based `.copilot` locations back to the default home location when appropriate, then creates compatibility symlinks.

```mermaid
flowchart TD
    MigrationStart["startup config migration"] --> EnvVars["check XDG_STATE_HOME and XDG_CONFIG_HOME"]
    EnvVars --> ExistingXdg{"XDG .copilot exists and differs from ~/.copilot?"}
    ExistingXdg -- no --> Skip["skip migration"]
    ExistingXdg -- yes --> EnsureHome["ensure ~/.copilot exists"]
    EnsureHome --> ForEachItem["for selected state/config items"]
    ForEachItem --> TargetExists{"target already exists?"}
    TargetExists -- yes --> WarnSkip["warn and skip item"]
    TargetExists -- no --> MoveItem["move or copy item"]
    MoveItem --> LinkBack["create symlink back to XDG path"]
```

## Bootstrap summary

Before the user-facing CLI logic runs, `app.js` has already:

- constrained dynamic module loading;
- installed Git safety config in environment variables;
- checked Node compatibility;
- prepared config/state directory behavior;
- defined shutdown/error/logging infrastructure used later by the top-level action.
