import type { Linter } from 'eslint'
import unicornImport from 'eslint-plugin-unicorn'

// eslint-plugin-unicorn is ESM-only; when consumed via CJS the default export sits at .default
const unicorn = (unicornImport as unknown as { default: typeof unicornImport }).default ?? unicornImport

export function unicornConfig(): Linter.Config {
  return {
    name: 'ai-agent/unicorn',
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      unicorn: unicorn as unknown as Record<string, unknown>,
    },
    rules: {
      // AI agents write .filter(...)[0] instead of .find(...)
      'unicorn/prefer-array-find': 'error',
      // AI agents add defensive [...array] spreads where copies are not needed
      'unicorn/no-useless-spread': 'error',
      // AI agents write `// eslint-disable` without specifying which rule — hides bugs
      'unicorn/no-abusive-eslint-disable': 'error',
      // AI agents create objects with .then() method, confusing await
      'unicorn/no-thenable': 'error',
      // AI agents create empty placeholder files
      'unicorn/no-empty-file': 'error',
      // AI agents write `throw Error()` without `new`
      'unicorn/throw-new-error': 'error',
      // AI agents write `throw new Error()` without a message
      'unicorn/error-message': 'error',
      // AI agents wrap return values in Promise.resolve inside async functions
      'unicorn/no-useless-promise-resolve-reject': 'error',
      // AI agents use `import path from 'path'` instead of `'node:path'`
      'unicorn/prefer-node-protocol': 'error',
      // AI agents use .replace(/pattern/g, ...) instead of .replaceAll()
      'unicorn/prefer-string-replace-all': 'error',
      // AI agents write array[array.length - 1] instead of array.at(-1)
      'unicorn/prefer-at': 'error',
      // AI agents write `return undefined` or `let x = undefined` explicitly
      'unicorn/no-useless-undefined': 'error',
    },
  }
}
