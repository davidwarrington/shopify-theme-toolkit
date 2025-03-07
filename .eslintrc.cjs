module.exports = {
  root: true,

  extends: [
    'eslint:recommended',
    'plugin@typescript-eslint/recommended',
    'prettier',
  ],

  parser: '@typescript-eslint',

  plugins: ['@typescript-eslint'],
};
