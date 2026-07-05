/**
 * Parse the public `export { … }` block from a generated declaration file.
 */
export function parseDeclarationExportBlock(source: string): {
  values: string[];
  types: string[];
} {
  const match = source.match(/^export\s*\{([^}]+)\}/m);
  if (!match) {
    throw new Error('Could not find public export block in declaration file');
  }

  const values: string[] = [];
  const types: string[] = [];

  for (const rawPart of match[1].split(',')) {
    const part = rawPart.trim();
    if (!part) {
      continue;
    }

    const typeMatch = part.match(/^type\s+(\w+)$/);
    if (typeMatch) {
      types.push(typeMatch[1]);
    } else {
      values.push(part);
    }
  }

  return {
    values: values.sort(),
    types: types.sort(),
  };
}
