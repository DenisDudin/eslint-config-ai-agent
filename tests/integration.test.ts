import { describe, it, expect } from 'vitest'
import { Linter } from 'eslint'
import aiAgent from '../src/index.js'

/**
 * Integration tests: run real ESLint Linter API against code snippets.
 * These verify that rules actually fire, not just that configs are structured correctly.
 */

function lint(code: string, filename = 'test.ts', options = {}) {
  const linter = new Linter({ configType: 'flat' })
  const config = aiAgent({ typescript: false, prettier: false, ...options })
  const messages = linter.verify(code, config, { filename })
  return messages
}

function ruleIds(messages: Linter.LintMessage[]) {
  return messages.map((m) => m.ruleId)
}

describe('integration: MVP guardrails', () => {
  it('flags eval', () => {
    const msgs = lint('eval("code")')
    expect(ruleIds(msgs)).toContain('no-eval')
  })

  it('flags var', () => {
    const msgs = lint('var x = 1')
    expect(ruleIds(msgs)).toContain('no-var')
  })

  it('flags == instead of ===', () => {
    const msgs = lint('if (x == null) {}')
    expect(ruleIds(msgs)).toContain('eqeqeq')
  })

  it('flags implicit coercion !!', () => {
    const msgs = lint('const b = !!value')
    expect(ruleIds(msgs)).toContain('no-implicit-coercion')
  })

  it('flags for...in', () => {
    const msgs = lint('for (const k in obj) { console.warn(k) }')
    expect(ruleIds(msgs)).toContain('no-restricted-syntax')
  })

  it('flags console.log', () => {
    const msgs = lint('console.log("debug")')
    expect(ruleIds(msgs)).toContain('no-console')
  })

  it('flags string concat instead of template literal', () => {
    const msgs = lint('const s = "hello " + name')
    expect(ruleIds(msgs)).toContain('prefer-template')
  })
})

describe('integration: unicorn guardrails', () => {
  it('flags filter()[0] instead of find()', () => {
    const msgs = lint('const x = arr.filter(fn)[0]')
    expect(ruleIds(msgs)).toContain('unicorn/prefer-array-find')
  })

  it('flags throw Error() without new', () => {
    const msgs = lint('throw Error("oops")')
    expect(ruleIds(msgs)).toContain('unicorn/throw-new-error')
  })

  it('flags throw new Error() without message', () => {
    const msgs = lint('throw new Error()')
    expect(ruleIds(msgs)).toContain('unicorn/error-message')
  })

  it('flags empty file', () => {
    const msgs = lint('', 'empty.ts')
    expect(ruleIds(msgs)).toContain('unicorn/no-empty-file')
  })
})

describe('integration: standard level', () => {
  it('flags magic numbers at standard level', () => {
    // enforceConst allows numbers in `const` declarations — use a function return to trigger
    const msgs = lint('function delay() { return 3000 }', 'test.ts', { level: 'standard' })
    expect(ruleIds(msgs)).toContain('no-magic-numbers')
  })

  it('does not flag magic numbers at mvp level', () => {
    const msgs = lint('function delay() { return 3000 }', 'test.ts', { level: 'mvp' })
    expect(ruleIds(msgs)).not.toContain('no-magic-numbers')
  })
})

describe('integration: Airbnb-sourced guardrails', () => {
  it('flags await in loop', () => {
    const msgs = lint('async function f(arr) { for (const x of arr) { await x } }')
    expect(ruleIds(msgs)).toContain('no-await-in-loop')
  })

  it('flags missing return in map callback', () => {
    const msgs = lint('const r = arr.map(function(x) { x + 1 })')
    expect(ruleIds(msgs)).toContain('array-callback-return')
  })

  it('flags function defined inside loop (var — classic closure bug)', () => {
    // no-loop-func fires for `var` (shared across iterations); `let` is safe and not flagged
    const msgs = lint('var arr = []; for (var i = 0; i < 3; i++) { arr.push(function() { return i }) }')
    expect(ruleIds(msgs)).toContain('no-loop-func')
  })

  it('flags new String()', () => {
    const msgs = lint('const s = new String("x")')
    expect(ruleIds(msgs)).toContain('no-new-wrappers')
  })

  it('flags new Function()', () => {
    const msgs = lint('const f = new Function("return 1")')
    expect(ruleIds(msgs)).toContain('no-new-func')
  })

  it('flags parseInt without radix', () => {
    const msgs = lint('const n = parseInt("08")')
    expect(ruleIds(msgs)).toContain('radix')
  })

  it('flags bitwise & instead of &&', () => {
    const msgs = lint('const r = a & b')
    expect(ruleIds(msgs)).toContain('no-bitwise')
  })

  it('flags Object.assign({}, obj) instead of spread', () => {
    const msgs = lint('const r = Object.assign({}, obj)')
    expect(ruleIds(msgs)).toContain('prefer-object-spread')
  })

  it('flags no-new (constructor called without assignment)', () => {
    const msgs = lint('function Foo() {} new Foo()')
    expect(ruleIds(msgs)).toContain('no-new')
  })
})

describe('integration: test file relaxations', () => {
  it('does not flag magic numbers in test files', () => {
    const msgs = lint('const timeout = 3000', 'foo.test.ts', { level: 'standard' })
    expect(ruleIds(msgs)).not.toContain('no-magic-numbers')
  })

  it('does not flag magic numbers in spec files', () => {
    const msgs = lint('const timeout = 3000', 'foo.spec.ts', { level: 'standard' })
    expect(ruleIds(msgs)).not.toContain('no-magic-numbers')
  })

  it('does not flag magic numbers in config files', () => {
    const msgs = lint('const timeout = 3000', 'vite.config.ts', { level: 'standard' })
    expect(ruleIds(msgs)).not.toContain('no-magic-numbers')
  })
})
