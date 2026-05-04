export type OutputFormat = 'markdown' | 'json';

export interface FormulaInfo {
  name: string;
  path: string;
  relativePath: string;
  className?: string;
  desc?: string;
  homepage?: string;
  url?: string;
  sha256?: string;
  version?: string;
  hasBottle: boolean;
  hasLivecheck: boolean;
  hasTest: boolean;
  dependencies: string[];
  caveats: string[];
}

export interface TapInfo {
  root: string;
  name: string;
  formulae: FormulaInfo[];
  git?: GitInfo;
  warnings: string[];
}

export interface GitInfo {
  branch?: string;
  isRepository: boolean;
  dirty: boolean;
  statusLines: string[];
  remoteUrls: string[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  status: 'pass' | 'warn' | 'todo';
  detail: string;
  formula?: string;
}

export interface ValidationCommand {
  label: string;
  command: string;
  args: string[];
  cwd: string;
  optional: boolean;
  reason: string;
}

export interface CommandResult extends ValidationCommand {
  skipped: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

export interface TaplineReport {
  tap: TapInfo;
  checklist: ChecklistItem[];
  validationCommands: ValidationCommand[];
  commandResults?: CommandResult[];
  releaseNotes: string;
  generatedAt: string;
}
