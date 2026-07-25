import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { FormulaInfo } from './types.js';

function firstMatch(source: string, pattern: RegExp): string | undefined {
  return source.match(pattern)?.[1];
}

function quotedMatches(source: string, field: string): string[] {
  const pattern = new RegExp(`^\\s*${field}\\s+(["'])((?:\\\\.|(?!\\1)[^\\r\\n])*)\\1`, 'gm');
  return [...source.matchAll(pattern)].map((match) => {
    const quote = match[1] ?? '"';
    return (match[2] ?? '').replace(new RegExp(`\\\\([\\\\${quote}])`, 'g'), '$1');
  });
}

function quotedValue(source: string, field: string): string | undefined {
  return quotedMatches(source, field)[0];
}

export async function parseFormula(filePath: string, tapRoot: string): Promise<FormulaInfo> {
  const source = await fs.readFile(filePath, 'utf8');
  const name = path.basename(filePath, '.rb');
  const relativePath = path.relative(tapRoot, filePath);
  const className = firstMatch(source, /^class\s+([A-Za-z0-9_:]+)\s+<\s+Formula/m);
  const desc = quotedValue(source, 'desc');
  const homepage = quotedValue(source, 'homepage');
  const url = quotedValue(source, 'url');
  const sha256 = quotedValue(source, 'sha256');
  const version = quotedValue(source, 'version') ?? url?.match(/v?(\d+\.\d+(?:\.\d+)?)/)?.[1];
  return {
    name,
    path: filePath,
    relativePath,
    ...(className ? { className } : {}),
    ...(desc ? { desc } : {}),
    ...(homepage ? { homepage } : {}),
    ...(url ? { url } : {}),
    ...(sha256 ? { sha256 } : {}),
    ...(version ? { version } : {}),
    hasBottle: /\bbottle\s+do\b/.test(source),
    hasLivecheck: /\blivecheck\s+do\b/.test(source),
    hasTest: /\btest\s+do\b/.test(source),
    dependencies: quotedMatches(source, 'depends_on'),
    caveats: [
      ...(!desc ? ['missing desc'] : []),
      ...(!homepage ? ['missing homepage'] : []),
      ...(!sha256 ? ['missing sha256'] : []),
      ...(!/\btest\s+do\b/.test(source) ? ['missing test block'] : [])
    ]
  };
}
