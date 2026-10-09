import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const theme = JSON.parse(readFileSync(new URL('../themes/trans-theme.json', import.meta.url)));
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));

test('ships only a static dark theme', () => {
  assert.equal(theme.name, 'trans-theme');
  assert.equal(theme.appearance, 'dark');
  assert.deepEqual(pkg.pi, { themes: ['./themes/trans-theme.json'] });
  assert.equal(pkg.dependencies, undefined);
  assert.equal(Object.keys(theme.colors).length, 55);
  for (const color of Object.values(theme.colors)) assert.match(color, /^#[0-9A-F]{6}$/);
});

test('preserves every generated README example color', () => {
  // Snapshot of deriveTheme('#CD9D8A', '#CC397B').colors at the source commit in README.
  assert.equal(createHash('sha256').update(JSON.stringify(theme.colors)).digest('hex'),
    '8a7709df3f2c8f137f729d0070dc3f5d63d4b3df9be3f1b4195af6c1afc81add');
});
