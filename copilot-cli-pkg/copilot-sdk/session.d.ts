/**
 * Copilot Session - represents a single conversation session with the Copilot CLI.
 * @module session
 */
import type { MessageConnection } from "vscode-jsonrpc/node.js";
import { createSessionRpc } from "./generated/rpc.js";
import type { ClientSessionApiHandlers } from "./generated/rpc.js";
import type { CommandHandler, AutoModeSwitchHandler, AutoModeSwitchRequest, AutoModeSwitchResponse, ElicitationHandler, ElicitationContext, ExitPlanModeHandler, ExitPlanModeRequest, ExitPlanModeResult, MessageOptions, PermissionHandler, PermissionRequestResult, ReasoningEffort, ModelCapabilitiesOverride, SectionTransformFn, SessionCapabilities, SessionEvent, SessionEventHandler, SessionEventType, SessionHooks, SessionUiApi, Tool, ToolHandler, TraceContextProvider, TypedSessionEventHandler, UserInputHandler, UserInputResponse } from "./types.js";
export declare const NO_RESULT_PERMISSION_V2_ERROR = "Permission handlers cannot return 'no-result' when connected to a protocol v2 server.";
/** Assistant message event - the final response from the assistant. */
export type AssistantMessageEvent = Extract<SessionEvent, {
    type: "assistant.message";
}>;
/**
 * Represents a single conversation session with the Copilot CLI.
 *
 * A session maintains conversation state, handles events, and manages tool execution.
 * Sessions are created via {@link CopilotClient.createSession} or resumed via
 * {@link CopilotClient.resumeSession}.
 *
 * @example
 * ```typescript
 * const session = await client.createSession({ model: "gpt-4" });
 *
 * // Subscribe to events
 * session.on((event) => {
 *   if (event.type === "assistant.message") {
 *     console.log(event.data.content);
 *   }
 * });
 *
 * // Send a message and wait for completion
 * await session.sendAndWait({ prompt: "Hello, world!" });
 *
 * // Clean up
 * await session.disconnect();
 * ```
 */
