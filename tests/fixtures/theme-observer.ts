import assert from 'node:assert/strict';
import { appendFileSync, readFileSync } from 'node:fs';
import { colorToHex } from '@earendil-works/pi-tui';
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';

// Loaded only by the CLI regression harness, never included in the package.
export default function (pi: ExtensionAPI) {
  const config = JSON.parse(readFileSync(process.env.EVERGREEN_THEME_CONFIG!, 'utf8'));
  const report = (value: object) => appendFileSync(process.env.EVERGREEN_THEME_REPORT!, `${JSON.stringify(value)}\n`);
  pi.on('session_start', () => { report({ kind: 'start' }); });
  pi.registerCommand('evergreen-check', {
    description: 'Assert the actual active CLI theme through public UI APIs',
    handler: async (label, ctx) => {
      try {
        assert.equal(ctx.mode, 'tui');
        if (label === 'startup') {
          const settings = JSON.parse(readFileSync(`${process.env.PI_CODING_AGENT_DIR}/settings.json`, 'utf8'));
          assert.equal(settings.theme, 'light', '--use-theme must not overwrite the saved selection');
        }
        const entries = ctx.ui.getAllThemes().filter(({ name }) => name === config.expected.name);
        assert.equal(entries.length, 1, 'package theme must be discovered exactly once');
        assert.equal(ctx.ui.theme.name, config.expected.name, 'CLI selection must win over saved light theme');
        assert.equal(ctx.ui.theme.appearance, 'dark');
        const loaded = ctx.ui.getTheme(config.expected.name)!;
        assert.ok(loaded, 'package theme must load');
        for (const [role, hex] of Object.entries(config.expected.colors)) {
          assert.equal(colorToHex(ctx.ui.theme.colors[role]).toUpperCase(), hex, `active ${role}`);
          assert.equal(colorToHex(loaded.colors[role]).toUpperCase(), hex, `loaded ${role}`);
          const rendered = ctx.ui.theme.style('sentinel', { fg: ctx.ui.theme.colors[role] });
          if (process.env.EVERGREEN_EXPECT_TRUE_COLOR === '1') {
            const rgb = (hex as string).slice(1).match(/../g)!.map((v) => parseInt(v, 16));
            assert.ok(rendered.includes(`\x1b[38;2;${rgb.join(';')}m`), `truecolor rendering ${role}`);
          } else assert.match(rendered, /\x1b\[38;5;\d+m/, `256-color rendering ${role}`);
        }
        // scrollbarTrack is the only optional role omitted by this saved palette.
        assert.equal(colorToHex(loaded.colors.scrollbarTrack), colorToHex(loaded.colors.muted));
        assert.ok(ctx.ui.theme.fg('text', 'sentinel').includes('sentinel'));
        assert.ok(ctx.ui.theme.bg('userMessageBg', 'sentinel').includes('sentinel'));
        for (const name of ['missing-colors', 'unknown-token', 'unknown-field', 'invalid-color']) {
          assert.equal(ctx.ui.getTheme(name), undefined, `reject invalid theme ${name}`);
        }
        const before = ctx.ui.theme;
        assert.equal(ctx.ui.setTheme('evergreen-does-not-exist').success, false);
        assert.equal(ctx.ui.theme, before, 'failed selection must preserve active theme');
        assert.equal(ctx.ui.setTheme('light').success, true);
        assert.equal(ctx.ui.theme.name, 'light');
        assert.equal(ctx.ui.setTheme(config.expected.name).success, true);
        assert.equal(ctx.ui.theme.name, config.expected.name);
        ctx.ui.setStatus('evergreen-palette', ctx.ui.theme.fg('accent', 'evergreen-palette'));
        report({ kind: 'check', label, ok: true });
      } catch (error) {
        report({ kind: 'check', label, ok: false, error: String(error) });
      }
    },
  });
  pi.registerCommand('evergreen-exit', {
    description: 'Stop the isolated regression session without a model call',
    handler: async (_args, ctx) => { ctx.shutdown(); },
  });
}
