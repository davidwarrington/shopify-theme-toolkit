import { describe, expect, it } from 'vitest';
import { findSchemaImport } from './parser';

describe('find schema import', () => {
  describe('source', () => {
    it(`doesn't match schema with no import`, () => {
      const input = `{% schema %}{% endschema %}`;
      const expected = null;

      expect(findSchemaImport(input).code).toStrictEqual(expected);
    });

    it('matches imports wrapped in single quotes', () => {
      const input = `{% schema 'schema' %}`;
      const expected = `{% schema 'schema' %}`;

      expect(findSchemaImport(input).code).toBe(expected);
    });

    it('matches imports wrapped in double quotes quotes', () => {
      const input = `{% schema "schema" %}`;
      const expected = `{% schema "schema" %}`;

      expect(findSchemaImport(input).code).toBe(expected);
    });

    it('matches imports with file extensions', () => {
      const input = `{% schema 'schema.ts' %}`;
      const expected = `{% schema 'schema.ts' %}`;

      expect(findSchemaImport(input).code).toBe(expected);
    });

    it('matches imports with paths', () => {
      const input = `{% schema '../schemas/schema' %}`;
      const expected = `{% schema '../schemas/schema' %}`;

      expect(findSchemaImport(input).code).toBe(expected);
    });

    it('matches imports with import aliases', () => {
      const input = `{% schema '@schemas/schema' %}`;
      const expected = `{% schema '@schemas/schema' %}`;

      expect(findSchemaImport(input).code).toBe(expected);
    });

    it('matches schema with end tag', () => {
      const input = `{% schema 'schema' %}{% endschema %}`;
      const expected = `{% schema 'schema' %}{% endschema %}`;

      expect(findSchemaImport(input).code).toBe(expected);
    });

    it('matches schema with content', () => {
      const input = `{% schema 'schema' %}{ "name": "section" }{% endschema %}`;
      const expected = `{% schema 'schema' %}{ "name": "section" }{% endschema %}`;

      expect(findSchemaImport(input).code).toBe(expected);
    });

    it('matches multiline schema with content', () => {
      const input = `
      {% schema 'schema' %}
      { "name": "section" }
      {% endschema %}
      `;
      const expected = `{% schema 'schema' %}
      { "name": "section" }
      {% endschema %}`;

      expect(findSchemaImport(input).code).toBe(expected);
    });

    it('matches multiline schema tag', () => {
      const input = `
        {%
          schema 'schema'
        %}
        `;
      const expected = `{%
          schema 'schema'
        %}`;

      expect(findSchemaImport(input).code).toBe(expected);
    });

    it('matches schema tag with whitespace control', () => {
      const input = `{%- schema 'schema' -%}`;
      const expected = `{%- schema 'schema' -%}`;

      expect(findSchemaImport(input).code).toBe(expected);
    });
  });

  describe('import specifier', () => {
    it('extracts an import specifier in single quotes', () => {
      const input = `{% schema 'schema' %}`;
      const expected = 'schema';

      expect(findSchemaImport(input).specifier).toBe(expected);
    });

    it('extracts an import specifier in double quotes', () => {
      const input = `{% schema "schema" %}`;
      const expected = 'schema';

      expect(findSchemaImport(input).specifier).toBe(expected);
    });
  });

  describe('type', () => {
    it('can detect replaceable schema imports', () => {
      const input = `{% schema 'schema' %}{% schema %}`;
      const expected = 'replaceable';

      expect(findSchemaImport(input).type).toBe(expected);
    });

    it('can detect inline schema imports', () => {
      const input = `{%- # import schema from 'schema' -%}`;
      const expected = 'inline';

      expect(findSchemaImport(input).type).toBe(expected);
    });
  });
});
