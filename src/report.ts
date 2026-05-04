import type { TaplineReport } from './types.js';

function statusIcon(status: string): string {
  if (status === 'pass') return '✅';
  if (status === 'warn') return '⚠️';
  return '⬜';
}

export function renderMarkdown(report: TaplineReport): string {
  const { tap } = report;
  const lines = [
    `# Tapline report: ${tap.name}`,
    '',
    `Generated: ${report.generatedAt}`,
    `Root: \`${tap.root}\``,
    '',
    '## Formulae',
    ...(tap.formulae.length ? tap.formulae.map((f) => `- **${f.name}**${f.version ? ` ${f.version}` : ''} — ${f.desc ?? 'No desc'} (\`${f.relativePath}\`)`) : ['- None found.']),
    '',
    '## Checklist',
    ...report.checklist.map((item) => `- ${statusIcon(item.status)} **${item.title}** — ${item.detail}`),
    '',
    '## Explicit dry-run validation commands',
    ...report.validationCommands.map((cmd) => `- \`${[cmd.command, ...cmd.args].join(' ')}\` (${cmd.reason})`)
  ];
  if (report.commandResults) {
    lines.push('', '## Command results');
    for (const result of report.commandResults) {
      lines.push(`- ${result.skipped ? 'SKIP' : result.exitCode === 0 ? 'PASS' : 'FAIL'} ${result.label}: ${result.skipped ? 'command unavailable' : `exit ${result.exitCode}`}`);
    }
  }
  lines.push('', report.releaseNotes, '');
  return lines.join('\n');
}

export function renderJson(report: TaplineReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
