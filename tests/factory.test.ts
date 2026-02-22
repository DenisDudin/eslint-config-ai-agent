import { describe, it, expect } from 'vitest'
import aiAgent from '../src/index.js'

describe('aiAgent factory', () => {
  it('returns an array of configs with default options', () => {
    const configs = aiAgent()
    expect(Array.isArray(configs)).toBe(true)
    expect(configs.length).toBeGreaterThan(0)
  })

  it('includes named configs', () => {
    const configs = aiAgent()
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).toContain('ai-agent/eslint-recommended')
    expect(names).toContain('ai-agent/globals')
    expect(names).toContain('ai-agent/mvp')
    expect(names).toContain('ai-agent/standard')
    expect(names).toContain('ai-agent/typescript')
    expect(names).toContain('ai-agent/imports')
    expect(names).toContain('ai-agent/unicorn')
    expect(names).toContain('ai-agent/sonarjs')
    expect(names).toContain('ai-agent/promise')
    expect(names).toContain('ai-agent/relaxed')
    expect(names).toContain('ai-agent/prettier')
  })

  it('prettier is always last config', () => {
    const configs = aiAgent()
    const last = configs[configs.length - 1]
    expect(last.name).toBe('ai-agent/prettier')
  })

  it('mvp level excludes standard and strict rules', () => {
    const configs = aiAgent({ level: 'mvp' })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).toContain('ai-agent/mvp')
    expect(names).not.toContain('ai-agent/standard')
    expect(names).not.toContain('ai-agent/strict')
    expect(names).not.toContain('ai-agent/sonarjs')
    expect(names).not.toContain('ai-agent/promise')
  })

  it('standard level includes mvp + standard but not strict', () => {
    const configs = aiAgent({ level: 'standard' })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).toContain('ai-agent/mvp')
    expect(names).toContain('ai-agent/standard')
    expect(names).not.toContain('ai-agent/strict')
  })

  it('strict level includes all three levels', () => {
    const configs = aiAgent({ level: 'strict' })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).toContain('ai-agent/mvp')
    expect(names).toContain('ai-agent/standard')
    expect(names).toContain('ai-agent/strict')
  })

  it('react option adds react configs', () => {
    const withoutReact = aiAgent({ react: false })
    const withReact = aiAgent({ react: true })
    const namesWithout = withoutReact.map(c => c.name).filter(Boolean)
    const namesWith = withReact.map(c => c.name).filter(Boolean)
    expect(namesWithout).not.toContain('ai-agent/react')
    expect(namesWith).toContain('ai-agent/react')
  })

  it('reactNative option auto-enables react', () => {
    const configs = aiAgent({ reactNative: true })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).toContain('ai-agent/react')
    expect(names).toContain('ai-agent/react-native')
    expect(names).toContain('ai-agent/react-native-a11y')
  })

  it('vue option adds vue configs', () => {
    const configs = aiAgent({ vue: true })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names.some(n => n?.startsWith('ai-agent/vue/'))).toBe(true)
  })

  it('fsd option adds FSD configs', () => {
    const withoutFsd = aiAgent({ fsd: false })
    const withFsd = aiAgent({ fsd: true })
    const namesWithout = withoutFsd.map(c => c.name).filter(Boolean)
    const namesWith = withFsd.map(c => c.name).filter(Boolean)
    expect(namesWithout).not.toContain('ai-agent/fsd-boundaries')
    expect(namesWith).toContain('ai-agent/fsd-boundaries')
    expect(namesWith).toContain('ai-agent/fsd-imports')
  })

  it('prettier: false omits prettier', () => {
    const configs = aiAgent({ prettier: false })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).not.toContain('ai-agent/prettier')
  })

  it('typescript: false omits TS configs', () => {
    const configs = aiAgent({ typescript: false })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).not.toContain('ai-agent/typescript')
  })

  it('ignores are added as first config', () => {
    const configs = aiAgent({ ignores: ['scripts/**'] })
    expect(configs[0].name).toBe('ai-agent/ignores')
    expect(configs[0].ignores).toContain('scripts/**')
  })

  it('user overrides are inserted before prettier', () => {
    const configs = aiAgent({
      overrides: { 'no-console': 'off' },
    })
    const names = configs.map(c => c.name).filter(Boolean)
    const overridesIdx = names.indexOf('ai-agent/user-overrides')
    const prettierIdx = names.indexOf('ai-agent/prettier')
    expect(overridesIdx).toBeGreaterThan(-1)
    expect(overridesIdx).toBeLessThan(prettierIdx)
  })

  it('strict level enables import-x/no-cycle', () => {
    const configs = aiAgent({ level: 'strict' })
    const importsConfig = configs.find(c => c.name === 'ai-agent/imports')
    expect(importsConfig?.rules?.['import-x/no-cycle']).toBeDefined()
  })

  it('non-strict levels disable import-x/no-cycle', () => {
    const configs = aiAgent({ level: 'standard' })
    const importsConfig = configs.find(c => c.name === 'ai-agent/imports')
    expect(importsConfig?.rules?.['import-x/no-cycle']).toBeUndefined()
  })

  it('mvp level sets no-explicit-any to warn', () => {
    const configs = aiAgent({ level: 'mvp' })
    const tsConfig = configs.find(c => c.name === 'ai-agent/typescript')
    expect(tsConfig?.rules?.['@typescript-eslint/no-explicit-any']).toBe('warn')
  })

  it('standard level sets no-explicit-any to error', () => {
    const configs = aiAgent({ level: 'standard' })
    const tsConfig = configs.find(c => c.name === 'ai-agent/typescript')
    expect(tsConfig?.rules?.['@typescript-eslint/no-explicit-any']).toBe('error')
  })
})

