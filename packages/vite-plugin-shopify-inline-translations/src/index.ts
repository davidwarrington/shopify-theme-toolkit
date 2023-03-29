import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Identifier, MemberExpression } from 'estree';
import { type Node, walk } from 'estree-walker';
import MagicString from 'magic-string';
import { findStaticImports, parseStaticImport } from 'mlly';
import type { Plugin } from 'vite';

declare module 'estree' {
  interface Identifier {
    end: number;
    object?: Node;
    start: number;
  }

  interface ImportDeclaration {
    end: number;
    start: number;
  }
}

interface Options {
  input: string;
  namespace?: string;
  output: string;
}

export default function viteShopifyInlineTranslations({
  input,
  namespace = 'window.translations',
  output,
}: Options): Plugin {
  const translationsToRender: string[][] = [];

  return {
    name: 'vite-plugin-shopify-inline-translations',

    async transform(code, id) {
      const staticImports = findStaticImports(code);
      const resolvedStaticImports = await Promise.all(
        staticImports.map(async staticImport => {
          return [
            staticImport,
            await this.resolve(staticImport.specifier, id),
          ] as const;
        })
      );

      const translationsImports = resolvedStaticImports.filter(
        ([_, resolvedId]) => resolvedId?.id === input
      );

      const hasImportedTranslations = translationsImports.length > 0;

      if (!hasImportedTranslations) {
        return;
      }

      const parsedAndResolvedImports = translationsImports.map(
        ([staticImport, ...rest]) => {
          return [parseStaticImport(staticImport), ...rest] as const;
        }
      );
      const importedDefaultVariablesToReplace = new Set<string>();
      const importedNamedVariablesToReplace = new Set<string>();
      parsedAndResolvedImports.forEach(([parsedImport]) => {
        if (parsedImport.defaultImport) {
          importedDefaultVariablesToReplace.add(parsedImport.defaultImport);
        }

        if (parsedImport.namedImports) {
          Object.keys(parsedImport.namedImports).forEach(namedImport => {
            importedNamedVariablesToReplace.add(namedImport);
          });
        }
      });

      const magicString = new MagicString(code);

      const tree = this.parse(code) as Node;
      const visitedRootNodes = new Set<Node>();

      walk(tree, {
        enter(node) {
          if (node.type === 'ImportDeclaration') {
            const isTranslationsImport = parsedAndResolvedImports.some(
              ([parsedImport]) => parsedImport.specifier === node.source.value
            );

            if (!isTranslationsImport) {
              return;
            }

            node.specifiers.forEach(specifier => {
              visitedRootNodes.add(specifier.local);
            });

            const { start, end } = node;
            magicString.remove(start, end);
          }

          if (node.type === 'MemberExpression') {
            const root = getRootNode(node);

            if (visitedRootNodes.has(root)) {
              return;
            }

            const { name, start, end } = root;
            const isDefaultImport = importedDefaultVariablesToReplace.has(name);
            const isNamedImport = importedNamedVariablesToReplace.has(name);
            if (!isDefaultImport && !isNamedImport) {
              return;
            }

            const path = getPathToNode(node, isNamedImport);
            translationsToRender.push(path);
            visitedRootNodes.add(root);

            if (isDefaultImport) {
              magicString.overwrite(start, end, namespace);
            } else {
              magicString.prependLeft(start, `${namespace}.`);
            }
          }

          if (node.type === 'Identifier') {
            const root = getRootNode(node);

            if (visitedRootNodes.has(root)) {
              return;
            }

            const { name, start, end } = root;
            const isNamedImport = importedNamedVariablesToReplace.has(name);
            if (!isNamedImport) {
              return;
            }

            const path = getPathToNode(node, isNamedImport);
            translationsToRender.push(path);
            visitedRootNodes.add(root);

            magicString.overwrite(start, end, [namespace, ...path].join('.'));
          }
        },
      });

      if (!magicString.hasChanged()) {
        return;
      }

      return {
        code: magicString.toString(),
        map: magicString.generateMap({ includeContent: true, source: id }),
      };
    },

    async generateBundle() {
      const tree: Tree = (() => {
        const tree = {};

        translationsToRender.forEach(branch =>
          addBranchToTree(
            branch,
            `{{ '${branch.join('.')}' | t | json }}`,
            tree
          )
        );

        return tree;
      })();

      const liquidTree = JSON.stringify(tree, null, 2)
        .replace(/"{{/g, '{{')
        .replaceAll(/}}"/g, '}}');

      const source = join(NEWLINE)([
        '<script>',
        `${namespace} = ${liquidTree}`,
        '</script>',
      ]);

      return await outputFile(output, source, { encoding: 'utf-8' });
    },
  };
}

function getRootNode(node: MemberExpression | Identifier): Identifier {
  if (node.type === 'MemberExpression') {
    return getRootNode(node.object as MemberExpression | Identifier);
  }

  return node;
}

function getPathToNode(
  node: Identifier | MemberExpression,
  maintainRoot = false,
  path: string[] = []
): string[] {
  const isRoot = node.type !== 'MemberExpression';

  if (isRoot) {
    if (maintainRoot) {
      return [node.name, ...path];
    }

    return path;
  }

  return getPathToNode(node.object as MemberExpression, maintainRoot, [
    (node.property as Identifier).name,
    ...path,
  ]);
}

interface Tree {
  [key: string]: Tree | string;
}

function addBranchToTree(
  branch: string[],
  finalValue: string,
  root: Tree
): void {
  const isLast = branch.length === 1;

  if (!isLast) {
    const nextRootName = branch[0];
    if (!(nextRootName in root)) {
      root[nextRootName] = {};
    }

    return addBranchToTree(
      branch.slice(1),
      finalValue,
      root[nextRootName] as Tree
    );
  }

  root[branch[0]] = finalValue;
}

const NEWLINE = '\n';

function join(separator = '') {
  return function (values: string[]) {
    return values.join(separator);
  };
}

async function outputFile(...args: Parameters<typeof writeFile>) {
  const [outputPath] = args;
  const outputDir = dirname(String(outputPath));

  await mkdir(outputDir, { recursive: true });

  return writeFile(...args);
}
