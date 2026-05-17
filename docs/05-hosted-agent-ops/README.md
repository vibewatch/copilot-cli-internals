# Hosted agent ops

This MVP section groups the hosted coding-agent runtime contract: job environment variables, hosted settings construction, default GitHub MCP policy, OIDC token injection, firewall and trajectory outputs, feature gates, diagnostics, debug bundles, observability, and shutdown behavior.

## Semantic alias and minified anchor mapping

This is a navigation page. Linked implementation pages carry concrete `app.js` anchors.

| Semantic alias | Minified anchor | Scope |
|---|---|---|
| Hosted agent ops section | N/A — navigation page | Groups hosted-agent environment contracts, MCP/OIDC bootstrap, diagnostics, debug bundles, OTel switches, feature gates, and support artifacts. |
| Hosted implementation pages | See linked topic pages | Concrete bundle anchors live in the destination pages. |

## Primary path

| Order | Page | Covers |
|---:|---|---|
| 1 | [Hosted agent environment](hosted-agent-environment.md) | `COPILOT_AGENT_*` settings envelope, hosted MCP/OIDC bootstrap, OTel switches, firewall logs, trajectory output, and managed-agent SDK watchpoints. |
| 2 | [Feature gates and rollout logic](feature-gates.md) | Gate tiers, env/settings overrides, remote experiments, repo/team allowlists, and MCP permission gates. |
| 3 | [Diagnostics, feedback, and debug bundles](diagnostics-feedback-debug-bundles.md) | `/diagnose`, `/feedback`, `/bug`, `/collect-debug-logs`, support archives, and secret gist uploads. |
| 4 | [Debug bundle and redaction boundaries](debug-bundle-redaction-boundaries.md) | Diagnostic inputs, redaction layers, local archive vs secret gist risks, and support-sharing caveats. |
| 5 | [Observability, update, and shutdown workflows](observability-update-shutdown.md) | Logging, telemetry, OpenTelemetry, debug artifacts, update/version paths, and graceful shutdown. |

## Cross-links

- [MCP support implementation](../03-tools-integrations-security/mcp-support-implementation.md) for generic MCP host behavior.
- [Content exclusion and redaction](../03-tools-integrations-security/content-exclusion-and-redaction.md) for broader filtering/redaction policy.
- [Session, remote, cloud, and history workflows](../04-sessions-persistence-remote/sessions-remote-cloud.md) for cloud session behavior outside the hosted job envelope.
- [Research atlas](../99-research-atlas/README.md) for generated indexes and future watchpoints.

## Back to MVP start

- [Start here](../00-start-here/README.md)
