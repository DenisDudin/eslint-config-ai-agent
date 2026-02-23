# eslint-config-ai-agent

[![npm](https://img.shields.io/npm/v/eslint-config-ai-agent)](https://www.npmjs.com/package/eslint-config-ai-agent)
[![license](https://img.shields.io/npm/l/eslint-config-ai-agent)](./LICENSE)

Universal ESLint flat config optimized for AI-agent development. Catches the patterns AI agents produce most often: implicit coercions, unsafe mutations, cross-layer imports, unescaped HTML, promise misuse, and dozens more.

## Installation

```bash
npm install -D eslint-config-ai-agent
# or
pnpm add -D eslint-config-ai-agent
```

Framework plugins (react, vue, react-native, fsd, prettier) are optional peer dependencies — install only what you use:

```bash
# React
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-react-refresh

# Vue
npm install -D eslint-plugin-vue

# React Native
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-react-refresh eslint-plugin-react-native

# FSD architecture
npm install -D eslint-plugin-boundaries

# Prettier compat
npm install -D eslint-config-prettier
```

Or install everything at once:

```bash
npx install-peerdeps -D eslint-config-ai-agent
```

**Required peer dependencies:** `eslint >= 9.38.0`, `typescript >= 5.0.0` (optional)

> **`npm audit` reports minimatch vulnerability?**
> `typescript-eslint` (a dependency of this package) currently ships `minimatch@^9` internally, which has a [ReDoS advisory](https://github.com/advisories/GHSA-3ppc-4f35-3m26). This is a dev-only tool, so there is no production impact. A fix is pending in `typescript-eslint@8.56.1` (stable). Until then, add an override to your project:
> ```json
> // package.json
> "overrides": { "minimatch": "^10.2.1" }
> // pnpm: use "pnpm.overrides" instead
> ```

## Quick Start

```js
// eslint.config.js
import aiAgent from 'eslint-config-ai-agent'

export default aiAgent({
  level: 'standard',
  typescript: true,
})
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `level` | `'mvp' \| 'standard' \| 'strict'` | `'standard'` | Strictness level (cumulative) |
| `typescript` | `boolean` | `true` | TypeScript parser + rules |
| `typedLinting` | `boolean` | `true` | Type-checked rules (`no-unsafe-*`, `no-floating-promises`, etc.) — requires `projectService`. Set to `false` for faster local linting (enable in CI only) |
| `react` | `boolean` | `false` | React, hooks, jsx-a11y rules |
| `reactNative` | `boolean` | `false` | React Native rules (auto-enables `react`) |
| `vue` | `boolean` | `false` | Vue 3 SFC rules |
| `fsd` | `boolean` | `false` | Feature-Sliced Design layer boundaries |
| `prettier` | `boolean` | `true` | Disable formatting rules (eslint-config-prettier) |
| `ignores` | `string[]` | `[]` | Additional global ignore patterns |
| `overrides` | `Linter.RulesRecord` | `{}` | Custom rules applied after all configs |

### React

```js
export default aiAgent({
  level: 'standard',
  react: true,
})
```

Enables `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react-refresh`. Key AI-agent guardrails included: `jsx-no-leaked-render` (renders `0` instead of nothing), `button-has-type` (missing `type` accidentally submits forms), `no-array-index-key` (breaks reconciliation on list reorder), `no-unstable-nested-components` (causes remounting on every render).

### React Native

```js
export default aiAgent({
  level: 'standard',
  reactNative: true, // automatically enables react: true
})
```

Enables all React rules plus `eslint-plugin-react-native`. Blocks HTML elements (`<div>`, `<span>`, `<button>`, and 22 more) that AI agents use instead of RN components. Restricts web-only globals (`document`, `window`, `localStorage`, `sessionStorage`) and internal RN package imports.

### Vue

```js
export default aiAgent({
  level: 'standard',
  vue: true,
})
```

Enables `eslint-plugin-vue` (essential preset at `mvp`, recommended at `standard+`). Enforces Composition API only (`script setup`) — Options API is an error. Extra AI-agent guardrails: reactivity-loss detection (`no-ref-object-reactivity-loss`, `no-setup-props-reactivity-loss`), unused declarations, undefined references, and type-based prop/emit declarations.

### Feature-Sliced Design

```js
export default aiAgent({
  level: 'standard',
  react: true,
  fsd: true,
})
```

Enables `eslint-plugin-boundaries` for layer isolation (`shared → entities → features → widgets → pages → app`) and `no-restricted-imports` to enforce public API access only.

### Overrides

Use `overrides` to tune any rule after all configs are applied:

```js
export default aiAgent({
  level: 'strict',
  react: true,
  overrides: {
    'no-console': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
})
```

## Strictness Levels

Levels are **cumulative** — `standard` includes all `mvp` rules, `strict` includes all `standard` rules.

| Rule | MVP | Standard | Strict |
|---|---|---|---|
| `max-lines` | 450 | 400 | 300 |
| `max-lines-per-function` | 100 | 90 | 80 |
| `max-params` | 5 | 4 | 3 |
| `complexity` | 20 | 15 | 10 |
| `max-depth` | 6 | 5 | 4 |
| `max-statements` | 35 | 28 | 25 |
| `no-magic-numbers` | — | error | error |
| `@typescript-eslint/no-explicit-any` | warn | error | error |
| `@typescript-eslint/no-unsafe-*` | — | error | error |
| SonarJS recommended | — | ✓ | ✓ |
| `eslint-plugin-promise` | — | ✓ | ✓ |
| `import-x/no-cycle` | — | — | error |
| `no-param-reassign` props | false | false | true |

> **Note:** `no-param-reassign` with `props: true` in `strict` mode is automatically relaxed for state management files matching `**/store/**`, `**/stores/**`, `**/slices/**`, `**/*.slice.ts`, `**/*.store.ts` (Immer / Redux Toolkit / Pinia / Vuex patterns).

## Caught Patterns

Examples of non-obvious mistakes the config catches.

**`{count && <Spinner />}` renders `"0"` when count is zero**

```jsx
// ❌ react/jsx-no-leaked-render
{count && <Spinner />}

// ✓
{count > 0 && <Spinner />}
```

**`<button>` without `type` accidentally submits forms**

```jsx
// ❌ react/button-has-type
<button onClick={handleClick}>Save</button>

// ✓
<button type="button" onClick={handleClick}>Save</button>
```

**`filter()[0]` instead of `find()`**

```js
// ❌ unicorn/prefer-array-find
const user = users.filter(u => u.id === id)[0]

// ✓
const user = users.find(u => u.id === id)
```

**`await` inside a loop runs requests sequentially**

```js
// ❌ no-await-in-loop
for (const id of ids) {
  const user = await fetchUser(id)
}

// ✓
const users = await Promise.all(ids.map(fetchUser))
```

**Destructuring Vue props loses reactivity**

```js
// ❌ vue/no-setup-props-reactivity-loss
const { title } = props  // title is now a plain string, not reactive

// ✓
const title = computed(() => props.title)
// or use toRefs(props)
```

**HTML elements in React Native**

```jsx
// ❌ no-restricted-syntax — <div> does not exist in React Native
<div className="container"><span>{text}</span></div>

// ✓
<View style={styles.container}><Text>{text}</Text></View>
```

## What's Included

### Always on (all levels)

- **`@eslint/js`** recommended
- **`typescript-eslint`** recommended + custom rules (`naming-convention`, `consistent-type-imports`, `no-non-null-assertion`, and more); type-checked rules (`no-unsafe-*`, `no-floating-promises`, `switch-exhaustiveness-check`) are `standard+` only
- **`eslint-plugin-import-x`** — `no-default-export`, `no-cycle` (strict only), `no-duplicates`, ordered imports
- **`eslint-plugin-unicorn`** — AI-specific patterns: `prefer-array-find`, `no-useless-spread`, `no-abusive-eslint-disable`, `no-thenable`, `no-empty-file`, `throw-new-error`, `error-message`, `prefer-node-protocol`, `prefer-string-replace-all`, `prefer-at`, `no-useless-undefined`
- **`eslint-config-prettier`** — disables formatting rules (unless `prettier: false`)

### Standard+ only

- **`eslint-plugin-sonarjs`** recommended — cognitive complexity, duplicate code, regex safety
- **`eslint-plugin-promise`** — `prefer-await-to-then`, `catch-or-return`, `no-multiple-resolved`

### AI guardrails (built-in)

Rules targeting patterns AI agents produce most:

- `no-restricted-syntax` — forbids `for...in`, `with`, `Function` type, labeled statements
- `no-implicit-coercion` — forbids `!!x`, `+x`, `"" + x`
- `no-eval`, `no-alert`
- `eqeqeq` — always use `===`
- `prefer-template`, `object-shorthand`, `arrow-body-style`
- `no-else-return` — no redundant else after return
- `no-await-in-loop` — sequential awaits instead of `Promise.all`
- `array-callback-return` — missing `return` in `.map()` / `.filter()`
- `no-extend-native` — modifying built-in prototypes
- `no-restricted-globals` — `isNaN` / `isFinite` (use `Number.isNaN` / `Number.isFinite`)

## Automatic Relaxations

Test files (`**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`) and config files (`**/*.config.*`) automatically get:

- `no-magic-numbers` — off
- `max-lines`, `max-lines-per-function`, `max-statements` — off
- `id-length` — off
- `@typescript-eslint/no-explicit-any` and all `no-unsafe-*` — off
- `import-x/no-default-export` — off

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT
