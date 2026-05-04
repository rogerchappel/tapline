import { spawn } from 'node:child_process';
import path from 'node:path';
import type { CommandResult, TapInfo, ValidationCommand } from './types.js';

export function planValidationCommands(tap: TapInfo, includeBrew = false): ValidationCommand[] {
  const commands: ValidationCommand[] = [
    { label: 'Review git working tree', command: 'git', args: ['status', '--short'], cwd: tap.root, optional: true, reason: 'Read-only release readiness context.' }
  ];
  for (const formula of tap.formulae) {
    commands.push({ label: `Ruby syntax: ${formula.name}`, command: 'ruby', args: ['-c', formula.path], cwd: tap.root, optional: true, reason: 'Checks formula Ruby syntax without publishing or installing.' });
    if (includeBrew) {
      commands.push({ label: `Homebrew audit: ${formula.name}`, command: 'brew', args: ['audit', '--strict', '--formula', path.relative(tap.root, formula.path)], cwd: tap.root, optional: true, reason: 'Explicit Homebrew audit. It may inspect local Homebrew state but does not publish.' });
    }
  }
  return commands;
}

export async function runValidationCommands(commands: ValidationCommand[]): Promise<CommandResult[]> {
  const results: CommandResult[] = [];
  for (const command of commands) results.push(await runOne(command));
  return results;
}

async function runOne(command: ValidationCommand): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(command.command, command.args, { cwd: command.cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += String(chunk); });
    child.stderr.on('data', (chunk) => { stderr += String(chunk); });
    child.on('error', (error: NodeJS.ErrnoException) => {
      resolve({ ...command, skipped: command.optional && error.code === 'ENOENT', exitCode: error.code === 'ENOENT' ? null : 127, stdout, stderr: error.message });
    });
    child.on('close', (code) => resolve({ ...command, skipped: false, exitCode: code, stdout, stderr }));
  });
}
