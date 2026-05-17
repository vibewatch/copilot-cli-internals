# Context and model loop

This MVP section follows everything that becomes model-visible context and the request loop that consumes it: prompts, instructions, attachments, memory, compaction, provider routing, retries, quota, and usage accounting.

## Semantic alias and minified anchor mapping

This is a navigation page. Linked implementation pages carry concrete `app.js` anchors.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Context/model loop section | N/A — navigation page | Groups prompt/context assembly with provider request, streaming, retry, compaction, and usage behavior. |
| Context/model implementation pages | See linked topic pages | Concrete bundle anchors live in the destination pages. |

## Primary path

| Order | Page | Covers |
|---:|---|---|
| 1 | [Prompt sources in Copilot CLI](prompt-sources.md) | Static/runtime prompts, instructions, MCP prompts, hooks, and provider mapping. |
| 2 | [`app.js` prompt catalog](app-js-prompt-catalog.md) | Extracted prompt families and system-prompt composition details. |
| 3 | [Attachment and file-ingestion pipeline](attachments-and-file-ingestion.md) | Image/document attachments, tagged-file fallback, MIME detection, and limits. |
| 4 | [Memory and dynamic context board](memory-and-context-board.md) | Agentic memory, local memory, context board, rem-agent, sidekicks, and consolidation. |
| 5 | [Conversation compaction and memory compression](conversation-compaction.md) | `/compact`, automatic compaction, request trimming, summary replacement, and checkpoints. |
| 6 | [Model API routing and provider wire formats](model-api-routing.md) | Chat Completions, Responses, WebSocket Responses, and Anthropic Messages API routing. |
| 7 | [Rate limits, concurrency, retries, and error recovery](resilience-rate-limits-concurrency.md) | Retry policy, rate-limit recovery, fallback, cancellation, and request-size handling. |

## Supporting model topics

- [Models, providers, and authentication workflows](models-providers-auth.md)
- [Usage, quota, and billing metrics](usage-quota-billing-metrics.md)
- [Checkpoints, undo, rewind, and fork](checkpoints-undo-rewind.md)
- [Custom agents and skills packaging](../06-agents-automation/custom-agents-and-skills-packaging.md)

## Back to MVP start

- [Start here](../00-start-here/README.md)
