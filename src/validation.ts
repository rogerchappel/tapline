import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import type { CommandResult, TapInfo, ValidationCommand } from './types.js';

export interface PlanOptions {
  /** Homebrew prefix override for tests; defaults to the resolved local installation. */
  homebrewPrefix?: string;
}

interface TapTarget {
  /** Fully qualified Homebrew tap name, e.g. `acme/demo`. */
  tapName: string;
  /** Tap directory expected under `<prefix>/Library/Taps`. */
  tapDirectory: string;
}

export function planValidationCommands(tap: TapInfo, includeBrew = false, options: PlanOptions = {}): ValidationCommand[] {
  const commands: ValidationCommand[] = [
    { label: 'Review git working tree', command: 'git', args: ['status', '--short'], cwd: tap.root, optional: true, reason: 'Read-only release readiness context.' }
  ];
  const brewTarget = includeBrew ? resolveTapTarget(tap, options.homebrewPrefix ?? defaultHomebrewPrefix()) : undefined;
  for (const formula of tap.formulae) {
    commands.push({ label: `Ruby syntax: ${formula.name}`, command: 'ruby', args: ['-c', formula.path], cwd: tap.root, optional: true, reason: 'Checks formula Ruby syntax without publishing or installing.' });
    if (includeBrew) {
      commands.push(planBrewAudit(tap, formula.name, brewTarget));
    }
  }
  return commands;
}

function planBrewAudit(tap: TapInfo, formulaName: string, target: TapTarget | undefined): ValidationCommand {
  const auditLabel = `Homebrew audit: ${formulaName}`;
  const base: ValidationCommand = {
    label: auditLabel,
    command: 'brew',
    args: ['audit', '--strict', '--formula', target ? `${target.tapName}/${formulaName}` : formulaName],
    cwd: tap.root,
    optional: true,
    reason: 'Explicit Homebrew audit by fully qualified formula name. It may inspect local Homebrew state but does not publish.'
  };
  if (!target) {
    return {
      ...base,
      args: ['audit', '--strict', '--formula', formulaName],
      skipReason: `Modern Homebrew disabled \`brew audit [path ...]\`, and no GitHub \`homebrew-*\` remote on ${tap.root} identifies an installable tap. Run \`brew tap <user>/<name> ${tap.root}\` with a \`homebrew-*\` repository name to enable name-based audits.`
    };
  }
  if (!existsSync(target.tapDirectory)) {
    return {
      ...base,
      skipReason: `Homebrew tap ${target.tapName} is not installed in this Homebrew installation. Run \`brew tap ${target.tapName} ${tap.root}\` to enable name-based audits.`
    };
  }
  return { ...base, reason: `${base.reason} Name-based audits are accepted by current Homebrew.` };
}

export function resolveTapTarget(tap: TapInfo, homebrewPrefix: string): TapTarget | undefined {
  for (const url of tap.git?.remoteUrls ?? []) {
    const slug = githubSlug(url);
    if (!slug) continue;
    const separator = slug.indexOf('/');
    if (separator < 0) continue;
    const owner = slug.slice(0, separator);
    const repository = slug.slice(separator + 1);
    if (!repository.startsWith('homebrew-')) continue;
    const tapName = `${owner}/${repository.slice('homebrew-'.length)}`;
    return {
      tapName,
      tapDirectory: path.join(homebrewPrefix, 'Library', 'Taps', owner, repository)
    };
  }
  return undefined;
}

function githubSlug(url: string): string | undefined {
  const httpsMatch = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?$/);
  const sshMatch = url.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (httpsMatch?.[1] && httpsMatch[2]) return `${httpsMatch[1]}/${httpsMatch[2]}`;
  if (sshMatch?.[1] && sshMatch[2]) return `${sshMatch[1]}/${sshMatch[2]}`;
  return undefined;
}

function defaultHomebrewPrefix(): string {
  if (process.env.HOMEBREW_PREFIX) return process.env.HOMEBREW_PREFIX;
  if (process.platform === 'darwin') return process.arch === 'arm64' ? '/opt/homebrew' : '/usr/local';
  if (process.platform === 'linux') return '/home/linuxbrew/.linuxbrew';
  return '/usr/local';
}

export async function runValidationCommands(commands: ValidationCommand[]): Promise<CommandResult[]> {
  const results: CommandResult[] = [];
  for (const command of commands) results.push(await runOne(command));
  return results;
}

async function runOne(command: ValidationCommand): Promise<CommandResult> {
  if (command.skipReason) {
    return { ...command, skipped: true, exitCode: null, stdout: '', stderr: '' };
  }
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
