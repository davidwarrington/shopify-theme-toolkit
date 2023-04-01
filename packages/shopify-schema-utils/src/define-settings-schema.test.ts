import { describe, expect, it } from 'vitest';
import {
  defineSettingsSchema,
  type SettingsSchema,
  type SettingsSchemaObject,
} from './define-settings-schema';

describe('define-settings-schema', () => {
  it('supports regular settings schema structure', () => {
    const input: SettingsSchema = [
      {
        name: 'theme_info',
        theme_name: 'define-settings-schema',
        theme_author: 'define-settings-schema',
        theme_documentation_url: 'define-settings-schema',
        theme_version: 'define-settings-schema',
        theme_support_email: 'define-settings-schema',
      },
      {
        name: 'Developer Settings',
        settings: [],
      },
    ];

    const output: SettingsSchema = [
      {
        name: 'theme_info',
        theme_name: 'define-settings-schema',
        theme_author: 'define-settings-schema',
        theme_documentation_url: 'define-settings-schema',
        theme_version: 'define-settings-schema',
        theme_support_email: 'define-settings-schema',
      },
      {
        name: 'Developer Settings',
        settings: [],
      },
    ];

    expect(defineSettingsSchema(input)).toStrictEqual(output);
  });

  it('support object settings schema structure', () => {
    const input: SettingsSchemaObject = {
      meta: {
        name: 'theme_info',
        theme_name: 'define-settings-schema',
        theme_author: 'define-settings-schema',
        theme_documentation_url: 'define-settings-schema',
        theme_version: 'define-settings-schema',
        theme_support_email: 'define-settings-schema',
      },
      settings: [
        {
          name: 'Category 1',
          settings: [],
        },
        {
          name: 'Category 2',
          settings: [],
        },
      ],
    };

    const output: SettingsSchema = [
      {
        name: 'theme_info',
        theme_name: 'define-settings-schema',
        theme_author: 'define-settings-schema',
        theme_documentation_url: 'define-settings-schema',
        theme_version: 'define-settings-schema',
        theme_support_email: 'define-settings-schema',
      },
      {
        name: 'Category 1',
        settings: [],
      },
      {
        name: 'Category 2',
        settings: [],
      },
    ];

    expect(defineSettingsSchema(input)).toStrictEqual(output);
  });

  describe('object settings schema', () => {
    it('does not require settings categories', () => {
      const input: SettingsSchemaObject = {
        meta: {
          name: 'theme_info',
          theme_name: 'define-settings-schema',
          theme_author: 'define-settings-schema',
          theme_documentation_url: 'define-settings-schema',
          theme_version: 'define-settings-schema',
          theme_support_email: 'define-settings-schema',
        },
      };

      const output: SettingsSchema = [
        {
          name: 'theme_info',
          theme_name: 'define-settings-schema',
          theme_author: 'define-settings-schema',
          theme_documentation_url: 'define-settings-schema',
          theme_version: 'define-settings-schema',
          theme_support_email: 'define-settings-schema',
        },
      ];

      expect(defineSettingsSchema(input)).toStrictEqual(output);
    });
  });
});
