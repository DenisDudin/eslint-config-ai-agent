import type { Linter } from 'eslint'

export function relaxedOverrides(): Linter.Config {
  return {
    name: 'ai-agent/relaxed',
    files: [
      '**/*.config.{js,ts,mjs,cjs}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/__tests__/**',
    ],
    rules: {
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-statements': 'off',
      'id-length': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'import-x/no-default-export': 'off',
    },
  }
}
