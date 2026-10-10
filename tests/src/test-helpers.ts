import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve, dirname } from 'node:path';

export function generateId(prefix: string = ''): string {
  return `${prefix}${prefix ? '_' : ''}${randomUUID().replace(/-/g, '').slice(0, 26)}`;
}

export function generateTaskId(): string {
  return generateId('task');
}

export function generateSessionId(): string {
  return generateId('session');
}

export function generateWorkspaceId(): string {
  return generateId('ws');
}

export function generateEventId(): string {
  return generateId('evt');
}

export function generateCheckpointId(): string {
  return generateId('cp');
}

export async function withTempDir<T>(callback: (path: string) => Promise<T>): Promise<T> {
  const path = await mkdtemp(join(tmpdir(), 'gix-test-'));
  try {
    return await callback(path);
  } finally {
    await rm(path, { recursive: true, force: true });
  }
}

export async function withTempGitRepo<T>(callback: (path: string) => Promise<T>): Promise<T> {
  const { execa } = await import('execa');

  return withTempDir(async path => {
    await execa('git', ['init'], { cwd: path });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: path });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: path });
    // Create an initial file so there's something to commit
    await writeFile(join(path, 'README.md'), '# Test Repository\n', 'utf8');
    await execa('git', ['add', '.'], { cwd: path });
    await execa('git', ['commit', '-m', 'Initial commit'], { cwd: path });
    return callback(path);
  });
}

export async function writeTestFile(
  basePath: string,
  filePath: string,
  content: string
): Promise<string> {
  const fullPath = join(basePath, filePath);
  await import('node:fs/promises').then(fs => fs.mkdir(dirname(fullPath), { recursive: true }));
  await writeFile(fullPath, content, 'utf8');
  return fullPath;
}

export async function readTestFile(basePath: string, filePath: string): Promise<string> {
  const fullPath = join(basePath, filePath);
  return readFile(fullPath, 'utf8');
}

export async function createDirectory(basePath: string, dirPath: string): Promise<string> {
  const fullPath = join(basePath, dirPath);
  await import('node:fs/promises').then(fs => fs.mkdir(fullPath, { recursive: true }));
  return fullPath;
}

export async function listFiles(basePath: string, pattern?: string): Promise<string[]> {
  const { glob } = await import('tinyglobby');
  return glob(pattern ?? '**/*', { cwd: basePath, absolute: false, onlyFiles: true });
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function getFileSize(path: string): Promise<number> {
  const stats = await stat(path);
  return stats.size;
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function isSubPath(base: string, target: string): boolean {
  const resolvedBase = resolve(base);
  const resolvedTarget = resolve(target);
  const relativePath = relative(resolvedBase, resolvedTarget);
  return !relativePath.startsWith('..') && !relativePath.startsWith('.');
}

export async function runCommand(
  command: string,
  args: string[],
  options: { cwd?: string; timeout?: number; env?: Record<string, string> } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const { execa } = await import('execa');
  try {
    const result = await execa(command, args, {
      cwd: options.cwd ?? process.cwd(),
      timeout: options.timeout ?? 30000,
      env: options.env ?? {},
      reject: false,
    });
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode ?? 0,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        stdout: '',
        stderr: error.message,
        exitCode: 1,
      };
    }
    throw error;
  }
}

export async function runGitCommand(
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return runCommand('git', args, { cwd });
}

export function createMockContext(options: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    timestamp: Date.now(),
    requestId: generateId('req'),
    ...options,
  };
}

export function assertNever(value: never, message: string = 'Unexpected value'): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}

export function timeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number; backoff?: number } = {}
): Promise<T> {
  const { retries = 3, delay = 100, backoff = 2 } = options;

  return fn().catch(async error => {
    if (retries <= 0) throw error;
    await timeout(delay);
    return retry(fn, { retries: retries - 1, delay: delay * backoff, backoff });
  });
}

export function deepEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export class TestLogger {
  private logs: Array<{ level: string; message: string; timestamp: number; context?: unknown }> =
    [];

  log(level: string, message: string, context?: unknown): void {
    this.logs.push({ level, message, timestamp: Date.now(), context });
  }

  info(message: string, context?: unknown): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: unknown): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: unknown): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: unknown): void {
    this.log('debug', message, context);
  }

  getLogs(): Array<{ level: string; message: string; timestamp: number; context?: unknown }> {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }

  getLogsByLevel(
    level: string
  ): Array<{ level: string; message: string; timestamp: number; context?: unknown }> {
    return this.logs.filter(log => log.level === level);
  }
}

export function createTestLogger(): TestLogger {
  return new TestLogger();
}
