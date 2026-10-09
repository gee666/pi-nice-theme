# pi-nice-theme

A static Pi theme copied byte for byte from the user's `pi-nice-theme.json`, saved with the [pi-a-theme browser app](https://github.com/gee666/pi-a-theme).

All 55 saved roles are fixed hex colors in [`themes/pi-nice-theme.json`](themes/pi-nice-theme.json). The accent is `#E20368`, text is `#B6B0AA`, and the user-message background is `#624A41`. No colors are regenerated from guessed inputs. There is no extension, runtime generator, color picker, or terminal-color detection.

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

- Saved JSON SHA-256: `321fe243f86460ac631fb525243ef524c803c4e8f3839dc86530bf468b49ad1d`
- Colors SHA-256, using `JSON.stringify(theme.colors)`: `8ad3e57952d8c88207480ab29442469828f49bfe01a0653d473297595d76b118`

The file does not contain the browser's generator inputs or preview background, so those values are not inferred here.

## Test

```sh
npm test
```

Tests check the package manifest, static color format, all 55 saved colors, and the complete JSON snapshot. Requires Node.js 18 or newer for tests. Installation needs no build step or runtime dependencies.

## License

[MIT](LICENSE).
