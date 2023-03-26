import { readFile } from 'node:fs/promises';
import { basename, isAbsolute, resolve as resolvePath } from 'node:path';
import fastGlob from 'fast-glob';
import { evalModule } from 'mlly';
import { type Plugin, type ResolvedConfig } from 'vite';
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
  const entrypoint = '\0vite-plugin-shopify-section-schema-virtual-entrypoint';

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
          const code = await readFile(sectionId, { encoding: 'utf-8' });
          const schemaImport = findSchemaImport(code);

          if (!schemaImport.specifier) {
            return null;
          }

          const resolvedSchemaImport = await this.resolve(
            schemaImport.specifier,
            sectionId
          );

          if (!resolvedSchemaImport) {
            // throw
            return null;
          }

          const existingSectionSet = schemaToSectionMap.get(
            resolvedSchemaImport.id
          );
          if (existingSectionSet) {
            existingSectionSet.add(sectionId);
          } else {
            schemaToSectionMap.set(
              resolvedSchemaImport.id,
              new Set([sectionId])
            );
          }

          return resolvedSchemaImport.id;
        })
      );

      const imports = schemaIds
        .map(id => `import(${JSON.stringify(id)});`)
        .join('\n');

      return imports;
    },

    async generateBundle(_, bundle) {
      function getOutputChunkByEntryId(id: string) {
        return Object.entries(bundle).find(
          ([_, value]) =>
            'facadeModuleId' in value && value.facadeModuleId === id
        );
      }

      const virtualModuleEntry = getOutputChunkByEntryId(entrypoint);

      if (!virtualModuleEntry) {
        // throw
        return;
      }

      await Promise.all(
        Array.from(schemaToSectionMap.entries()).map(
          async ([schemaId, sectionIds]) => {
            const outputEntry = getOutputChunkByEntryId(schemaId);

            if (!outputEntry) {
              // throw
              return;
            }

            const [_, chunk] = outputEntry;

            if (!('code' in chunk)) {
              // throw
              return;
            }

            const evaluatedSchema: EvaluatedModule = await evalModule(
              chunk.code
            );

            if (!('default' in evaluatedSchema)) {
              // throw
              return;
            }

            return Promise.all(
              Array.from(sectionIds).map(async sectionId => {
                const code = await readFile(sectionId, { encoding: 'utf-8' });
                const liquid = transformSection(
                  code,
                  JSON.stringify(
                    evaluatedSchema.default,
                    ...options.jsonStringifyOptions
                  )
                );

                const outputPath = resolvePath(output, basename(sectionId));
                return writeFile(outputPath, liquid, { encoding: 'utf-8' });
              })
            );
          }
        )
      );

      const entriesToDelete = Array.from(schemaToSectionMap.keys())
        .map(getOutputChunkByEntryId)
        .filter((entry): entry is Exclude<typeof entry, undefined> =>
          Boolean(entry)
        )
        .map(entry => entry[0]);

      entriesToDelete.forEach(name => {
        delete bundle[name];
      });

      delete bundle[virtualModuleEntry[0]];
    },
  };
}
