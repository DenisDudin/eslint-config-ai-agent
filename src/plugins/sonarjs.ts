import type { Linter } from 'eslint'
import sonarjs from 'eslint-plugin-sonarjs'

export function sonarjsConfig(): Linter.Config[] {
  return [
    {
      ...sonarjs.configs?.recommended as Linter.Config,
      name: 'ai-agent/sonarjs',
    },
    // Disable sonarjs rules that duplicate core/TS rules already in our config
    {
      name: 'ai-agent/sonarjs-dedup',
      rules: {
        // Duplicates core no-param-reassign (mvp.ts)
        'sonarjs/no-parameter-reassignment': 'off',
        // Duplicates no-restricted-syntax LabeledStatement (shared-restrictions.ts)
        'sonarjs/no-labels': 'off',
        // Duplicates core array-callback-return (mvp.ts) — already enforced at all levels
        'sonarjs/array-callback-without-return': 'off',
      },
    },
  ]
}
