## Summary
- Ship the exact user-saved `pi-nice-theme` palette, not a color generator.
- Pi loads one static JSON theme through the package's `pi.themes` manifest.
- No runtime extension, dependencies, or internal Pi API use in the package.
- Tests use the global Pi CLI and exported resource-loader/theme APIs only.
- Main risks: schema/token changes, package discovery, fallbacks, and palette drift.

## Intent
Preserve the saved JSON byte for byte, including all 55 fixed hex colors,
the `pi-nice-theme` name, and dark appearance. Leave terminal background alone.
History replaced the old `trans-theme` example with the user's saved theme,
then updated that saved palette; do not regenerate colors from inferred inputs.
There is no extension, terminal-color detection, or browser generator here.

## Pi integration (public APIs)
`package.json` declares `./themes/pi-nice-theme.json` in `pi.themes`.
Users install the package, `/reload`, and select it in `/settings`.
Pi's theme schema resolves roles and omitted optional-role fallbacks.
Test-only code uses `pi.registerCommand`, `DefaultResourceLoader.reload` and
`getThemes`, theme `colors`/`appearance`/`style`/`fg`/`bg`, and `colorToHex`.
CLI tests use `install`, `list`, `remove`, and a print-mode observer command.

## Internal Pi APIs
None. Neither shipped files nor tests import private Pi modules or deep paths.
The test observer uses exported SDK APIs, not interactive-mode internals.

## Weak points
Strict schema changes can reject the palette or introduce new required roles.
Manifest/discovery changes can hide the theme; duplicate standalone copies can
collide with its name. `scrollbarTrack` is omitted and inherits `muted`.
Fixed colors intentionally do not adapt to terminal palettes or contrast needs.
Ignored stdin forces print mode on Pi 1.4.0: interactive selection, terminal
background behavior, capability negotiation, `/reload`, and `/new` are untested.
HTML export and visual contrast are also outside automated coverage.

## Tests
`npm run test:evergreen` runs unit, integration, and e2e tests in that order.
`npm run check` checks JavaScript syntax; Pi loads the TypeScript fixture.
Unit: `tests/theme.test.mjs` locks the saved bytes, all colors, and static shape.
Integration: `tests/integration.test.mjs` packs/extracts the npm artifact, checks
its manifest and exact theme bytes, and excludes executable resources.
E2E: `scripts/validate-pi.mjs` uses `$EVERGREEN_PI_BIN` or `pi` on PATH with stdin
ignored. It installs the extracted artifact, lists it, checks persisted discovery,
resolves all colors via Pi, reloads resources, checks invalid themes/fallbacks,
proves mutated accent detection, restores the palette, then removes the package.
These checks protect faithful distribution and Pi interpretation of the palette,
not merely JSON syntax. Loader reload is not the interactive `/reload` command.
`$EVERGREEN_E2E_MODEL` is forwarded to `--model`; no model calls are needed.
Tests isolate settings/sessions under `tmp/` and clean temporary runs afterward.
Test only the latest stable Pi; README records the version actually tested.

## Relevant changelog topics
Theme schema and semantic roles; optional-role defaults; concrete color/style
APIs; resource loading and package manifests; CLI install/remove and print-mode
command handling; terminal truecolor/256-color rendering; selection and reload.
