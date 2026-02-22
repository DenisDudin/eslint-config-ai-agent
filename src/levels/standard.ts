import type { Linter } from 'eslint'

export function standardRules(): Linter.Config {
  return {
    name: 'ai-agent/standard',
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Tighter size and complexity
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 90, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', { max: 4 }],
      'complexity': ['error', { max: 15 }],
      'max-depth': ['error', { max: 5 }],
      'max-statements': ['error', { max: 28 }],

      // AI agents chain assignments a = b = c = 0 — obscures which variables are related
      'no-multi-assign': 'error',

      // No magic numbers (common UI constants ignored to reduce noise in JSX/StyleSheet)
      'no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24, 100],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
        },
      ],
    },
  }
}
