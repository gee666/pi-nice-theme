# pi-nice-theme

A static Pi theme copied byte for byte from the user's `pi-nice-theme.json`, saved with the [pi-a-theme browser app](https://github.com/gee666/pi-a-theme).

All 55 saved roles are fixed hex colors in [`themes/pi-nice-theme.json`](themes/pi-nice-theme.json). The accent is `#CC397B`, text is `#BFAFA1`, and the user-message background is `#89462A`. No colors are regenerated from guessed inputs. There is no extension, runtime generator, color picker, or terminal-color detection.

The theme has dark appearance and leaves the terminal background unchanged. Optional roles omitted from the saved JSON use Pi's standard fallbacks.

## Install

```sh
pi install https://github.com/gee666/pi-nice-theme.git
```

Run `/reload`, then select `pi-nice-theme` in `/settings`.

## Migrate from trans-theme

This repository was renamed from `gee666/pi-trans-theme`. Its history is unchanged; a normal commit replaces the previous README-example palette with the saved theme.

Replace the old package source in your Pi settings with `https://github.com/gee666/pi-nice-theme.git`, then install that source. Alternatively, use the CLI:

```sh
pi remove https://github.com/gee666/pi-trans-theme.git
pi install https://github.com/gee666/pi-nice-theme.git
```

Run `/reload` and select `pi-nice-theme`. The old `trans-theme` name is no longer shipped. Windows and WSL have separate package caches, so install the new source on both if you use both.

If you already have a standalone `pi-nice-theme.json` in your Pi themes folder, keep a backup outside the loaded themes directories before using the package. Loading both copies creates a duplicate theme name. Saved a-theme settings and other themes can be kept; this package does not read them. Remove the old a-theme extension package separately if it is still installed.

## Saved palette verification

The packaged JSON matches the saved file exactly, including its name, dark appearance, and all colors.

- Saved JSON SHA-256: `d798f496afa6cf74d80272eca8b4a457b831b34557278838a872459be4978992`
- Colors SHA-256, using `JSON.stringify(theme.colors)`: `aa75673b1465b11ecc4e82c8af1074580d56eece17f40815e7d95346598227c9`

The file does not contain the browser's generator inputs or preview background, so those values are not inferred here.

## Test

```sh
PI_EVERGREEN_PI_BIN=/absolute/path/to/pi npm test
npm run check
```

`npm test` exercises the installed global Pi CLI, then checks the package manifest, tarball contents, all 55 saved colors, and the complete JSON snapshot. CLI tests require Python 3 and a POSIX PTY; they fail rather than skip when the supplied executable is missing. Use `npm run test:unit` for Pi-independent snapshot and packaging tests on Node.js 18 or newer. Theme installation still needs no build step or runtime dependencies.

## Pi compatibility and validation

Only the latest stable `@earendil-works/pi-coding-agent` release is a test target. Older Pi versions are not part of the test policy. Before every release, resolve `@latest` again, rerun the checks below, and update this record with the exact version actually checked and any validation limits.

Tested against Pi 1.4.0

Validation used the supplied global Pi 1.4.0 executable on Node.js 26.7.0. `npm run test:e2e` (also `test:pi`, run automatically before `npm test`) explicitly loads this local package and a test-only observer into real interactive Pi sessions. No Pi runtime is installed or downloaded, and no private Pi modules are imported.

The CLI suite checks explicit and settings-configured local package discovery, initial theme selection overriding a saved light theme without overwriting that setting, all 55 resolved colors, truecolor and 256-color rendering (including settings taking precedence over conflicting `PI_TRUE_COLOR` values in both directions), the omitted `scrollbarTrack` fallback, invalid-theme rejection, failed-selection recovery, switching themes, `/reload`, and `/new`. It runs regular and fullscreen terminal modes; a test-only themed status ensures the saved accent reaches actual terminal output even without a startup header. A mutated-palette negative control proves the observer detects incorrect runtime colors. The suite also checks that Pi does not set or reset the terminal's default background. It does not visually assess contrast, test HTML exports, or emulate every terminal.

Tests use isolated agent directories under ignored `tmp/`, offline startup, and no model requests or credentials. Provider/model/reasoning options honor `PI_EVERGREEN_E2E_PROVIDER`, `PI_EVERGREEN_E2E_MODEL`, and `PI_EVERGREEN_E2E_REASONING` (defaults: `openai`, `gpt-6-luna`, `medium`); no paid calls are necessary for a static theme. Temporary session data is removed after each run. The saved theme JSON is unchanged.

No build, TypeScript application type check, or linter is configured; `npm run check` checks JavaScript and Python syntax. The test-only TypeScript observer is loaded by Pi itself. The validator checks the installed CLI version against this README's tested-version record; the maintenance environment is responsible for supplying the latest release.

## License

[MIT](LICENSE).
