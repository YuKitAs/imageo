module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  extends: 'standard',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'max-len': ['error', { code: 100 }]
  }
}
