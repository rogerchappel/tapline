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

function executableSource(source: string): string {
  let result = '';
  let quote: "'" | '"' | undefined;
  let comment = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index] ?? '';
    if (character === '\n' || character === '\r') {
      result += character;
      comment = false;
      continue;
    }
    if (comment) {
      result += ' ';
      continue;
    }
    if (quote) {
      result += ' ';
      if (character === '\\') {
        if (index + 1 < source.length && source[index + 1] !== '\n' && source[index + 1] !== '\r') {
          result += ' ';
          index += 1;
        }
      } else if (character === quote) {
        quote = undefined;
      }
      continue;
    }
    if (character === '#') {
      comment = true;
      result += ' ';
    } else if (character === "'" || character === '"') {
      quote = character;
      result += ' ';
    } else {
      result += character;
    }
  }

  return result;
}

function hasBlock(source: string, block: 'bottle' | 'livecheck' | 'test'): boolean {
  return new RegExp(`^\\s*${block}\\s+do\\b`, 'm').test(source);
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
  const code = executableSource(source);
  const hasBottle = hasBlock(code, 'bottle');
  const hasLivecheck = hasBlock(code, 'livecheck');
  const hasTest = hasBlock(code, 'test');
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
    hasBottle,
    hasLivecheck,
    hasTest,
    dependencies: quotedMatches(source, 'depends_on'),
    caveats: [
      ...(!desc ? ['missing desc'] : []),
      ...(!homepage ? ['missing homepage'] : []),
      ...(!sha256 ? ['missing sha256'] : []),
      ...(!hasTest ? ['missing test block'] : [])
    ]
  };
}
