import { describe, it, expect } from 'vitest';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { execa } from 'execa';
import {
  createTempRepository,
  createGitRepository,
  createTypeScriptProjectFixture,
  createNodeProjectFixture,
  createEmptyRepositoryFixture,
  createLargeRepositoryFixture,
  createBinaryFileFixture,
  COMMON_FIXTURES,
  type RepositoryStructure,
} from './repository-fixtures.js';

describe('Repository Fixtures', () => {
  describe('createTempRepository', () => {
    it('should create a temporary directory', async () => {
      const fixture = await createTempRepository();

      expect(fixture.path).toBeDefined();
      expect(typeof fixture.path).toBe('string');
      expect(fixture.path).toContain('gix-test-');
    });

    it('should create README.md by default', async () => {
      const fixture = await createTempRepository();

      const content = await readFile(join(fixture.path, 'README.md'), 'utf8');
      expect(content).toBe('# Test Repository\n');
    });

    it('should create specified files', async () => {
      const structure: RepositoryStructure = {
        files: [
          { path: 'src/main.ts', content: 'export const x = 1;' },
          { path: 'README.md', content: 'Custom README' },
        ],
      };
      const fixture = await createTempRepository(structure);

      const mainContent = await readFile(join(fixture.path, 'src/main.ts'), 'utf8');
      expect(mainContent).toBe('export const x = 1;');

      const readmeContent = await readFile(join(fixture.path, 'README.md'), 'utf8');
      expect(readmeContent).toBe('Custom README');
    });

    it('should create directories', async () => {
      const structure: RepositoryStructure = {
        directories: ['src', 'tests', 'docs'],
        files: [{ path: 'src/index.ts', content: 'export {};' }],
      };
      const fixture = await createTempRepository(structure);

      for (const dir of ['src', 'tests', 'docs']) {
        const stats = await stat(join(fixture.path, dir));
        expect(stats.isDirectory()).toBe(true);
      }

      const fileStats = await stat(join(fixture.path, 'src/index.ts'));
      expect(fileStats.isFile()).toBe(true);
    });

    it('should clean up on cleanup()', async () => {
      const fixture = await createTempRepository();
      const path = fixture.path;

      await fixture.cleanup();

      await expect(stat(path)).rejects.toThrow();
    });
  });

  describe('createGitRepository', () => {
    it('should initialize a git repository', async () => {
      const fixture = await createGitRepository();

      const gitStats = await stat(join(fixture.path, '.git'));
      expect(gitStats.isDirectory()).toBe(true);
    });

    it('should have initial commit', async () => {
      const fixture = await createGitRepository();

      const result = await execa('git', ['log', '--oneline'], { cwd: fixture.path });

      expect(result.stdout).toContain('Initial commit');
    });

    it('should have git config set', async () => {
      const fixture = await createGitRepository();

      const emailResult = await execa('git', ['config', 'user.email'], { cwd: fixture.path });
      const nameResult = await execa('git', ['config', 'user.name'], { cwd: fixture.path });

      expect(emailResult.stdout).toBe('test@example.com');
      expect(nameResult.stdout).toBe('Test User');
    });

    it('should include provided structure', async () => {
      const structure: RepositoryStructure = {
        files: [{ path: 'src/app.ts', content: 'console.log("hello");' }],
      };
      const fixture = await createGitRepository(structure);

      const content = await readFile(join(fixture.path, 'src/app.ts'), 'utf8');
      expect(content).toBe('console.log("hello");');
    });
  });

  describe('COMMON_FIXTURES', () => {
    it('should have typescript fixture', async () => {
      const fixture = await createTempRepository(COMMON_FIXTURES.typescript);

      const { readFile, stat } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const packageJson = JSON.parse(await readFile(join(fixture.path, 'package.json'), 'utf8'));
      expect(packageJson.name).toBe('test-project');

      const srcStats = await stat(join(fixture.path, 'src'));
      expect(srcStats.isDirectory()).toBe(true);
    });

    it('should have node fixture', async () => {
      const fixture = await createTempRepository(COMMON_FIXTURES.node);

      const { readFile } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const packageJson = JSON.parse(await readFile(join(fixture.path, 'package.json'), 'utf8'));
      expect(packageJson.name).toBe('test-node-project');
    });

    it('should have empty fixture', async () => {
      const fixture = await createTempRepository(COMMON_FIXTURES.empty);

      const { readFile } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const content = await readFile(join(fixture.path, 'README.md'), 'utf8');
      expect(content).toBe('# Empty Repository\n');
    });

    it('should have large fixture with many files', async () => {
      const fixture = await createTempRepository(COMMON_FIXTURES.large);

      const { readdir } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const files = await readdir(join(fixture.path, 'src'));
      expect(files.length).toBe(50);
    });

    it('should have binary fixture', async () => {
      const fixture = await createTempRepository(COMMON_FIXTURES.binary);

      const { readFile } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const content = await readFile(join(fixture.path, 'image.png'));
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('createTypeScriptProjectFixture', () => {
    it('should create a valid TypeScript project structure', () => {
      const fixture = createTypeScriptProjectFixture();

      expect(fixture.files.length).toBeGreaterThan(0);
      expect(fixture.directories).toContain('src');
      expect(fixture.directories).toContain('tests');

      const packageJsonFile = fixture.files.find(f => f.path === 'package.json');
      expect(packageJsonFile).toBeDefined();

      const packageJson = JSON.parse(packageJsonFile!.content);
      expect(packageJson.name).toBe('test-project');
      expect(packageJson.devDependencies.typescript).toBeDefined();
    });
  });

  describe('createNodeProjectFixture', () => {
    it('should create a valid Node.js project structure', () => {
      const fixture = createNodeProjectFixture();

      expect(fixture.files.length).toBeGreaterThan(0);

      const packageJsonFile = fixture.files.find(f => f.path === 'package.json');
      expect(packageJsonFile).toBeDefined();

      const packageJson = JSON.parse(packageJsonFile!.content);
      expect(packageJson.name).toBe('test-node-project');
      expect(packageJson.type).toBe('module');
    });
  });

  describe('createEmptyRepositoryFixture', () => {
    it('should create minimal repository', () => {
      const fixture = createEmptyRepositoryFixture();

      expect(fixture.files.length).toBe(1);
      expect(fixture.files[0]!.path).toBe('README.md');
      expect(fixture.files[0]!.content).toBe('# Empty Repository\n');
    });
  });

  describe('createLargeRepositoryFixture', () => {
    it('should create specified number of files', () => {
      const fixture = createLargeRepositoryFixture(25);

      expect(fixture.files.length).toBe(26); // 25 files + package.json

      const tsFiles = fixture.files.filter(f => f.path.endsWith('.ts'));
      expect(tsFiles.length).toBe(25);
    });

    it('should default to 100 files', () => {
      const fixture = createLargeRepositoryFixture();

      const tsFiles = fixture.files.filter(f => f.path.endsWith('.ts'));
      expect(tsFiles.length).toBe(100);
    });
  });

  describe('createBinaryFileFixture', () => {
    it('should create a binary file fixture', () => {
      const fixture = createBinaryFileFixture();

      expect(fixture.files.length).toBe(1);
      expect(fixture.files[0]!.path).toBe('image.png');
      expect(fixture.files[0]!.content.length).toBeGreaterThan(0);
    });
  });
});
