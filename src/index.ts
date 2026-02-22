import type { Linter } from 'eslint'
import js from '@eslint/js'
import globals from 'globals'
import type { Options } from './types.js'
import { resolveOptions, atLeast } from './types.js'
import { mvpRules } from './levels/mvp.js'
import { standardRules } from './levels/standard.js'
import { strictRules } from './levels/strict.js'
import { typescriptConfig } from './plugins/typescript.js'
import { importsConfig } from './plugins/imports.js'
import { sonarjsConfig } from './plugins/sonarjs.js'
import { promiseConfig } from './plugins/promise.js'
import { unicornConfig } from './plugins/unicorn.js'
import { prettierCompat } from './plugins/prettier.js'
import { reactConfig } from './frameworks/react.js'
import { reactNativeConfig } from './frameworks/react-native.js'
import { vueConfig } from './frameworks/vue.js'
import { fsdConfig } from './architecture/fsd.js'
import { relaxedOverrides } from './overrides/relaxed.js'

export type { Options, Level } from './types.js'

export default function aiAgent(options: Options = {}): Linter.Config[] {
  const opts = resolveOptions(options)
  const configs: Linter.Config[] = []

  // 1. Global ignores
  if (opts.ignores.length > 0) {
    configs.push({
      name: 'ai-agent/ignores',
      ignores: opts.ignores,
    })
  }

  // 2. @eslint/js recommended
  configs.push({
    ...js.configs.recommended,
    name: 'ai-agent/eslint-recommended',
  })

  // 3. Globals
  const globalsObj: Record<string, boolean> = {
    ...globals.es2021,
  }
  if (opts.react || opts.reactNative || opts.vue) {
    Object.assign(globalsObj, globals.browser)
  }
  if (opts.reactNative) {
    Object.assign(globalsObj, globals.node)
  }
  configs.push({
    name: 'ai-agent/globals',
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globalsObj,
    },
  })

  // 4. Level rules (cumulative: MVP always, standard adds on top, strict adds on top)
  configs.push(mvpRules())
  if (atLeast(opts.level, 'standard')) {
    configs.push(standardRules())
  }
  if (atLeast(opts.level, 'strict')) {
    configs.push(...strictRules())
  }

  // 5. TypeScript
  if (opts.typescript) {
    configs.push(...typescriptConfig(opts.level, opts.typedLinting))
  }

  // 6. Imports
  configs.push(importsConfig(opts.level))

  // 7. Unicorn (always on — low-noise AI guardrails)
  configs.push(unicornConfig())

  // 8. SonarJS & Promise (standard+)
  if (atLeast(opts.level, 'standard')) {
    configs.push(...sonarjsConfig())
    configs.push(promiseConfig())
  }

  // 9. Disable sonarjs rules that duplicate framework-specific rules
  if (atLeast(opts.level, 'standard') && (opts.react || opts.reactNative)) {
    configs.push({
      name: 'ai-agent/sonarjs-react-compat',
      files: ['**/*.tsx', '**/*.jsx'],
      rules: {
        'sonarjs/jsx-no-leaked-render': 'off',
      },
    })
  }

  // 10. Frameworks
  if (opts.react || opts.reactNative) {
    configs.push(...reactConfig())
  }
  if (opts.reactNative) {
    configs.push(...reactNativeConfig())
  }
  if (opts.vue) {
    configs.push(...vueConfig(opts.level))
    // Vue SFC files need relaxed limits (script + template + style in one file)
    configs.push({
      name: 'ai-agent/vue-sfc-overrides',
      files: ['**/*.vue'],
      rules: {
        'max-lines': ['error', { max: 600, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      },
    })
  }

  // 11. FSD
  if (opts.fsd) {
    configs.push(...fsdConfig({ reactNative: opts.reactNative }))
  }

  // 12. Framework-specific default export overrides
  if (opts.react || opts.reactNative || opts.vue) {
    configs.push({
      name: 'ai-agent/allow-default-export',
      files: [
        'app/**/*.{ts,tsx,js,jsx}',
        'pages/**/*.{ts,tsx,js,jsx}',
        'src/pages/**/*.{ts,tsx,js,jsx}',
        'src/app/**/*.{ts,tsx,js,jsx}',
      ],
      rules: {
        'import-x/no-default-export': 'off',
      },
    })
  }

  // 13. Relaxed overrides (tests, configs)
  configs.push(relaxedOverrides())

  // 14. User overrides
  if (Object.keys(opts.overrides).length > 0) {
    configs.push({
      name: 'ai-agent/user-overrides',
      rules: opts.overrides,
    })
  }

  // 15. Prettier (LAST — disables conflicting rules)
  if (opts.prettier) {
    configs.push(prettierCompat())
  }

  return configs
}
