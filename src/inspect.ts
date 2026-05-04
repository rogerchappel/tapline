import { promises as fs } from 'node:fs';
import path from 'node:path';
import { listFiles, pathExists } from './fs-utils.js';
import { parseFormula } from './formula-parser.js';
import { inspectGit } from './git.js';
import type { TapInfo } from './types.js';

export async function inspectTap(inputRoot: string): Promise<TapInfo> {
  const root = path.resolve(inputRoot);
  const stat = await fs.stat(root).catch(() => undefined);
  if (!stat?.isDirectory()) throw new Error(`Tap path does not exist or is not a directory: ${inputRoot}`);
  const formulaRoot = path.join(root, 'Formula');
  const warnings: string[] = [];
  if (!(await pathExists(formulaRoot))) warnings.push('No Formula/ directory found.');
  const formulaPaths = await listFiles(root, (file) => file.endsWith('.rb') && file.includes(`${path.sep}Formula${path.sep}`));
  if (formulaPaths.length === 0) warnings.push('No formula files found under Formula/.');
  const formulae = await Promise.all(formulaPaths.map((formulaPath) => parseFormula(formulaPath, root)));
  return {
    root,
    name: path.basename(root),
    formulae,
    git: await inspectGit(root),
    warnings
  };
}
