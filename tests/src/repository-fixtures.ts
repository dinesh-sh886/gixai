import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface RepositoryFixture {
  path: string;
  cleanup: () => Promise<void>;
}

export interface FileFixture {
  path: string;
  content: string;
}

export interface RepositoryStructure {
  files: FileFixture[];
  directories?: string[];
}

export async function createTempRepository(
  structure: RepositoryStructure = { files: [] }
): Promise<RepositoryFixture> {
  const basePath = await mkdtemp(join(tmpdir(), 'gix-test-'));

  for (const dir of structure.directories ?? []) {
    await mkdir(join(basePath, dir), { recursive: true });
  }

  for (const file of structure.files) {
    const filePath = join(basePath, file.path);
    await mkdir(join(filePath, '..'), { recursive: true });
    await writeFile(filePath, file.content, 'utf8');
  }

  if (structure.files.length === 0) {
    await writeFile(join(basePath, 'README.md'), '# Test Repository\n', 'utf8');
  }

  return {
    path: basePath,
    cleanup: async () => {
      await rm(basePath, { recursive: true, force: true });
    },
  };
}

export async function createGitRepository(
  structure: RepositoryStructure = { files: [] }
): Promise<RepositoryFixture> {
  const repo = await createTempRepository(structure);
  const { execa } = await import('execa');

  await execa('git', ['init'], { cwd: repo.path });
  await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: repo.path });
  await execa('git', ['config', 'user.name', 'Test User'], { cwd: repo.path });
  await execa('git', ['add', '.'], { cwd: repo.path });
  await execa('git', ['commit', '-m', 'Initial commit'], { cwd: repo.path });

  return repo;
}

export function createTypeScriptProjectFixture(): RepositoryStructure {
  return {
    directories: ['src', 'tests'],
    files: [
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'test-project',
            version: '1.0.0',
            type: 'module',
            scripts: {
              build: 'tsc',
              test: 'vitest run',
            },
            devDependencies: {
              typescript: '^5.0.0',
              vitest: '^2.0.0',
            },
          },
          null,
          2
        ),
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify(
          {
            extends: './tsconfig.base.json',
            compilerOptions: {
              outDir: './dist',
              rootDir: './src',
            },
            include: ['src/**/*'],
          },
          null,
          2
        ),
      },
      {
        path: 'src/index.ts',
        content: "export function hello(): string {\n  return 'Hello, World!';\n}\n",
      },
      {
        path: 'tests/index.test.ts',
        content:
          "import { describe, it, expect } from 'vitest';\nimport { hello } from '../src/index';\n\ndescribe('hello', () => {\n  it('returns greeting', () => {\n    expect(hello()).toBe('Hello, World!');\n  });\n});\n",
      },
    ],
  };
}

export function createNodeProjectFixture(): RepositoryStructure {
  return {
    files: [
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'test-node-project',
            version: '1.0.0',
            type: 'module',
            main: 'index.js',
            scripts: {
              test: 'vitest run',
            },
            devDependencies: {
              vitest: '^2.0.0',
            },
          },
          null,
          2
        ),
      },
      {
        path: 'index.js',
        content: 'export function add(a: number, b: number): number {\n  return a + b;\n}\n',
      },
    ],
  };
}

export function createEmptyRepositoryFixture(): RepositoryStructure {
  return {
    files: [
      {
        path: 'README.md',
        content: '# Empty Repository\n',
      },
    ],
  };
}

export function createLargeRepositoryFixture(fileCount: number = 100): RepositoryStructure {
  const files: FileFixture[] = [];

  for (let i = 0; i < fileCount; i++) {
    files.push({
      path: `src/file${i}.ts`,
      content: `// File ${i}\nexport const value${i} = ${i};\n`,
    });
  }

  files.push({
    path: 'package.json',
    content: JSON.stringify(
      {
        name: 'large-project',
        version: '1.0.0',
      },
      null,
      2
    ),
  });

  return { files };
}

export function createBinaryFileFixture(): RepositoryStructure {
  const binaryContent = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return {
    files: [
      {
        path: 'image.png',
        content: binaryContent.toString('binary'),
      },
    ],
  };
}

export function createSymlinkFixture(): RepositoryStructure {
  return {
    files: [
      {
        path: 'real-file.txt',
        content: 'Real content',
      },
    ],
    directories: ['symlinks'],
  };
}

export const COMMON_FIXTURES = {
  typescript: createTypeScriptProjectFixture(),
  node: createNodeProjectFixture(),
  empty: createEmptyRepositoryFixture(),
  large: createLargeRepositoryFixture(50),
  binary: createBinaryFileFixture(),
} as const;
