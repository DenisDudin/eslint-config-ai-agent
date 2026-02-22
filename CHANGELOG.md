# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-22

### Added

- Factory function `aiAgent(options)` returning ESLint flat config array
- Three cumulative strictness levels: `mvp`, `standard`, `strict`
- TypeScript support via `typescript-eslint` (parser + rules, level-gated)
- Import rules via `eslint-plugin-import-x` (`no-default-export`, `no-cycle` at strict, ordered imports)
- AI guardrails via `eslint-plugin-unicorn`: `prefer-array-find`, `no-useless-spread`, `no-abusive-eslint-disable`, `no-thenable`, `no-empty-file`, `throw-new-error`, `error-message`, `no-useless-promise-resolve-reject`, `prefer-node-protocol`, `prefer-string-replace-all`, `prefer-at`, `no-useless-undefined`
- Code quality rules via `eslint-plugin-sonarjs` recommended (standard+)
- Promise rules via `eslint-plugin-promise` (standard+)
- React support: `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react-refresh`
- React Native support: `eslint-plugin-react-native`, `eslint-plugin-react-native-a11y`, web API restrictions (`document`, `window`, `localStorage`)
- Vue 3 support: `eslint-plugin-vue` (essential/recommended by level) with Composition API enforcement and reactivity-loss detection
- Feature-Sliced Design architecture enforcement via `eslint-plugin-boundaries` and `no-restricted-imports`
- Prettier compatibility via `eslint-config-prettier` (always last)
- Automatic relaxations for test, spec, and config files
- `no-param-reassign` props relaxation for state management files (Immer / Redux Toolkit / Pinia / Vuex)
- Shared restriction constants to prevent flat-config last-wins overwrite bugs
- `typedLinting` option to disable type-checked rules (`no-unsafe-*`, `no-floating-promises`, etc.) for faster local linting
- `BASE_RESTRICTED_GLOBALS` merge in React Native config to prevent `isNaN`/`isFinite`/`event` restrictions being silently overwritten for `.tsx` files
- Automatic relaxations for Vue SFC files (`max-lines: 600`, `max-lines-per-function: 150`)
