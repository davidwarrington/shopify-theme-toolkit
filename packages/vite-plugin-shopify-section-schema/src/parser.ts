import {
  INLINE_SCHEMA_COMMENT_REGEX,
  REPLACEABLE_SCHEMA_REGEX,
} from './schema-patterns';

function findInlineSchemaImport(code: string) {
  return code.match(INLINE_SCHEMA_COMMENT_REGEX);
}

function findReplaceableSchemaImport(code: string) {
  return code.match(REPLACEABLE_SCHEMA_REGEX);
}

type FindSchemaImportNoResult = {
  code: null;
  matches: null;
  specifier: null;
  type: null;
};
type FindSchemaImportMatchedResult = {
  code: string;
  matches: RegExpMatchArray;
  specifier: string;
  type: 'inline' | 'replaceable';
};
type FindSchemaImportResult =
  | FindSchemaImportNoResult
  | FindSchemaImportMatchedResult;

export function findSchemaImport(code: string): FindSchemaImportResult {
  const typedMatch = [
    ['replaceable', findReplaceableSchemaImport(code)] as const,
    ['inline', findInlineSchemaImport(code)] as const,
  ].find((entries): entries is ['inline' | 'replaceable', RegExpMatchArray] => {
    const [_, matches] = entries;
    return matches !== null;
  });

  if (!typedMatch) {
    return {
      code: null,
      matches: null,
      specifier: null,
      type: null,
    };
  }

  const [type, matches] = typedMatch;

  if (matches === null) {
    return {
      code: null,
      matches: null,
      specifier: null,
      type: null,
    };
  }

  const [source, quotedSpecifier] = matches;
  const specifier = ((string: string) => {
    const quote = string[0];
    return string.replace(new RegExp(`^${quote}|${quote}$`, 'g'), '');
  })(quotedSpecifier);

  return {
    code: source,
    matches,
    specifier,
    type,
  };
}
