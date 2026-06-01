import assert from 'node:assert/strict';
import test from 'node:test';
import { createReport, renderReport } from '../dist/index.js';

test('createReport builds checklist, commands, and release notes', async () => {
  const report = await createReport('examples/fixtures/sample-tap', { now: new Date('2026-05-05T00:00:00Z') });
  assert.ok(report.checklist.some((item) => item.id === 'formula.needs-care.test' && item.status === 'warn'));
  assert.ok(report.validationCommands.some((command) => command.command === 'ruby'));
  assert.match(report.releaseNotes, /Tapline release notes/);
});

test('renderReport emits markdown by default', async () => {
  const report = await createReport('examples/fixtures/sample-tap', { now: new Date('2026-05-05T00:00:00Z') });
  const markdown = renderReport(report, 'markdown');
  assert.match(markdown, /# Tapline report: sample-tap/);
  assert.match(markdown, /Explicit dry-run validation commands/);
});

test('renderReport shell-quotes validation paths with spaces', async () => {
  const report = await createReport('examples/fixtures/sample-tap', { now: new Date('2026-05-05T00:00:00Z') });
  report.validationCommands.push({
    label: 'Ruby syntax: spaced formula',
    command: 'ruby',
    args: ['-c', 'Formula/needs care.rb'],
    cwd: report.tap.root,
    optional: true,
    reason: 'Copy-pasteable path quoting.'
  });

  const markdown = renderReport(report, 'markdown');

  assert.ok(markdown.includes("ruby -c 'Formula/needs care.rb'"));
});