export declare class CopilotSession {
    readonly sessionId: string;
    private connection;
    private _workspacePath?;
    private eventHandlers;
    private typedEventHandlers;
    private toolHandlers;
    private commandHandlers;
    private permissionHandler?;
    private userInputHandler?;
    private elicitationHandler?;
    private exitPlanModeHandler?;
    private autoModeSwitchHandler?;
    private hooks?;
    private transformCallbacks?;
    private _rpc;
    private traceContextProvider?;
    private _capabilities;
    /** @internal Client session API handlers, populated by CopilotClient during create/resume. */
    clientSessionApis: ClientSessionApiHandlers;
    /**
     * Creates a new CopilotSession instance.
     *
     * @param sessionId - The unique identifier for this session
     * @param connection - The JSON-RPC message connection to the Copilot CLI
     * @param workspacePath - Path to the session workspace directory (when infinite sessions enabled)
     * @param traceContextProvider - Optional callback to get W3C Trace Context for outbound RPCs
     * @internal This constructor is internal. Use {@link CopilotClient.createSession} to create sessions.
     */
    constructor(sessionId: string, connection: MessageConnection, _workspacePath?: string | undefined, traceContextProvider?: TraceContextProvider);
    /**
     * Typed session-scoped RPC methods.
     */
    get rpc(): ReturnType<typeof createSessionRpc>;
    /**
     * Path to the session workspace directory when infinite sessions are enabled.
     * Contains checkpoints/, plan.md, and files/ subdirectories.
     * Undefined if infinite sessions are disabled.
     */
    get workspacePath(): string | undefined;
    /**
     * Host capabilities reported when the session was created or resumed.
     * Use this to check feature support before calling capability-gated APIs.
     */
    get capabilities(): SessionCapabilities;
    /**
     * Interactive UI methods for showing dialogs to the user.
     * Only available when the CLI host supports elicitation
     * (`session.capabilities.ui?.elicitation === true`).
     *
     * @example
     * ```typescript
     * if (session.capabilities.ui?.elicitation) {
     *   const ok = await session.ui.confirm("Deploy to production?");
     * }
     * ```
     */
    get ui(): SessionUiApi;
    /**
     * Sends a message to this session and waits for the response.
     *
     * The message is processed asynchronously. Subscribe to events via {@link on}
     * to receive streaming responses and other session events.
     *
     * @param options - The message options including the prompt and optional attachments
     * @returns A promise that resolves with the message ID of the response
     * @throws Error if the session has been disconnected or the connection fails
     *
     * @example
     * ```typescript
     * const messageId = await session.send({
     *   prompt: "Explain this code",
     *   attachments: [{ type: "file", path: "./src/index.ts" }]
     * });
     * ```
     */
    send(options: MessageOptions): Promise<string>;
    /**
     * Sends a message to this session and waits until the session becomes idle.
     *
     * This is a convenience method that combines {@link send} with waiting for
     * the `session.idle` event. Use this when you want to block until the
     * assistant has finished processing the message.
     *
     * Events are still delivered to handlers registered via {@link on} while waiting.
     *
     * @param options - The message options including the prompt and optional attachments
     * @param timeout - Timeout in milliseconds (default: 60000). Controls how long to wait; does not abort in-flight agent work.
     * @returns A promise that resolves with the final assistant message when the session becomes idle,
     *          or undefined if no assistant message was received
     * @throws Error if the timeout is reached before the session becomes idle
     * @throws Error if the session has been disconnected or the connection fails
     *
     * @example
     * ```typescript
     * // Send and wait for completion with default 60s timeout
     * const response = await session.sendAndWait({ prompt: "What is 2+2?" });
     * console.log(response?.data.content); // "4"
     * ```
     */
    sendAndWait(options: MessageOptions, timeout?: number): Promise<AssistantMessageEvent | undefined>;
    /**
     * Subscribes to events from this session.
     *
     * Events include assistant messages, tool executions, errors, and session state changes.
     * Multiple handlers can be registered and will all receive events.
     *
     * @param eventType - The specific event type to listen for (e.g., "assistant.message", "session.idle")
     * @param handler - A callback function that receives events of the specified type
     * @returns A function that, when called, unsubscribes the handler
     *
     * @example
     * ```typescript
     * // Listen for a specific event type
     * const unsubscribe = session.on("assistant.message", (event) => {
     *   console.log("Assistant:", event.data.content);
     * });
     *
     * // Later, to stop receiving events:
     * unsubscribe();
     * ```
     */
    on<K extends SessionEventType>(eventType: K, handler: TypedSessionEventHandler<K>): () => void;
    /**
     * Subscribes to all events from this session.
     *
     * @param handler - A callback function that receives all session events
     * @returns A function that, when called, unsubscribes the handler
     *
     * @example
     * ```typescript
     * const unsubscribe = session.on((event) => {
     *   switch (event.type) {
     *     case "assistant.message":
     *       console.log("Assistant:", event.data.content);
     *       break;
     *     case "session.error":
     *       console.error("Error:", event.data.message);
     *       break;
     *   }
     * });
     *
     * // Later, to stop receiving events:
     * unsubscribe();
     * ```
     */
    on(handler: SessionEventHandler): () => void;
    /**
     * Dispatches an event to all registered handlers.
     * Also handles broadcast request events internally (external tool calls, permissions).
     *
     * @param event - The session event to dispatch
     * @internal This method is for internal use by the SDK.
     */
    _dispatchEvent(event: SessionEvent): void;
    /**
     * Handles broadcast request events by executing local handlers and responding via RPC.
     * Handlers are dispatched as fire-and-forget — rejections propagate as unhandled promise
     * rejections, consistent with standard EventEmitter / event handler semantics.
     * @internal
     */
    private _handleBroadcastEvent;
    /**
     * Executes a tool handler and sends the result back via RPC.
     * @internal
     */
    private _executeToolAndRespond;
    /**
     * Executes a permission handler and sends the result back via RPC.
     * @internal
     */
    private _executePermissionAndRespond;
    /**
     * Executes a command handler and sends the result back via RPC.
     * @internal
     */
    private _executeCommandAndRespond;
    /**
     * Registers custom tool handlers for this session.
     *
     * Tools allow the assistant to execute custom functions. When the assistant
     * invokes a tool, the corresponding handler is called with the tool arguments.
     *
     * @param tools - An array of tool definitions with their handlers, or undefined to clear all tools
     * @internal This method is typically called internally when creating a session with tools.
     */
    registerTools(tools?: Tool[]): void;
    /**
     * Retrieves a registered tool handler by name.
     *
     * @param name - The name of the tool to retrieve
     * @returns The tool handler if found, or undefined
     * @internal This method is for internal use by the SDK.
     */
    getToolHandler(name: string): ToolHandler | undefined;
    /**
     * Registers command handlers for this session.
     *
     * @param commands - An array of command definitions with handlers, or undefined to clear
     * @internal This method is typically called internally when creating/resuming a session.
     */
    registerCommands(commands?: {
        name: string;
        handler: CommandHandler;
    }[]): void;
    /**
     * Registers the elicitation handler for this session.
     *
     * @param handler - The handler to invoke when the server dispatches an elicitation request
     * @internal This method is typically called internally when creating/resuming a session.
     */
    registerElicitationHandler(handler?: ElicitationHandler): void;
    /**
     * Registers the exit-plan-mode handler for this session.
     *
     * @param handler - The handler to invoke when the server dispatches an exit-plan-mode request
     * @internal This method is typically called internally when creating/resuming a session.
     */
    registerExitPlanModeHandler(handler?: ExitPlanModeHandler): void;
    /**
     * Registers the auto-mode-switch handler for this session.
     *
     * @param handler - The handler to invoke when the server dispatches an auto-mode-switch request
     * @internal This method is typically called internally when creating/resuming a session.
     */
    registerAutoModeSwitchHandler(handler?: AutoModeSwitchHandler): void;
    /**
     * Handles an elicitation.requested broadcast event.
     * Invokes the registered handler and responds via handlePendingElicitation RPC.
     * @internal
     */
    _handleElicitationRequest(context: ElicitationContext, requestId: string): Promise<void>;
    /**
     * Handles an exitPlanMode.request callback from the runtime.
     * @internal
     */
    _handleExitPlanModeRequest(request: ExitPlanModeRequest): Promise<ExitPlanModeResult>;
    /**
     * Handles an autoModeSwitch.request callback from the runtime.
     * @internal
     */
    _handleAutoModeSwitchRequest(request: AutoModeSwitchRequest): Promise<AutoModeSwitchResponse>;
    /**
     * Sets the host capabilities for this session.
     *
     * @param capabilities - The capabilities object from the create/resume response
     * @internal This method is typically called internally when creating/resuming a session.
     */
    setCapabilities(capabilities?: SessionCapabilities): void;
    private assertElicitation;
    private _elicitation;
    private _confirm;
    private _select;
    private _input;
    /**
     * Registers a handler for permission requests.
     *
     * When the assistant needs permission to perform certain actions (e.g., file operations),
     * this handler is called to approve or deny the request.
     *
     * @param handler - The permission handler function, or undefined to remove the handler
     * @internal This method is typically called internally when creating a session.
     */
    registerPermissionHandler(handler?: PermissionHandler): void;
    /**
     * Registers a user input handler for ask_user requests.
     *
     * When the agent needs input from the user (via ask_user tool),
     * this handler is called to provide the response.
     *
     * @param handler - The user input handler function, or undefined to remove the handler
     * @internal This method is typically called internally when creating a session.
     */
    registerUserInputHandler(handler?: UserInputHandler): void;
    /**
     * Registers hook handlers for session lifecycle events.
     *
     * Hooks allow custom logic to be executed at various points during
     * the session lifecycle (before/after tool use, session start/end, etc.).
     *
     * @param hooks - The hook handlers object, or undefined to remove all hooks
     * @internal This method is typically called internally when creating a session.
     */
    registerHooks(hooks?: SessionHooks): void;
    /**
     * Registers transform callbacks for system message sections.
     *
     * @param callbacks - Map of section ID to transform callback, or undefined to clear
     * @internal This method is typically called internally when creating a session.
     */
    registerTransformCallbacks(callbacks?: Map<string, SectionTransformFn>): void;
    /**
     * Handles a systemMessage.transform request from the runtime.
     * Dispatches each section to its registered transform callback.
     *
     * @param sections - Map of section IDs to their current rendered content
     * @returns A promise that resolves with the transformed sections
     * @internal This method is for internal use by the SDK.
     */
    _handleSystemMessageTransform(sections: Record<string, {
        content: string;
    }>): Promise<{
        sections: Record<string, {
            content: string;
        }>;
    }>;
    /**
     * Handles a permission request in the v2 protocol format (synchronous RPC).
     * Used as a back-compat adapter when connected to a v2 server.
     *
     * @param request - The permission request data from the CLI
     * @returns A promise that resolves with the permission decision
     * @internal This method is for internal use by the SDK.
     */
    _handlePermissionRequestV2(request: unknown): Promise<PermissionRequestResult>;
    /**
     * Handles a user input request from the Copilot CLI.
     *
     * @param request - The user input request data from the CLI
     * @returns A promise that resolves with the user's response
     * @internal This method is for internal use by the SDK.
     */
    _handleUserInputRequest(request: unknown): Promise<UserInputResponse>;
    /**
     * Handles a hooks invocation from the Copilot CLI.
     *
     * @param hookType - The type of hook being invoked
     * @param input - The input data for the hook
     * @returns A promise that resolves with the hook output, or undefined
     * @internal This method is for internal use by the SDK.
     */
    _handleHooksInvoke(hookType: string, input: unknown): Promise<unknown>;
    /**
     * Retrieves all events and messages from this session's history.
     *
     * This returns the complete conversation history including user messages,
     * assistant responses, tool executions, and other session events.
     *
     * @returns A promise that resolves with an array of all session events
     * @throws Error if the session has been disconnected or the connection fails
     *
     * @example
     * ```typescript
     * const events = await session.getMessages();
     * for (const event of events) {
     *   if (event.type === "assistant.message") {
     *     console.log("Assistant:", event.data.content);
     *   }
     * }
     * ```
     */
    getMessages(): Promise<SessionEvent[]>;
    /**
     * Disconnects this session and releases all in-memory resources (event handlers,
     * tool handlers, permission handlers).
     *
     * Session state on disk (conversation history, planning state, artifacts) is
     * preserved, so the conversation can be resumed later by calling
     * {@link CopilotClient.resumeSession} with the session ID. To permanently
     * remove all session data including files on disk, use
     * {@link CopilotClient.deleteSession} instead.
     *
     * After calling this method, the session object can no longer be used.
     *
     * @returns A promise that resolves when the session is disconnected
     * @throws Error if the connection fails
     *
     * @example
     * ```typescript
     * // Clean up when done — session can still be resumed later
     * await session.disconnect();
     * ```
     */
    disconnect(): Promise<void>;
    /**
     * @deprecated Use {@link disconnect} instead. This method will be removed in a future release.
     *
     * Disconnects this session and releases all in-memory resources.
     * Session data on disk is preserved for later resumption.
     *
     * @returns A promise that resolves when the session is disconnected
     * @throws Error if the connection fails
     */
    destroy(): Promise<void>;
    /** Enables `await using session = ...` syntax for automatic cleanup. */
    [Symbol.asyncDispose](): Promise<void>;
    /**
     * Aborts the currently processing message in this session.
     *
     * Use this to cancel a long-running request. The session remains valid
     * and can continue to be used for new messages.
     *
     * @returns A promise that resolves when the abort request is acknowledged
     * @throws Error if the session has been disconnected or the connection fails
     *
     * @example
     * ```typescript
     * // Start a long-running request
     * const messagePromise = session.send({ prompt: "Write a very long story..." });
     *
     * // Abort after 5 seconds
     * setTimeout(async () => {
     *   await session.abort();
     * }, 5000);
     * ```
     */
    abort(): Promise<void>;
    /**
     * Change the model for this session.
     * The new model takes effect for the next message. Conversation history is preserved.
     *
     * @param model - Model ID to switch to
     * @param options - Optional settings for the new model
     *
     * @example
     * ```typescript
     * await session.setModel("gpt-4.1");
     * await session.setModel("claude-sonnet-4.6", { reasoningEffort: "high" });
     * ```
     */
    setModel(model: string, options?: {
        reasoningEffort?: ReasoningEffort;
        modelCapabilities?: ModelCapabilitiesOverride;
    }): Promise<void>;
    /**
     * Log a message to the session timeline.
     * The message appears in the session event stream and is visible to SDK consumers
     * and (for non-ephemeral messages) persisted to the session event log on disk.
     *
     * @param message - Human-readable message text
     * @param options - Optional log level and ephemeral flag
     *
     * @example
     * ```typescript
     * await session.log("Processing started");
     * await session.log("Disk usage high", { level: "warning" });
     * await session.log("Connection failed", { level: "error" });
     * await session.log("Debug info", { ephemeral: true });
     * ```
     */
    log(message: string, options?: {
        level?: "info" | "warning" | "error";
        ephemeral?: boolean;
    }): Promise<void>;
}
