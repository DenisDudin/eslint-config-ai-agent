import type { Linter } from 'eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactRefresh from 'eslint-plugin-react-refresh'

export function reactConfig(): Linter.Config[] {
  return [
    {
      name: 'ai-agent/react',
      files: ['**/*.tsx', '**/*.jsx'],
      plugins: {
        react: react as unknown as Record<string, unknown>,
        'react-hooks': reactHooks as unknown as Record<string, unknown>,
        'jsx-a11y': jsxA11y as unknown as Record<string, unknown>,
        'react-refresh': reactRefresh as unknown as Record<string, unknown>,
      },
      settings: {
        react: { version: 'detect' },
      },
      rules: {
        // --- Hooks ---
        'react-hooks/exhaustive-deps': 'error',
        'react-hooks/rules-of-hooks': 'error',

        // --- Critical AI-agent guardrails ---
        'react/jsx-key': ['error', { checkFragmentShorthand: true, warnOnDuplicates: true }],
        'react/no-direct-mutation-state': 'error',
        'react/no-children-prop': 'error',
        'react/no-danger': 'error',
        'react/no-deprecated': 'error',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-no-duplicate-props': 'error',

        // --- AI agents confuse HTML and JSX (from Airbnb) ---
        'react/no-unknown-property': 'error',
        'react/no-unescaped-entities': 'error',
        'react/style-prop-object': 'error',
        'react/void-dom-elements-no-children': 'error',
        'react/jsx-pascal-case': ['error', { allowAllCaps: true }],
        'react/no-string-refs': 'error',

        // --- Security ---
        'react/iframe-missing-sandbox': 'error',
        'react/jsx-no-script-url': 'error',
        'react/no-danger-with-children': 'error',

        // --- Performance (agents create new objects/functions in render) ---
        'react/jsx-no-constructed-context-values': 'error',
        'react/no-object-type-as-default-prop': 'error',
        'react/no-unstable-nested-components': ['error', { allowAsProps: true }],

        // --- DevTools ---
        'react/display-name': 'error',

        // --- JSX quality ---
        'react/no-array-index-key': 'error',
        // AI agents write <button onClick={...}> without type — defaults to "submit", accidentally submits forms
        'react/button-has-type': 'error',
        'react/self-closing-comp': ['error', { component: true, html: true }],
        'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
        'react/jsx-curly-brace-presence': [
          'error',
          { props: 'never', children: 'never' },
        ],
        'react/jsx-boolean-value': ['error', 'never'],
        'react/jsx-fragments': ['error', 'syntax'],
        'react/hook-use-state': 'error',
        'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary', 'coerce'] }],

        // --- File conventions ---
        'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],

        // --- HMR / Fast Refresh ---
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

        // --- jsx-a11y (expanded from recommended preset) ---
        'jsx-a11y/alt-text': 'error',
        'jsx-a11y/anchor-has-content': 'error',
        'jsx-a11y/anchor-is-valid': 'error',
        'jsx-a11y/aria-props': 'error',
        'jsx-a11y/aria-proptypes': 'error',
        'jsx-a11y/aria-role': 'error',
        'jsx-a11y/click-events-have-key-events': 'error',
        'jsx-a11y/heading-has-content': 'error',
        'jsx-a11y/interactive-supports-focus': 'error',
        'jsx-a11y/label-has-associated-control': 'error',
        'jsx-a11y/no-aria-hidden-on-focusable': 'error',
        'jsx-a11y/no-noninteractive-element-interactions': 'warn',
        'jsx-a11y/no-static-element-interactions': ['error', {
          handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
        }],
        'jsx-a11y/tabindex-no-positive': 'error',
        // AI agents write alt="image of a cat" — word "image/photo/picture/icon" in alt is redundant
        'jsx-a11y/img-redundant-alt': 'error',
        // AI agents add onMouseOver without onFocus — keyboard users can't trigger the handler
        'jsx-a11y/mouse-events-have-key-events': 'error',
        // AI agents set role without required ARIA attributes for that role
        'jsx-a11y/role-has-required-aria-props': 'error',
        // AI agents add aria-* attributes that are not valid for the element's role
        'jsx-a11y/role-supports-aria-props': 'error',
      },
    },
  ]
}
