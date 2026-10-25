import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { DefaultResourceLoader } from '@earendil-works/pi-coding-agent';
import { colorToHex } from '@earendil-works/pi-tui';
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';

// Test-only SDK observer, executed inside the supplied global Pi.
export default function (pi: ExtensionAPI) {
  pi.registerCommand('evergreen-check', {
    description: 'Check the installed package through Pi resource discovery',
    handler: async () => {
      try {
        const expected = JSON.parse(readFileSync(process.env.EVERGREEN_EXPECTED!, 'utf8'));
        const loader = new DefaultResourceLoader({
          cwd: process.cwd(), agentDir: process.env.PI_CODING_AGENT_DIR,
          noExtensions: true, noSkills: true, noPromptTemplates: true,
          additionalThemePaths: [process.env.EVERGREEN_INVALID!],
        });
        for (let pass = 0; pass < 2; pass++) {
          await loader.reload();
          const { themes } = loader.getThemes();
          const matches = themes.filter(({ name }) => name === expected.name);
          assert.equal(matches.length, 1, 'installed theme must be discovered exactly once');
          const theme = matches[0];
          assert.equal(theme.appearance, 'dark');
          for (const [role, hex] of Object.entries(expected.colors)) {
            assert.equal(colorToHex(theme.colors[role]).toUpperCase(), hex, `resolved ${role}`);
            assert.match(theme.style('sentinel', { fg: theme.colors[role] }), /\x1b\[38;(?:2|5);/);
          }
          assert.equal(colorToHex(theme.colors.scrollbarTrack), colorToHex(theme.colors.muted));
          assert.ok(theme.fg('accent', 'sentinel').includes('sentinel'));
          assert.ok(theme.bg('userMessageBg', 'sentinel').includes('sentinel'));
          for (const name of ['missing-colors', 'unknown-token', 'unknown-field', 'invalid-color']) {
            assert.ok(!themes.some((theme) => theme.name === name), `reject invalid theme ${name}`);
          }
        }
        writeFileSync(process.env.EVERGREEN_REPORT!, JSON.stringify({ ok: true }));
      } catch (error) {
        writeFileSync(process.env.EVERGREEN_REPORT!, JSON.stringify({ ok: false, error: String(error) }));
      }
    },
  });
}
