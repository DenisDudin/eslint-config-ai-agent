import type { Linter } from 'eslint'

export type Level = 'mvp' | 'standard' | 'strict'

export interface Options {
  /** Strictness level. Default: 'standard' */
  level?: Level
  /** Enable React rules. Default: false */
  react?: boolean
  /** Enable React Native rules. Auto-enables react. Default: false */
  reactNative?: boolean
  /** Enable Vue rules. Default: false */
  vue?: boolean
  /** Enable TypeScript rules. Default: true */
  typescript?: boolean
  /** Enable type-checked rules (requires projectService). Disable for faster local linting. Default: true */
  typedLinting?: boolean
  /** Enable FSD architecture rules. Default: false */
  fsd?: boolean
  /** Enable Prettier compat (must be last). Default: true */
  prettier?: boolean
  /** Additional global ignores */
  ignores?: string[]
  /** Custom rule overrides applied after all configs */
  overrides?: Linter.RulesRecord
}

export function resolveOptions(raw: Options = {}): Required<Options> {
  const reactNative = raw.reactNative ?? false
  return {
    level: raw.level ?? 'standard',
    react: raw.react ?? reactNative ?? false,
    reactNative,
    vue: raw.vue ?? false,
    typescript: raw.typescript ?? true,
    typedLinting: raw.typedLinting ?? true,
    fsd: raw.fsd ?? false,
    prettier: raw.prettier ?? true,
    ignores: raw.ignores ?? [],
    overrides: raw.overrides ?? {},
  }
}

/** Helper: check if level is at least the given threshold */
export function atLeast(current: Level, threshold: Level): boolean {
  const order: Level[] = ['mvp', 'standard', 'strict']
  return order.indexOf(current) >= order.indexOf(threshold)
}
