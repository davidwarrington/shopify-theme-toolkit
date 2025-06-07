import { describe, expect, it } from 'vitest';
import {
  REPLACEABLE_SCHEMA_REGEX,
  SCHEMA_IMPORT_COMMENT_REGEX,
  SCHEMA_REGEX,
} from './schema-patterns';

describe('schema regex', () => {
  it.each([
    `{% schema %}{% endschema %}`,
    `{%- schema -%}{%- endschema -%}`,
    `{%- schema %}{% endschema %}`,
    `{% schema -%}{% endschema %}`,
    `{% schema %}{%- endschema %}`,
    `{% schema %}{% endschema -%}`,
    `{% schema %}\n{\n  "name": "tags-with-content"\n}\n{% endschema %}`,
    `{% schema %}{% endschema %}`,
    `{%schema%}{%endschema%}`,
  ])('matches %s', input => {
    expect(SCHEMA_REGEX.test(input)).toBeTruthy();
  });

  it.each([`{% schema 'schema' %}{% endschema %}`])(
    `doesn't match %s`,
    input => {
      expect(SCHEMA_REGEX.test(input)).toBeFalsy();
    },
  );
});

describe('replaceable schema regex', () => {
  it.each([
    `{% schema 'schema' %}{% endschema %}`,
    `{%- schema 'schema' -%}{%- endschema -%}`,
    `{%- schema 'schema' %}{% endschema %}`,
    `{% schema 'schema' -%}{% endschema %}`,
    `{% schema 'schema' %}{%- endschema %}`,
    `{% schema 'schema' %}{% endschema -%}`,
    `{% schema 'schema' %}\n{\n  "name": "tags-with-content"\n}\n{% endschema %}`,
    `{% schema "schema" %}{% endschema %}`,
    `{%schema 'schema'%}{%endschema%}`,
    `{% schema 'schema' %}`,
    `{%\n  schema 'schema'\n%}`,
    `{% schema '../schemas/schema' %}`,
    `{% schema '@schemas/schema' %}`,
    `{% schema 'schema.ts' %}`,
  ])('matches %s', input => {
    expect(REPLACEABLE_SCHEMA_REGEX.test(input)).toBeTruthy();
  });

  it.each([`{% schema %}{% endschema %}`])(`doesn't match %s`, input => {
    expect(REPLACEABLE_SCHEMA_REGEX.test(input)).toBeFalsy();
  });
});

describe('schema import comment regex', () => {
  it.each([
    `{% # import schema from 'schema' %}`,
    `{%- # import schema from 'schema' -%}`,
    `{%- # import schema from 'schema' %}`,
    `{% # import schema from 'schema' -%}`,
    `{% # import schema from 'schema' %}`,
    `{% # import schema from 'schema' %}`,
    `{%\n  # import schema from 'schema'\n%}`,
    `{% # import schema from "schema" %}`,
    `{%# import schema from 'schema'%}`,
  ])('matches %s', input => {
    expect(SCHEMA_IMPORT_COMMENT_REGEX.test(input)).toBeTruthy();
  });
});
