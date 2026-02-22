import { describe, it, expect } from 'vitest'
import { Linter } from 'eslint'
import aiAgent from '../src/index.js'

function ruleIds(messages: Linter.LintMessage[]) {
  return messages.map((m) => m.ruleId)
}

/**
 * Lint JSX/TSX code — appends ecmaFeatures.jsx to the ai-agent flat config
 * so espree can parse JSX without requiring TypeScript project setup.
 */
function lintJsx(code: string, options: Record<string, unknown> = {}, filename = 'test.tsx') {
  const linter = new Linter({ configType: 'flat' })
  const base = aiAgent({ typescript: false, prettier: false, ...options })
  const config = [
    ...base,
    {
      files: ['**/*.tsx', '**/*.jsx'],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    },
  ]
  return linter.verify(code, config, { filename })
}

/**
 * Lint a Vue SFC — the Vue plugin preset configures the parser for .vue files.
 * Filters out ai-agent/vue-typescript (which sets projectService: true and
 * requires a real TS project) so the Vue parser works in the inline test context.
 */
function lintVue(code: string, options: Record<string, unknown> = {}) {
  const linter = new Linter({ configType: 'flat' })
  const base = aiAgent({ vue: true, typescript: false, prettier: false, ...options })
  const config = base.filter(c => c.name !== 'ai-agent/vue-typescript')
  return linter.verify(code, config, { filename: 'test.vue' })
}

/**
 * Lint plain TS/JS code.
 */
function lint(code: string, options: Record<string, unknown> = {}, filename = 'test.ts') {
  const linter = new Linter({ configType: 'flat' })
  const config = aiAgent({ typescript: false, prettier: false, ...options })
  return linter.verify(code, config, { filename })
}

// ─── REACT: obvious AI mistakes ───────────────────────────────────────────────