describe('CRITICAL: no-restricted-globals merge in RN', () => {
  it('RN no-html config preserves base MVP globals (isNaN, isFinite, event)', () => {
    const configs = aiAgent({ reactNative: true })
    const noHtml = configs.find(c => c.name === 'ai-agent/react-native-no-html')
    const globals = noHtml?.rules?.['no-restricted-globals'] as unknown[]
    const names = globals.slice(1).map((e: any) => e.name)
    // These would be silently lost without the BASE_RESTRICTED_GLOBALS merge
    expect(names).toContain('isNaN')
    expect(names).toContain('isFinite')
    expect(names).toContain('event')
    // RN-specific globals also present
    expect(names).toContain('document')
    expect(names).toContain('localStorage')
  })
})

describe('CRITICAL: no-restricted-syntax merge', () => {
  it('RN config merges base selectors with HTML tag restrictions', () => {
    const configs = aiAgent({ reactNative: true })
    const noHtml = configs.find(c => c.name === 'ai-agent/react-native-no-html')
    const restrictions = noHtml?.rules?.['no-restricted-syntax'] as unknown[]
    const entries = restrictions.slice(1)
    const selectors = entries.map((e: any) => e.selector)
    // Base selectors preserved
    expect(selectors).toContain('ForInStatement')
    expect(selectors).toContain('TSTypeReference[typeName.name="Function"]')
    expect(selectors).toContain('LabeledStatement')
    expect(selectors).toContain('WithStatement')
    // HTML tags also present
    expect(selectors).toContain("JSXOpeningElement[name.name='div']")
    expect(selectors).toContain("JSXOpeningElement[name.name='span']")
  })

  it('RN config restricts web-only globals', () => {
    const configs = aiAgent({ reactNative: true })
    const noHtml = configs.find(c => c.name === 'ai-agent/react-native-no-html')
    const globals = noHtml?.rules?.['no-restricted-globals'] as unknown[]
    const names = globals.slice(1).map((e: any) => e.name)
    expect(names).toContain('document')
    expect(names).toContain('window')
    expect(names).toContain('localStorage')
  })
})

describe('CRITICAL: no-restricted-imports FSD + RN merge', () => {
  it('FSD config includes RN import restrictions when reactNative is enabled', () => {
    const configs = aiAgent({ reactNative: true, fsd: true })
    const fsdImports = configs.find(c => c.name === 'ai-agent/fsd-imports')
    const rule = fsdImports?.rules?.['no-restricted-imports'] as any[]
    const patterns = rule[1].patterns
    const groups = patterns.map((p: any) => p.group).flat()
    // FSD patterns present
    expect(groups).toContain('@/shared/*/*/**')
    // RN patterns also present
    expect(groups).toContain('react-native/Libraries/*')
  })

  it('FSD config does NOT include RN patterns when reactNative is off', () => {
    const configs = aiAgent({ fsd: true, reactNative: false })
    const fsdImports = configs.find(c => c.name === 'ai-agent/fsd-imports')
    const rule = fsdImports?.rules?.['no-restricted-imports'] as any[]
    const patterns = rule[1].patterns
    const groups = patterns.map((p: any) => p.group).flat()
    expect(groups).not.toContain('react-native/Libraries/*')
  })
})

