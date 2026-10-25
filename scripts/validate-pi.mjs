import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Exercise the supplied runtime, never install or substitute a second Pi.
const bin = process.env.PI_EVERGREEN_PI_BIN;
assert.ok(bin, 'PI_EVERGREEN_PI_BIN must point to the installed global Pi executable');
const root = fileURLToPath(new URL('../', import.meta.url));
const version = execFileSync(bin, ['--version'], { encoding: 'utf8', timeout: 30000 }).trim();
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
assert.ok(readme.includes(`Tested against Pi ${version}`), `Update README after testing Pi ${version}`);
mkdirSync(new URL('../tmp/', import.meta.url), { recursive: true });
const work = mkdtempSync(fileURLToPath(new URL('../tmp/cli-test-', import.meta.url)));
try {
  const theme = JSON.parse(readFileSync(new URL('../themes/pi-nice-theme.json', import.meta.url)));
  const invalid = `${work}/invalid`;
  mkdirSync(invalid);
  for (const [name, json] of Object.entries({
    'missing-colors': { ...theme, colors: {} },
    'unknown-token': { ...theme, colors: { ...theme.colors, evergreenUnknown: '#FFFFFF' } },
    'unknown-field': { ...theme, evergreenUnknown: true },
    'invalid-color': { ...theme, colors: { ...theme.colors, text: 'not-a-variable' } },
  })) writeFileSync(`${invalid}/${name}.json`, JSON.stringify({ ...json, name }));

  const config = {
    bin, root, work, invalid, expected: theme,
    observer: `${root}tests/fixtures/theme-observer.ts`,
    provider: process.env.PI_EVERGREEN_E2E_PROVIDER || 'openai',
    model: process.env.PI_EVERGREEN_E2E_MODEL || 'gpt-6-luna',
    reasoning: process.env.PI_EVERGREEN_E2E_REASONING || 'medium',
  };
  writeFileSync(`${work}/config.json`, JSON.stringify(config));
  execFileSync('python3', [`${root}tests/cli-driver.py`, `${work}/config.json`], {
    stdio: 'inherit', timeout: 180000,
  });
  console.log(`Pi ${version}: real CLI theme discovery, rendering, validation and lifecycle passed`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
