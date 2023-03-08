import { describe, expect, it } from 'vitest';
import { transformSection } from './transformer';

describe('transform section', () => {
  it('does not transform a section without a schema tag', () => {
    const input = `<h1>no schema tag</h1>`;
    const expected = `<h1>no schema tag</h1>`;

    expect(transformSection(input)).toBe(expected);
  });

  it('does not transform a section with a static schema', () => {
    const input = `
    <h1>static</h1>

    {% schema %}
    {
      "name": "static schema"
    }
    {% endschema %}
    `;
    const expected = `
    <h1>static</h1>

    {% schema %}
    {
      "name": "static schema"
    }
    {% endschema %}
    `;

    expect(transformSection(input)).toBe(expected);
  });

  it('transforms a section with a dynamic schema', () => {
    const input = [
      `
<h1>static</h1>

{% schema './schema' %}
      `.trim(),
      JSON.stringify({ name: 'dynamic schema' }, null, 2),
    ] as const;
    const expected = `
<h1>static</h1>

{% schema %}
{
  "name": "dynamic schema"
}
{% endschema %}
    `.trim();

    expect(transformSection(...input)).toBe(expected);
  });
});
