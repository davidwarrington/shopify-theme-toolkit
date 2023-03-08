import { readFile } from 'node:fs/promises';
import { basename, isAbsolute, resolve as resolvePath } from 'node:path';
import fastGlob from 'fast-glob';
import { evalModule, normalizeid } from 'mlly';
import { type Plugin, type ResolvedConfig, transformWithEsbuild } from 'vite';
import { writeFile } from './utils/write-file';
import { findSchemaImport } from './parser';
import { transformSection } from './transformer';

type Tail<T extends any[]> = ((...t: T) => void) extends (
  h: any,
  ...r: infer R
) => void
  ? R
  : never;

export interface Options {
  input: string;
  output: string;
  options?: {
    jsonStringifyOptions: Tail<Parameters<(typeof JSON)['stringify']>>;
  };
}

interface EvaluatedModule {
  default: unknown;
}

export default function viteShopifySectionSchema({
  input,
  output,
  options = {
    jsonStringifyOptions: [null, 2],
  },
}: Options): Plugin {
  let config: ResolvedConfig;

  function getInputIds() {
    const glob = isAbsolute(input) ? input : resolvePath(config.root, input);

    return fastGlob(glob);
  }

  return {
    name: 'vite-plugin-shopify-section-schema',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async generateBundle() {
      const ids = await getInputIds();

      const writeFiles = ids.map(async id => {
        const code = await readFile(id, { encoding: 'utf-8' });
        const schemaImport = findSchemaImport(code);

        if (!schemaImport.specifier) {
          return;
        }

        const resolvedSchemaImport = await this.resolve(
          schemaImport.specifier,
          id
        );

        if (!resolvedSchemaImport) {
          return;
        }

        const baseSchemaModule = await this.load({
          id: resolvedSchemaImport.id,
        });

        if (!baseSchemaModule.code) {
          return;
        }

        const transformedSchema = await transformWithEsbuild(
          baseSchemaModule.code,
          resolvedSchemaImport.id
        );
        const evaluatedModule: EvaluatedModule = await evalModule(
          transformedSchema.code,
          { url: normalizeid(resolvedSchemaImport.id) }
        );

        if (!('default' in evaluatedModule)) {
          return;
        }

        const liquid = transformSection(
          code,
          JSON.stringify(
            evaluatedModule.default,
            ...options.jsonStringifyOptions
          )
        );

        const outputPath = resolvePath(output, basename(id));
        return writeFile(outputPath, liquid, { encoding: 'utf-8' });
      });

      await Promise.all(writeFiles);
    },
  };
}
