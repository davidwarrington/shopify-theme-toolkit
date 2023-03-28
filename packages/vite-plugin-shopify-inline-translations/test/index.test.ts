import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';

import shopifyInlineTranslations from '../src';

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
    input: getPath('src/locales/en.default.json'),
    output: getPath('dist/snippets/js.translations.liquid'),
  };

  return {
    build() {
      return build({
        root: base,
        logLevel: 'silent',
        build: {
          outDir: getPath('dist'),
          rollupOptions: {
            input: [getPath('src/scripts/index.ts')],
          },
        },
        plugins: [shopifyInlineTranslations(options)],
      });
    },

    getPath,

    async getResult<T>(buildOutput: Awaited<ReturnType<typeof build>>) {
      if (Array.isArray(buildOutput) || !('output' in buildOutput)) {
        throw new Error('err nerr');
      }

      const jsFilename = getPath(`dist/${buildOutput.output[0].fileName}`);

      const js = await fs.readFile(jsFilename, { encoding: 'utf-8' });
      const liquid = await fs.readFile(options.output, { encoding: 'utf-8' });

      return {
        js,
        liquid,
      };
    },
  };
}

describe('vite-plugin-shopify-settings-schema', () => {
  it('can output a config with a single module', async () => {
    const fixture = getFixture('with-default-import');
    const output = await fixture.build();

    const result = await fixture.getResult(output);

    expect(result.js).toMatchSnapshot('js');
    expect(result.liquid).toMatchSnapshot('liquid');
  });
});
