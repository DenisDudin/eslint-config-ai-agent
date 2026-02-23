/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Lazily loads an optional peer dependency at call time.
 * In CJS: uses the global require. In ESM: tsup shims inject require via createRequire.
 * Handles ESM-only packages that expose their plugin at .default.
 */
export function loadPlugin<T>(name: string, hint: string): T {
  try {
    const mod = require(name) as { default?: T } | T
    return ((mod as { default?: T }).default ?? mod) as T
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `[eslint-config-ai-agent] '${name}' is not installed.\n` +
        `  Install: npm install -D ${hint}\n` +
        `  Or install all peers: npx install-peerdeps -D eslint-config-ai-agent`,
      )
    }
    throw err
  }
}
