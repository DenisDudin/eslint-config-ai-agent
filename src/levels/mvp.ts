import type { Linter } from 'eslint'
import { BASE_RESTRICTED_SYNTAX, BASE_RESTRICTED_GLOBALS } from '../shared-restrictions.js'

export function mvpRules(): Linter.Config {
  return {
    name: 'ai-agent/mvp',
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Size and complexity
      'max-lines': ['error', { max: 450, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', { max: 5 }],
      'complexity': ['error', { max: 20 }],
      'max-depth': ['error', { max: 6 }],
      'max-statements': ['error', { max: 35 }],
      'max-nested-callbacks': ['error', { max: 3 }],
      'max-classes-per-file': ['error', { max: 1 }],

      // Readability
      'id-length': ['error', { min: 2, exceptions: ['_', 'x', 'y', 'i', 'j', 't', 'el'] }],
      'no-unneeded-ternary': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'prefer-template': 'error',
      // AI agents write 'foo' + 'bar' instead of 'foobar' (prefer-template catches vars, this catches literals)
      'no-useless-concat': 'error',
      'object-shorthand': ['error', 'always'],
      'arrow-body-style': ['error', 'as-needed'],
      // AI agents write x = x + 1 instead of x += 1
      'operator-assignment': ['error', 'always'],
      // AI agents wrap in useless standalone blocks { ... } that serve no purpose
      'no-lone-blocks': 'error',

      // Code quality
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-alert': 'error',
      'no-eval': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'multi-line'],
      'no-return-assign': ['error', 'always'],
      'grouped-accessor-pairs': ['error', 'getBeforeSet'],
      // AI agents forget `return` in .map() / .filter() / .reduce() callbacks
      'array-callback-return': ['error', { allowImplicit: false, checkForEach: false }],
      // AI agents call new Foo() without using the result
      'no-new': 'error',
      // AI agents do new String("x"), new Number(5) — use primitives instead
      'no-new-wrappers': 'error',
      // AI agents create functions via new Function(...) — equivalent to eval
      'no-new-func': 'error',
      // AI agents extend built-in prototypes and break the environment
      'no-extend-native': 'error',
      // AI agents use .bind(this) on arrow functions or where this is not referenced
      'no-extra-bind': 'error',
      // AI agents write new RegExp('\\d+') instead of /\d+/
      'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
      // AI agents forget the radix argument in parseInt("08") — silent decimal/octal bug
      'radix': 'error',
      // AI agents use uppercase names for non-constructors or lowercase for constructors
      'new-cap': ['error', { newIsCap: true, capIsNew: true }],
      // Async & iteration
      // AI agents put `await` in a loop instead of Promise.all — sequential where parallel is intended
      'no-await-in-loop': 'error',
      // AI agents define functions inside loops — classic closure-over-loop-variable bug
      'no-loop-func': 'error',

      // ES6+ patterns
      // AI agents use `arguments` object instead of rest parameters
      'prefer-rest-params': 'error',
      // AI agents use fn.apply(null, args) instead of fn(...args)
      'prefer-spread': 'error',
      // AI agents write Object.assign({}, obj) instead of { ...obj }
      'prefer-object-spread': 'error',

      // Safety
      'no-param-reassign': ['error', { props: false }],
      'no-implicit-coercion': 'error',
      // Comma operator is almost always a mistake (a = 1, b = 2 silently evaluates both)
      'no-sequences': 'error',

      // AI guardrails: restrict dangerous patterns agents tend to produce
      // AI agents use global isNaN("x") → true (coerces), Number.isNaN("x") → false (correct)
      'no-restricted-globals': ['error', ...BASE_RESTRICTED_GLOBALS],
      // AI agents set href="javascript:void(0)" or href="javascript:..." — XSS vector
      'no-script-url': 'error',
      // AI agents write `a + b` or `condition` as a statement — expression with no effect
      'no-unused-expressions': ['error', {
        allowShortCircuit: true,  // allow condition && doSomething()
        allowTernary: true,       // allow condition ? a() : b()
        allowTaggedTemplates: true,
      }],
      // AI agents confuse & with &&, | with || — no-bitwise catches the mistake
      'no-bitwise': 'error',
      'no-restricted-syntax': ['error', ...BASE_RESTRICTED_SYNTAX],
      'no-restricted-properties': [
        'error',
        {
          object: 'arguments',
          property: 'callee',
          message: 'Use named functions instead of arguments.callee.',
        },
        {
          object: 'Math',
          property: 'pow',
          message: 'Use the exponentiation operator `**` instead of Math.pow.',
        },
      ],

      // Disable core rules in favor of TS equivalents
      'no-implied-eval': 'off',
      'no-throw-literal': 'off',
      'no-return-await': 'off',
      'no-shadow': 'off',
    },
  }
}
