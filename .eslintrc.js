const { builtinModules } = require('module');
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
  root: true,
  parserOptions: {
    ecmaVersion: 2021,
    lib: ['es2021'],
  },
  rules: {
    'simple-import-sort/exports': 'error',
    'import/no-duplicates': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Side effect imports
          ['^\\u0000'],
          // Node.js builtins
          [`^(${builtinModules.join('|')})(/|$)`],
        ],
      },
    ],
  },
  overrides: [
    {
      files: '*.js',
      rules: {
        '@typescript-eslint/no-var-requires': ['off'],
      },
    },
  ],
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  settings: {
    'import/resolver': 'typescript',
  },
};
