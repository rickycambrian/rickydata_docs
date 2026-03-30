---
name: docusaurus-sdk-webpack
description: Webpack plugin pattern for resolving rickydata SDK subpath exports and node: protocol URIs in Docusaurus builds. Use when adding new SDK subpath imports or debugging build failures related to Node.js modules.
user-invocable: true
paths: apps/docs-site/docusaurus.config.ts
---

# Docusaurus SDK Webpack Resolution

**Provenance:** Discovered 2026-03-30 in docs-migration team. Pattern verified in `apps/docs-site/docusaurus.config.ts`. Build passes with `npx docusaurus build` producing output at `apps/docs-site/build/`.

## When to Use

- Adding a new `rickydata/*` subpath import (e.g. `rickydata/agent`, `rickydata/wallet`)
- Debugging "Module not found" errors during Docusaurus build for SDK packages
- Encountering `node:` protocol URI errors in webpack 5 client builds
- Adding new Node.js-only packages that need browser fallbacks

## The Problem

The `rickydata` core SDK uses Node.js [subpath exports](https://nodejs.org/api/packages.html#subpath-exports) in its `package.json`:

```json
{
  "exports": {
    "./agent": { "import": "./dist/agent/index.js" },
    "./wallet": { "import": "./dist/wallet/index.js" }
  }
}
```

Webpack 5 (used by Docusaurus) does not reliably resolve subpath exports with `import`-only conditions in browser builds. Additionally, some transitive dependencies use `node:` protocol URIs (`node:fs`, `node:path`) which webpack 5 does not handle by default.

## The Solution

A custom Docusaurus plugin in `docusaurus.config.ts` that:
1. Maps each subpath to its resolved file path via webpack aliases
2. Sets Node.js builtins to `false` for client builds (browser polyfill fallbacks)
3. Strips `node:` protocol prefixes from module requests

### File: `apps/docs-site/docusaurus.config.ts`

```typescript
import path from 'path';

// Resolve rickydata package root — check local node_modules first, then monorepo root
const rickydataRoot = path.join(__dirname, 'node_modules', 'rickydata');
const actualRoot = require('fs').existsSync(path.join(rickydataRoot, 'dist'))
  ? rickydataRoot
  : path.join(__dirname, '..', '..', 'node_modules', 'rickydata');

const config: Config = {
  // ...
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
};
```

## Steps to Add a New Subpath

When the `rickydata` SDK adds a new subpath export (e.g. `rickydata/newmodule`):

1. Add the alias in the `resolve.alias` block:
   ```typescript
   'rickydata/newmodule': path.join(actualRoot, 'dist/newmodule/index.js'),
   ```

2. Rebuild: `cd apps/docs-site && npx docusaurus build`

3. If the new module imports Node.js builtins not already in the `fallback` list, add them:
   ```typescript
   fallback: isServer ? {} : {
     // ... existing entries ...
     zlib: false,  // example: if new module imports zlib
   },
   ```

## How the Monorepo Resolution Works

The `actualRoot` logic handles two scenarios:

1. **Standalone install** (`npm ci` inside `apps/docs-site/`): `rickydata` is in local `node_modules/`
2. **Monorepo hoisted** (npm workspaces): `rickydata` is in the root `node_modules/`

The check `existsSync(path.join(rickydataRoot, 'dist'))` determines which case applies.

## Key Details

### Why `isServer` Check?

Docusaurus builds twice: once for SSR (Node.js) and once for the browser. Node.js builtins are available in server builds, so `fallback` is only needed for client builds. Similarly, `node:` protocol is valid in Node.js but not in webpack 5's browser resolver.

### Why `NormalModuleReplacementPlugin`?

Some dependencies (often ESM-first packages) use the `node:` protocol prefix for imports like `node:fs`, `node:path`. Webpack 5 doesn't resolve these in browser builds. The plugin strips the prefix so webpack can match them against the `fallback` configuration (which maps them to `false`).

### Why Not `resolve.conditionNames`?

Adding `['import']` to `conditionNames` would resolve subpath exports but can break other packages that have different `import` vs `require` entry points. Explicit aliases are safer and more predictable.

## Debugging Build Failures

**"Module not found: Can't resolve 'rickydata/xxx'"**
- Add the subpath alias to the `resolve.alias` block
- Verify the dist file exists: `ls node_modules/rickydata/dist/xxx/index.js`

**"Module not found: Can't resolve 'fs'" (or other Node.js builtins)**
- Add the module to the `fallback` block with `false`
- This tells webpack to provide an empty module instead of trying to bundle it

**"Module not found: Can't resolve 'node:xxx'"**
- The `NormalModuleReplacementPlugin` should handle this
- If it persists, check that the plugin is only applied to client builds (`!isServer`)

**Build works locally but fails in Docker**
- Check that `npm ci --legacy-peer-deps` is used in the Dockerfile (peer dep conflicts with React 19)
- Verify the Dockerfile copies all necessary files before `npm run build`

## File Reference

| File | Role |
|------|------|
| `apps/docs-site/docusaurus.config.ts` | Plugin definition, alias mapping, fallback config |
| `apps/docs-site/Dockerfile` | Multi-stage build using `npm ci --legacy-peer-deps` + nginx |
| `apps/docs-site/package.json` | Dependencies including `rickydata`, `@rickydata/react`, `@rickydata/chat` |

## Known Limitations

- Aliases must be updated manually when new subpath exports are added to the SDK
- The `actualRoot` check uses synchronous `existsSync` at config load time (acceptable for build-time config)
- `fallback: false` means SDK code that actually needs Node.js builtins at runtime will silently get empty modules in the browser -- this is intentional since those code paths should be gated behind `typeof window === 'undefined'` checks
