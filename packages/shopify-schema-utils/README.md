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
