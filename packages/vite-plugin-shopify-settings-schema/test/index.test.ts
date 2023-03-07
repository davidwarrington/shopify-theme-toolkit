import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';
import shopifySettingsSchema, {
  Options as ShopifySettingsSchemaPluginOptions,
} from '../src';

function getFixture(fixture: string) {
  function getPath(relativePath?: string) {
    const base = path.join(__dirname, '__fixtures__', fixture);
    if (!relativePath) {
      return base;
    }

    return path.resolve(base, relativePath);
  }

  const base = getPath();
  let options = {
    input: getPath('config/settings_schema.ts'),
    output: getPath('config/settings_schema.json'),
  };

  return {
    build(pluginOptions: Partial<ShopifySettingsSchemaPluginOptions> = {}) {
      options = {
        ...options,
        ...pluginOptions,
      };

      return build({
        root: base,
        logLevel: 'silent',
        build: {
          emptyOutDir: false,
          outDir: base,
        },
        plugins: [shopifySettingsSchema(options)],
      });
    },

    getPath,

    async getResult<T>() {
      const content = await fs.readFile(options.output, { encoding: 'utf-8' });
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

  it('can output a config from other filetypes', async () => {
    const fixture = getFixture('with-other-filetypes');
    await fixture.build();

    const result = await fixture.getResult();

    expect(result).toMatchSnapshot();
  });

  it('can output a config with src and dist dirs', async () => {
    const fixture = getFixture('with-src-dist-dirs');
    await fixture.build({
      input: fixture.getPath('src/config/settings_schema.ts'),
      output: fixture.getPath('dist/config/settings_schema.json'),
    });

    const result = await fixture.getResult();

    expect(result).toMatchSnapshot();
  });
});
