import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { FormulaInfo } from './types.js';

function firstMatch(source: string, pattern: RegExp): string | undefined {
  return source.match(pattern)?.[1];
}

function allMatches(source: string, pattern: RegExp): string[] {
  return [...source.matchAll(pattern)].map((match) => match[1]).filter((value): value is string => Boolean(value));
}

export async function parseFormula(filePath: string, tapRoot: string): Promise<FormulaInfo> {
  const source = await fs.readFile(filePath, 'utf8');
  const name = path.basename(filePath, '.rb');
  const relativePath = path.relative(tapRoot, filePath);
  const className = firstMatch(source, /^class\s+([A-Za-z0-9_:]+)\s+<\s+Formula/m);
  const desc = firstMatch(source, /^\s*desc\s+["']([^"']+)["']/m);
  const homepage = firstMatch(source, /^\s*homepage\s+["']([^"']+)["']/m);
  const url = firstMatch(source, /^\s*url\s+["']([^"']+)["']/m);
  const sha256 = firstMatch(source, /^\s*sha256\s+["']([^"']+)["']/m);
  const version = firstMatch(source, /^\s*version\s+["']([^"']+)["']/m) ?? url?.match(/v?(\d+\.\d+(?:\.\d+)?)/)?.[1];
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
    dependencies: allMatches(source, /^\s*depends_on\s+["']([^"']+)["']/gm),
    caveats: [
      ...(!desc ? ['missing desc'] : []),
      ...(!homepage ? ['missing homepage'] : []),
      ...(!sha256 ? ['missing sha256'] : []),
      ...(!/\btest\s+do\b/.test(source) ? ['missing test block'] : [])
    ]
  };
}
