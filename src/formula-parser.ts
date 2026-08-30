import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { FormulaDependency, FormulaInfo } from './types.js';

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

function unescapeQuoted(value: string, quote: string): string {
  return value.replace(new RegExp(`\\\\([\\\\${quote}])`, 'g'), '$1');
}

function dependencyQualifiers(value: string): string[] {
  const match = value.match(/^\s*=>\s*(.*?)(?:\s+#.*)?$/);
  if (!match) return [];
  const expression = match[1] ?? '';
  const single = expression.match(/^:([A-Za-z0-9_]+)\s*$/);
  if (single) return [single[1] ?? ''];
  const list = expression.match(/^\[\s*((?::[A-Za-z0-9_]+\s*,\s*)*:[A-Za-z0-9_]+)\s*\]\s*$/);
  return list ? [...(list[1] ?? '').matchAll(/:([A-Za-z0-9_]+)/g)].map((item) => item[1] ?? '') : [];
}

function dependencies(source: string, executable: string): FormulaDependency[] {
  const result: FormulaDependency[] = [];
  const quoted = /^\s*depends_on\s+(["'])((?:\\.|(?!\1)[^\r\n])*)\1([^\r\n]*)$/gm;
  for (const match of source.matchAll(quoted)) {
    const keyword = (match.index ?? 0) + (match[0]?.indexOf('depends_on') ?? 0);
    if (executable.slice(keyword, keyword + 'depends_on'.length) !== 'depends_on') continue;
    result.push({
      name: unescapeQuoted(match[2] ?? '', match[1] ?? '"'),
      qualifiers: dependencyQualifiers(match[3] ?? '')
    });
  }

  const platform = /^\s*depends_on\s+([A-Za-z0-9_]+):\s*:([A-Za-z0-9_]+)\s*(?:#.*)?$/gm;
  for (const match of source.matchAll(platform)) {
    const keyword = (match.index ?? 0) + (match[0]?.indexOf('depends_on') ?? 0);
    if (executable.slice(keyword, keyword + 'depends_on'.length) !== 'depends_on') continue;
    result.push({ platform: match[1] ?? '', qualifiers: [match[2] ?? ''] });
  }
  return result;
}

function withoutRubyBlockComments(source: string): string {
  let inBlockComment = false;
  return source.split(/(?<=\n)/).map((line) => {
    if (!inBlockComment && /^=begin(?:\s|$)/.test(line)) {
      inBlockComment = true;
      return line.endsWith('\n') ? '\n' : '';
    }
    if (inBlockComment) {
      if (/^=end(?:\s|$)/.test(line)) inBlockComment = false;
      return line.endsWith('\n') ? '\n' : '';
    }
    return line;
  }).join('');
}

function executableSource(source: string): string {
  let result = '';
  let quote: "'" | '"' | undefined;
  let percentLiteral: { opener: string; closer: string; depth: number } | undefined;
  let comment = false;
  const pairedDelimiters: Record<string, string> = { '(': ')', '[': ']', '{': '}', '<': '>' };

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
    if (percentLiteral) {
      result += ' ';
      if (character === '\\') {
        if (index + 1 < source.length && source[index + 1] !== '\n' && source[index + 1] !== '\r') {
          result += ' ';
          index += 1;
        }
      } else if (character === percentLiteral.opener && percentLiteral.opener !== percentLiteral.closer) {
        percentLiteral.depth += 1;
      } else if (character === percentLiteral.closer) {
        percentLiteral.depth -= 1;
        if (percentLiteral.depth === 0) percentLiteral = undefined;
      }
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
    const percentType = source[index + 1];
    const percentDelimiter = source[index + 2];
    if (character === '%' && (percentType === 'q' || percentType === 'Q') &&
        percentDelimiter && !/[A-Za-z0-9\s]/.test(percentDelimiter)) {
      percentLiteral = {
        opener: percentDelimiter,
        closer: pairedDelimiters[percentDelimiter] ?? percentDelimiter,
        depth: 1
      };
      result += '   ';
      index += 2;
    } else if (character === '#') {
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

function withoutRubyHeredocs(source: string): string {
  const pending: Array<{ terminator: string; indented: boolean }> = [];
  return source.split(/(?<=\n)/).map((line) => {
    const active = pending[0];
    if (active) {
      const content = line.replace(/[\r\n]+$/, '');
      const candidate = active.indented ? content.trimStart() : content;
      if (candidate === active.terminator) pending.shift();
      return line.endsWith('\n') ? '\n' : '';
    }

    const code = executableSource(line);
    const pattern = /<<([~-]?)(?:'([^']+)'|"([^"]+)"|`([^`]+)`|([A-Za-z_][A-Za-z0-9_]*))/g;
    for (const match of line.matchAll(pattern)) {
      if (match.index === undefined || code.slice(match.index, match.index + 2) !== '<<') continue;
      pending.push({
        terminator: match[2] ?? match[3] ?? match[4] ?? match[5] ?? '',
        indented: match[1] === '-' || match[1] === '~'
      });
    }
    return line;
  }).join('');
}

function hasBlock(source: string, block: 'bottle' | 'livecheck' | 'test'): boolean {
  return new RegExp(`^\\s*${block}\\s+do\\b`, 'm').test(source);
}

export async function parseFormula(filePath: string, tapRoot: string): Promise<FormulaInfo> {
  const source = await fs.readFile(filePath, 'utf8');
  const parsedSource = withoutRubyHeredocs(withoutRubyBlockComments(source));
  const name = path.basename(filePath, '.rb');
  const relativePath = path.relative(tapRoot, filePath);
  const className = firstMatch(parsedSource, /^class\s+([A-Za-z0-9_:]+)\s+<\s+Formula/m);
  const desc = quotedValue(parsedSource, 'desc');
  const homepage = quotedValue(parsedSource, 'homepage');
  const url = quotedValue(parsedSource, 'url');
  const sha256 = quotedValue(parsedSource, 'sha256');
  const version = quotedValue(parsedSource, 'version') ?? url?.match(/v?(\d+\.\d+(?:\.\d+)?)/)?.[1];
  const code = executableSource(parsedSource);
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
    dependencies: dependencies(parsedSource, code),
    caveats: [
      ...(!desc ? ['missing desc'] : []),
      ...(!homepage ? ['missing homepage'] : []),
      ...(!sha256 ? ['missing sha256'] : []),
      ...(!hasTest ? ['missing test block'] : [])
    ]
  };
}
