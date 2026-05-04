import type { ChecklistItem, TapInfo } from './types.js';

export function generateReleaseNotes(tap: TapInfo, checklist: ChecklistItem[]): string {
  const formulaLines = tap.formulae.map((formula) => `- ${formula.name}${formula.version ? ` ${formula.version}` : ''}: ${formula.desc ?? 'formula metadata reviewed'}`);
  const blockers = checklist.filter((item) => item.status === 'todo');
  const cautions = checklist.filter((item) => item.status === 'warn');
  return [
    `## Tapline release notes for ${tap.name}`,
    '',
    '### Formulae reviewed',
    ...(formulaLines.length > 0 ? formulaLines : ['- No formulae discovered.']),
    '',
    '### Maintenance checklist summary',
    `- Pass: ${checklist.filter((item) => item.status === 'pass').length}`,
    `- Caution: ${cautions.length}`,
    `- To do before release: ${blockers.length}`,
    '',
    '### Copy-paste maintainer note',
    blockers.length === 0
      ? 'Local tap inspection found no required metadata blockers. Review dry-run validation output before tagging or publishing.'
      : `Resolve ${blockers.length} checklist blocker(s), then rerun tapline and Homebrew validation before release.`,
    '',
    '_Generated locally by tapline. No network calls, publishing, or credentials are used by report generation._'
  ].join('\n');
}
