# Agents and automation

This MVP section covers how the runtime delegates work beyond one foreground model turn: built-in agents, custom agents, subagents, background tasks, autopilot, fleet mode, scheduled prompts, and command queues.

## Semantic alias and minified anchor mapping

This is a navigation page. Linked implementation pages carry concrete `app.js` anchors.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Agents/automation section | N/A — navigation page | Groups task orchestration, built-in agents, custom agents, autopilot/no-ask-user, fleet mode, and scheduled prompts. |
| Agent implementation pages | See linked topic pages | Concrete bundle anchors live in the destination pages. |

## Primary path

| Order | Page | Covers |
|---:|---|---|
| 1 | [Agent and task orchestration](agent-task-orchestration.md) | Task tool dispatch, TaskRegistry, main/subagent/custom-agent collaboration, hooks, MCP tasks, research, and fleet. |
| 2 | [Built-in agents](built-in-agents.md) | Built-in agent catalog, YAML-backed vs runtime-defined prompts, selection, execution, and slash-command entry points. |
| 3 | [Custom agents and skills packaging](custom-agents-and-skills-packaging.md) | AGENTS.md, SKILL.md, plugin/remote/provided agents, skill directories, invocation, allowed-tools, and events. |
| 4 | [Autopilot and no-ask-user flags](autopilot-and-no-ask-user.md) | `--autopilot`, `--no-ask-user`, continuation, `task_complete`, `ask_user`, and permission boundaries. |
| 5 | [Fleet mode implementation](fleet-mode.md) | `/fleet`, `session.fleet.start`, SQL todo coordination, dependencies, and parallel subagents. |
| 6 | [Scheduled prompts and command queue](scheduled-prompts-and-command-queue.md) | `/every`, `/after`, ScheduleRegistry replay, queue integration, and ephemeral command dispatch. |

## Back to MVP start

- [Start here](../00-start-here/README.md)
