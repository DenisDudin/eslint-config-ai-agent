import type { Linter } from 'eslint'
import prettierConfig from 'eslint-config-prettier'

export function prettierCompat(): Linter.Config {
  return {
    ...prettierConfig as Linter.Config,
    name: 'ai-agent/prettier',
  }
}
