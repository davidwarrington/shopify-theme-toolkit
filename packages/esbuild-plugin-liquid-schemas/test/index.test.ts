import path from 'node:path';
import { build } from 'esbuild';
import { describe, expect, it } from 'vitest';
import liquidSchemas from '../src';

function getFixture(fixture: string) {
  function getPath(relativePath?: string) {
    const base = path.join(import.meta.dirname, '__fixtures__', fixture);
    if (!relativePath) {
      return base;
    }

    return path.resolve(base, relativePath);
  }

  const options = {
    input: getPath('src/sections/*.liquid'),
    output: getPath('src/sections'),
  };

  const results = new Map<string, string>();

  return {
    async build() {
      try {
        const result = await build({
          entryPoints: [options.input],
          bundle: true,
          write: false,
          outdir: '.shopify',
          format: 'esm',
          plugins: [liquidSchemas({ write: false })],
          logLevel: 'silent',
        });

        results.clear();

        result.outputFiles
          .filter(file => file.path.endsWith('.liquid'))
          .forEach(file => results.set(file.path, file.text));
      } catch (error) {
        if (
          !error ||
          typeof error !== 'object' ||
          !('errors' in error) ||
          !Array.isArray(error.errors)
        ) {
          throw error;
        }

        throw new Error(error.errors[0].text);
      }
    },

    getPath,

    getResult() {
      return results.get(`${options.output}/section.liquid`);
    },
  };
}

describe('esbuild-plugin-liquid-schemas', () => {
  it.skip('can output a schema with a single module', async () => {
    const fixture = getFixture('with-single-module');
    await fixture.build();

    const output = fixture.getResult();

    expect(output).toMatchSnapshot();
  });

  it.skip('can output a schema with modules', async () => {
    const fixture = getFixture('with-modules');
    await fixture.build();

    const output = fixture.getResult();

    expect(output).toMatchSnapshot();
  });

  it.skip('can output a schema with plugin transformations', async () => {
    const fixture = getFixture('with-plugin-transformations');
    await fixture.build();

    const output = fixture.getResult();

    expect(output).toMatchSnapshot();
  });

  it('can output a section with import schema comment', async () => {
    const fixture = getFixture('with-import-schema-comment');

    await fixture.build();

    const output = fixture.getResult();

    expect(output).toMatchSnapshot();
  });

  it('errors if imported schema does not have a default export', async () => {
    const fixture = getFixture('with-error-schema-no-default-export');

    await expect(fixture.build).rejects.toThrowError(
      /No matching export in ".*" for import "default"/,
    );
  });

  it('errors if imported schema cannot be found', async () => {
    const fixture = getFixture('with-error-schema-not-found');

    await expect(fixture.build).rejects.toThrowError(
      /Could not resolve ".*" from ".*"/,
    );
  });
});
