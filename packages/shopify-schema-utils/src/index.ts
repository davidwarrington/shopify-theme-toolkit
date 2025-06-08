type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in Exclude<
          keyof T,
          symbol
        >]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}`;
      }[Exclude<keyof T, symbol>]
    : ''
) extends infer D
  ? Extract<D, string>
  : never;

type Translations<Dictionary> = DotNestedKeys<Dictionary>;
type TranslationKey<Dictionary> = `t:${Translations<Dictionary>}`;

type TranslationKeyOrString<Dictionary> =
  | TranslationKey<Dictionary>
  | (string & {});

type Locales = Record<string, unknown>;

interface BaseSettingSchema<Translations extends Locales> {
  readonly id: string;
  readonly label: TranslationKeyOrString<Translations>;
  readonly info?: TranslationKeyOrString<Translations>;
  readonly visible_if?: string;
}

interface BaseMetaSchema<Translations extends Locales> {
  readonly info?: TranslationKeyOrString<Translations>;
  readonly content: TranslationKeyOrString<Translations>;
  readonly visible_if?: string;
}

export interface HeaderSettingSchema<Translations extends Locales>
  extends BaseMetaSchema<Translations> {
  readonly type: 'header';
}

export interface ParagraphSettingSchema<Translations extends Locales>
  extends BaseMetaSchema<Translations> {
  readonly type: 'paragraph';
}

export interface CheckboxSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'checkbox';
  readonly default?: boolean;
}

export interface NumberSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'number';
  readonly default?: number;
  readonly placeholder?: string;
}

export interface RadioOption {
  readonly value: string;
  readonly label: string;
}

export interface RadioSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'radio';
  readonly options: RadioOption[];
  readonly default?: string;
}

export interface RangeSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'range';
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly unit?: string;
  readonly default?: number;
}

interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly group: string;
}

export interface SelectSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'select';
  readonly options: SelectOption[];
  readonly default?: string;
}

export interface TextSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'text';
  readonly placeholder?: string;
  readonly default?: string;
}

export interface TextAreaSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'textarea';
  readonly placeholder?: string;
  readonly default?: string;
}

export interface ArticleSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'article';
}

export interface BlogSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'blog';
}

export interface CollectionSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'collection';
}

export interface CollectionListSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'collection_list';
  readonly limit?: number;
}

export interface ColorSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'color';
  readonly default?: string;
  readonly alpha?: boolean;
}

export interface ColorBackgroundSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'color_background';
  readonly default?: string;
}

export interface ColorSchemeSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'color_scheme';
  readonly default?: string;
}

export interface ColorSchemaGroupSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'color_scheme_group';
}

export interface FontPickerSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'font_picker';
  readonly default?: string;
}

export interface HtmlSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'html';
  readonly default?: string;
}

export interface ImagePickerSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'image_picker';
}

export interface InlineRichtextSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'inline_richtext';
  readonly default?: string;
}

export interface LiquidSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'liquid';
  readonly default?: string;
}

export interface MetaobjectSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'metaobject';
  readonly metaobject_type?: string;
}

export interface MetaobjectListSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'metaobject';
  readonly metaobject_type?: string;
  readonly limit?: number;
}

export interface PageSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'page';
}

export interface ProductSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'product';
}

export interface ProductListSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'product_list';
  readonly limit?: number;
}

export interface RichTextSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'richtext';
  readonly default?: string;
}

export interface TextAlignmentSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'text_alignment';
  readonly default?: 'left' | 'center' | 'right';
}

export interface UrlSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'url';
  readonly default?: string;
}

export interface VideoSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'video';
}

export interface VideoUrlSettingSchema<Translations extends Locales>
  extends BaseSettingSchema<Translations> {
  readonly type: 'video_url';
  readonly accept: ('vimeo' | 'youtube')[];
  readonly placeholder?: string;
}

export type SettingSchema<Translations extends Locales> =
  | HeaderSettingSchema<Translations>
  | ParagraphSettingSchema<Translations>
  | CheckboxSettingSchema<Translations>
  | NumberSettingSchema<Translations>
  | RadioSettingSchema<Translations>
  | RangeSettingSchema<Translations>
  | SelectSettingSchema<Translations>
  | TextSettingSchema<Translations>
  | TextAreaSettingSchema<Translations>
  | ArticleSettingSchema<Translations>
  | BlogSettingSchema<Translations>
  | CollectionSettingSchema<Translations>
  | CollectionListSettingSchema<Translations>
  | ColorSettingSchema<Translations>
  | ColorBackgroundSettingSchema<Translations>
  | ColorSchemeSettingSchema<Translations>
  | ColorSchemaGroupSettingSchema<Translations>
  | FontPickerSettingSchema<Translations>
  | HtmlSettingSchema<Translations>
  | ImagePickerSettingSchema<Translations>
  | InlineRichtextSettingSchema<Translations>
  | LiquidSettingSchema<Translations>
  | MetaobjectSettingSchema<Translations>
  | MetaobjectListSettingSchema<Translations>
  | PageSettingSchema<Translations>
  | ProductSettingSchema<Translations>
  | ProductListSettingSchema<Translations>
  | RichTextSettingSchema<Translations>
  | TextAlignmentSettingSchema<Translations>
  | UrlSettingSchema<Translations>
  | VideoSettingSchema<Translations>
  | VideoUrlSettingSchema<Translations>;

export interface SchemaPresetBlock {
  readonly type: string;
  readonly name?: string;
  readonly static?: boolean;
  readonly id?: string;
  readonly blocks?: Record<string, SchemaPresetBlock>;
  readonly block_order?: string[];
  readonly settings?: Record<string, unknown>;
}

export interface Schema<Translations extends Locales> {
  readonly disabled_on?: {
    readonly groups?: string[];
    readonly templates?: string[];
  };
  readonly enabled_on?: {
    readonly groups?: string[];
    readonly templates?: string[];
  };
  readonly name: TranslationKeyOrString<Translations>;
  readonly class?: string | null;
  readonly tag?: string | null;
  readonly blocks?: (
    | { type: string }
    | {
        name: TranslationKeyOrString<Translations>;
        type: string;
        limit?: number;
        settings?: SettingSchema<Translations>[];
      }
  )[];
  readonly max_blocks?: number;
  readonly limit?: number;
  readonly settings?: SettingSchema<Translations>[];
  readonly presets?: {
    name: TranslationKeyOrString<Translations>;
    blocks?: Record<string, SchemaPresetBlock>;
    block_order?: string[];
    settings?: Record<string, unknown>;
    category?: TranslationKeyOrString<Translations>;
  }[];
}

/**
 * Pass translations to function for type hints.
 *
 * @example
 * import locales from '../locales/en.default.schema.json';
 *
 * export default defineBlockSchema<typeof locales>({
 *  // Type hints will be shown for all translatable properties
 *  name: 't:',
 * })
 *
 * @todo narrow type
 */
export function defineBlockSchema<Translations extends Locales>(
  schema: Schema<Translations>,
) {
  return schema;
}

/**
 * Pass translations to function for type hints.
 *
 * @example
 * import locales from '../locales/en.default.schema.json';
 *
 * export default defineSectionSchema<typeof locales>({
 *  // Type hints will be shown for all translatable properties
 *  name: 't:',
 * })
 *
 * @todo narrow type
 */
export function defineSectionSchema<Translations extends Locales>(
  schema: Schema<Translations>,
) {
  return schema;
}
