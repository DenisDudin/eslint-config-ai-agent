import type { Linter } from 'eslint'
import reactNative from 'eslint-plugin-react-native'
import reactNativeA11y from 'eslint-plugin-react-native-a11y'
import { BASE_RESTRICTED_SYNTAX, BASE_RESTRICTED_GLOBALS, RN_RESTRICTED_IMPORT_PATTERNS } from '../shared-restrictions.js'

const HTML_TAGS = [
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'form', 'input', 'textarea', 'select', 'option', 'button',
  'a', 'img', 'label', 'section', 'article', 'nav', 'header', 'footer',
  'main', 'aside',
]

function buildHtmlTagRestrictions(): Array<{ selector: string; message: string }> {
  return HTML_TAGS.map(tag => ({
    selector: `JSXOpeningElement[name.name='${tag}']`,
    message: `Use React Native components instead of <${tag}>. Example: <View>, <Text>, <Pressable>, <Image>.`,
  }))
}

export function reactNativeConfig(): Linter.Config[] {
  return [
    {
      name: 'ai-agent/react-native',
      files: ['**/*.tsx'],
      plugins: {
        'react-native': reactNative as unknown as Record<string, unknown>,
      },
      rules: {
        'react-native/no-inline-styles': 'error',
        'react-native/no-raw-text': 'error',
        'react-native/no-unused-styles': 'error',
        'react-native/no-color-literals': 'warn',
        'react-native/no-single-element-style-arrays': 'error',
        'react-native/split-platform-components': 'error',
      },
    },
    {
      name: 'ai-agent/react-native-a11y',
      files: ['**/*.tsx'],
      plugins: {
        'react-native-a11y': reactNativeA11y as unknown as Record<string, unknown>,
      },
      rules: {
        'react-native-a11y/has-accessibility-hint': 'warn',
        'react-native-a11y/has-accessibility-props': 'error',
        'react-native-a11y/has-valid-accessibility-actions': 'error',
        'react-native-a11y/has-valid-accessibility-role': 'error',
        'react-native-a11y/has-valid-accessibility-state': 'error',
        'react-native-a11y/has-valid-accessibility-states': 'error',
        'react-native-a11y/has-valid-accessibility-component-type': 'error',
        'react-native-a11y/has-valid-accessibility-traits': 'error',
        'react-native-a11y/has-valid-accessibility-value': 'error',
        'react-native-a11y/no-nested-touchables': 'error',
      },
    },
    {
      name: 'ai-agent/react-native-no-html',
      files: ['**/*.tsx'],
      rules: {
        // Merge base AI guardrails + HTML tag restrictions (flat config last-wins)
        'no-restricted-syntax': ['error', ...BASE_RESTRICTED_SYNTAX, ...buildHtmlTagRestrictions()],
        // Prevent deep imports from react-native internals
        'no-restricted-imports': ['error', {
          patterns: [...RN_RESTRICTED_IMPORT_PATTERNS],
        }],
        // Prevent AI agents from using web-only APIs in RN
        // BASE_RESTRICTED_GLOBALS must be merged here — flat-config last-wins would otherwise
        // erase the MVP restrictions (isNaN, isFinite, event) for .tsx files.
        'no-restricted-globals': [
          'error',
          ...BASE_RESTRICTED_GLOBALS,
          { name: 'document', message: 'document is not available in React Native.' },
          { name: 'window', message: 'Use Dimensions or other RN APIs instead of window.' },
          { name: 'localStorage', message: 'Use AsyncStorage or expo-secure-store in React Native.' },
          { name: 'sessionStorage', message: 'sessionStorage is not available in React Native.' },
        ],
      },
    },
  ]
}
