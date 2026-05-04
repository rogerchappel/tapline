import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listFiles(root: string, predicate: (absolutePath: string) => boolean): Promise<string[]> {
  const results: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile() && predicate(absolute)) {
        results.push(absolute);
      }
    }
  }
  await walk(root);
  return results.sort();
}

export async function ensureParent(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}
