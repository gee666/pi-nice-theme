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
EVERGREEN_PI_BIN=/absolute/path/to/pi npm run test:evergreen
npm run check
```

`npm run test:evergreen` runs unit, integration, and e2e tests; `npm test` also runs all three. Unit tests protect the exact saved bytes and all 55 colors. Integration tests pack and extract the real npm artifact, checking its resource declaration and excluding executable resources. E2E tests require `tar` and the globally installed Pi: `$EVERGREEN_PI_BIN`, or `pi` on PATH. A missing executable fails rather than skips. Use `npm run test:unit` and `npm run test:integration` for Pi-independent checks on Node.js 18 or newer. Theme installation still needs no build step or runtime dependencies.

## Pi compatibility and validation

Only the latest stable `@earendil-works/pi-coding-agent` release is a test target. Older Pi versions are not part of the test policy. Before every release, resolve `@latest` again, rerun the checks below, and update this record with the exact version actually checked and any validation limits.

Tested against Pi 1.4.0

Validation used the supplied global Pi 1.4.0 executable on Node.js 26.7.0. `npm run test:e2e` (also `test:pi`) installs the extracted npm artifact into an isolated agent directory, verifies CLI listing and persisted discovery, and removes it afterward. A test-only command uses Pi's exported `DefaultResourceLoader` to check all 55 resolved colors, dark appearance, ANSI styling, the omitted `scrollbarTrack` fallback, invalid-theme rejection, and repeat resource loading. A mutated-palette negative control proves that runtime color drift is detected, then the restored artifact is checked again. No Pi runtime is installed or downloaded, and no private Pi modules are imported.

Pi always runs with stdin ignored. Pi 1.4.0 therefore selects print mode, so these tests do not exercise interactive selection, `/reload`, `/new`, terminal-background preservation, truecolor capability negotiation, visual contrast, or HTML exports. Resource-loader reload is not an interactive `/reload` test.

Tests use isolated agent directories under ignored `tmp/`, offline startup, and no model requests or credentials. `$EVERGREEN_E2E_MODEL` is passed to Pi's `--model` when supplied; no paid calls are needed for a static theme. Temporary session data is removed after each run. The saved theme JSON is unchanged.

No build, TypeScript application type check, or linter is configured; `npm run check` checks JavaScript syntax. The test-only TypeScript observer is loaded by Pi itself. The validator checks the installed CLI version against this README's tested-version record; the maintenance environment is responsible for supplying the latest release. See [EVERGREEN.md](EVERGREEN.md) for the maintenance map.

## License

[MIT](LICENSE).
