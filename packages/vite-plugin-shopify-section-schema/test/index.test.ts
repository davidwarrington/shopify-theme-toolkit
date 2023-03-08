import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';

import shopifySectionSchema from '../src';

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
    input: 'src/sections/*.liquid',
    output: getPath('dist/sections'),
  };

  return {
    build(pluginOptions = {}) {
      options = {
        ...options,
        ...pluginOptions,
      };

      return build({
        root: getPath(),
        logLevel: 'silent',
        build: {
          outDir: getPath('dist'),
          rollupOptions: {
            input: [getPath('src/scripts/index.ts')],
          },
        },
        plugins: [shopifySectionSchema(options)],
      });
    },

    getPath,

    async getResult() {
      const output = path.resolve(options.output, 'section.liquid');
      return fs.readFile(output, { encoding: 'utf-8' });
    },
  };
}

describe('vite-plugin-shopify-section-schema', () => {
  it('injects schema into liquid file', async () => {
    const fixture = getFixture('basic');
    await fixture.build();

    const output = await fixture.getResult();

    expect(output).toMatchSnapshot();
  });
});
