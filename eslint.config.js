import { typescript } from '@davidwarrington/eslint-config';

export default [
  ...typescript,

  {
    rules: {
      'unicorn/no-null': 'off',
    },
  },
];
