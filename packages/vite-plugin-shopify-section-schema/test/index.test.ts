import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from '@rollup/plugin-yaml';
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
  const options = {
    input: 'src/sections/*.liquid',
    output: getPath('dist/sections'),
  };

  return {
    build() {
      return build({
        root: getPath(),
        logLevel: 'silent',
        build: {
          outDir: getPath('dist'),
          rollupOptions: {
            input: [getPath('src/scripts/index.ts')],
          },
        },
        plugins: [shopifySectionSchema(options), yaml()],
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
  it('can output a schema with a single module', async () => {
    const fixture = getFixture('with-single-module');
    await fixture.build();

    const output = await fixture.getResult();

    expect(output).toMatchSnapshot();
  });

  it('can output a schema with modules', async () => {
    const fixture = getFixture('with-modules');
    await fixture.build();

    const output = await fixture.getResult();

    expect(output).toMatchSnapshot();
  });

  it('can output a schema with plugin transformations', async () => {
    const fixture = getFixture('with-plugin-transformations');
    await fixture.build();

    const output = await fixture.getResult();

    expect(output).toMatchSnapshot();
  });

  it('can output a section with import schema comment', async () => {
    const fixture = getFixture('with-import-schema-comment');
    await fixture.build();

    const output = await fixture.getResult();

    expect(output).toMatchSnapshot();
  });
});
