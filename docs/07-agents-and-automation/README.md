# Agents and automation

Task orchestration, built-in agents, subagents, autopilot, fleet mode, and scheduled prompt/command automation.

## Semantic alias and minified anchor mapping

This is a section index, not a direct `app.js` implementation analysis. Topic pages linked below carry the concrete bundle mappings.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Agents and automation section index | N/A — navigation page | Groups task orchestration, autopilot, fleet, and scheduled prompt docs. |
| Agents and automation topic pages | See linked page-level mappings | Concrete `app.js` anchors are documented in the child pages. |

## How this section fits

Click a node in the map to jump to that page or related section.

```mermaid
flowchart TD
    Tasks[Task orchestration] --> Builtins[Built-in agents]
    Builtins --> Subagents[Subagents/custom agents]
    Autopilot[Autopilot/no-ask-user] --> Tasks
    Fleet[Fleet mode] --> Subagents
    Schedules[Scheduled prompts/commands] --> Tasks

    click Tasks "./agent-task-orchestration/" "Open agent and task orchestration"
    click Builtins "./built-in-agents/" "Open built-in agents"
    click Subagents "../02-context-and-input/custom-agents-and-skills-packaging/" "Open custom agents and skills"
    click Autopilot "./autopilot-and-no-ask-user/" "Open autopilot and no-ask-user"
    click Fleet "./fleet-mode/" "Open fleet mode"
    click Schedules "./scheduled-prompts-and-command-queue/" "Open scheduled prompts and command queue"
```

## Pages

| Page | Why read it | File |
|---|---|---|
| [Agent and task orchestration in Copilot CLI](./agent-task-orchestration.md) | Task tool dispatch, TaskRegistry, main/subagent/custom-agent collaboration, hooks, MCP tasks, research, and fleet. | `agent-task-orchestration.md` |
| [Built-in agents in Copilot CLI](./built-in-agents.md) | Central catalog for `general-purpose`, `explore`, `task`, `code-review`, `research`, `rubber-duck`, and `rem-agent`; YAML-backed versus runtime-defined prompt sources; selection and execution path. | `built-in-agents.md` |
| [Autopilot and no-ask-user flags](./autopilot-and-no-ask-user.md) | Implementation comparison of --autopilot, --no-ask-user, continuation, task_complete, ask_user, and permission boundaries. | `autopilot-and-no-ask-user.md` |
| [Fleet mode implementation in Copilot CLI](./fleet-mode.md) | /fleet, session.fleet.start, autopilot_fleet, SQL todo coordination, dependencies, and parallel subagents. | `fleet-mode.md` |
| [Scheduled prompts and command queue](./scheduled-prompts-and-command-queue.md) | /every and /after parsing, ScheduleRegistry replay, queue integration, and ephemeral command dispatch. | `scheduled-prompts-and-command-queue.md` |

## Reading guidance

- Task orchestration is the base; autopilot, fleet, and schedules build on it.
- Use the built-in agents page when you need the packaged agent catalog and prompt-source split before diving into the full task lifecycle.
- Read this section with custom agents/skills in Context and input.

## Back to wiki home

- [Wiki home](../README.md)
- [Full table of contents](../SUMMARY.md)
