# Sessions, persistence, and remote

This MVP section treats sessions as the durable spine of the runtime: events, replay, state files, indexing, fork/rewind, cloud/remote operation, UI projection, and repository context.

## Semantic alias and minified anchor mapping

This is a navigation page. Linked implementation pages carry concrete `app.js` anchors.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Sessions/persistence/remote section | N/A — navigation page | Groups end-to-end session flow, local persistence, SessionFs, SQLite indexing, schemas, UI projection, git context, and remote control. |
| Session implementation pages | See linked topic pages | Concrete bundle anchors live in the destination pages. |

## Primary path

| Order | Page | Covers |
|---:|---|---|
| 1 | [End-to-end session lifecycle](session-lifecycle-end-to-end.md) | Creation/resume/continue, replay, workspace state, tool refresh, UI projection, indexing, remote export, and shutdown. |
| 2 | [Session support implementation](session-support-implementation.md) | Event-sourced local persistence, workspace artifacts, startup resolution, APIs, and handoff behavior. |
| 3 | [Persistence pipeline for sessions](persistence-pipeline.md) | JSONL events, SessionFs, workspace sidecars, SQLite/FTS, search/reindex, fork, rewind, checkpoints, and cloud sync. |
| 4 | [SessionFs provider and state-file lifecycle](session-fs-provider-and-state-files.md) | Local and SDK/RPC-backed session filesystems, reverse calls, large output temp files, and fork-time copying. |
| 5 | [Session, remote, cloud, and history workflows](sessions-remote-cloud.md) | Resume/continue/name handling, background sessions, cloud sessions, remote steering, and history. |
| 6 | [Remote control implementation](remote-control-implementation.md) | Mission Control exporter, command polling, `/remote`, permission bridging, and remote task attach. |

## Supporting session topics

- [API and session event schema contracts](api-and-session-event-schemas.md)
- [Session-store SQLite indexing](session-store-sqlite-indexing.md)
- [System events and UI projection](system-events-and-ui-projection.md)
- [Git, repository, PR, and ref context](git-repository-context.md)

## Back to MVP start

- [Start here](../00-start-here/README.md)
