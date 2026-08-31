import { PassThrough, Writable } from "node:stream";
export declare class FfiRuntimeHost {
    private readonly libraryPath;
    private readonly cliEntrypoint;
    private readonly environment;
    private readonly args;
    private readonly lib;
    private serverId;
    private connectionId;
    private disposed;
    private outboundCallback;
    private keepAliveTimer;
    /** The stream JSON-RPC reads server→client frames from. */
    readonly receiveStream: PassThrough;
    /** The stream JSON-RPC writes client→server frames to. */
    readonly sendStream: Writable;
    private constructor();
    /**
     * Resolves the cdylib next to the given CLI entrypoint and prepares the FFI host.
     * The cdylib is resolved as `prebuilds/<prebuildsFolder>/runtime.node` relative to
     * the entrypoint directory (the napi-rs `<node-platform>-<arch>` layout, e.g.
     * `linux-x64`). Throws if it cannot be found.
     */
    static create(cliEntrypoint: string, prebuildsFolder: string, environment: Record<string, string | undefined> | undefined, args: readonly string[]): FfiRuntimeHost;
    /**
     * Starts the in-process runtime: spawns the CLI worker via the native host,
     * waits for readiness, and opens the FFI JSON-RPC connection.
     */
    start(): Promise<void>;
    private writeFrame;
    /**
     * Native outbound (server→client) callback. koffi delivers it on the JS event loop
     * via a threadsafe function, so the frame is decoded and written straight to
     * {@link receiveStream}. The native pointer is only valid for this call, so the
     * bytes are copied out before returning.
     */
    private feedInbound;
    private unregisterCallback;
    /** Closes the FFI connection, shuts down the native host, and releases resources. */
    dispose(): void;
}
