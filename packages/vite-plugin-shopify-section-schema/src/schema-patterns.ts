export const SCHEMA_REGEX =
  /{%-?\s*schema\s*-?%}([\s\S]*){%-?\s*endschema\s*-?%}/;

export const REPLACEABLE_SCHEMA_REGEX =
  /{%-?\s*schema\s*('.*'|".*")\s*-?%}(([\s\S]*){%-?\s*endschema\s*-?%})?/;

export const SCHEMA_IMPORT_COMMENT_REGEX =
  /{%-?\s*# import schema from ('.*'|".*")\s*-?%}/;
