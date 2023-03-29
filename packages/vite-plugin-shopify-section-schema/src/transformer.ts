import { findSchemaImport } from './parser';
import { SCHEMA_REGEX } from './schema-patterns';

const NEWLINE = '\n';

function join(separator = '') {
  return function (array: string[]) {
    return array.join(separator);
  };
}

export function transformSection(code: string, schema: string = '') {
  const schemaImport = findSchemaImport(code);

  if (!schemaImport.matches) {
    return code;
  }

  const replacementSchema = join(NEWLINE)([
    '{% schema %}',
    schema,
    '{% endschema %}',
  ]);

  if (schemaImport.type === 'replaceable') {
    return code.replace(schemaImport.code, replacementSchema);
  }

  const hasExistingSchema = SCHEMA_REGEX.test(code);

  if (hasExistingSchema) {
    return code.replace(SCHEMA_REGEX, replacementSchema);
  }

  return join(NEWLINE)([code, replacementSchema]);
}