describe('CRITICAL: strict no-param-reassign state management override', () => {
  it('strict level has state management file override', () => {
    const configs = aiAgent({ level: 'strict' })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).toContain('ai-agent/strict-state-override')
  })

  it('state override relaxes props to false', () => {
    const configs = aiAgent({ level: 'strict' })
    const override = configs.find(c => c.name === 'ai-agent/strict-state-override')
    expect(override?.rules?.['no-param-reassign']).toEqual(['error', { props: false }])
    expect(override?.files).toContain('**/store/**')
    expect(override?.files).toContain('**/slices/**')
  })
})

describe('IMPORTANT: sonarjs/react duplicate fix', () => {
  it('disables sonarjs/jsx-no-leaked-render when react is enabled at standard+', () => {
    const configs = aiAgent({ react: true, level: 'standard' })
    const compat = configs.find(c => c.name === 'ai-agent/sonarjs-react-compat')
    expect(compat).toBeDefined()
    expect(compat?.rules?.['sonarjs/jsx-no-leaked-render']).toBe('off')
  })

  it('does not add compat config when react is disabled', () => {
    const configs = aiAgent({ react: false })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).not.toContain('ai-agent/sonarjs-react-compat')
  })

  it('does not add compat config at mvp level (sonarjs not loaded)', () => {
    const configs = aiAgent({ react: true, level: 'mvp' })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).not.toContain('ai-agent/sonarjs-react-compat')
  })
})

describe('IMPORTANT: Vue SFC overrides', () => {
  it('adds relaxed max-lines for .vue files', () => {
    const configs = aiAgent({ vue: true })
    const sfcOverride = configs.find(c => c.name === 'ai-agent/vue-sfc-overrides')
    expect(sfcOverride).toBeDefined()
    expect(sfcOverride?.files).toContain('**/*.vue')
    const maxLines = sfcOverride?.rules?.['max-lines'] as any[]
    expect(maxLines[1].max).toBe(600)
    const maxFn = sfcOverride?.rules?.['max-lines-per-function'] as any[]
    expect(maxFn[1].max).toBe(150)
  })
})

describe('typedLinting option', () => {
  it('typedLinting: true (default) includes projectService', () => {
    const configs = aiAgent({ typescript: true })
    const tsConfig = configs.find(c => c.name === 'ai-agent/typescript')
    expect(tsConfig?.languageOptions?.parserOptions?.projectService).toBe(true)
  })

  it('typedLinting: false removes projectService', () => {
    const configs = aiAgent({ typedLinting: false })
    const tsConfig = configs.find(c => c.name === 'ai-agent/typescript')
    expect(tsConfig?.languageOptions?.parserOptions?.projectService).toBeUndefined()
  })

  it('typedLinting: false removes no-unsafe-* rules', () => {
    const configs = aiAgent({ level: 'standard', typedLinting: false })
    const tsConfig = configs.find(c => c.name === 'ai-agent/typescript')
    expect(tsConfig?.rules?.['@typescript-eslint/no-unsafe-assignment']).toBeUndefined()
    expect(tsConfig?.rules?.['@typescript-eslint/no-floating-promises']).toBeUndefined()
    expect(tsConfig?.rules?.['@typescript-eslint/no-misused-promises']).toBeUndefined()
  })

  it('typedLinting: false re-enables core no-implied-eval and no-throw-literal', () => {
    const configs = aiAgent({ typedLinting: false })
    const tsConfig = configs.find(c => c.name === 'ai-agent/typescript')
    expect(tsConfig?.rules?.['no-implied-eval']).toBe('error')
    expect(tsConfig?.rules?.['no-throw-literal']).toBe('error')
  })

  it('typedLinting: true includes return-await and no-floating-promises at standard+', () => {
    const configs = aiAgent({ level: 'standard', typedLinting: true })
    const tsConfig = configs.find(c => c.name === 'ai-agent/typescript')
    expect(tsConfig?.rules?.['@typescript-eslint/return-await']).toBeDefined()
    expect(tsConfig?.rules?.['@typescript-eslint/no-floating-promises']).toBeDefined()
  })
})

