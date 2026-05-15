import { createServerRpc } from "./generated/rpc.js";
import { CopilotSession } from "./session.js";
import type { ConnectionState, CopilotClientOptions, GetAuthStatusResponse, GetStatusResponse, ModelInfo, ResumeSessionConfig, SessionConfig, SessionLifecycleEventType, SessionLifecycleHandler, SessionListFilter, SessionMetadata, TypedSessionLifecycleHandler } from "./types.js";
/**
 * Main client for interacting with the Copilot CLI.
 *
 * The CopilotClient manages the connection to the Copilot CLI server and provides
 * methods to create and manage conversation sessions. It can either spawn a CLI
 * server process or connect to an existing server.
 *
 * @example
 * ```typescript
 * import { CopilotClient } from "@github/copilot-sdk";
 *
 * // Create a client with default options (spawns CLI server)
 * const client = new CopilotClient();
 *
 * // Or connect to an existing server
 * const client = new CopilotClient({ cliUrl: "localhost:3000" });
 *
 * // Create a session
 * const session = await client.createSession({ onPermissionRequest: approveAll, model: "gpt-4" });
 *
 * // Send messages and handle responses
 * session.on((event) => {
 *   if (event.type === "assistant.message") {
 *     console.log(event.data.content);
 *   }
 * });
 * await session.send({ prompt: "Hello!" });
 *
 * // Clean up
 * await session.disconnect();
 * await client.stop();
 * ```
 */
