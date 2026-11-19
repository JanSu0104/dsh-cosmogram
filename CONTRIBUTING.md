# Contributing

Thanks for helping. This project is deliberately small: a reading contract, a deterministic intake checker, and the packaging that makes them usable in DeepSeek Harness and elsewhere.

## Non-negotiable rules

1. **No chart calculation in code.** Do not add ephemerides, GanZhi conversion, star placement, hexagram casting, card drawing or Qi Men layout. The assistant interprets supplied material only.
2. **No absolutes or fear framing in prompts.** No "注定 / 一定 / 必发", no "不做某事就会出事", no paid-remedy upsell.
3. **Keep the bundle dependency-free.** `index.js` and `lib/` may import Node built-ins only. This is what makes local directory install and broad portability predictable.

## Development

```sh
npm test
npm run check
```

Tests use `node:test` and need no install step. They run on Node 20 and 22 in CI.

## Adding a system

1. Add an entry to `SYSTEM_SPECS` in `lib/intake.js`: `id`, `label`, `en`, `aliases`, `required` (each with `key`, `label`, `question`, `check`), `recommended` (same shape; reported as optional suggestions), `optional`, `scope`.
2. Mirror it in `prompts/cosmogram.spec.json` — the parity test fails until the labels match.
3. Document it in `references/systems.md` with the five fixed blocks: minimum data, reading order, term-to-plain-language, can/cannot answer, follow-up directions.
4. Update the minimum-data table in `README.md` and `README.zh.md`.
5. Add at least one ready-path and one missing-data test in `test/intake.test.js`.

## Changing prompts

Keep the seven-section structure stable; downstream users and tools rely on it. If a boundary sentence changes, update it in `assets/cosmogram.md`, `references/output-and-safety.md`, `prompts/cosmogram.prompt.md` and the READMEs together.

## Translations

`locale/` accepts additional locales (`ja.json`, `ko.json`, …). Each file needs `meta.title` and `meta.description`; other locales fall back to English. Prompt translations belong in `prompts/`, not in the code.

## Pull requests

- Explain the user-visible change in one or two sentences.
- Include tests for logic changes.
- Do not reformat unrelated files.
