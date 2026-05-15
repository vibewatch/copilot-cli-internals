// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeRewriteDocLinks from './src/plugins/rehype-rewrite-doc-links.mjs';

/**
 * GitHub Pages deploy config.
 *
 * Production deploys go to the custom domain
 * https://copilot-cli.genisisiq.com (served from the root path).
 *
 * When DEPLOY_TARGET=github-pages, the build emits absolute URLs based on
 * `SITE_URL` and an optional path prefix from `SITE_BASE` (leave empty for
 * a root-domain deployment). Local dev and preview keep the bare-root
 * behaviour so links work without extra setup.
 *
 * Override either value via env vars when invoking the build, e.g.:
 *   SITE_URL=https://my-org.github.io SITE_BASE=/my-repo \
 *     DEPLOY_TARGET=github-pages pnpm build
 */
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';
const siteUrl = process.env.SITE_URL ?? 'https://copilot-cli.genisisiq.com';
const basePath = process.env.SITE_BASE ?? '';

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages ? siteUrl : undefined,
  base: isGitHubPages && basePath ? basePath : undefined,
  trailingSlash: 'always',
  markdown: {
    // Rewrite GitHub-style `*.md` links in the source docs to Starlight
    // routes. The custom docs loader (see `src/content.config.ts`) reuses
    // this markdown config, so the same rewrite applies to every page.
    rehypePlugins: [rehypeRewriteDocLinks],
  },
  integrations: [
    starlight({
      title: 'Copilot CLI Internals',
      description:
        'Reverse-engineering wiki for the @github/copilot CLI bundle (app.js).',
      logo: {
        src: './src/assets/cat.svg',
        replacesTitle: false,
      },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      lastUpdated: true,
      pagination: true,
      customCss: [
        // Order matters — tokens first, then base layers, then components.
        './src/assets/fonts.css',
        './src/styles/tokens.css',
        './src/styles/theme.css',
        './src/styles/typography.css',
        './src/styles/callouts.css',
        './src/styles/code.css',
        './src/styles/components.css',
      ],
      components: {
        Head: './src/components/Head.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        Footer: './src/components/Footer.astro',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/vibewatch/copilot-cli-internals',
        },
      ],
      sidebar: [
        {
          label: 'Introduction',
          items: [
            { label: 'Overview', link: '/00-overview/' },
            { label: 'What is app.js', link: '/00-overview/what-is-app-js/' },
            { label: 'Main feature map', link: '/00-overview/main-feature-map/' },
            { label: 'Full table of contents', link: '/summary/' },
          ],
        },
        {
          label: 'Runtime and UI',
          items: [
            { label: 'Overview', link: '/01-runtime-and-ui/' },
            { label: 'Loader and bootstrap', link: '/01-runtime-and-ui/loader-bootstrap/' },
            { label: 'CLI runtime workflows', link: '/01-runtime-and-ui/cli-runtime-workflows/' },
            { label: 'TUI and slash commands', link: '/01-runtime-and-ui/tui-and-slash-commands/' },
            { label: 'Terminal and shell environment', link: '/01-runtime-and-ui/terminal-setup-and-shell-environment/' },
            { label: 'Voice mode and Foundry Local', link: '/01-runtime-and-ui/voice-mode-foundry-local/' },
            { label: 'Embedded server, ACP, JSON-RPC', link: '/01-runtime-and-ui/embedded-server-acp-protocol/' },
            { label: 'Tree-sitter WASM usage', link: '/01-runtime-and-ui/tree-sitter-wasm-usage/' },
          ],
        },
        {
          label: 'Context and input',
          items: [
            { label: 'Overview', link: '/02-context-and-input/' },
            { label: 'Prompt sources', link: '/02-context-and-input/prompt-sources/' },
            { label: 'Custom agents and skills', link: '/02-context-and-input/custom-agents-and-skills-packaging/' },
            { label: 'Attachments and file ingestion', link: '/02-context-and-input/attachments-and-file-ingestion/' },
            { label: 'Memory and context board', link: '/02-context-and-input/memory-and-context-board/' },
            { label: 'Conversation compaction', link: '/02-context-and-input/conversation-compaction/' },
            { label: 'Checkpoints, undo, rewind', link: '/02-context-and-input/checkpoints-undo-rewind/' },
          ],
        },
        {
          label: 'Sessions and remote',
          items: [
            { label: 'Overview', link: '/03-sessions-and-remote/' },
            { label: 'Session support', link: '/03-sessions-and-remote/session-support-implementation/' },
            { label: 'Sessions, remote, cloud', link: '/03-sessions-and-remote/sessions-remote-cloud/' },
            { label: 'Session-store SQLite indexing', link: '/03-sessions-and-remote/session-store-sqlite-indexing/' },
            { label: 'System events and UI projection', link: '/03-sessions-and-remote/system-events-and-ui-projection/' },
            { label: 'Git and repository context', link: '/03-sessions-and-remote/git-repository-context/' },
            { label: 'Remote control', link: '/03-sessions-and-remote/remote-control-implementation/' },
          ],
        },
        {
          label: 'Tools and integrations',
          items: [
            { label: 'Overview', link: '/04-tools-and-integrations/' },
            { label: 'Built-in tool execution', link: '/04-tools-and-integrations/built-in-tool-execution-pipeline/' },
            { label: 'MCP support', link: '/04-tools-and-integrations/mcp-support-implementation/' },
            { label: 'Plugin and extension architecture', link: '/04-tools-and-integrations/plugin-extension-architecture/' },
            { label: 'IDE, LSP, editor integration', link: '/04-tools-and-integrations/ide-lsp-editor-integration/' },
            { label: 'Web search and URL fetching', link: '/04-tools-and-integrations/web-search-url-fetching/' },
            { label: 'Integrations and permissions', link: '/04-tools-and-integrations/integrations-permissions-config/' },
          ],
        },
        {
          label: 'Security and policy',
          items: [
            { label: 'Overview', link: '/05-security-and-policy/' },
            { label: 'Permission system', link: '/05-security-and-policy/permission-system-design/' },
            { label: 'Content exclusion and redaction', link: '/05-security-and-policy/content-exclusion-and-redaction/' },
            { label: 'Hooks and lifecycle automation', link: '/05-security-and-policy/hooks-lifecycle-automation/' },
            { label: 'Sandboxing', link: '/05-security-and-policy/sandboxing/' },
            { label: 'Settings and config persistence', link: '/05-security-and-policy/settings-config-persistence/' },
          ],
        },
        {
          label: 'Models and reliability',
          items: [
            { label: 'Overview', link: '/06-models-and-reliability/' },
            { label: 'Models, providers, auth', link: '/06-models-and-reliability/models-providers-auth/' },
            { label: 'Model API routing', link: '/06-models-and-reliability/model-api-routing/' },
            { label: 'Resilience and rate limits', link: '/06-models-and-reliability/resilience-rate-limits-concurrency/' },
            { label: 'Usage, quota, billing', link: '/06-models-and-reliability/usage-quota-billing-metrics/' },
          ],
        },
        {
          label: 'Agents and automation',
          items: [
            { label: 'Overview', link: '/07-agents-and-automation/' },
            { label: 'Agent and task orchestration', link: '/07-agents-and-automation/agent-task-orchestration/' },
            { label: 'Autopilot and no-ask-user', link: '/07-agents-and-automation/autopilot-and-no-ask-user/' },
            { label: 'Fleet mode', link: '/07-agents-and-automation/fleet-mode/' },
            { label: 'Scheduled prompts', link: '/07-agents-and-automation/scheduled-prompts-and-command-queue/' },
          ],
        },
        {
          label: 'Operations and research',
          items: [
            { label: 'Overview', link: '/08-operations-and-research/' },
            { label: 'Feature gates', link: '/08-operations-and-research/feature-gates/' },
            { label: 'Diagnostics and debug bundles', link: '/08-operations-and-research/diagnostics-feedback-debug-bundles/' },
            { label: 'Observability and shutdown', link: '/08-operations-and-research/observability-update-shutdown/' },
            { label: 'Documentation opportunities', link: '/08-operations-and-research/documentation-opportunities/' },
          ],
        },
      ],
    }),
  ],
});
