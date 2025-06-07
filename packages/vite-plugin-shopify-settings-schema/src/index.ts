import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { evalModule, normalizeid } from 'mlly';
import type { OutputAsset, OutputChunk } from 'rollup';
import type { Plugin } from 'vite';

type ResolvedSettingsSchema = {
  default: unknown;
};

export interface Options {
  input: string;
  output: string;
}

export default function viteShopifySettingsSchema(options: Options): Plugin {
  const entrypoint = '\0virtual:shopify-settings-schema';

  return {
    name: 'vite-plugin-shopify-settings-schema',

    config() {
      return {
        build: {
          rollupOptions: {
            input: [entrypoint],
          },
        },
      };
    },

    resolveId(source) {
      if (source !== entrypoint) {
        return null;
      }

      return source;
    },

    load(id) {
      if (id !== entrypoint) {
        return;
      }

      return `import(${JSON.stringify(options.input)})`;
    },

    async generateBundle(_, bundle) {
      function getChunkByModuleId(id: string) {
        return Object.values(bundle)
          .filter(isOutputChunk)
          .find(asset => asset.facadeModuleId === id);
      }

      const virtualModule = getChunkByModuleId(entrypoint);

      if (!virtualModule) {
        this.error(`Entrypoint could not be found. "${entrypoint}"`);
      }

      const id = options.input;
      const settingsSchema = getChunkByModuleId(id);

      if (!settingsSchema) {
        this.error(`No settings schema found at "${id}"`);
      }

      const evaluatedModule: ResolvedSettingsSchema = await evalModule(
        settingsSchema.code,
        {
          url: normalizeid(id),
        },
      );

      if (!('default' in evaluatedModule)) {
        this.error('Settings schema input must have a default export');
      }

      await outputFile(
        options.output,
        JSON.stringify(evaluatedModule.default, null, 2),
        { encoding: 'utf8' },
      );

      delete bundle[virtualModule.fileName];
      delete bundle[settingsSchema.fileName];
    },
  };
}

function isOutputChunk(
  assetOrChunk: OutputAsset | OutputChunk,
): assetOrChunk is OutputChunk {
  return assetOrChunk.type === 'chunk';
}

async function outputFile(...args: Parameters<typeof writeFile>) {
  const [outputPath] = args;
  const outputDirectory = dirname(String(outputPath));

  await mkdir(outputDirectory, { recursive: true });

  return writeFile(...args);
}
