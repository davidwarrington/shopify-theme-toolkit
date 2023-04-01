import { describe, expect, it } from 'vitest';
import { defineSectionSchema, SectionSchema } from './define-section-schema';

describe('define-section-schema', () => {
  it('supports valid section schemas', () => {
    const input: SectionSchema = { name: 'Section' };
    const output: SectionSchema = { name: 'Section' };

    expect(defineSectionSchema(input)).toStrictEqual(output);
  });
});
