import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// Never install or substitute a second Pi runtime.
const bin = process.env.EVERGREEN_PI_BIN || 'pi';
const root = fileURLToPath(new URL('../', import.meta.url));
const version = execFileSync(bin, ['--version'], {
  encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'pipe'],
}).trim();
const readme = readFileSync(`${root}README.md`, 'utf8');
assert.ok(readme.includes(`Tested against Pi ${version}`), `Update README after testing Pi ${version}`);
mkdirSync(`${root}tmp`, { recursive: true });
const work = mkdtempSync(`${root}tmp/cli-test-`);
try {
  const agent = `${work}/agent`;
  const invalid = `${work}/invalid`;
  mkdirSync(agent);
  mkdirSync(invalid);
  writeFileSync(`${agent}/settings.json`, JSON.stringify({
    enableInstallTelemetry: false, enableAnalytics: false,
  }));
  const env = {
    ...process.env, PI_CODING_AGENT_DIR: agent, PI_OFFLINE: '1',
    EVERGREEN_EXPECTED: `${root}themes/pi-nice-theme.json`,
    EVERGREEN_INVALID: invalid, EVERGREEN_REPORT: `${work}/report.json`,
  };
  const pi = (args) => execFileSync(bin, args, {
    cwd: work, env, encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const [packed] = JSON.parse(execFileSync(process.execPath, [
    process.env.npm_execpath, 'pack', '--json', '--ignore-scripts',
    '--pack-destination', work, '--cache', `${root}tmp/npm-cache`,
  ], { cwd: root, encoding: 'utf8', timeout: 30000 }));
  execFileSync('tar', ['-xzf', `${work}/${packed.filename}`, '-C', work]);
  const source = `${work}/package`;
  const theme = JSON.parse(readFileSync(env.EVERGREEN_EXPECTED, 'utf8'));
  for (const [name, json] of Object.entries({
    'missing-colors': { ...theme, colors: {} },
    'unknown-token': { ...theme, colors: { ...theme.colors, evergreenUnknown: '#FFFFFF' } },
    'unknown-field': { ...theme, evergreenUnknown: true },
    'invalid-color': { ...theme, colors: { ...theme.colors, text: 'not-a-variable' } },
  })) writeFileSync(`${invalid}/${name}.json`, JSON.stringify({ ...json, name }));

  pi(['install', source]);
  assert.ok(pi(['list']).includes(source), 'CLI must list the installed artifact');
  const settings = JSON.parse(readFileSync(`${agent}/settings.json`, 'utf8'));
  assert.ok(settings.packages.some((entry) => resolve(agent, entry) === source), 'install must persist package discovery');
  const args = ['--print', '--offline', '--no-approve', '--no-context-files',
    '--no-extensions', '--no-skills', '--no-prompt-templates', '--no-tools',
    '-e', `${root}tests/fixtures/theme-observer.ts`,
    ...(process.env.EVERGREEN_E2E_MODEL ? ['--model', process.env.EVERGREEN_E2E_MODEL] : []),
    '/evergreen-check'];
  const check = () => {
    rmSync(env.EVERGREEN_REPORT, { force: true });
    pi(args);
    return JSON.parse(readFileSync(env.EVERGREEN_REPORT, 'utf8'));
  };
  assert.deepEqual(check(), { ok: true });
  // Change runtime input, not the expected oracle: prove color drift is detected.
  const mutated = { ...theme, colors: { ...theme.colors, accent: '#010203' } };
  writeFileSync(`${source}/themes/pi-nice-theme.json`, JSON.stringify(mutated));
  const negative = check();
  assert.equal(negative.ok, false, 'observer must detect a mutated installed palette');
  assert.match(negative.error, /resolved accent/);
  writeFileSync(`${source}/themes/pi-nice-theme.json`, readFileSync(env.EVERGREEN_EXPECTED));
  assert.deepEqual(check(), { ok: true });
  pi(['remove', source]);
  assert.ok(!pi(['list']).includes(source), 'CLI removal must remove the package');
  console.log(`Pi ${version}: packed install/list, resolved palette, rendering, reload, negative control and removal passed`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
