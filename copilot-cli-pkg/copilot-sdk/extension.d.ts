import type { CopilotSession } from "./session.js";
import { type ExtensionInfo, type PermissionHandler, type ResumeSessionConfig } from "./types.js";
export { Canvas, CanvasError, createCanvas, type CanvasAction, type CanvasDeclaration, type CanvasHostContext, type CanvasJsonSchema, type CanvasOptions, } from "./canvas.js";
export type JoinSessionConfig = Omit<ResumeSessionConfig, "onPermissionRequest" | "extensionSdkPath"> & {
    onPermissionRequest?: PermissionHandler;
};
export type { ExtensionInfo };
/**
 * Joins the current foreground session.
 *
 * @param config - Configuration to add to the session
 * @returns A promise that resolves with the joined session
 *
 * @example
 * ```typescript
 * import { joinSession } from "@github/copilot-sdk/extension";
 *
 * const session = await joinSession({ tools: [myTool] });
 * ```
 */
export declare function joinSession(config?: JoinSessionConfig): Promise<CopilotSession>;
