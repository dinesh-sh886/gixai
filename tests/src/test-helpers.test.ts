import { describe, it, expect, beforeEach } from 'vitest';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { execa } from 'execa';
import {
  generateId,
  generateTaskId,
  generateSessionId,
  generateWorkspaceId,
  generateEventId,
  generateCheckpointId,
  withTempDir,
  withTempGitRepo,
  writeTestFile,
  readTestFile,
  createDirectory,
  listFiles,
  fileExists,
  getFileSize,
  normalizePath,
  isSubPath,
  runCommand,
  runGitCommand,
  createMockContext,
  timeout,
  retry,
  deepEqual,
  omit,
  pick,
  debounce,
  throttle,
  createTestLogger,
  type TestLogger,
} from './test-helpers.js';

describe('Test Helpers', () => {
  describe('ID Generation', () => {
    it('generateId should create unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(20);
    });

    it('generateId with prefix should include prefix', () => {
      const id = generateId('test');
      expect(id).toMatch(/^test_[a-z0-9]{26}$/);
    });

    it('generateTaskId should have task prefix', () => {
      const id = generateTaskId();
      expect(id).toMatch(/^task_[a-z0-9]{26}$/);
    });

    it('generateSessionId should have session prefix', () => {
      const id = generateSessionId();
      expect(id).toMatch(/^session_[a-z0-9]{26}$/);
    });

    it('generateWorkspaceId should have ws prefix', () => {
      const id = generateWorkspaceId();
      expect(id).toMatch(/^ws_[a-z0-9]{26}$/);
    });

    it('generateEventId should have evt prefix', () => {
      const id = generateEventId();
      expect(id).toMatch(/^evt_[a-z0-9]{26}$/);
    });

    it('generateCheckpointId should have cp prefix', () => {
      const id = generateCheckpointId();
      expect(id).toMatch(/^cp_[a-z0-9]{26}$/);
    });
  });

  describe('withTempDir', () => {
    it('should create and cleanup temp directory', async () => {
      let capturedPath = '';
      await withTempDir(async path => {
        capturedPath = path;
        const stats = await stat(path);
        expect(stats.isDirectory()).toBe(true);
      });

      await expect(stat(capturedPath)).rejects.toThrow();
    });

    it('should return callback result', async () => {
      const result = await withTempDir(async () => 'test-result');
      expect(result).toBe('test-result');
    });

    it('should cleanup on error', async () => {
      await expect(
        withTempDir(async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('withTempGitRepo', () => {
    it('should create git repository', async () => {
      await withTempGitRepo(async path => {
        const gitStats = await stat(join(path, '.git'));
        expect(gitStats.isDirectory()).toBe(true);
      });
    });

    it('should have initial commit', async () => {
      await withTempGitRepo(async path => {
        const result = await execa('git', ['log', '--oneline'], { cwd: path });
        expect(result.stdout).toContain('Initial commit');
      });
    });
  });

  describe('File Operations', () => {
    it('writeTestFile and readTestFile should work', async () => {
      await withTempDir(async path => {
        await writeTestFile(path, 'test.txt', 'Hello, World!');
        const content = await readTestFile(path, 'test.txt');
        expect(content).toBe('Hello, World!');
      });
    });

    it('createDirectory should create nested directories', async () => {
      await withTempDir(async path => {
        await createDirectory(path, 'nested/deep/dir');
        const { stat } = await import('node:fs/promises');
        const { join } = await import('node:path');

        const stats = await stat(join(path, 'nested/deep/dir'));
        expect(stats.isDirectory()).toBe(true);
      });
    });

    it('listFiles should find files', async () => {
      await withTempDir(async path => {
        await writeTestFile(path, 'file1.txt', 'content1');
        await writeTestFile(path, 'sub/file2.txt', 'content2');

        const files = await listFiles(path);
        expect(files).toContain('file1.txt');
        expect(files).toContain('sub/file2.txt');
      });
    });

    it('fileExists should return true for existing files', async () => {
      await withTempDir(async path => {
        await writeTestFile(path, 'exists.txt', 'content');
        expect(await fileExists(join(path, 'exists.txt'))).toBe(true);
        expect(await fileExists(join(path, 'missing.txt'))).toBe(false);
      });
    });

    it('getFileSize should return correct size', async () => {
      await withTempDir(async path => {
        await writeTestFile(path, 'test.txt', 'Hello');
        const size = await getFileSize(join(path, 'test.txt'));
        expect(size).toBe(5);
      });
    });
  });

  describe('Path Utilities', () => {
    it('normalizePath should normalize paths', () => {
      expect(normalizePath('path\\to\\file')).toBe('path/to/file');
      expect(normalizePath('path/to/file')).toBe('path/to/file');
    });

    it('isSubPath should detect subpaths', () => {
      expect(isSubPath('/base', '/base/sub/file')).toBe(true);
      expect(isSubPath('/base', '/base')).toBe(true);
      expect(isSubPath('/base', '/other')).toBe(false);
      expect(isSubPath('/base', '/base/../other')).toBe(false);
    });
  });

  describe('Command Execution', () => {
    it('runCommand should execute commands', async () => {
      const result = await runCommand('echo', ['hello']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('hello');
    });

    it('runCommand should handle errors', async () => {
      const result = await runCommand('false', []);
      expect(result.exitCode).not.toBe(0);
    });

    it('runGitCommand should work in git repo', async () => {
      await withTempGitRepo(async path => {
        const result = await runGitCommand(['status'], path);
        expect(result.exitCode).toBe(0);
      });
    });
  });

  describe('Utility Functions', () => {
    it('createMockContext should create context with defaults', () => {
      const context = createMockContext({ custom: 'value' });
      expect(context['custom']).toBe('value');
      expect(context['timestamp']).toBeDefined();
      expect(context['requestId']).toBeDefined();
    });

    it('timeout should resolve after delay', async () => {
      const start = Date.now();
      await timeout(50);
      expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    });

    it('retry should retry on failure', async () => {
      let attempts = 0;
      const result = await retry(
        async () => {
          attempts++;
          if (attempts < 3) throw new Error('Not ready');
          return 'success';
        },
        { retries: 5, delay: 10 }
      );
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('retry should throw after max retries', async () => {
      await expect(
        retry(
          async () => {
            throw new Error('Always fails');
          },
          { retries: 2, delay: 10 }
        )
      ).rejects.toThrow('Always fails');
    });

    it('deepEqual should compare objects', () => {
      expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('omit should remove keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
      expect(omit(obj, ['a', 'c'])).toEqual({ b: 2 });
    });

    it('pick should select keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('debounce should delay execution', async () => {
      let callCount = 0;
      const debounced = debounce(() => callCount++, 50);

      debounced();
      debounced();
      debounced();
      expect(callCount).toBe(0);

      await timeout(100);
      expect(callCount).toBe(1);
    });

    it('throttle should limit execution rate', async () => {
      let callCount = 0;
      const throttled = throttle(() => callCount++, 50);

      throttled();
      throttled();
      throttled();
      expect(callCount).toBe(1);

      await timeout(100);
      throttled();
      expect(callCount).toBe(2);
    });
  });

  describe('TestLogger', () => {
    let logger: TestLogger;

    beforeEach(() => {
      logger = createTestLogger();
    });

    it('should log messages at different levels', () => {
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      logger.debug('Debug message');

      expect(logger.getLogs()).toHaveLength(4);
    });

    it('should filter logs by level', () => {
      logger.info('Info 1');
      logger.warn('Warning 1');
      logger.info('Info 2');
      logger.error('Error 1');

      expect(logger.getLogsByLevel('info')).toHaveLength(2);
      expect(logger.getLogsByLevel('warn')).toHaveLength(1);
      expect(logger.getLogsByLevel('error')).toHaveLength(1);
    });

    it('should clear logs', () => {
      logger.info('Test');
      logger.clear();
      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should include context in logs', () => {
      logger.info('Test', { key: 'value' });
      const logs = logger.getLogs();
      expect(logs[0]!.context).toEqual({ key: 'value' });
    });
  });

  describe('Object Utilities', () => {
    it('deepEqual should handle nested objects', () => {
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    it('deepEqual should handle arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('omit should handle empty keys', () => {
      expect(omit({ a: 1 }, [])).toEqual({ a: 1 });
    });

    it('pick should handle empty keys', () => {
      expect(pick({ a: 1 }, [])).toEqual({});
    });

    it('omit should not mutate original', () => {
      const obj = { a: 1, b: 2 };
      omit(obj, ['b']);
      expect(obj).toEqual({ a: 1, b: 2 });
    });

    it('pick should not mutate original', () => {
      const obj = { a: 1, b: 2 };
      pick(obj, ['a']);
      expect(obj).toEqual({ a: 1, b: 2 });
    });
  });

  describe('Context Creation', () => {
    it('createMockContext should include timestamp and requestId', () => {
      const context = createMockContext();
      expect(context['timestamp']).toBeTypeOf('number');
      expect(context['requestId']).toMatch(/^req_[a-z0-9]{26}$/);
    });

    it('createMockContext should merge custom values', () => {
      const context = createMockContext({ foo: 'bar', count: 42 });
      expect(context['foo']).toBe('bar');
      expect(context['count']).toBe(42);
    });
  });

  describe('Retry with Backoff', () => {
    it('should respect backoff multiplier', async () => {
      const delays: number[] = [];
      let attempt = 0;

      await expect(
        retry(
          async () => {
            attempt++;
            if (attempt < 3) {
              const start = Date.now();
              await timeout(10);
              delays.push(Date.now() - start);
              throw new Error('Retry');
            }
            return 'success';
          },
          { retries: 5, delay: 10, backoff: 2 }
        )
      ).resolves.toBe('success');

      expect(delays.length).toBe(2);
    });
  });
});