describe('React config — new rules', () => {
  it('includes Airbnb-inspired HTML/JSX confusion rules', () => {
    const configs = aiAgent({ react: true })
    const reactCfg = configs.find(c => c.name === 'ai-agent/react')
    const rules = reactCfg?.rules ?? {}
    expect(rules['react/no-unknown-property']).toBe('error')
    expect(rules['react/no-unescaped-entities']).toBe('error')
    expect(rules['react/style-prop-object']).toBe('error')
    expect(rules['react/void-dom-elements-no-children']).toBe('error')
    expect(rules['react/jsx-pascal-case']).toBeDefined()
    expect(rules['react/no-string-refs']).toBe('error')
  })

  it('includes security rules', () => {
    const configs = aiAgent({ react: true })
    const reactCfg = configs.find(c => c.name === 'ai-agent/react')
    const rules = reactCfg?.rules ?? {}
    expect(rules['react/jsx-no-script-url']).toBe('error')
    expect(rules['react/no-danger-with-children']).toBe('error')
    expect(rules['react/iframe-missing-sandbox']).toBe('error')
  })

  it('includes react-refresh HMR rule', () => {
    const configs = aiAgent({ react: true })
    const reactCfg = configs.find(c => c.name === 'ai-agent/react')
    const rules = reactCfg?.rules ?? {}
    expect(rules['react-refresh/only-export-components']).toBeDefined()
  })

  it('includes display-name rule', () => {
    const configs = aiAgent({ react: true })
    const reactCfg = configs.find(c => c.name === 'ai-agent/react')
    expect(reactCfg?.rules?.['react/display-name']).toBe('error')
  })

  it('includes expanded jsx-a11y rules', () => {
    const configs = aiAgent({ react: true })
    const reactCfg = configs.find(c => c.name === 'ai-agent/react')
    const rules = reactCfg?.rules ?? {}
    expect(rules['jsx-a11y/aria-proptypes']).toBe('error')
    expect(rules['jsx-a11y/heading-has-content']).toBe('error')
    expect(rules['jsx-a11y/interactive-supports-focus']).toBe('error')
    expect(rules['jsx-a11y/label-has-associated-control']).toBe('error')
    expect(rules['jsx-a11y/no-aria-hidden-on-focusable']).toBe('error')
    expect(rules['jsx-a11y/no-static-element-interactions']).toBeDefined()
    expect(rules['jsx-a11y/tabindex-no-positive']).toBe('error')
  })
})

describe('Vue config — new rules', () => {
  it('includes unused detection rules', () => {
    const configs = aiAgent({ vue: true })
    const guardrails = configs.find(c => c.name === 'ai-agent/vue-ai-guardrails')
    const rules = guardrails?.rules ?? {}
    expect(rules['vue/no-unused-emit-declarations']).toBe('error')
    expect(rules['vue/no-unused-properties']).toBeDefined()
    expect(rules['vue/no-unused-refs']).toBe('error')
  })

  it('includes undef detection rules', () => {
    const configs = aiAgent({ vue: true })
    const guardrails = configs.find(c => c.name === 'ai-agent/vue-ai-guardrails')
    const rules = guardrails?.rules ?? {}
    expect(rules['vue/no-undef-components']).toBeDefined()
    expect(rules['vue/no-undef-properties']).toBe('error')
  })

  it('includes type safety rules', () => {
    const configs = aiAgent({ vue: true })
    const guardrails = configs.find(c => c.name === 'ai-agent/vue-ai-guardrails')
    const rules = guardrails?.rules ?? {}
    expect(rules['vue/require-typed-ref']).toBe('error')
    expect(rules['vue/require-explicit-slots']).toBe('error')
  })
})

describe('React Native config — new rules', () => {
  it('includes split-platform-components', () => {
    const configs = aiAgent({ reactNative: true })
    const rnCfg = configs.find(c => c.name === 'ai-agent/react-native')
    expect(rnCfg?.rules?.['react-native/split-platform-components']).toBe('error')
  })
})

