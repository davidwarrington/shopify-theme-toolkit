import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Plugin } from 'esbuild';
import { evalModule } from 'mlly';
import { findSchemaImport } from './parser';
import { transformSection } from './transformer';

const PLACEHOLDER_SCHEMA = '{{{ schema }}}';

export interface LiquidSchemasPluginOptions {
  formatter?: (options: {
    path: string;
    source: string;
  }) => Promise<string> | string;
  write?: boolean;
}

export default function liquidSchemas({
  formatter = options => options.source,
  write = true,
}: LiquidSchemasPluginOptions = {}): Plugin {
  return {
    name: 'liquid-schemas',
    setup({ onEnd, onLoad, resolve }) {
      const assetCache = new Map<string, string>();

      onLoad({ filter: /.*.liquid$/ }, async ({ path }) => {
        const content = await readFile(path, 'utf8');
        const schemaImport = findSchemaImport(content);

        if (!schemaImport.specifier) {
          return {
            contents: `
              export const content = ${JSON.stringify(content)};
              export const path = ${JSON.stringify(path)};
            `,
          };
        }

        const resolvedSchemaImport = await resolve(schemaImport.specifier, {
          kind: 'import-statement',
          resolveDir: dirname(path),
        });

        if (resolvedSchemaImport.path === '') {
          throw new Error(
            `Could not resolve ${JSON.stringify(schemaImport.specifier)} from ${JSON.stringify(path)}`,
          );
        }

        return {
          contents: `
            import schema from ${JSON.stringify(resolvedSchemaImport.path)};

            export const content = ${JSON.stringify(transformSection(content, PLACEHOLDER_SCHEMA))}
              .replace(${JSON.stringify(PLACEHOLDER_SCHEMA)}, JSON.stringify(schema, null, 2));
            export const path = ${JSON.stringify(path)};
          `,
        };
      });

      onEnd(async result => {
        const changedFiles = (result.outputFiles ?? []).filter(
          file => assetCache.get(file.path) !== file.hash,
        );

        const buildResults = await Promise.allSettled(
          changedFiles.map(async file => {
            const evaluatedResult: { content: string; path: string } =
              await evalModule(file.text);

            assetCache.set(file.path, file.hash);

            const formattedContent = await formatter({
              path: evaluatedResult.path,
              source: evaluatedResult.content,
            });

            if (write) {
              writeFile(evaluatedResult.path, formattedContent, 'utf8');
            } else {
              result.outputFiles ??= [];
              result.outputFiles.push({
                contents: new TextEncoder().encode(formattedContent),
                hash: '',
                path: evaluatedResult.path,
                text: formattedContent,
              });
            }
          }),
        );

        const failedBuilds = buildResults.filter(
          result => result.status === 'rejected',
        );
        if (failedBuilds.length > 0) {
          console.error(
            `Failed files:\n\n ${failedBuilds.map(result => result.reason).join('\n')}`,
          );
          return;
        }
      });
    },
  };
}
