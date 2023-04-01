interface BaseThemeMetadata {
  name: 'theme_info';
  theme_name: string;
  theme_author: string;
  theme_version: string;
  theme_documentation_url: string;
}

interface ThemeMetadataWithThemeSupportEmail extends BaseThemeMetadata {
  theme_support_email: string;
  theme_support_url?: never;
}

interface ThemeMetadataWithThemeSupportURL extends BaseThemeMetadata {
  theme_support_email?: never;
  theme_support_url: string;
}

export type ThemeMetadata =
  | ThemeMetadataWithThemeSupportEmail
  | ThemeMetadataWithThemeSupportURL;
