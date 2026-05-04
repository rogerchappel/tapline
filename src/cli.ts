#!/usr/bin/env node
import { createReport, renderReport, writeReport } from './index.js';
import type { OutputFormat } from './types.js';

interface CliOptions {
  command: 'inspect' | 'help' | 'version';
  tapPath?: string;
  output?: string;
  format: OutputFormat;
  runCommands: boolean;
  includeBrew: boolean;
}

function usage(): string {
  return `tapline — local-first Homebrew tap maintenance helper

Usage:
  tapline inspect <tap-path> [--format markdown|json] [--output file] [--run-checks] [--include-brew]
  tapline --help
  tapline --version

Safety:
  Report generation is read-only. --run-checks executes explicit local validation commands shown in the report.
  Homebrew audit commands are included only with --include-brew.`;
}

function parse(argv: string[]): CliOptions {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) return { command: 'help', format: 'markdown', runCommands: false, includeBrew: false };
  if (argv.includes('--version')) return { command: 'version', format: 'markdown', runCommands: false, includeBrew: false };
  const [command, tapPath, ...rest] = argv;
  if (command !== 'inspect' || !tapPath) throw new Error('Expected: tapline inspect <tap-path>');
  let format: OutputFormat = 'markdown';
  let output: string | undefined;
  let runCommands = false;
  let includeBrew = false;
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === '--format') {
      const next = rest[++i];
      if (next !== 'markdown' && next !== 'json') throw new Error('--format must be markdown or json');
      format = next;
    } else if (arg === '--output' || arg === '-o') {
      output = rest[++i];
      if (!output) throw new Error('--output requires a file path');
    } else if (arg === '--run-checks') {
      runCommands = true;
    } else if (arg === '--include-brew') {
      includeBrew = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return { command: 'inspect', tapPath, ...(output ? { output } : {}), format, runCommands, includeBrew };
}

async function main(): Promise<void> {
  const options = parse(process.argv.slice(2));
  if (options.command === 'help') {
    console.log(usage());
    return;
  }
  if (options.command === 'version') {
    console.log('0.1.0');
    return;
  }
  const report = await createReport(options.tapPath!, { runCommands: options.runCommands, includeBrew: options.includeBrew });
  const rendered = renderReport(report, options.format);
  if (options.output) {
    await writeReport(options.output, rendered);
  } else {
    process.stdout.write(rendered);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
