import { promises as fs } from 'node:fs';
import { buildChecklist } from './checklist.js';
import { ensureParent } from './fs-utils.js';
import { inspectTap } from './inspect.js';
import { generateReleaseNotes } from './release-notes.js';
import { renderJson, renderMarkdown } from './report.js';
import { planValidationCommands, runValidationCommands } from './validation.js';
import type { OutputFormat, TaplineReport } from './types.js';

export type * from './types.js';
export { inspectTap } from './inspect.js';
export { buildChecklist } from './checklist.js';
export { generateReleaseNotes } from './release-notes.js';
export { planValidationCommands, runValidationCommands } from './validation.js';
export { renderJson, renderMarkdown } from './report.js';

export interface CreateReportOptions {
  includeBrew?: boolean;
  runCommands?: boolean;
  now?: Date;
}

export async function createReport(tapPath: string, options: CreateReportOptions = {}): Promise<TaplineReport> {
  const tap = await inspectTap(tapPath);
  const checklist = buildChecklist(tap);
  const validationCommands = planValidationCommands(tap, options.includeBrew ?? false);
  const commandResults = options.runCommands ? await runValidationCommands(validationCommands) : undefined;
  return {
    tap,
    checklist,
    validationCommands,
    ...(commandResults ? { commandResults } : {}),
    releaseNotes: generateReleaseNotes(tap, checklist),
    generatedAt: (options.now ?? new Date()).toISOString()
  };
}

export function renderReport(report: TaplineReport, format: OutputFormat): string {
  return format === 'json' ? renderJson(report) : renderMarkdown(report);
}

export async function writeReport(filePath: string, contents: string): Promise<void> {
  await ensureParent(filePath);
  await fs.writeFile(filePath, contents, 'utf8');
}
