// ESLint configuration migrated for v9+ (CommonJS syntax, flat config, manual recommended rules)

/** @type {import('eslint').Linter.FlatConfig} */
module.exports = [
  {
    ignores: [
      'public/javascripts/*.js',
      '.github/*',
    ],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        exports: 'writable',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {},
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-empty': 'warn',
      'eqeqeq': 'warn',
      'curly': 'warn',
      'semi': ['warn', 'always'],
    },
  },
];
