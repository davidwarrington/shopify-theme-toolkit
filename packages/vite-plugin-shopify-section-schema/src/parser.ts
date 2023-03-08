const REPLACEABLE_SCHEMA_REGEX =
  /{%-?\s*schema\s*('.*'|".*")\s*-?%}(([\s\S]*){%-?\s*endschema\s*-?%})?/;

type FindReplaceableSchemaNoResult = {
  code: null;
  matches: null;
  specifier: null;
};
type FindReplaceableSchemaMatchedResult = {
  code: string;
  matches: RegExpMatchArray;
  specifier: string;
};
type FindReplaceableSchemaResult =
  | FindReplaceableSchemaNoResult
  | FindReplaceableSchemaMatchedResult;

export function findSchemaImport(code: string): FindReplaceableSchemaResult {
  const matches = code.match(REPLACEABLE_SCHEMA_REGEX);

  if (!matches) {
    return {
      code: null,
      matches: null,
      specifier: null,
    };
  }

  const source = matches[0];
  const specifier = ((string: string) => {
    const quote = string[0];
    return string.replace(new RegExp(`^${quote}|${quote}$`, 'g'), '');
  })(matches[1]);

  return {
    code: source,
    matches,
    specifier,
  };
}
