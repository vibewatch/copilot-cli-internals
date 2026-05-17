// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { readFileSync } from 'node:fs';
import rehypeRewriteDocLinks from './src/plugins/rehype-rewrite-doc-links.mjs';

/**
 * GitHub Pages deploy config.
 *
 * Production deploys go to the custom domain
 * https://copilot-cli.genisisiq.com (served from the root path).
 *
 * The `site` URL is always set so Astro/Starlight can generate canonical
 * URLs and a sitemap during any production build. When
 * DEPLOY_TARGET=github-pages, the build also applies an optional path prefix
 * from `SITE_BASE` (leave empty for a root-domain deployment). Local dev and
 * preview keep the bare-root base path so links work without extra setup.
 *
 * Override either value via env vars when invoking the build, e.g.:
 *   SITE_URL=https://my-org.github.io SITE_BASE=/my-repo \
 *     DEPLOY_TARGET=github-pages npm run build
 */
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';
const siteUrl = process.env.SITE_URL ?? 'https://copilot-cli.genisisiq.com';
const basePath = process.env.SITE_BASE ?? '';

function forceStarlightLightTheme() {
  const starlightPagePath = '/node_modules/@astrojs/starlight/components/Page.astro';
  const darkThemeShell = "const htmlDataAttributes: DOMStringMap = { 'data-theme': 'dark' };";
  const lightThemeShell = "const htmlDataAttributes: DOMStringMap = { 'data-theme': 'light' };";
  const isStarlightPage = (id) => id.split('?', 1)[0].replaceAll('\\', '/').endsWith(starlightPagePath);

  return {
    name: 'copilot-cli-starlight-light-theme',
    enforce: 'pre',
    load(id) {
      if (!isStarlightPage(id)) return;
      return readFileSync(id.split('?', 1)[0], 'utf8').replace(darkThemeShell, lightThemeShell);
    },
    transform(code, id) {
      if (!isStarlightPage(id)) return;
      return code.replace(darkThemeShell, lightThemeShell);
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  base: isGitHubPages && basePath ? basePath : undefined,
  trailingSlash: 'always',
  vite: {
    plugins: [forceStarlightLightTheme()],
  },
  markdown: {
    // Rewrite GitHub-style `*.md` links in the source docs to Starlight
    // routes. The custom docs loader (see `src/content.config.ts`) reuses
    // this markdown config, so the same rewrite applies to every page.
    rehypePlugins: [rehypeRewriteDocLinks],
  },
  integrations: [
    starlight({
      title: 'Copilot CLI Internal Analysis',
      description:
        'Reverse-engineering wiki for the @github/copilot CLI bundle (app.js).',
      logo: {
        src: './src/assets/cat.svg',
        replacesTitle: false,
      },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      lastUpdated: true,
      pagination: true,
      expressiveCode: {
        themes: ['github-light'],
        useStarlightDarkModeSwitch: false,
      },
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
        ThemeProvider: './src/components/LightThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
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
          label: 'Start here',
          items: [
            { label: 'Wiki home', link: '/' },
            { label: 'Start here', link: '/00-start-here/' },
            { label: 'What is app.js', link: '/00-start-here/what-is-app-js/' },
            { label: 'Main feature map', link: '/00-start-here/main-feature-map/' },
            { label: 'Full table of contents', link: '/summary/' },
          ],
        },
        {
          label: 'Runtime lifecycle',
          items: [
            { label: 'Overview', link: '/01-runtime-lifecycle/' },
            { label: 'Loader and bootstrap', link: '/01-runtime-lifecycle/loader-bootstrap/' },
            { label: 'Mode dispatch and runtime startup', link: '/01-runtime-lifecycle/mode-dispatch-and-runtime-startup/' },
            { label: 'TUI and slash commands', link: '/01-runtime-lifecycle/tui-and-slash-commands/' },
            { label: 'Embedded server, ACP, JSON-RPC', link: '/01-runtime-lifecycle/embedded-server-acp-protocol/' },
            { label: 'Tree-sitter WASM usage', link: '/01-runtime-lifecycle/tree-sitter-wasm-usage/' },
            { label: 'Terminal and shell environment', link: '/01-runtime-lifecycle/terminal-setup-and-shell-environment/' },
            { label: 'Voice mode and Foundry Local', link: '/01-runtime-lifecycle/voice-mode-foundry-local/' },
            { label: 'Voice runtime', link: '/01-runtime-lifecycle/voice-runtime-workers-and-transcription/' },
          ],
        },
        {
          label: 'Context and model loop',
          items: [
            { label: 'Overview', link: '/02-context-model-loop/' },
            { label: 'Prompt sources', link: '/02-context-model-loop/prompt-sources/' },
            { label: 'Prompt catalog', link: '/02-context-model-loop/prompt-catalog/' },
            { label: 'Attachments and file ingestion', link: '/02-context-model-loop/attachments-and-file-ingestion/' },
            { label: 'Memory and context board', link: '/02-context-model-loop/memory-and-context-board/' },
            { label: 'Conversation compaction', link: '/02-context-model-loop/conversation-compaction/' },
            { label: 'Checkpoints, undo, rewind', link: '/02-context-model-loop/checkpoints-undo-rewind/' },
            { label: 'Models, providers, auth', link: '/02-context-model-loop/models-providers-auth/' },
            { label: 'Model API routing', link: '/02-context-model-loop/model-api-routing/' },
            { label: 'Resilience and rate limits', link: '/02-context-model-loop/resilience-rate-limits-concurrency/' },
            { label: 'Usage, quota, billing', link: '/02-context-model-loop/usage-quota-billing-metrics/' },
          ],
        },
        {
          label: 'Tools, integrations, security',
          items: [
            { label: 'Overview', link: '/03-tools-integrations-security/' },
            { label: 'Runtime tool assembly', link: '/03-tools-integrations-security/runtime-tool-assembly-and-filtering/' },
            { label: 'Built-in tools and events', link: '/03-tools-integrations-security/built-in-tools-execution-events/' },
            { label: 'Shell command execution', link: '/03-tools-integrations-security/shell-command-execution-events/' },
            { label: 'Coding-agent validation', link: '/03-tools-integrations-security/coding-agent-validation-toolchain/' },
            { label: 'MCP host, transports, tools', link: '/03-tools-integrations-security/mcp-host-transport-and-tools/' },
            { label: 'Plugins, extensions, and capabilities', link: '/03-tools-integrations-security/plugins-extensions-and-capabilities/' },
            { label: 'Copilot SDK extension bridge', link: '/03-tools-integrations-security/copilot-sdk-extension-bridge/' },
            { label: 'IDE, LSP, editor integration', link: '/03-tools-integrations-security/ide-lsp-editor-integration/' },
            { label: 'Web search and URL fetching', link: '/03-tools-integrations-security/web-search-url-fetching/' },
            { label: 'Integration config entrypoints', link: '/03-tools-integrations-security/integration-config-entrypoints/' },
            { label: 'Tool, path, URL permissions', link: '/03-tools-integrations-security/tool-path-url-permissions/' },
            { label: 'Content exclusion and redaction', link: '/03-tools-integrations-security/content-exclusion-and-redaction/' },
            { label: 'Hooks, events, automation', link: '/03-tools-integrations-security/hooks-events-and-automation/' },
            { label: 'Sandboxing', link: '/03-tools-integrations-security/sandboxing/' },
            { label: 'Settings and configuration persistence', link: '/03-tools-integrations-security/settings-config-persistence/' },
          ],
        },
        {
          label: 'Sessions, persistence, remote',
          items: [
            { label: 'Overview', link: '/04-sessions-persistence-remote/' },
            { label: 'Conversation session end-to-end', link: '/04-sessions-persistence-remote/conversation-session-end-to-end/' },
            { label: 'Session manager and replay', link: '/04-sessions-persistence-remote/session-manager-and-event-replay/' },
            { label: 'Session persistence, replay, and indexing', link: '/04-sessions-persistence-remote/session-persistence-replay-and-indexing/' },
            { label: 'SessionFs provider and state files', link: '/04-sessions-persistence-remote/session-fs-provider-and-state-files/' },
            { label: 'API and event schemas', link: '/04-sessions-persistence-remote/api-and-session-event-schemas/' },
            { label: 'Sessions, remote, cloud', link: '/04-sessions-persistence-remote/sessions-remote-cloud/' },
            { label: 'Session-store SQLite indexing', link: '/04-sessions-persistence-remote/session-store-sqlite-indexing/' },
            { label: 'System events and UI projection', link: '/04-sessions-persistence-remote/system-events-and-ui-projection/' },
            { label: 'Git and repository context', link: '/04-sessions-persistence-remote/git-repository-context/' },
            { label: 'Remote control', link: '/04-sessions-persistence-remote/remote-control-protocol-and-steering/' },
          ],
        },
        {
          label: 'Hosted agent ops',
          items: [
            { label: 'Overview', link: '/05-hosted-agent-ops/' },
            { label: 'Hosted agent environment', link: '/05-hosted-agent-ops/hosted-agent-environment/' },
            { label: 'Feature gates', link: '/05-hosted-agent-ops/feature-gates/' },
            { label: 'Diagnostics and debug bundles', link: '/05-hosted-agent-ops/diagnostics-feedback-debug-bundles/' },
            { label: 'Debug bundle redaction boundaries', link: '/05-hosted-agent-ops/debug-bundle-redaction-boundaries/' },
            { label: 'Telemetry and shutdown', link: '/05-hosted-agent-ops/telemetry-update-and-shutdown/' },
          ],
        },
        {
          label: 'Agents and automation',
          items: [
            { label: 'Overview', link: '/06-agents-automation/' },
            { label: 'Agent and task orchestration', link: '/06-agents-automation/agent-task-orchestration/' },
            { label: 'Built-in agents', link: '/06-agents-automation/built-in-agents/' },
            { label: 'Custom agents and skills', link: '/06-agents-automation/custom-agents-and-skills-packaging/' },
            { label: 'Autopilot and no-ask-user', link: '/06-agents-automation/autopilot-and-no-ask-user/' },
            { label: 'Fleet mode', link: '/06-agents-automation/fleet-mode/' },
            { label: 'Scheduled prompts', link: '/06-agents-automation/scheduled-prompts-and-command-queue/' },
          ],
        },
        {
          label: 'Research atlas',
          items: [
            { label: 'Overview', link: '/99-research-atlas/' },
            { label: 'Source atlas', link: '/99-research-atlas/source-atlas/' },
            { label: 'MXC sandbox binary notes', link: '/99-research-atlas/mxc-sandbox-binary-notes/' },
            { label: 'Documentation opportunities', link: '/99-research-atlas/documentation-opportunities/' },
          ],
        },
      ],
    }),
  ],
});
