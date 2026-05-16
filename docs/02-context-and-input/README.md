# Context and input

Everything that becomes model-visible context: prompts, custom instructions, attachments, memory, compaction, and rewind boundaries.

## Semantic alias and minified anchor mapping

This is a section index, not a direct `app.js` implementation analysis. Topic pages linked below carry the concrete bundle mappings.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Context and input section index | N/A — navigation page | Groups prompt, instruction, attachment, memory, compaction, and rewind docs. |
| Context and input topic pages | See linked page-level mappings | Concrete `app.js` anchors are documented in the child pages. |

## How this section fits

Click a node in the map to jump to that page or section.

```mermaid
flowchart TD
    Prompt[Prompt sources] --> ModelContext[Model-visible context]
    Agents[Custom agents/skills] --> ModelContext
    Attachments[Attachments/files] --> ModelContext
    Memory[Memory/context board] --> ModelContext
    Compaction[Compaction] --> ModelContext
    Rewind[Checkpoints/rewind] --> ModelContext

    click Prompt "./prompt-sources/" "Open prompt sources"
    click Agents "./custom-agents-and-skills-packaging/" "Open custom agents and skills"
    click Attachments "./attachments-and-file-ingestion/" "Open attachments and file ingestion"
    click Memory "./memory-and-context-board/" "Open memory and context board"
    click Compaction "./conversation-compaction/" "Open conversation compaction"
    click Rewind "./checkpoints-undo-rewind/" "Open checkpoints and rewind"
    click ModelContext "./" "Open Context and input overview"
```

## Pages

| Page | Why read it | File |
|---|---|---|
| [Prompt sources in Copilot CLI](./prompt-sources.md) | Static/runtime prompt sources, YAML package prompts, instructions, MCP prompts, hooks, and provider mapping. | `prompt-sources.md` |
| [`app.js` prompt catalog](./app-js-prompt-catalog.md) | Extracted model-facing prompt templates from `copilot-cli-pkg/app.js`, with system-prompt composition workflow diagrams and placeholders for dynamic parameters. | `app-js-prompt-catalog.md` |
| [Custom agents and skills packaging](./custom-agents-and-skills-packaging.md) | AGENTS.md, SKILL.md, built-in skills, plugin/remote/provided agents, skill directories, skill invocation, allowed-tools, and enable/disable events. | `custom-agents-and-skills-packaging.md` |
| [Attachment and file-ingestion pipeline](./attachments-and-file-ingestion.md) | Native image/document attachments, tagged-file fallback, MIME detection, payload mapping, and limits. | `attachments-and-file-ingestion.md` |
| [Memory and dynamic context board in Copilot CLI](./memory-and-context-board.md) | Agentic memory API, local memory, dynamic context board, rem-agent, sidekicks, and shutdown consolidation. | `memory-and-context-board.md` |
| [Conversation compaction and memory compression in Copilot CLI](./conversation-compaction.md) | /compact, automatic compaction, request-time prompt trimming, summary replacement, checkpoints, hooks, telemetry, and UI status. | `conversation-compaction.md` |
| [Checkpoints, undo, rewind, and fork](./checkpoints-undo-rewind.md) | /undo, /rewind, /fork, event-log truncation/replay, snapshot_rewind, and workspace events. | `checkpoints-undo-rewind.md` |

## Reading guidance

- This section explains how input becomes prompt/context.
- Compaction and rewind describe how context is later rewritten or replayed.

## Back to wiki home

- [Wiki home](../README.md)
- [Full table of contents](../SUMMARY.md)
