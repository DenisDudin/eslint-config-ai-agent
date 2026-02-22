import type { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import type { Level } from '../types.js'
import { atLeast } from '../types.js'

export function typescriptConfig(level: Level, typedLinting: boolean): Linter.Config[] {
  const configs: Linter.Config[] = [
    ...tseslint.configs.recommended as Linter.Config[],
    {
      name: 'ai-agent/typescript',
      files: ['**/*.ts', '**/*.tsx'],
      languageOptions: {
        parserOptions: {
          ...(typedLinting ? { projectService: true } : {}),
        },
      },
      rules: {
        // Always-on TS rules (no type information required)
        '@typescript-eslint/no-explicit-any': level === 'mvp' ? 'warn' : 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-require-imports': 'error',
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/consistent-type-assertions': [
          'error',
          { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
        ],
        '@typescript-eslint/no-empty-object-type': 'error',
        '@typescript-eslint/no-wrapper-object-types': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/naming-convention': [
          'error',
          { selector: 'default', format: ['camelCase'] },
          { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
          { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
          { selector: 'function', format: ['camelCase', 'PascalCase'] },
          { selector: 'typeLike', format: ['PascalCase'] },
          { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
          { selector: 'property', format: null },
          { selector: 'import', format: ['camelCase', 'PascalCase'] },
        ],

        // Type-checked rules — always-on when typedLinting is enabled
        ...(typedLinting ? {
          '@typescript-eslint/no-unnecessary-type-assertion': 'error',
          '@typescript-eslint/no-redundant-type-constituents': 'error',
          '@typescript-eslint/no-implied-eval': 'error',
          '@typescript-eslint/only-throw-error': 'error',
          '@typescript-eslint/return-await': ['error', 'in-try-catch'],
        } : {
          // Re-enable core equivalents since TS type-checked versions are unavailable
          'no-implied-eval': 'error',
          'no-throw-literal': 'error',
        }),

        // Type-checked rules — standard+ only
        ...(atLeast(level, 'standard') && typedLinting ? {
          '@typescript-eslint/prefer-nullish-coalescing': 'error',
          '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
          '@typescript-eslint/no-misused-promises': [
            'error',
            { checksVoidReturn: { attributes: false } },
          ],
          '@typescript-eslint/switch-exhaustiveness-check': [
            'error',
            { requireDefaultForNonUnion: true },
          ],
          '@typescript-eslint/no-unsafe-assignment': 'error',
          '@typescript-eslint/no-unsafe-call': 'error',
          '@typescript-eslint/no-unsafe-member-access': 'error',
          '@typescript-eslint/no-unsafe-return': 'error',
          '@typescript-eslint/no-unsafe-argument': 'error',
        } : {}),
      },
    },
  ]

  return configs
}
