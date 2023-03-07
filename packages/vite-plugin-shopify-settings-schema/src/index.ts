import fs from 'node:fs/promises';
import path from 'node:path';
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
  return {
    name: 'vite-plugin-shopify-settings-schema',

    config(existingConfig) {
      return {
        build: {
          rollupOptions: {
            input: [options.input],
            preserveEntrySignatures:
              existingConfig.build?.rollupOptions?.preserveEntrySignatures ??
              'exports-only',
          },
        },
      };
    },

    async generateBundle(_, bundle) {
      function getChunkByModuleId(id: string) {
        return Object.values(bundle)
          .filter(isOutputChunk)
          .find(asset => asset.facadeModuleId === id);
      }

      const id = options.input;
      const settingsSchema = getChunkByModuleId(id);

      if (typeof settingsSchema === 'undefined') {
        return this.error(`No settings schema found at "${id}"`);
      }

      const evaluatedModule: ResolvedSettingsSchema = await evalModule(
        settingsSchema.code,
        {
          url: normalizeid(id),
        }
      );

      if (!('default' in evaluatedModule)) {
        this.error('Settings schema input must have a default export');
      }

      await fs.writeFile(
        options.output,
        JSON.stringify(evaluatedModule.default, null, 2),
        { encoding: 'utf-8' }
      );

      delete bundle[settingsSchema.fileName];
    },
  };
}

function isOutputChunk(
  assetOrChunk: OutputAsset | OutputChunk
): assetOrChunk is OutputChunk {
  return assetOrChunk.type === 'chunk';
}
