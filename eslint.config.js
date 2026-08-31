// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAnyKeyword',
          message: 'Use a named Ingredia contract instead of any.',
        },
        {
          selector: 'TSUnknownKeyword',
          message: 'Use a named Ingredia contract instead of unknown.',
        },
      ],
    },
  }
]);