export declare class CopilotClient {
    private cliStartTimeout;
    private cliProcess;
    private connection;
    private socket;
    private actualPort;
    private actualHost;
    private state;
    private sessions;
    private stderrBuffer;
    private options;
    private isExternalServer;
    private forceStopping;
    /** Token sent in `connect`; auto-generated when the SDK spawns its own CLI in TCP mode. */
    private effectiveConnectionToken?;
    private onListModels?;
    private onGetTraceContext?;
    private modelsCache;
    private modelsCacheLock;
    private sessionLifecycleHandlers;
    private typedLifecycleHandlers;
    private _rpc;
    private _internalRpc;
    private processExitPromise;
    private negotiatedProtocolVersion;
    /** Connection-level session filesystem config, set via constructor option. */
    private sessionFsConfig;
    /**
     * Typed server-scoped RPC methods.
     * @throws Error if the client is not connected
     */
    get rpc(): ReturnType<typeof createServerRpc>;
    /**
     * Internal RPC surface (e.g. handshake helpers). Not part of the public API.
     * @internal
     */
    private get internalRpc();
    /**
     * Creates a new CopilotClient instance.
     *
     * @param options - Configuration options for the client
     * @throws Error if mutually exclusive options are provided (e.g., cliUrl with useStdio or cliPath)
     *
     * @example
     * ```typescript
     * // Default options - spawns CLI server using stdio
     * const client = new CopilotClient();
     *
     * // Connect to an existing server
     * const client = new CopilotClient({ cliUrl: "localhost:3000" });
     *
     * // Custom CLI path with specific log level
     * const client = new CopilotClient({
     *   cliPath: "/usr/local/bin/copilot",
     *   logLevel: "debug"
     * });
     * ```
     */
    constructor(options?: CopilotClientOptions);
    /**
     * Parse CLI URL into host and port
     * Supports formats: "host:port", "http://host:port", "https://host:port", or just "port"
     */
    private parseCliUrl;
    private validateSessionFsConfig;
    /**
     * Starts the CLI server and establishes a connection.
     *
     * If connecting to an external server (via cliUrl), only establishes the connection.
     * Otherwise, spawns the CLI server process and then connects.
     *
     * This method is called automatically when creating a session if `autoStart` is true (default).
     *
     * @returns A promise that resolves when the connection is established
     * @throws Error if the server fails to start or the connection fails
     *
     * @example
     * ```typescript
     * const client = new CopilotClient({ autoStart: false });
     * await client.start();
     * // Now ready to create sessions
     * ```
     */
    start(): Promise<void>;
    /**
     * Stops the CLI server and closes all active sessions.
     *
     * This method performs graceful cleanup:
     * 1. Closes all active sessions (releases in-memory resources)
     * 2. Closes the JSON-RPC connection
     * 3. Terminates the CLI server process (if spawned by this client)
     *
     * Note: session data on disk is preserved, so sessions can be resumed later.
     * To permanently remove session data before stopping, call
     * {@link deleteSession} for each session first.
     *
     * @returns A promise that resolves with an array of errors encountered during cleanup.
     *          An empty array indicates all cleanup succeeded.
     *
     * @example
     * ```typescript
     * const errors = await client.stop();
     * if (errors.length > 0) {
     *   console.error("Cleanup errors:", errors);
     * }
     * ```
     */
    stop(): Promise<Error[]>;
    /**
     * Forcefully stops the CLI server without graceful cleanup.
     *
     * Use this when {@link stop} fails or takes too long. This method:
     * - Clears all sessions immediately without destroying them
     * - Force closes the connection
     * - Sends SIGKILL to the CLI process (if spawned by this client)
     *
     * @returns A promise that resolves when the force stop is complete
     *
     * @example
     * ```typescript
     * // If normal stop hangs, force stop
     * const stopPromise = client.stop();
     * const timeout = new Promise((_, reject) =>
     *   setTimeout(() => reject(new Error("Timeout")), 5000)
     * );
     *
     * try {
     *   await Promise.race([stopPromise, timeout]);
     * } catch {
     *   await client.forceStop();
     * }
     * ```
     */
    forceStop(): Promise<void>;
    /**
     * Creates a new conversation session with the Copilot CLI.
     *
     * Sessions maintain conversation state, handle events, and manage tool execution.
     * If the client is not connected and `autoStart` is enabled, this will automatically
     * start the connection.
     *
     * @param config - Optional configuration for the session
     * @returns A promise that resolves with the created session
     * @throws Error if the client is not connected and autoStart is disabled
     *
     * @example
     * ```typescript
     * // Basic session
     * const session = await client.createSession({ onPermissionRequest: approveAll });
     *
     * // Session with model and tools
     * const session = await client.createSession({
     *   onPermissionRequest: approveAll,
     *   model: "gpt-4",
     *   tools: [{
     *     name: "get_weather",
     *     description: "Get weather for a location",
     *     parameters: { type: "object", properties: { location: { type: "string" } } },
     *     handler: async (args) => ({ temperature: 72 })
     *   }]
     * });
     * ```
     */
    createSession(config: SessionConfig): Promise<CopilotSession>;
    /**
     * Resumes an existing conversation session by its ID.
     *
     * This allows you to continue a previous conversation, maintaining all
     * conversation history. The session must have been previously created
     * and not deleted.
     *
     * @param sessionId - The ID of the session to resume
     * @param config - Optional configuration for the resumed session
     * @returns A promise that resolves with the resumed session
     * @throws Error if the session does not exist or the client is not connected
     *
     * @example
     * ```typescript
     * // Resume a previous session
     * const session = await client.resumeSession("session-123", { onPermissionRequest: approveAll });
     *
     * // Resume with new tools
     * const session = await client.resumeSession("session-123", {
     *   onPermissionRequest: approveAll,
     *   tools: [myNewTool]
     * });
     * ```
     */
    resumeSession(sessionId: string, config: ResumeSessionConfig): Promise<CopilotSession>;
    /**
     * Gets the current connection state of the client.
     *
     * @returns The current connection state: "disconnected", "connecting", "connected", or "error"
     *
     * @example
     * ```typescript
     * if (client.getState() === "connected") {
     *   const session = await client.createSession({ onPermissionRequest: approveAll });
     * }
     * ```
     */
    getState(): ConnectionState;
    /**
     * Sends a ping request to the server to verify connectivity.
     *
     * @param message - Optional message to include in the ping
     * @returns A promise that resolves with the ping response containing the message and timestamp
     * @throws Error if the client is not connected
     *
     * @example
     * ```typescript
     * const response = await client.ping("health check");
     * console.log(`Server responded at ${new Date(response.timestamp)}`);
     * ```
     */
    ping(message?: string): Promise<{
        message: string;
        timestamp: number;
        protocolVersion?: number;
    }>;
    /**
     * Get CLI status including version and protocol information
     */
    getStatus(): Promise<GetStatusResponse>;
    /**
     * Get current authentication status
     */
    getAuthStatus(): Promise<GetAuthStatusResponse>;
    /**
     * List available models with their metadata.
     *
     * If an `onListModels` handler was provided in the client options,
     * it is called instead of querying the CLI server.
     *
     * Results are cached after the first successful call to avoid rate limiting.
     * The cache is cleared when the client disconnects.
     *
     * @throws Error if not connected (when no custom handler is set)
     */
    listModels(): Promise<ModelInfo[]>;
    /**
     * Send the `connect` handshake (carrying the optional token) and verify the
     * server's protocol version. Falls back to `ping` against legacy servers
     * that don't implement `connect`.
     */
    private verifyProtocolVersion;
    /**
     * Gets the ID of the most recently updated session.
     *
     * This is useful for resuming the last conversation when the session ID
     * was not stored.
     *
     * @returns A promise that resolves with the session ID, or undefined if no sessions exist
     * @throws Error if the client is not connected
     *
     * @example
     * ```typescript
     * const lastId = await client.getLastSessionId();
     * if (lastId) {
     *   const session = await client.resumeSession(lastId, { onPermissionRequest: approveAll });
     * }
     * ```
     */
    getLastSessionId(): Promise<string | undefined>;
    /**
     * Permanently deletes a session and all its data from disk, including
     * conversation history, planning state, and artifacts.
     *
     * Unlike {@link CopilotSession.disconnect}, which only releases in-memory
     * resources and preserves session data for later resumption, this method
     * is irreversible. The session cannot be resumed after deletion.
     *
     * @param sessionId - The ID of the session to delete
     * @returns A promise that resolves when the session is deleted
     * @throws Error if the session does not exist or deletion fails
     *
     * @example
     * ```typescript
     * await client.deleteSession("session-123");
     * ```
     */
    deleteSession(sessionId: string): Promise<void>;
    /**
     * List all available sessions.
     *
     * @param filter - Optional filter to limit returned sessions by context fields
     *
     * @example
     * // List all sessions
     * const sessions = await client.listSessions();
     *
     * @example
     * // List sessions for a specific repository
     * const sessions = await client.listSessions({ repository: "owner/repo" });
     */
    listSessions(filter?: SessionListFilter): Promise<SessionMetadata[]>;
    /**
     * Gets metadata for a specific session by ID.
     *
     * This provides an efficient O(1) lookup of a single session's metadata
     * instead of listing all sessions. Returns undefined if the session is not found.
     *
     * @param sessionId - The ID of the session to look up
     * @returns A promise that resolves with the session metadata, or undefined if not found
     * @throws Error if the client is not connected
     *
     * @example
     * ```typescript
     * const metadata = await client.getSessionMetadata("session-123");
     * if (metadata) {
     *   console.log(`Session started at: ${metadata.startTime}`);
     * }
     * ```
     */
    getSessionMetadata(sessionId: string): Promise<SessionMetadata | undefined>;
    private static toSessionMetadata;
    /**
     * Gets the foreground session ID in TUI+server mode.
     *
     * This returns the ID of the session currently displayed in the TUI.
     * Only available when connecting to a server running in TUI+server mode (--ui-server).
     *
     * @returns A promise that resolves with the foreground session ID, or undefined if none
     * @throws Error if the client is not connected
     *
     * @example
     * ```typescript
     * const sessionId = await client.getForegroundSessionId();
     * if (sessionId) {
     *   console.log(`TUI is displaying session: ${sessionId}`);
     * }
     * ```
     */
    getForegroundSessionId(): Promise<string | undefined>;
    /**
     * Sets the foreground session in TUI+server mode.
     *
     * This requests the TUI to switch to displaying the specified session.
     * Only available when connecting to a server running in TUI+server mode (--ui-server).
     *
     * @param sessionId - The ID of the session to display in the TUI
     * @returns A promise that resolves when the session is switched
     * @throws Error if the client is not connected or if the operation fails
     *
     * @example
     * ```typescript
     * // Switch the TUI to display a specific session
     * await client.setForegroundSessionId("session-123");
     * ```
     */
    setForegroundSessionId(sessionId: string): Promise<void>;
    /**
     * Subscribes to a specific session lifecycle event type.
     *
     * Lifecycle events are emitted when sessions are created, deleted, updated,
     * or change foreground/background state (in TUI+server mode).
     *
     * @param eventType - The specific event type to listen for
     * @param handler - A callback function that receives events of the specified type
     * @returns A function that, when called, unsubscribes the handler
     *
     * @example
     * ```typescript
     * // Listen for when a session becomes foreground in TUI
     * const unsubscribe = client.on("session.foreground", (event) => {
     *   console.log(`Session ${event.sessionId} is now displayed in TUI`);
     * });
     *
     * // Later, to stop receiving events:
     * unsubscribe();
     * ```
     */
    on<K extends SessionLifecycleEventType>(eventType: K, handler: TypedSessionLifecycleHandler<K>): () => void;
    /**
     * Subscribes to all session lifecycle events.
     *
     * @param handler - A callback function that receives all lifecycle events
     * @returns A function that, when called, unsubscribes the handler
     *
     * @example
     * ```typescript
     * const unsubscribe = client.on((event) => {
     *   switch (event.type) {
     *     case "session.foreground":
     *       console.log(`Session ${event.sessionId} is now in foreground`);
     *       break;
     *     case "session.created":
     *       console.log(`New session created: ${event.sessionId}`);
     *       break;
     *   }
     * });
     *
     * // Later, to stop receiving events:
     * unsubscribe();
     * ```
     */
    on(handler: SessionLifecycleHandler): () => void;
    /**
     * Start the CLI server process
     */
    private startCLIServer;
    /**
     * Connect to the CLI server (via socket or stdio)
     */
    private connectToServer;
    /**
     * Connect to child via stdio pipes
     */
    private connectToChildProcessViaStdio;
    /**
     * Connect to parent via stdio pipes
     */
    private connectToParentProcessViaStdio;
    /**
     * Connect to the CLI server via TCP socket
     */
    private connectViaTcp;
    private attachConnectionHandlers;
    private handleSessionEventNotification;
    private handleSessionLifecycleNotification;
    private handleUserInputRequest;
    private handleExitPlanModeRequest;
    private handleAutoModeSwitchRequest;
    private handleHooksInvoke;
    private handleSystemMessageTransform;
    /**
     * Handles a v2-style tool.call RPC request from the server.
     * Looks up the session and tool handler, executes it, and returns the result
     * in the v2 response format.
     */
    private handleToolCallRequestV2;
    /**
     * Handles a v2-style permission.request RPC request from the server.
     */
    private handlePermissionRequestV2;
    private normalizeToolResultV2;
    private isToolResultObject;
}
