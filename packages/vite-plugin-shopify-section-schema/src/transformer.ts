import { findSchemaImport } from './parser';

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

  return code.replace(schemaImport.code, replacementSchema);
}
