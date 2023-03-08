import fs from 'node:fs/promises';
import { dirname } from 'node:path';

export async function writeFile(...args: Parameters<(typeof fs)['writeFile']>) {
  const [outputPath] = args;
  const outputDir = dirname(String(outputPath));

  await fs.mkdir(outputDir, { recursive: true });

  return fs.writeFile(...args);
}
