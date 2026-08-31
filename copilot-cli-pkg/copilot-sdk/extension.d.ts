import type { CopilotSession } from "./session.js";
import { type PermissionHandler, type ResumeSessionConfig } from "./types.js";
import type { FactoryHandle } from "./factory.js";
export { Canvas, CanvasError, createCanvas, type CanvasAction, type CanvasDeclaration, type CanvasHostContext, type CanvasJsonSchema, type CanvasOptions, } from "./canvas.js";
export type JoinSessionConfig = Omit<ResumeSessionConfig, "onPermissionRequest" | "extensionSdkPath"> & {
    onPermissionRequest?: PermissionHandler;
    /**
     * Factory handles to register when the extension joins the session.
     *
     * @experimental Part of the experimental Agent Factories surface and may
     * change or be removed in future SDK or CLI releases.
     */
    factories?: FactoryHandle[];
};
export type { ExtensionInfo, FactoryLimits, FactoryMeta } from "./types.js";
export { defineFactory, FactoryResumeError, isFactoryRunTerminal, type RunOptions, type ResumeOptions, type FactoryResumeErrorCode, type SessionFactoryApi, type FactoryAgentOptions, type FactoryContext, type FactoryDefinition, type FactoryHandle, type FactoryJsonSchema, type JsonValue, type FactoryPipelineStage, type FactoryStepOptions, type FactoryRunResult, type FactoryRunStatus, type FactoryRunSummary, type FactoryRunDetail, type FactoryProgressPage, type FactoryProgressLine, type FactoryPhaseObservation, type FactoryPhaseStatus, type FactoryAgentSummary, } from "./factory.js";
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
