import type { SessionFsHandler, SessionFsStatResult, SessionFsReaddirWithTypesEntry, SessionFsSqliteQueryResult as GeneratedSqliteQueryResult, SessionFsSqliteTransactionErrorClass, SessionFsSqliteQueryType } from "./generated/rpc.js";
export type { SessionFsSqliteQueryType, SessionFsSqliteTransactionErrorClass };
/**
 * File metadata returned by {@link SessionFsProvider.stat}.
 * Same shape as the generated {@link SessionFsStatResult} but without the
 * `error` field, since providers signal errors by throwing.
 */
export type SessionFsFileInfo = Omit<SessionFsStatResult, "error">;
/**
 * Result of a SQLite query execution via {@link SessionFsSqliteProvider.query}.
 * Same shape as the generated {@link GeneratedSqliteQueryResult} but without the
 * `error` field, since providers signal errors by throwing.
 */
export type SessionFsSqliteQueryResult = Omit<GeneratedSqliteQueryResult, "error">;
/**
 * One statement in an atomic SQLite transaction passed to
 * {@link SessionFsSqliteProvider.transaction}.
 */
export interface SessionFsSqliteStatement {
    /** How to execute: `"exec"` for DDL/multi-statement, `"query"` for SELECT, `"run"` for INSERT/UPDATE/DELETE. */
    queryType: SessionFsSqliteQueryType;
    /** SQL statement to execute. */
    query: string;
    /** Optional named bind parameters. */
    params?: Record<string, string | number | null>;
}
/**
 * Error thrown by {@link SessionFsSqliteProvider.transaction} to classify a
 * transaction failure for the runtime.
 *
 * Any other thrown value is reported as `"fatal"`. Throw this with
 * `"busyOrLocked"` when SQLite reported BUSY/LOCKED before commit and the
 * transaction was rolled back, so the runtime knows the call is safe to retry.
 */
export declare class SessionFsSqliteTransactionFailure extends Error {
    /** Failure classification reported to the runtime. */
    readonly errorClass: SessionFsSqliteTransactionErrorClass;
    constructor(message: string, errorClass?: SessionFsSqliteTransactionErrorClass);
}
/**
 * SQLite operations for the per-session database.
 * Implementers provide query execution and existence checking.
 */
export interface SessionFsSqliteProvider {
    /**
     * Execute a SQLite query against the per-session database.
     *
     * @param queryType - How to execute: `"exec"` for DDL/multi-statement, `"query"` for SELECT, `"run"` for INSERT/UPDATE/DELETE.
     * @param query - SQL query to execute.
     * @param params - Optional named bind parameters.
     */
    query(queryType: SessionFsSqliteQueryType, query: string, params?: Record<string, string | number | null>): Promise<SessionFsSqliteQueryResult | undefined>;
    /**
     * Execute `statements` atomically against the per-session database.
     *
     * Apply busy handling to every statement and roll back the whole batch if
     * any statement fails. Throw {@link SessionFsSqliteTransactionFailure} to
     * classify the failure; any other thrown value is reported as `"fatal"`.
     *
     * @param statements - Statements to execute in order inside a single transaction.
     * @returns One result per statement, in the same order.
     */
    transaction?(statements: SessionFsSqliteStatement[]): Promise<SessionFsSqliteQueryResult[]>;
    /**
     * Check whether the per-session database already exists, without creating it.
     */
    exists(): Promise<boolean>;
}
/**
 * Interface for session filesystem providers. Implementers use idiomatic
 * TypeScript patterns: throw on error, return values directly. Use
 * {@link createSessionFsAdapter} to convert a provider into the
 * {@link SessionFsHandler} expected by the SDK.
 *
 * Errors with a `code` property of `"ENOENT"` are mapped to the ENOENT
 * error code; all others map to UNKNOWN.
 */
export interface SessionFsProvider {
    /** Reads the full content of a file. Throw if the file does not exist. */
    readFile(path: string): Promise<string>;
    /** Writes content to a file, creating parent directories if needed. */
    writeFile(path: string, content: string, mode?: number): Promise<void>;
    /** Appends content to a file, creating parent directories if needed. */
    appendFile(path: string, content: string, mode?: number): Promise<void>;
    /** Checks whether a path exists. */
    exists(path: string): Promise<boolean>;
    /** Gets metadata about a file or directory. Throw if it does not exist. */
    stat(path: string): Promise<SessionFsFileInfo>;
    /** Creates a directory. If recursive is true, creates parents as needed. */
    mkdir(path: string, recursive: boolean, mode?: number): Promise<void>;
    /** Lists entry names in a directory. Throw if it does not exist. */
    readdir(path: string): Promise<string[]>;
    /** Lists entries with type info. Throw if the directory does not exist. */
    readdirWithTypes(path: string): Promise<SessionFsReaddirWithTypesEntry[]>;
    /** Removes a file or directory. If force is true, do not throw on ENOENT. */
    rm(path: string, recursive: boolean, force: boolean): Promise<void>;
    /** Renames/moves a file or directory. */
    rename(src: string, dest: string): Promise<void>;
    /** Per-session SQLite database operations. Optional — omit if the provider does not support SQLite. */
    sqlite?: SessionFsSqliteProvider;
}
/**
 * Wraps a {@link SessionFsProvider} into the {@link SessionFsHandler}
 * interface expected by the SDK, converting thrown errors into
 * {@link SessionFsError} results.
 */
export declare function createSessionFsAdapter(provider: SessionFsProvider): SessionFsHandler;
