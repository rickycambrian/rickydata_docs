import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';

// Resolve rickydata package root for webpack aliases (subpath exports use import-only conditions)
const rickydataRoot = path.join(__dirname, 'node_modules', 'rickydata');
// Fallback to monorepo root node_modules if not found locally
const actualRoot = require('fs').existsSync(path.join(rickydataRoot, 'dist'))
  ? rickydataRoot
  : path.join(__dirname, '..', '..', 'node_modules', 'rickydata');

const config: Config = {
  title: 'RickyData Docs',
  tagline: 'MCP tools, AI agents, and wallet-powered workflows',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.rickydata.org',
  baseUrl: '/',

  customFields: {
    docsApiUrl: process.env.DOCS_API_URL || 'https://api.rickydata.org/docs',
    agentGatewayUrl: process.env.AGENT_GATEWAY_URL || 'https://gateway.rickydata.org',
    privyAppId: process.env.PRIVY_APP_ID || '',
  },

  organizationName: 'cambriannetwork',
  projectName: 'rickydata_docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400;1,9..40,500&family=IBM+Plex+Mono:wght@400;500&display=swap',
      },
    },
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/cambriannetwork/rickydata_docs/tree/main/apps/docs-site/',
        },
        blog: false,
        theme: {
          customCss: [
            './src/css/custom.css',
            './src/css/markdown-extras.css',
          ],
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    function resolveRickydataSubpaths() {
      return {
        name: 'resolve-rickydata-subpaths',
        configureWebpack(_config, isServer) {
          const webpack = require('webpack');
          const config: Record<string, unknown> = {
            resolve: {
              alias: {
                'rickydata/agent': path.join(actualRoot, 'dist/agent/index.js'),
                'rickydata/wallet': path.join(actualRoot, 'dist/wallet/index.js'),
                'rickydata/canvas': path.join(actualRoot, 'dist/canvas/index.js'),
                'rickydata/mcp': path.join(actualRoot, 'dist/mcp/index.js'),
                'rickydata/kfdb': path.join(actualRoot, 'dist/kfdb/index.js'),
              },
              fallback: isServer
                ? {}
                : {
                    fs: false,
                    os: false,
                    path: false,
                    crypto: false,
                    stream: false,
                    http: false,
                    https: false,
                    net: false,
                    tls: false,
                    child_process: false,
                  },
            },
          };

          // Handle node: protocol URIs in webpack 5 client builds
          if (!isServer) {
            config.plugins = [
              new webpack.NormalModuleReplacementPlugin(
                /^node:/,
                (resource: { request: string }) => {
                  resource.request = resource.request.replace(/^node:/, '');
                },
              ),
            ];
          }

          return config;
        },
      };
    },
  ],

  themeConfig: {
    image: 'img/rickydata-social-card.svg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'RickyData',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        { to: '/playground', label: 'Playground', position: 'left' },
        { to: '/status', label: 'Status', position: 'left' },
        { to: '/changelog', label: 'Changelog', position: 'left' },
        {
          href: 'https://marketplace.rickydata.org',
          label: 'Marketplace',
          position: 'right',
        },
        {
          href: 'https://github.com/cambriannetwork',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'SDK Reference', to: '/docs/sdk/overview' },
            { label: 'MCP Server', to: '/docs/mcp/overview' },
          ],
        },
        {
          title: 'Products',
          items: [
            { label: 'Marketplace', href: 'https://marketplace.rickydata.org' },
            { label: 'Agent Gateway', to: '/docs/agents/overview' },
            { label: 'Wallet', to: '/docs/wallet-billing/overview' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Changelog', to: '/changelog' },
            { label: 'Status', to: '/status' },
            {
              label: 'GitHub',
              href: 'https://github.com/cambriannetwork',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} RickyData. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'typescript', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
