import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ignores: ['node_modules/', 'test-results/', 'playwright-report/', 'dist/'],
  },
  js.configs.recommended,
  {
    files: ['assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['tools/**/*.mjs', 'tests/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
      eqeqeq: ['error', 'smart'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
