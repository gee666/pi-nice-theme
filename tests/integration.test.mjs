import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('published artifact exposes the exact saved theme without executable resources', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  mkdirSync(`${root}tmp`, { recursive: true });
  const work = mkdtempSync(`${root}tmp/pack-test-`);
  try {
    const [packed] = JSON.parse(execFileSync(process.execPath, [
      process.env.npm_execpath, 'pack', '--json', '--ignore-scripts',
      '--pack-destination', work, '--cache', `${root}tmp/npm-cache`,
    ], { cwd: root, encoding: 'utf8', timeout: 30000 }));
    assert.deepEqual(packed.files.map(({ path }) => path).sort(), [
      'LICENSE', 'README.md', 'package.json', 'themes/pi-nice-theme.json',
    ]);
    execFileSync('tar', ['-xzf', `${work}/${packed.filename}`, '-C', work]);
    const manifest = JSON.parse(readFileSync(`${work}/package/package.json`, 'utf8'));
    assert.deepEqual(manifest.pi, { themes: ['./themes/pi-nice-theme.json'] });
    for (const path of manifest.pi.themes) {
      assert.deepEqual(readFileSync(`${work}/package/${path}`), readFileSync(`${root}${path}`));
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});
