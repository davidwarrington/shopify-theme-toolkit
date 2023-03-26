import { describe, expect, it } from 'vitest';
import { findSchemaImport } from './parser';

describe('find schema import', () => {
  describe('type', () => {
    it('can detect replaceable schema imports', () => {
      const input = `{% schema 'schema' %}{% schema %}`;
      const expected = 'replaceable';

      expect(findSchemaImport(input).type).toBe(expected);
    });

    it('can detect schema import comments', () => {
      const input = `{%- # import schema from 'schema' -%}`;
      const expected = 'import-comment';

      expect(findSchemaImport(input).type).toBe(expected);
    });
  });

  describe('replaceable schema tag - import specifier', () => {
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

    it('extracts an import specifier with relative path', () => {
      const input = `{% schema "../schemas/schema" %}`;
      const expected = '../schemas/schema';

      expect(findSchemaImport(input).specifier).toBe(expected);
    });

    it('extracts an import specifier with aliased path', () => {
      const input = `{% schema "@schemas/schema" %}`;
      const expected = '@schemas/schema';

      expect(findSchemaImport(input).specifier).toBe(expected);
    });

    it('extracts an import specifier with file extension', () => {
      const input = `{% schema "schema.ts" %}`;
      const expected = 'schema.ts';

      expect(findSchemaImport(input).specifier).toBe(expected);
    });
  });

  describe('schema import comment - import specifier', () => {
    it('extracts an import specifier in single quotes', () => {
      const input = `{% # import schema from 'schema' %}`;
      const expected = 'schema';

      expect(findSchemaImport(input).specifier).toBe(expected);
    });

    it('extracts an import specifier in double quotes', () => {
      const input = `{% # import schema from "schema" %}`;
      const expected = 'schema';

      expect(findSchemaImport(input).specifier).toBe(expected);
    });

    it('extracts an import specifier with relative path', () => {
      const input = `{% # import schema from "../schemas/schema" %}`;
      const expected = '../schemas/schema';

      expect(findSchemaImport(input).specifier).toBe(expected);
    });

    it('extracts an import specifier with aliased path', () => {
      const input = `{% # import schema from "@schemas/schema" %}`;
      const expected = '@schemas/schema';

      expect(findSchemaImport(input).specifier).toBe(expected);
    });

    it('extracts an import specifier with file extension', () => {
      const input = `{% # import schema from "schema.ts" %}`;
      const expected = 'schema.ts';

      expect(findSchemaImport(input).specifier).toBe(expected);
    });
  });
});
