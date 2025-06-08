interface BaseSettingSchema {
  readonly id: string;
  readonly label: string;
  readonly info?: string;
  readonly visible_if?: string;
}

interface BaseMetaSchema {
  readonly info?: string;
  readonly content: string;
  readonly visible_if?: string;
}

export interface HeaderSettingSchema extends BaseMetaSchema {
  readonly type: 'header';
}

export interface ParagraphSettingSchema extends BaseMetaSchema {
  readonly type: 'paragraph';
}

export interface CheckboxSettingSchema extends BaseSettingSchema {
  readonly type: 'checkbox';
  readonly default?: boolean;
}

export interface NumberSettingSchema extends BaseSettingSchema {
  readonly type: 'number';
  readonly default?: number;
  readonly placeholder?: string;
}

export interface RadioOption {
  readonly value: string;
  readonly label: string;
}

export interface RadioSettingSchema extends BaseSettingSchema {
  readonly type: 'radio';
  readonly options: RadioOption[];
  readonly default?: string;
}

export interface RangeSettingSchema extends BaseSettingSchema {
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

export interface SelectSettingSchema extends BaseSettingSchema {
  readonly type: 'select';
  readonly options: SelectOption[];
  readonly default?: string;
}

export interface TextSettingSchema extends BaseSettingSchema {
  readonly type: 'text';
  readonly placeholder?: string;
  readonly default?: string;
}

export interface TextAreaSettingSchema extends BaseSettingSchema {
  readonly type: 'textarea';
  readonly placeholder?: string;
  readonly default?: string;
}

export interface ArticleSettingSchema extends BaseSettingSchema {
  readonly type: 'article';
}

export interface BlogSettingSchema extends BaseSettingSchema {
  readonly type: 'blog';
}

export interface CollectionSettingSchema extends BaseSettingSchema {
  readonly type: 'collection';
}

export interface CollectionListSettingSchema extends BaseSettingSchema {
  readonly type: 'collection_list';
  readonly limit?: number;
}

export interface ColorSettingSchema extends BaseSettingSchema {
  readonly type: 'color';
  readonly default?: string;
  readonly alpha?: boolean;
}

export interface ColorBackgroundSettingSchema extends BaseSettingSchema {
  readonly type: 'color_background';
  readonly default?: string;
}

export interface ColorSchemeSettingSchema extends BaseSettingSchema {
  readonly type: 'color_scheme';
  readonly default?: string;
}

export interface ColorSchemaGroupSettingSchema extends BaseSettingSchema {
  readonly type: 'color_scheme_group';
}

export interface FontPickerSettingSchema extends BaseSettingSchema {
  readonly type: 'font_picker';
  readonly default?: string;
}

export interface HtmlSettingSchema extends BaseSettingSchema {
  readonly type: 'html';
  readonly default?: string;
}

export interface ImagePickerSettingSchema extends BaseSettingSchema {
  readonly type: 'image_picker';
}

export interface InlineRichtextSettingSchema extends BaseSettingSchema {
  readonly type: 'inline_richtext';
  readonly default?: string;
}

export interface LiquidSettingSchema extends BaseSettingSchema {
  readonly type: 'liquid';
  readonly default?: string;
}

export interface MetaobjectSettingSchema extends BaseSettingSchema {
  readonly type: 'metaobject';
  readonly metaobject_type?: string;
}

export interface MetaobjectListSettingSchema extends BaseSettingSchema {
  readonly type: 'metaobject';
  readonly metaobject_type?: string;
  readonly limit?: number;
}

export interface PageSettingSchema extends BaseSettingSchema {
  readonly type: 'page';
}

export interface ProductSettingSchema extends BaseSettingSchema {
  readonly type: 'product';
}

export interface ProductListSettingSchema extends BaseSettingSchema {
  readonly type: 'product_list';
  readonly limit?: number;
}

export interface RichTextSettingSchema extends BaseSettingSchema {
  readonly type: 'richtext';
  readonly default?: string;
}

export interface TextAlignmentSettingSchema extends BaseSettingSchema {
  readonly type: 'text_alignment';
  readonly default?: 'left' | 'center' | 'right';
}

export interface UrlSettingSchema extends BaseSettingSchema {
  readonly type: 'url';
  readonly default?: string;
}

export interface VideoSettingSchema extends BaseSettingSchema {
  readonly type: 'video';
}

export interface VideoUrlSettingSchema extends BaseSettingSchema {
  readonly type: 'video_url';
  readonly accept: ('vimeo' | 'youtube')[];
  readonly placeholder?: string;
}

export type SettingSchema =
  | HeaderSettingSchema
  | ParagraphSettingSchema
  | CheckboxSettingSchema
  | NumberSettingSchema
  | RadioSettingSchema
  | RangeSettingSchema
  | SelectSettingSchema
  | TextSettingSchema
  | TextAreaSettingSchema
  | ArticleSettingSchema
  | BlogSettingSchema
  | CollectionSettingSchema
  | CollectionListSettingSchema
  | ColorSettingSchema
  | ColorBackgroundSettingSchema
  | ColorSchemeSettingSchema
  | ColorSchemaGroupSettingSchema
  | FontPickerSettingSchema
  | HtmlSettingSchema
  | ImagePickerSettingSchema
  | InlineRichtextSettingSchema
  | LiquidSettingSchema
  | MetaobjectSettingSchema
  | MetaobjectListSettingSchema
  | PageSettingSchema
  | ProductSettingSchema
  | ProductListSettingSchema
  | RichTextSettingSchema
  | TextAlignmentSettingSchema
  | UrlSettingSchema
  | VideoSettingSchema
  | VideoUrlSettingSchema;

export interface SchemaPresetBlock {
  readonly type: string;
  readonly name?: string;
  readonly static?: boolean;
  readonly id?: string;
  readonly blocks?: Record<string, SchemaPresetBlock>;
  readonly block_order?: string[];
  readonly settings?: Record<string, unknown>;
}

export interface Schema {
  readonly disabled_on?: {
    readonly groups?: string[];
    readonly templates?: string[];
  };
  readonly enabled_on?: {
    readonly groups?: string[];
    readonly templates?: string[];
  };
  readonly name: string;
  readonly class?: string | null;
  readonly tag?: string | null;
  readonly blocks?: (
    | { type: string }
    | {
        name: string;
        type: string;
        limit?: number;
        settings?: SettingSchema[];
      }
  )[];
  readonly max_blocks?: number;
  readonly limit?: number;
  readonly settings?: SettingSchema[];
  readonly presets?: {
    name: string;
    blocks?: Record<string, SchemaPresetBlock>;
    block_order?: string[];
    settings?: Record<string, unknown>;
    category?: string;
  }[];
}

/** @todo narrow type */
export function defineBlockSchema(schema: Schema) {
  return schema;
}

/** @todo narrow type */
export function defineSectionSchema(schema: Schema) {
  return schema;
}
