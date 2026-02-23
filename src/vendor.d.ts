// Type declarations for ESLint plugins that don't ship their own types
declare module 'eslint-plugin-jsx-a11y' {
  import type { ESLint } from 'eslint'
  const plugin: ESLint.Plugin
  export default plugin
}

declare module 'eslint-plugin-promise' {
  import type { ESLint } from 'eslint'
  const plugin: ESLint.Plugin
  export default plugin
}

declare module 'eslint-plugin-react-native' {
  import type { ESLint } from 'eslint'
  const plugin: ESLint.Plugin
  export default plugin
}
