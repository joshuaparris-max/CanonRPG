export function createBackupName(prefix: string): string {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
}

export function parseBackupData<T>(json: string): T {
  return JSON.parse(json) as T;
}
