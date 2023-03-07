import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';
import shopifySettingsSchema from '../src';

function getFixture(fixture: string) {
  const basePath = path.join(__dirname, '__fixtures__', fixture);
  const input = path.join(basePath, 'config', 'settings_schema.ts');
  const output = path.join(basePath, 'config', 'settings_schema.json');

  return {
    build() {
      return build({
        root: basePath,
        logLevel: 'silent',
        build: {
          emptyOutDir: false,
          outDir: basePath,
          rollupOptions: {
            input: [input],
          },
        },
        plugins: [
          shopifySettingsSchema({
            input,
            output,
          }),
        ],
      });
    },
    async getResult<T>() {
      const content = await fs.readFile(output, { encoding: 'utf-8' });
      return JSON.parse(content) as T;
    },
  };
}

describe('vite-plugin-shopify-settings-schema', () => {
  it('can output a config with a single module', async () => {
    const fixture = getFixture('with-single-module');
    await fixture.build();

    const result = await fixture.getResult();

    expect(result).toMatchSnapshot();
  });

  it('can output a config with modules', async () => {
    const fixture = getFixture('with-modules');
    await fixture.build();

    const result = await fixture.getResult();

    expect(result).toMatchSnapshot();
  });
});
