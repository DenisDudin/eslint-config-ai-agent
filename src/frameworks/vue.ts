import type { Linter } from 'eslint'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import type { Level } from '../types.js'

export function vueConfig(level: Level): Linter.Config[] {
  // Base preset: essential for mvp, recommended for standard+
  const preset = level === 'mvp'
    ? vue.configs['flat/essential'] as Linter.Config[]
    : vue.configs['flat/recommended'] as Linter.Config[]

  const presetConfigs = preset.map((config, idx) => ({
    ...config,
    name: `ai-agent/vue/${idx}`,
  }))

  return [
    ...presetConfigs,

    // TypeScript parser for .vue files with <script lang="ts">
    {
      name: 'ai-agent/vue-typescript',
      files: ['**/*.vue'],
      languageOptions: {
        parserOptions: {
          parser: tseslint.parser,
          extraFileExtensions: ['.vue'],
          projectService: true,
        },
      },
    },

    // AI-agent specific Vue rules
    {
      name: 'ai-agent/vue-ai-guardrails',
      files: ['**/*.vue'],
      rules: {
        // Security: agents insert v-html without thinking
        'vue/no-v-html': 'error',
        'vue/no-v-text-v-html-on-component': 'error',

        // Reactivity: agents destructure reactive objects and lose reactivity
        'vue/no-ref-object-reactivity-loss': 'error',
        'vue/no-setup-props-reactivity-loss': 'error',

        // Composition API consistency
        'vue/component-api-style': ['error', ['script-setup', 'composition']],
        'vue/define-props-declaration': ['error', 'type-based'],
        'vue/define-emits-declaration': ['error', 'type-based'],
        'vue/prefer-define-options': 'error',

        // SFC structure
        'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
        'vue/define-macros-order': ['error', {
          order: ['defineProps', 'defineEmits', 'defineOptions', 'defineSlots', 'defineModel'],
        }],
        'vue/html-button-has-type': 'error',
        'vue/prefer-use-template-ref': 'error',

        // Agents create templates with common mistakes
        'vue/no-lone-template': 'error',
        'vue/no-multiple-objects-in-class': 'error',
        'vue/no-static-inline-styles': 'error',
        'vue/prefer-true-attribute-shorthand': 'error',
        'vue/prefer-separate-static-class': 'error',

        // AI agents declare things they never use
        'vue/no-unused-emit-declarations': 'error',
        'vue/no-unused-properties': ['error', {
          groups: ['props', 'data', 'computed', 'methods', 'setup'],
        }],
        'vue/no-unused-refs': 'error',

        // AI agents reference undeclared properties/components
        'vue/no-undef-components': ['error', {
          ignorePatterns: ['RouterLink', 'RouterView'],
        }],
        'vue/no-undef-properties': 'error',

        // Type safety: agents skip type params on refs
        'vue/require-typed-ref': 'error',
        'vue/require-explicit-slots': 'error',

        // Default export required for .vue
        'import-x/no-default-export': 'off',
      },
    },
  ]
}
