import type { ChecklistItem, TapInfo } from './types.js';

export function buildChecklist(tap: TapInfo): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  items.push({
    id: 'tap.formulae-present',
    title: 'Formula files discovered',
    status: tap.formulae.length > 0 ? 'pass' : 'todo',
    detail: `${tap.formulae.length} formula file(s) found.`
  });
  if (tap.git?.isRepository) {
    items.push({
      id: 'tap.git-clean',
      title: 'Git working tree reviewed',
      status: tap.git.dirty ? 'warn' : 'pass',
      detail: tap.git.dirty ? `Working tree has ${tap.git.statusLines.length} pending change(s).` : 'Working tree is clean.'
    });
  } else {
    items.push({ id: 'tap.git-present', title: 'Git repository detected', status: 'warn', detail: 'Path is not a Git repository; release context may be incomplete.' });
  }
  for (const formula of tap.formulae) {
    const prefix = `formula.${formula.name}`;
    items.push({ id: `${prefix}.metadata`, title: `${formula.name}: metadata`, status: formula.desc && formula.homepage ? 'pass' : 'todo', detail: formula.desc && formula.homepage ? 'desc and homepage are present.' : 'Add desc and homepage.', formula: formula.name });
    items.push({ id: `${prefix}.source`, title: `${formula.name}: source integrity`, status: formula.url && formula.sha256 ? 'pass' : 'todo', detail: formula.url && formula.sha256 ? 'url and sha256 are present.' : 'Add url and sha256.', formula: formula.name });
    items.push({ id: `${prefix}.test`, title: `${formula.name}: test block`, status: formula.hasTest ? 'pass' : 'warn', detail: formula.hasTest ? 'test do block is present.' : 'Add a test do block before release.', formula: formula.name });
    items.push({ id: `${prefix}.livecheck`, title: `${formula.name}: livecheck`, status: formula.hasLivecheck ? 'pass' : 'warn', detail: formula.hasLivecheck ? 'livecheck block is present.' : 'Consider adding livecheck for update discovery.', formula: formula.name });
  }
  return items;
}
