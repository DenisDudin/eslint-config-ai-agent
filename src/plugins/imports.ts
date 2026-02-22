import type { Linter } from 'eslint'
import importX from 'eslint-plugin-import-x'
import type { Level } from '../types.js'
import { atLeast } from '../types.js'

export function importsConfig(level: Level): Linter.Config {
  return {
    name: 'ai-agent/imports',
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      'import-x': importX as unknown as Record<string, unknown>,
    },
    rules: {
      'import-x/no-duplicates': 'error',
      'import-x/no-absolute-path': 'error',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-default-export': 'error',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // no-cycle only in strict (expensive)
      ...(atLeast(level, 'strict') ? {
        'import-x/no-cycle': ['error', { maxDepth: 3 }],
      } : {}),
    },
  }
}