describe('Unicorn plugin — expanded rules', () => {
  it('includes all AI-agent safety rules', () => {
    const configs = aiAgent()
    const unicornCfg = configs.find(c => c.name === 'ai-agent/unicorn')
    const rules = unicornCfg?.rules ?? {}
    expect(rules['unicorn/prefer-array-find']).toBe('error')
    expect(rules['unicorn/no-useless-spread']).toBe('error')
    expect(rules['unicorn/no-abusive-eslint-disable']).toBe('error')
    expect(rules['unicorn/no-thenable']).toBe('error')
    expect(rules['unicorn/no-empty-file']).toBe('error')
    expect(rules['unicorn/throw-new-error']).toBe('error')
    expect(rules['unicorn/error-message']).toBe('error')
    expect(rules['unicorn/no-useless-promise-resolve-reject']).toBe('error')
    expect(rules['unicorn/prefer-node-protocol']).toBe('error')
    expect(rules['unicorn/prefer-string-replace-all']).toBe('error')
    expect(rules['unicorn/prefer-at']).toBe('error')
    expect(rules['unicorn/no-useless-undefined']).toBe('error')
  })
})

describe('AI guardrails (no-restricted-syntax)', () => {
  it('mvp level includes no-restricted-syntax rules', () => {
    const configs = aiAgent({ level: 'mvp' })
    const mvpCfg = configs.find(c => c.name === 'ai-agent/mvp')
    const rules = mvpCfg?.rules ?? {}
    expect(rules['no-restricted-syntax']).toBeDefined()
    const entries = (rules['no-restricted-syntax'] as unknown[]).slice(1)
    const selectors = entries.map((e: any) => e.selector)
    expect(selectors).toContain('ForInStatement')
    expect(selectors).toContain('TSTypeReference[typeName.name="Function"]')
  })

  it('mvp level includes no-restricted-properties', () => {
    const configs = aiAgent({ level: 'mvp' })
    const mvpCfg = configs.find(c => c.name === 'ai-agent/mvp')
    expect(mvpCfg?.rules?.['no-restricted-properties']).toBeDefined()
  })
})

describe('Sonarjs dedup', () => {
  it('disables sonarjs rules that duplicate core rules', () => {
    const configs = aiAgent({ level: 'standard' })
    const dedup = configs.find(c => c.name === 'ai-agent/sonarjs-dedup')
    expect(dedup).toBeDefined()
    expect(dedup?.rules?.['sonarjs/no-parameter-reassignment']).toBe('off')
    expect(dedup?.rules?.['sonarjs/no-labels']).toBe('off')
  })
})

describe('Vue NICE-TO-HAVE rules', () => {
  it('includes define-macros-order', () => {
    const configs = aiAgent({ vue: true })
    const guardrails = configs.find(c => c.name === 'ai-agent/vue-ai-guardrails')
    expect(guardrails?.rules?.['vue/define-macros-order']).toBeDefined()
  })

  it('includes html-button-has-type', () => {
    const configs = aiAgent({ vue: true })
    const guardrails = configs.find(c => c.name === 'ai-agent/vue-ai-guardrails')
    expect(guardrails?.rules?.['vue/html-button-has-type']).toBe('error')
  })

  it('includes prefer-use-template-ref', () => {
    const configs = aiAgent({ vue: true })
    const guardrails = configs.find(c => c.name === 'ai-agent/vue-ai-guardrails')
    expect(guardrails?.rules?.['vue/prefer-use-template-ref']).toBe('error')
  })
})

describe('React jsx-filename-extension', () => {
  it('restricts JSX to .tsx and .jsx files', () => {
    const configs = aiAgent({ react: true })
    const reactCfg = configs.find(c => c.name === 'ai-agent/react')
    expect(reactCfg?.rules?.['react/jsx-filename-extension']).toBeDefined()
  })
})

describe('id-length exceptions', () => {
  it('includes t and el in exceptions', () => {
    const configs = aiAgent()
    const mvpCfg = configs.find(c => c.name === 'ai-agent/mvp')
    const rule = mvpCfg?.rules?.['id-length'] as any[]
    expect(rule[1].exceptions).toContain('t')
    expect(rule[1].exceptions).toContain('el')
  })
})

describe('Default export overrides for frameworks', () => {
  it('adds allow-default-export for page files when react is enabled', () => {
    const configs = aiAgent({ react: true })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).toContain('ai-agent/allow-default-export')
  })

  it('does not add allow-default-export when no framework enabled', () => {
    const configs = aiAgent({ react: false, vue: false, reactNative: false })
    const names = configs.map(c => c.name).filter(Boolean)
    expect(names).not.toContain('ai-agent/allow-default-export')
  })
})
