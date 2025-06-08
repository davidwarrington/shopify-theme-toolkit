# Shopify Schema Utils

Utilities for writing shopify schemas in JavaScript/Typescript.

## Installation

```shell
npm install --save-dev shopify-schema-utils
```

## Usage

### defineSectionSchema

A helper function for creating a section schema without providing TypeScript/JSDoc boilerplate.

```js
import { defineSectionSchema } from 'shopify-schema-utils';

export default defineSectionSchema({
  name: 'My Section',
  // ...
});
```

### defineBlockSchema

A helper function for creating a block schema without providing TypeScript/JSDoc boilerplate.

```js
import { defineBlockSchema } from 'shopify-schema-utils';

export default defineBlockSchema({
  name: 'My Block',
  // ...
});
```

### Types

Prefer not to use `define` functions? Need more granular types? This package exports a whole bunch of types for schemas too, including definitions for individual setting types, and schema presets.

```ts
import type { SelectSettingSchema } from 'shopify-schema-utils';

export const colorsSetting: SelectSettingSchema = {
  // ...
};
```

## Editor suggestions

`defineBlockSchema` and `defineSectionSchema` can be enhanced by passing your translations/locales as a generic.

```ts
import { defineBlockSchema } from 'shopify-schema-utils';
import locales from '@locales/en.default.schema.json';

export default defineBlockSchema<typeof locales>({
  // Translatable keys such as name will have autocomplete suggestions in your editor
  name: 't:',
});
```

If you don't want to repeat the above boilerplate _every time_ you call `defineBlockSchema` or `defineSectionSchema`, you can create your own importable utilities like so

```ts
// schemas/utils/define.ts

import {
  defineBlockSchema as _defineBlockSchema,
  defineSectionSchema as _defineSectionSchema,
} from 'shopify-schema-utils';
import locales from '@locales/en.default.schema.json';

export const defineBlockSchema = _defineBlockSchema<typeof locales>;
export const defineSectionSchema = _defineSectionSchema<typeof locales>;
```

Now, rather than importing the utilities directly from `shopify-schema-utils`, import the overridden ones from your `schemas/utils/define.ts` file.

```ts
// schemas/blocks/my-block.ts

import { defineBlockSchema } from '../utils/define';

export default defineBlockSchema({
  // Translatable keys are suggested because `utils/define` has the translations preloaded
  name: 't:',
});
```

Even if you prefer JavaScript over TypeScript, I'd recommend using TS just for definition utilities as per the `utils/define.ts` example. Alternatively you can use JSDoc to get the same benefits.
