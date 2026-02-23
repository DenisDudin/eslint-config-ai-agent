import type { Linter } from 'eslint'
import { loadPlugin } from '../utils/load-plugin.js'

export function prettierCompat(): Linter.Config {
  const prettierConfig = loadPlugin<Linter.Config>('eslint-config-prettier', 'eslint-config-prettier')
  return {
    ...prettierConfig,
    name: 'ai-agent/prettier',
  }
}
