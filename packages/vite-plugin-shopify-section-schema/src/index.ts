import { readFile } from 'node:fs/promises';
import { basename, isAbsolute, resolve as resolvePath } from 'node:path';
import fastGlob from 'fast-glob';
import { evalModule } from 'mlly';
import { type Plugin, type ResolvedConfig } from 'vite';
import { writeFile } from './utils/write-file';
import { findSchemaImport } from './parser';
import { transformSection } from './transformer';

type Tail<Tuple extends unknown[]> = Tuple extends [unknown, ...infer Rest]
  ? Rest
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
  const entrypoint = '\0virtual:shopify-section-schema';

  const schemaToSectionMap = new Map<string, Set<string>>();

  let config: ResolvedConfig;

  function getInputIds() {
    const glob = isAbsolute(input) ? input : resolvePath(config.root, input);

    return fastGlob(glob);
  }

  return {
    name: 'vite-plugin-shopify-section-schema',

    config() {
      return {
        build: {
          rollupOptions: {
            input: [entrypoint],
          },
        },
      };
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    resolveId(source) {
      if (source !== entrypoint) {
        return null;
      }

      return source;
    },

    async load(id) {
      if (id !== entrypoint) {
        return null;
      }

      const sectionIds = await getInputIds();
      const schemaIds = await Promise.all(
        sectionIds.map(async sectionId => {
          const code = await readFile(sectionId, { encoding: 'utf8' });
          const schemaImport = findSchemaImport(code);

          if (!schemaImport.specifier) {
            return null;
          }

          const resolvedSchemaImport = await this.resolve(
            schemaImport.specifier,
            sectionId,
          );

          if (!resolvedSchemaImport) {
            this.error(
              `Could not resolve import "${schemaImport.specifier}" from "${sectionId}".`,
            );
          }

          const existingSectionSet = schemaToSectionMap.get(
            resolvedSchemaImport.id,
          );
          if (existingSectionSet) {
            existingSectionSet.add(sectionId);
          } else {
            schemaToSectionMap.set(
              resolvedSchemaImport.id,
              new Set([sectionId]),
            );
          }

          return resolvedSchemaImport.id;
        }),
      );

      const imports = schemaIds
        .map(id => `import(${JSON.stringify(id)});`)
        .join('\n');

      return imports;
    },

    async generateBundle(_, bundle) {
      function getOutputChunkByEntryId(id: string) {
        return Object.entries(bundle).find(
          ([, value]) =>
            'facadeModuleId' in value && value.facadeModuleId === id,
        );
      }

      const virtualModuleEntry = getOutputChunkByEntryId(entrypoint);

      if (!virtualModuleEntry) {
        this.error(`Entrypoint could not be found. "${entrypoint}"`);
      }

      await Promise.all(
        [...schemaToSectionMap.entries()].map(
          async ([schemaId, sectionIds]) => {
            const outputEntry = getOutputChunkByEntryId(schemaId);

            if (!outputEntry) {
              this.error(`Entry not found in output bundle. "${schemaId}"`);
            }

            const [, chunk] = outputEntry;

            if (!('code' in chunk)) {
              this.error(`Entry contains no code. "${schemaId}"`);
            }

            const evaluatedSchema: EvaluatedModule = await evalModule(
              chunk.code,
            );

            if (!('default' in evaluatedSchema)) {
              this.error(
                `Schema module must have a default export. "${schemaId}"`,
              );
            }

            return Promise.all(
              [...sectionIds].map(async sectionId => {
                const code = await readFile(sectionId, { encoding: 'utf8' });
                const liquid = transformSection(
                  code,
                  JSON.stringify(
                    evaluatedSchema.default,
                    ...options.jsonStringifyOptions,
                  ),
                );

                const outputPath = resolvePath(output, basename(sectionId));
                return writeFile(outputPath, liquid, { encoding: 'utf8' });
              }),
            );
          },
        ),
      );

      const entriesToDelete = [...schemaToSectionMap.keys()]
        .map(getOutputChunkByEntryId)
        .filter(entry => entry !== undefined)
        .map(entry => entry[0]);

      entriesToDelete.forEach(name => {
        delete bundle[name];
      });

      delete bundle[virtualModuleEntry[0]];
    },
  };
}
