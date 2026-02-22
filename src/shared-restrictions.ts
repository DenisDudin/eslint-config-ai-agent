/**
 * Base no-restricted-syntax selectors shared across all configs.
 * Framework configs that add their own selectors MUST include these
 * to avoid flat-config last-wins overwriting them.
 */
export const BASE_RESTRICTED_SYNTAX = [
  {
    selector: 'TSTypeReference[typeName.name="Function"]',
    message: 'Use a specific function type like `() => void` instead of `Function`.',
  },
  {
    selector: 'ForInStatement',
    message: 'Use `Object.keys()` / `Object.entries()` with `for-of` instead of `for-in`.',
  },
  {
    selector: 'LabeledStatement',
    message: 'Labels are not allowed. Refactor to avoid them.',
  },
  {
    selector: 'WithStatement',
    message: '`with` is not allowed in strict mode.',
  },
] as const

/**
 * Base no-restricted-globals shared across all configs.
 * Framework configs that override this rule MUST spread these entries
 * to avoid flat-config last-wins erasing the base MVP restrictions.
 */
export const BASE_RESTRICTED_GLOBALS = [
  { name: 'isNaN', message: 'Use Number.isNaN() instead of the global isNaN().' },
  { name: 'isFinite', message: 'Use Number.isFinite() instead of the global isFinite().' },
  { name: 'event', message: 'Use the `event` parameter instead of the global event object.' },
] as const

/**
 * Base no-restricted-imports patterns for React Native internals.
 * Must be merged with FSD patterns when both options are enabled.
 */
export const RN_RESTRICTED_IMPORT_PATTERNS = [
  {
    group: ['react-native/Libraries/*'],
    message: 'Import from "react-native" directly, not internal paths.',
  },
] as const
