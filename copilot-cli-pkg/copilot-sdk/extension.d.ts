import type { CopilotSession } from "./session.js";
import { type PermissionHandler, type ResumeSessionConfig } from "./types.js";
export type JoinSessionConfig = Omit<ResumeSessionConfig, "onPermissionRequest"> & {
    onPermissionRequest?: PermissionHandler;
};
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