describe('React: obvious AI mistakes', () => {
  it('flags missing key prop in .map()', () => {
    const msgs = lintJsx(
      `const list = items.map(item => <li>{item}</li>)`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/jsx-key')
  })

  it('flags <button> without type — defaults to "submit", submits forms accidentally', () => {
    const msgs = lintJsx(
      `const el = <button onClick={fn}>Click me</button>`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/button-has-type')
  })

  it('flags array index as key — breaks reconciliation on reorder', () => {
    const msgs = lintJsx(
      `const list = items.map((item, index) => <li key={index}>{item}</li>)`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/no-array-index-key')
  })

  it('flags dangerouslySetInnerHTML — XSS risk', () => {
    const msgs = lintJsx(
      `const el = <div dangerouslySetInnerHTML={{__html: str}} />`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/no-danger')
  })

  it('flags <br></br> — should be self-closing <br />', () => {
    const msgs = lintJsx(
      `const el = <br></br>`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/self-closing-comp')
  })

  it('flags disabled={true} — should be just disabled', () => {
    const msgs = lintJsx(
      `const el = <input type="text" disabled={true} />`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/jsx-boolean-value')
  })

  it('flags className={"foo"} — unnecessary curly braces around string literal', () => {
    const msgs = lintJsx(
      `const el = <div className={"container"}>text</div>`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/jsx-curly-brace-presence')
  })

  it('flags hook called inside conditional — violates Rules of Hooks', () => {
    const msgs = lintJsx(
      `import { useState } from 'react'
       function Comp({ show }) {
         if (show) { const [s, setS] = useState(0) }
         return null
       }`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react-hooks/rules-of-hooks')
  })
})

// ─── REACT: non-obvious AI mistakes ──────────────────────────────────────────

describe('React: non-obvious AI mistakes', () => {
  it('flags {count && <Child />} — renders "0" when count=0', () => {
    const msgs = lintJsx(
      `const el = <div>{count && <Child />}</div>`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/jsx-no-leaked-render')
  })

  it('flags <></> wrapping single child — useless fragment', () => {
    const msgs = lintJsx(
      `const el = <><Child /></>`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/jsx-no-useless-fragment')
  })

  it('flags component defined inside render body — remounts on every render', () => {
    const msgs = lintJsx(
      `function Parent() {
         function Inner() { return <span>inner</span> }
         return <div><Inner /></div>
       }`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/no-unstable-nested-components')
  })

  it('flags useState setter not named setFoo — obscures what is being set', () => {
    const msgs = lintJsx(
      `import { useState } from 'react'
       const [count, handleCount] = useState(0)`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/hook-use-state')
  })

  it('flags jsx-no-script-url — javascript: href is an XSS vector', () => {
    const msgs = lintJsx(
      `const el = <a href="javascript:void(0)">click</a>`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/jsx-no-script-url')
  })

  it('flags <iframe> without sandbox — allows untrusted content to break out', () => {
    const msgs = lintJsx(
      `const el = <iframe src="https://example.com" />`,
      { react: true },
    )
    expect(ruleIds(msgs)).toContain('react/iframe-missing-sandbox')
  })
})

// ─── REACT NATIVE: obvious AI mistakes ───────────────────────────────────────

describe('React Native: obvious AI mistakes', () => {
  it('flags inline style object — styles must come from StyleSheet', () => {
    const msgs = lintJsx(
      `const el = <View style={{flex: 1, backgroundColor: 'white'}} />`,
      { reactNative: true },
    )
    expect(ruleIds(msgs)).toContain('react-native/no-inline-styles')
  })

  it('flags raw text outside <Text> component', () => {
    const msgs = lintJsx(
      `const el = <View>Hello world</View>`,
      { reactNative: true },
    )
    expect(ruleIds(msgs)).toContain('react-native/no-raw-text')
  })

  it('flags <div> — HTML element must not be used in React Native', () => {
    const msgs = lintJsx(
      `const el = <div className="container">content</div>`,
      { reactNative: true },
    )
    expect(ruleIds(msgs)).toContain('no-restricted-syntax')
  })

  it('flags <button> — HTML element must not be used in React Native', () => {
    const msgs = lintJsx(
      `const el = <button onPress={fn}>tap</button>`,
      { reactNative: true },
    )
    expect(ruleIds(msgs)).toContain('no-restricted-syntax')
  })
})

// ─── REACT NATIVE: non-obvious — web globals in .tsx files ───────────────────

describe('React Native: non-obvious — web globals blocked in .tsx files', () => {
  it('flags localStorage — not available in RN', () => {
    // .tsx extension required: RN globals restriction targets **/*.tsx
    const msgs = lint(
      `const data = localStorage.getItem('key')`,
      { reactNative: true },
      'component.tsx',
    )
    expect(ruleIds(msgs)).toContain('no-restricted-globals')
  })

  it('flags window — use Dimensions or RN APIs instead', () => {
    const msgs = lint(
      `const width = window.innerWidth`,
      { reactNative: true },
      'component.tsx',
    )
    expect(ruleIds(msgs)).toContain('no-restricted-globals')
  })

  it('flags document — DOM API not available in RN', () => {
    const msgs = lint(
      `const el = document.getElementById('app')`,
      { reactNative: true },
      'component.tsx',
    )
    expect(ruleIds(msgs)).toContain('no-restricted-globals')
  })

  it('flags isNaN in .tsx files — MVP globals must not be erased by RN config override', () => {
    // REGRESSION: before the BASE_RESTRICTED_GLOBALS fix, the RN no-html config
    // silently replaced the MVP no-restricted-globals for *.tsx files,
    // making isNaN/isFinite/event restrictions disappear in component files.
    const msgs = lint(
      `if (isNaN(value)) {}`,
      { reactNative: true },
      'component.tsx',
    )
    expect(ruleIds(msgs)).toContain('no-restricted-globals')
  })

  it('flags isFinite in .tsx files — MVP globals preserved after merge', () => {
    const msgs = lint(
      `if (isFinite(value)) {}`,
      { reactNative: true },
      'component.tsx',
    )
    expect(ruleIds(msgs)).toContain('no-restricted-globals')
  })
})

// ─── VUE: obvious AI mistakes ─────────────────────────────────────────────────

describe('Vue: obvious AI mistakes', () => {
  it('flags v-html — XSS risk, same as dangerouslySetInnerHTML in React', () => {
    const msgs = lintVue(
      `<template><div v-html="content"></div></template>\n<script setup>\nconst content = ''\n</script>`,
    )
    expect(ruleIds(msgs)).toContain('vue/no-v-html')
  })

  it('flags static inline style — error (was warn), same severity as RN no-inline-styles', () => {
    const msgs = lintVue(
      `<template><div style="color: red; font-size: 14px">text</div></template>\n<script setup>\n</script>`,
    )
    expect(ruleIds(msgs)).toContain('vue/no-static-inline-styles')
  })

  it('flags <button> without type — same issue as React button-has-type', () => {
    const msgs = lintVue(
      `<template><button @click="handler">Submit</button></template>\n<script setup>\n</script>`,
    )
    expect(ruleIds(msgs)).toContain('vue/html-button-has-type')
  })

  it('flags wrong block order — template before script', () => {
    // Config requires: script → template → style
    const msgs = lintVue(
      `<template><div>test</div></template>\n<script setup>\n</script>`,
    )
    expect(ruleIds(msgs)).toContain('vue/block-order')
  })
})

// ─── VUE: non-obvious AI mistakes ────────────────────────────────────────────

describe('Vue: non-obvious AI mistakes', () => {
  it('flags Options API — only Composition API (script setup) is allowed', () => {
    const msgs = lintVue(
      `<template><div>{{ message }}</div></template>\n<script>\nexport default {\n  data() { return { message: 'hello' } }\n}\n</script>`,
    )
    expect(ruleIds(msgs)).toContain('vue/component-api-style')
  })

  it('flags :loading="true" on custom component — use shorthand prop instead', () => {
    // prefer-true-attribute-shorthand only fires on custom components (PascalCase),
    // not on native HTML elements — :disabled on <input> is intentionally excluded.
    const msgs = lintVue(
      `<template><MyComp :loading="true" /></template>\n<script setup>\n</script>`,
    )
    expect(ruleIds(msgs)).toContain('vue/prefer-true-attribute-shorthand')
  })

  it('flags multiple object bindings in :class — use separate objects instead', () => {
    // AI agents write :class="[{active: isActive}, {disabled: isDisabled}]" — two objects in array
    const msgs = lintVue(
      `<template><div :class="[{active: isActive}, {disabled: isDisabled}]">x</div></template>\n<script setup>\n</script>`,
    )
    expect(ruleIds(msgs)).toContain('vue/no-multiple-objects-in-class')
  })
})

// ─── PROMISE: non-obvious AI mistakes (standard+) ────────────────────────────

describe('Promise: non-obvious AI mistakes (standard+)', () => {
  it('flags .then() chain inside async function — should use async/await', () => {
    // prefer-await-to-then only fires inside async functions (where await is a valid alternative)
    const msgs = lint(
      `async function load() { return fetch('/api').then(res => res.json()) }`,
      { level: 'standard' },
    )
    expect(ruleIds(msgs)).toContain('promise/prefer-await-to-then')
  })

  it('flags nested .then() — classic callback-hell in promise form', () => {
    const msgs = lint(
      `fetch('/api').then(res => { return fetch('/other').then(d => d.json()) })`,
      { level: 'standard' },
    )
    expect(ruleIds(msgs)).toContain('promise/no-nesting')
  })

  it('does NOT flag promise chains at mvp level', () => {
    const msgs = lint(
      `fetch('/api').then(res => res.json())`,
      { level: 'mvp' },
    )
    expect(ruleIds(msgs)).not.toContain('promise/prefer-await-to-then')
  })
})

// ─── MVP: non-obvious rules not covered in integration.test.ts ───────────────

describe('MVP: non-obvious AI guardrails', () => {
  it('flags Array.prototype extension — breaks environment for all consumers', () => {
    const msgs = lint(
      `Array.prototype.last = function() { return this[this.length - 1] }`,
    )
    expect(ruleIds(msgs)).toContain('no-extend-native')
  })

  it('flags comma operator — side-effectful expressions silently discarded', () => {
    // allowInParentheses defaults to true, so (a, b) is allowed.
    // Use a return statement with a bare sequence expression (no wrapping parens).
    const msgs = lint(`function f() { return 1, 2 }`)
    expect(ruleIds(msgs)).toContain('no-sequences')
  })

  it('flags new RegExp() with string literal — use regex literal instead', () => {
    const msgs = lint(`const re = new RegExp('\\\\d+')`)
    expect(ruleIds(msgs)).toContain('prefer-regex-literals')
  })

  it('flags Math.pow — use ** operator instead', () => {
    const msgs = lint(`const r = Math.pow(2, 10)`)
    expect(ruleIds(msgs)).toContain('no-restricted-properties')
  })

  it('flags global isNaN — silently coerces, use Number.isNaN', () => {
    const msgs = lint(`if (isNaN(value)) {}`)
    expect(ruleIds(msgs)).toContain('no-restricted-globals')
  })

  it('flags global isFinite — silently coerces, use Number.isFinite', () => {
    const msgs = lint(`if (isFinite(value)) {}`)
    expect(ruleIds(msgs)).toContain('no-restricted-globals')
  })

  it('flags javascript: URL — XSS vector in href/src', () => {
    const msgs = lint(`location.href = 'javascript:void(0)'`)
    expect(ruleIds(msgs)).toContain('no-script-url')
  })

  it('flags fn.apply(null, args) — use fn(...args) spread instead', () => {
    const msgs = lint(`fn.apply(null, args)`)
    expect(ruleIds(msgs)).toContain('prefer-spread')
  })

  it('flags chained assignment a = b = 0 at standard+ (obscures intent)', () => {
    const msgs = lint(`let a, b; a = b = 0`, { level: 'standard' })
    expect(ruleIds(msgs)).toContain('no-multi-assign')
  })
})

// ─── Factory: verify rules changed/added in this session ─────────────────────

describe('Factory: rules changed in this session', () => {
  it('react/no-array-index-key is error (upgraded from warn)', () => {
    const configs = aiAgent({ react: true })
    const reactCfg = configs.find(c => c.name === 'ai-agent/react')
    expect(reactCfg?.rules?.['react/no-array-index-key']).toBe('error')
  })

  it('react/button-has-type is error (new rule)', () => {
    const configs = aiAgent({ react: true })
    const reactCfg = configs.find(c => c.name === 'ai-agent/react')
    expect(reactCfg?.rules?.['react/button-has-type']).toBe('error')
  })

  it('vue/no-static-inline-styles is error (upgraded from warn)', () => {
    const configs = aiAgent({ vue: true })
    const guardrails = configs.find(c => c.name === 'ai-agent/vue-ai-guardrails')
    expect(guardrails?.rules?.['vue/no-static-inline-styles']).toBe('error')
  })

  it('RN no-html config merges BASE_RESTRICTED_GLOBALS (isNaN, isFinite, event)', () => {
    const configs = aiAgent({ reactNative: true })
    const noHtml = configs.find(c => c.name === 'ai-agent/react-native-no-html')
    const rule = noHtml?.rules?.['no-restricted-globals'] as unknown[]
    const names = rule.slice(1).map((e: any) => e.name)
    expect(names).toContain('isNaN')
    expect(names).toContain('isFinite')
    expect(names).toContain('event')
    expect(names).toContain('document')
    expect(names).toContain('localStorage')
  })
})
