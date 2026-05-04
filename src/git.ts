import { spawn } from 'node:child_process';
import type { GitInfo } from './types.js';

async function git(cwd: string, args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += String(chunk); });
    child.stderr.on('data', (chunk) => { stderr += String(chunk); });
    child.on('error', (error) => resolve({ code: 127, stdout, stderr: error.message }));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

export async function inspectGit(root: string): Promise<GitInfo> {
  const inside = await git(root, ['rev-parse', '--is-inside-work-tree']);
  if (inside.code !== 0 || inside.stdout.trim() !== 'true') {
    return { isRepository: false, dirty: false, statusLines: [], remoteUrls: [] };
  }
  const [branch, status, remotes] = await Promise.all([
    git(root, ['branch', '--show-current']),
    git(root, ['status', '--short']),
    git(root, ['remote', '-v'])
  ]);
  const statusLines = status.stdout.split('\n').map((line) => line.trimEnd()).filter(Boolean);
  const remoteUrls = [...new Set(remotes.stdout.split('\n').flatMap((line) => {
    const url = line.trim().split(/\s+/)[1];
    return url ? [url] : [];
  }))];
  return {
    isRepository: true,
    dirty: statusLines.length > 0,
    statusLines,
    remoteUrls,
    ...(branch.stdout.trim() ? { branch: branch.stdout.trim() } : {})
  };
}
