import type { Linter } from 'eslint'
import promise from 'eslint-plugin-promise'

export function promiseConfig(): Linter.Config {
  return {
    name: 'ai-agent/promise',
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      promise: promise as unknown as Record<string, unknown>,
    },
    rules: {
      'promise/prefer-await-to-then': 'error',
      'promise/catch-or-return': ['error', { allowFinally: true }],
      'promise/always-return': ['error', { ignoreLastCallback: true }],
      'promise/no-nesting': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/no-multiple-resolved': 'error',
      'promise/no-return-in-finally': 'error',
      'promise/valid-params': 'error',
      'promise/no-new-statics': 'error',
    },
  }
}
