import type { Linter, ESLint } from 'eslint'
import { loadPlugin } from '../utils/load-plugin.js'
import { RN_RESTRICTED_IMPORT_PATTERNS } from '../shared-restrictions.js'

interface FsdOptions {
  reactNative?: boolean
}

export function fsdConfig(options: FsdOptions = {}): Linter.Config[] {
  const boundaries = loadPlugin<ESLint.Plugin>('eslint-plugin-boundaries', 'eslint-plugin-boundaries')

  // Merge FSD patterns with RN patterns when both are enabled (flat config last-wins)
  const restrictedPatterns = [
    {
      group: ['@/shared/*/*/**'],
      message: 'Import from @/shared/<segment> (public API), not internal paths.',
    },
    {
      group: ['@/entities/*/*', '@/entities/*/*/**'],
      message: 'Import from @/entities/<slice> (public API), not internal paths.',
    },
    {
      group: ['@/features/*/*', '@/features/*/*/**'],
      message: 'Import from @/features/<slice> (public API), not internal paths.',
    },
    {
      group: ['@/widgets/*/*', '@/widgets/*/*/**'],
      message: 'Import from @/widgets/<slice> (public API), not internal paths.',
    },
    {
      group: ['@/pages/*/*', '@/pages/*/*/**'],
      message: 'Import from @/pages/<slice> (public API), not internal paths.',
    },
    ...(options.reactNative ? RN_RESTRICTED_IMPORT_PATTERNS : []),
  ]

  return [
    {
      name: 'ai-agent/fsd-boundaries',
      files: ['**/*.ts', '**/*.tsx'],
      plugins: {
        boundaries: boundaries as unknown as Record<string, unknown>,
      },
      settings: {
        'boundaries/elements': [
          { type: 'app', pattern: 'app/*', mode: 'folder' },
          { type: 'pages', pattern: 'pages/*', mode: 'folder' },
          { type: 'widgets', pattern: 'widgets/*', mode: 'folder' },
          { type: 'features', pattern: 'features/*', mode: 'folder' },
          { type: 'entities', pattern: 'entities/*', mode: 'folder' },
          { type: 'shared', pattern: 'shared/*', mode: 'folder' },
        ],
      },
      rules: {
        'boundaries/element-types': [
          'error',
          {
            default: 'allow',
            rules: [
              { from: 'shared', disallow: ['app', 'pages', 'widgets', 'features', 'entities'] },
              { from: 'entities', disallow: ['app', 'pages', 'widgets', 'features'] },
              { from: 'entities', disallow: ['entities'], allow: ['${from.entity}'] },
              { from: 'features', disallow: ['app', 'pages', 'widgets'] },
              { from: 'features', disallow: ['features'], allow: ['${from.feature}'] },
              { from: 'widgets', disallow: ['app', 'pages'] },
              { from: 'widgets', disallow: ['widgets'], allow: ['${from.widget}'] },
              { from: 'pages', disallow: ['app'] },
              { from: 'pages', disallow: ['pages'], allow: ['${from.page}'] },
            ],
          },
        ],
        'boundaries/entry-point': [
          'error',
          {
            default: 'disallow',
            rules: [
              { target: 'shared', allow: '**' },
              { target: 'entities', allow: 'index.ts' },
              { target: 'features', allow: 'index.ts' },
              { target: 'widgets', allow: 'index.ts' },
              { target: 'pages', allow: 'index.ts' },
            ],
          },
        ],
      },
    },
    {
      name: 'ai-agent/fsd-imports',
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        // Merges FSD + RN patterns when both enabled (prevents flat-config overwrite)
        'no-restricted-imports': ['error', { patterns: restrictedPatterns }],
        // Intentionally overrides base import-x/order from plugins/imports.ts
        // to add FSD-specific pathGroups for layer ordering
        'import-x/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            pathGroups: [
              { pattern: 'react', group: 'builtin', position: 'before' },
              { pattern: 'react-native', group: 'builtin', position: 'before' },
              { pattern: '@/shared/**', group: 'internal', position: 'before' },
              { pattern: '@/entities/**', group: 'internal' },
              { pattern: '@/features/**', group: 'internal' },
              { pattern: '@/widgets/**', group: 'internal', position: 'after' },
              { pattern: '@/pages/**', group: 'internal', position: 'after' },
            ],
            pathGroupsExcludedImportTypes: ['builtin'],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true },
          },
        ],
      },
    },
  ]
}
