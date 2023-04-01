import { Setting } from './types/settings';

type Block = {
  name: string;
  settings: Setting[];
};

type Preset = {
  name: string;
  settings?: Record<string, unknown>;
  blocks?: Record<string, unknown> & { type: string };
};

type EnabledOrDisabledOnSettings = {
  groups?: ('*' | string)[];
  templates?: ('*' | string)[];
};

export type SectionSchema = {
  name: string;
  tag?: 'article' | 'aside' | 'div' | 'footer' | 'header' | 'section';
  class?: string;
  limit?: number;
  settings?: Setting[];
  blocks?: Block[];
  max_blocks?: number;
  presets?: Preset[];
  default?: Preset;
  locales?: Record<string, Record<string, string>>;
  enabled_on?: EnabledOrDisabledOnSettings;
  disabled_on?: EnabledOrDisabledOnSettings;
};

export function defineSectionSchema(config: SectionSchema): SectionSchema {
  return config;
}
