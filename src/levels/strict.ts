import type { Linter } from 'eslint'

export function strictRules(): Linter.Config[] {
  return [
    {
      name: 'ai-agent/strict',
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      rules: {
        // Strictest size and complexity
        'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
        'max-params': ['error', { max: 3 }],
        'complexity': ['error', { max: 10 }],
        'max-depth': ['error', { max: 4 }],
        'max-statements': ['error', { max: 25 }],

        // Strict mutation protection
        'no-param-reassign': ['error', { props: true }],
      },
    },
    // Relax no-param-reassign for state management files (Immer, Vuex, Pinia)
    {
      name: 'ai-agent/strict-state-override',
      files: [
        '**/store/**',
        '**/stores/**',
        '**/slices/**',
        '**/*.slice.{ts,js}',
        '**/*.store.{ts,js}',
      ],
      rules: {
        'no-param-reassign': ['error', { props: false }],
      },
    },
  ]
}
