import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const savedTheme = readFileSync(new URL('../themes/pi-nice-theme.json', import.meta.url));
const theme = JSON.parse(savedTheme);
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));

test('ships only a static dark theme', () => {
  assert.equal(theme.name, 'pi-nice-theme');
  assert.equal(theme.appearance, 'dark');
  assert.equal(pkg.name, 'pi-nice-theme');
  assert.equal(pkg.repository.url, 'https://github.com/gee666/pi-nice-theme.git');
  assert.deepEqual(pkg.pi, { themes: ['./themes/pi-nice-theme.json'] });
  assert.deepEqual(Object.keys(theme).sort(), ['appearance', 'colors', 'name']);
  assert.equal(pkg.dependencies, undefined);
  assert.equal(Object.keys(theme.colors).length, 55);
  for (const color of Object.values(theme.colors)) assert.match(color, /^#[0-9A-F]{6}$/);
});

test('preserves all 55 user-saved colors exactly', () => {
  // Snapshot of the user's saved pi-nice-theme.json, not regenerated inputs.
  assert.equal(createHash('sha256').update(JSON.stringify(theme.colors)).digest('hex'),
    '8ad3e57952d8c88207480ab29442469828f49bfe01a0653d473297595d76b118');
});

test('ships the saved JSON byte for byte', () => {
  assert.equal(createHash('sha256').update(savedTheme).digest('hex'),
    '321fe243f86460ac631fb525243ef524c803c4e8f3839dc86530bf468b49ad1d');
});
