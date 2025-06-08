# ESBuild Plugin Liquid Schemas

Build liquid schemas for your Shopify themes via ESBuild.

## Installation

```shell
npm install --save-dev esbuild-plugin-liquid-schemas
```

## Quickstart

Install ESBuild and this plugin

```shell
npm install --save-dev esbuild esbuild-plugin-liquid-schemas
```

Create an ESBuild script at `scripts/build-schemas.js`

```js
import { build, context } from 'esbuild';
import liquidSchemas from 'esbuild-plugin-liquid-schemas';

const mode = process.argv.includes('--watch') ? 'watch' : 'build';

const config = {
  /**
   * esbuild will error if there are no matches in either your blocks or sections directory.
   * If for example you're not using blocks in your theme, omit the entry in this array.
   * You can always add it later if needed.
   */
  entryPoints: ['./blocks/*.liquid', './sections/*.liquid'],
  bundle: true,
  /** With `write: true` esbuild will write a JS module for every entrypoint */
  write: false,
  /**
   * Since `write` is set to `false` nothing will actually be emitted. esbuild still
   * requires that `outdir` is provided when there are multiple entrypoints.
   */
  outdir: '.shopify',
  format: 'esm',
  plugins: [liquidSchemas()],
};

if (mode === 'build') {
  build(config);
} else {
  const buildContext = await context(config);

  await buildContext.watch();
}
```

Add scripts to your package.json

```json
{
  "scripts": {
    "build": "node ./scripts/build-schemas.js",
    "dev": "node ./scripts/build-schemas.js --watch"
  }
}
```

Create a schema in a JS/TS file

```js
// schemas/sections/my-section.js

const name = 'My Section';

export default {
  name,
  blocks: [{ name: '@theme' }],
  presets: [{ name }],
};
```

Import the module into your Liquid section

```liquid
{% # sections/my-section.liquid %}

{% # import schema from '../sections/my-section' %}

<div>
  {% content_for 'blocks' %}
</div>
```

Run `node ./scripts/build-schemas.js --watch`

On save, the schema exported by `schema/sections/my-section.js` will be injected into `sections/my-section.liquid`. As you update `my-section.js` and any of its dependencies, esbuild will detect updates and update your Liquid file(s).

## Options

### write

Default: `true`

Type: `boolean`

Whether to write the generated Liquid files. If false, the output will be appended to `result.outputFiles`, which is useful if you need to make further modifications after ESBuild has made its injections.

## Why?

As a project grows the likelihood of schema overlap, where multiple blocks/sections reuse parts of the same schema increases. By writing schemas in JS/TS you have ultimate flexibility to share and reuse pieces of schema and don't have to worry about schemas becoming outdated across your project.

My ["Building Shopify Section Schemas with JavaScript" blog post](https://ellodave.dev/blog/2020/10/14/building-shopify-section-schemas-with-javascript) from 2020 goes into depth about a lot of the benefits that come from writing schemas this way.

## Why ESBuild?

This tool could be written as a standalone CLI, however ultimately I want people to be able to integrate this into their existing toolchains and configurations. Plugins for other build systems are planned, for example a Vite plugin.

With ESBuild you can use import aliases defined in your `tsconfig.json` (or `jsconfig.json`). For example `import schema from '@schemas/sections/my-section.liquid`. We also have out of the box support for TypeScript - if that's your poison, which can be used to provide additional linting. Support for other languages can be added too via ESBuild plugins.

Note that in its current, early state, this tool does have certain limitations, for example requiring being exported in `esm` format by ESBuild.
