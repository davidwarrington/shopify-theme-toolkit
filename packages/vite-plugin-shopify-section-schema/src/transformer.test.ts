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

  it('transforms a section with a replaceable schema', () => {
    const input = [
      `
<h1>static</h1>

{% schema './schema' %}
      `.trim(),
      JSON.stringify({ name: 'replaceable schema' }, null, 2),
    ] as const;
    const expected = `
<h1>static</h1>

{% schema %}
{
  "name": "replaceable schema"
}
{% endschema %}
    `.trim();

    expect(transformSection(...input)).toBe(expected);
  });

  it('transforms a section with an import schema comment', () => {
    const input = [
      `
<h1>import schema comment</h1>

{% # import schema from 'schema' %}
      `.trim(),
      JSON.stringify({ name: 'import schema comment' }, null, 2),
    ] as const;
    const expected = `
<h1>import schema comment</h1>

{% # import schema from 'schema' %}
{% schema %}
{
  "name": "import schema comment"
}
{% endschema %}
    `.trim();

    expect(transformSection(...input)).toBe(expected);
  });

  it('transforms a section with an import schema comment and existing schema', () => {
    const input = [
      `
<h1>import schema comment</h1>

{% # import schema from 'schema' %}
{% schema %}
{
  "name": "previously generated schema"
}
{% endschema %}
      `.trim(),
      JSON.stringify({ name: 'import schema comment' }, null, 2),
    ] as const;
    const expected = `
<h1>import schema comment</h1>

{% # import schema from 'schema' %}
{% schema %}
{
  "name": "import schema comment"
}
{% endschema %}
    `.trim();

    expect(transformSection(...input)).toBe(expected);
  });
});
