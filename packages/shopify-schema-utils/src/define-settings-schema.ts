import { Setting } from './types/settings';
import { ThemeMetadata } from './types/theme-metadata';

export type ThemeSettingsCategory = {
  name: string;
  settings: Setting[];
};

export type SettingsSchema = [ThemeMetadata, ...ThemeSettingsCategory[]];
export type SettingsSchemaObject = {
  meta: ThemeMetadata;
  settings?: ThemeSettingsCategory[];
};

export function defineSettingsSchema(
  schema: SettingsSchema | SettingsSchemaObject
): SettingsSchema {
  if (Array.isArray(schema)) {
    return schema;
  }

  const { meta, settings = [] } = schema;

  return [meta, ...settings];
}
