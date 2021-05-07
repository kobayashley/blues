module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  overrides: [
      {
        files: ["public/js/*.js"],
        env: {
          browser: true,
        }
      }
  ],
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "eol-last": ["error", "always"],
    semi: "error",
  }
};
