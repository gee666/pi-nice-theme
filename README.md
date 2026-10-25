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
npm test
```

`npm test` validates the theme against the latest Pi, then checks the package manifest, all 55 saved colors, and the complete JSON snapshot. It requires Node.js 22.19 or newer for Pi 1.4.0. Use `npm run test:unit` for dependency-free snapshot tests on Node.js 18 or newer. Theme installation still needs no build step or runtime dependencies.

## Pi compatibility and validation

Only the latest stable `@earendil-works/pi-coding-agent` release is a test target. Older Pi versions are not part of the test policy. Before every release, resolve `@latest` again, rerun the checks below, and update this record with the exact version actually checked and any validation limits.

Tested against Pi 1.4.0

Validation used `@earendil-works/pi-coding-agent` 1.4.0 on Node.js 24.16.0. Automated checks cover the three package/palette snapshot tests, JavaScript syntax, and the packaged JSON through Pi's actual theme schema validator and theme loader. These are format/loading checks, not a visual check or an interactive Pi session. The saved theme JSON is unchanged.

Installation still has no runtime dependencies. Pi 1.4.0 validation needs Node.js 22.19 or newer; `npm run test:unit` needs Node.js 18 or newer and no installed dependencies.

```sh
npm test
npm run check
```

`npm test` runs the latest-Pi validation automatically before the unit tests. Both `npm test` and standalone `npm run test:pi` refresh the temporary install with `--ignore-scripts`; no manual setup is needed. Install and registry calls have timeouts and failures stop the check. The validator verifies the installed version against npm's latest release. These commands need registry access and use Pi's internal validation entry points, which may change in a later release. This static JSON package has no TypeScript source or configured linter.

## License

[MIT](LICENSE).
