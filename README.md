# Cosmogram

A traditional Chinese metaphysics and divination **reading** assistant for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — and a portable prompt pack for any other LLM.

It covers nine systems: **Zi Wei Dou Shu (紫微斗数) · BaZi / Four Pillars (八字四柱) · Liu Yao (六爻) · Qi Men Dun Jia (奇门遁甲) · Feng Shui (风水) · Tarot (塔罗) · natal astrology (星座星盘) · name analysis (姓名学) · date selection (择日)**.

**English** | [中文](README.zh.md)

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](package.json)
[![tests](https://img.shields.io/badge/tests-55%20passing-brightgreen.svg)](test/)

---

## What it is

A reading assistant, not a chart generator. It interprets chart material you already obtained from a local charting tool, a screenshot, a text chart, or a third-party site. It answers in a fixed seven-section structure, says what it cannot know, and refuses to fill gaps with invented stars, hexagrams, cards, or planetary positions.

| It does | It never does |
| --- | --- |
| Read the Zi Wei, BaZi, Liu Yao, Qi Men, Feng Shui, Tarot, natal-chart, name or date-selection material you paste | Cast a chart, draw cards, toss a hexagram, or compute ephemerides |
| Tell you which elements are missing before a reading is possible | Invent a missing palace, star, four transformation (四化), stem-branch pair (干支), hexagram line (爻), card or degree |
| Keep multiple systems separate and explain their disagreements | Merge them into one authoritative verdict |
| Give probabilities, boundaries and follow-up directions | Use absolutes such as "注定 / 一定 / 必发" (destined / certainly / bound to happen) |
| Add medical, legal, investment, psychological and marriage boundaries | Replace professional advice |

## Four capabilities in the DSH bundle

1. **`cosmogram` skill** — loaded only when a reading is requested. It carries the reading contract, the seven-section output structure, the interpretation order for all nine systems, term-to-plain-language notes, tone rules and safety boundaries.
2. **`cosmogram_cast` tool** — asks a **loopback chart gateway** (default `http://127.0.0.1:8000`, `POST /calculate`) for a structured chart when the user supplies only birth information. It never casts a chart itself, refuses any non-local gateway URL before sending anything, and returns only the chart, its source library and warnings — birth fields are sent once and never echoed, logged or stored. If the gateway is down it stops and tells the user to start it, instead of falling back to a website or third-party API.
3. **`cosmogram_intake` tool** — a deterministic pre-check. Give it the pasted chart material; it returns:
   - `status: ready | need_data` and a `coverage` score (0–100) per system;
   - which minimum elements are present and which are missing;
   - structural problems the keyword check alone cannot see — an hour pillar that contradicts the stated clock time, four transformations without a birth-year stem, moving lines without a changed hexagram;
   - the exact follow-up questions to ask (never a guessed chart);
   - **derived facts the material already fixes**: BaZi ten gods, hidden stems, element weights, clashes, combinations and void branches; chart aspects and element/mode distribution — all from the pasted positions, with no calendar or ephemeris;
   - the seven-section answer skeleton;
   - boundary reminders triggered by the topic (health, legal, investment, psychology, marriage).
4. **`cosmogram_audit` tool** — the post-draft check. It compares the written answer with the supplied material and flags a missing section, absolute wording, a sensitive topic without a professional boundary, and any star, palace, stem-branch, card or degree the answer cites that the input does not contain. High-severity findings must be fixed before delivery.

The tools contain no astrology: they are checklists, lookup tables and templates, so they cannot fabricate a chart.

## Supported systems and minimum data

| System | Minimum material it needs |
| --- | --- |
| Zi Wei Dou Shu (紫微斗数) | The twelve palaces (at least the life palace and five named palaces) + three or more main stars + the birth-year four transformations (生年四化); gender and major limits (大限) make it fuller |
| BaZi / Four Pillars (八字四柱) | All four pillars, stems and branches (干支); gender, major luck cycles (大运) and the current year make it fuller |
| Liu Yao (六爻) | Primary and changed hexagram (本卦 / 变卦), moving lines (动爻), month and day stems (月建 / 日辰), or the exact casting time; the question is passed separately |
| Qi Men Dun Jia (奇门遁甲) | Yin or Yang dun and the ju number (阴阳遁 / 局数), the nine-palace board (八门 / 九星 / 八神 / 三奇六仪); the chief star and chief gate (值符 / 值使) make it fuller |
| Feng Shui (风水) | Facing direction (坐向 / 朝向) + floor-plan layout + doors and functional rooms; compass degrees make it fuller |
| Tarot (塔罗) | Spread name and position meanings + card names + upright or reversed |
| Natal astrology (星座星盘) | Planets in signs + houses (Ascendant); aspects make it fuller |
| Name analysis (姓名学) | The characters + the stroke-count authority (traditional or simplified) + three talents and five grids (三才五格) or five-element and character meaning |
| Date selection (择日) | The matter to be handled + a date window; the principal person's data makes it fuller |

`cosmogram_intake` enforces the minimums and reports "make it fuller" items separately, so an optional detail never blocks a first reading.

If only a birth time is given, the assistant says it does not cast charts, lists the minimum material above, and asks for the missing data.

## Install in DeepSeek Harness

The bundle is a dependency-free, Host-only plugin: `index.js`, a patch, locales, an icon and Markdown assets.

**From the Web GUI:** open **Plugins** → **Add plugin** → choose this directory.

**From an agent session:** call `plugin_manager` with `action: "install_bundle"` and the absolute directory of this package, then enable the `cosmogram` row if it arrives disabled.

**From the npm registry (once published):** call `plugin_manager` with `action: "install_bundle"` and `target: "dsh-cosmogram"`, or paste the package name into **Add plugin**.

A local directory install links this checkout, so edits show up after the plugin reloads. It changes the profile, so it affects every session in that profile; remove the bundle to undo it.

**A linked install breaks when the folder moves.** The plugin manager reads `locale/` and the patch from that path, so moving or deleting the checkout makes the row fail with `Plugin metadata … ENOENT …/locale`. Use the registry install for normal use; if you develop locally and move the folder, remove the bundle and install again instead of remapping it.

### Use it

```
体系：紫微斗数
数据来源：本地排盘工具
命盘：命宫在午，紫微、天相同宫；财帛宫武曲化禄；官禄宫七杀……
问题主题：事业
补充：最近想换工作，适不适合？
```

Chinese input is the common case, but English works too — the skill and the tool description are bilingual.

The assistant calls `cosmogram_intake`, asks for anything missing, then answers in:

1. System and data source (当前使用的体系与数据来源)
2. Key points (关键信息摘要)
3. Core judgment (核心判断)
4. Main evidence (主要依据)
5. Uncertain or missing information (不确定或需要补充的信息)
6. Actionable suggestions (可执行建议)
7. Follow-up questions (可继续追问的问题)

When no chart material is supplied at all, it replies with the fixed request:

> 请提供具体命盘、卦象、牌阵或星盘信息。如果暂时没有，可以发出生时间、性别、出生地、问题主题，以及你希望使用的体系。

In English: *"Please provide the chart, hexagram, spread or natal-chart material. If you do not have it yet, send your birth time, gender, birthplace, the topic you want to ask about, and the system you prefer."*

## Outside DeepSeek Harness

`prompts/` keeps the same contract usable anywhere:

- `prompts/cosmogram.prompt.md` — paste as system prompt / custom instructions / Project instructions in ChatGPT, Claude, Gemini, DeepSeek, Qwen, Kimi or a local model;
- `prompts/cosmogram.spec.json` — machine-readable list of the nine systems and their minimum evidence, if you want to build your own validator;
- `prompts/README.md` — usage notes and the difference from the DSH bundle.

## Safety and scope

Everything here is **traditional-culture and entertainment reference**, not prediction and not professional advice. The skill and the intake tool enforce:

- no absolutes and no fear-based framing;
- explicit medical, legal, investment, psychological and marriage boundaries;
- no reading of an absent third party's private details;
- no paid "remedy", "blessing" or "luck-changing" upsell.

Tarot, astrology and the Chinese systems disagree by design. When they do, the assistant explains each view separately instead of flattening them into one claim.

## Development

```sh
npm test        # node --test, no dependencies
npm run check   # syntax check of every runtime module
```

```
index.js              plugin entry: registers skill + both tools, applies settings
client.js             Client half: the 命盘 session tab
lib/intake.js         validation, coverage, structural checks, scaffold
lib/derive.js         zero-calendar derivation (BaZi, chart aspects)
lib/audit.js          post-draft check against the supplied material
lib/data.js           reference tables (stems, branches, aspects, vocabularies)
lib/gateway.js        loopback chart-gateway client (privacy allow-list)
lib/config.js         settings schema rendered by DSH
lib/settings.js       runtime settings store
lib/store.js          settings file persistence for the tab
lib/routes.js         /__cosmogram/api (state / save / reset)
lib/tool.js           cosmogram_intake and cosmogram_audit definitions
lib/skill.js          cosmogram skill registration
assets/cosmogram.md   skill body (the reading contract)
references/           per-system guide, output examples, safety rules
prompts/              portable prompt pack for other communities
test/                 55 tests: intake, coverage, derivation, audit, gateway, manifest
cordis.patch.yml      bundle patch
locale/{en,zh}.json   Plugin Manager title/description
icon.svg              original artwork (three-line trigram inside a ring)
```

### Settings

The bundle declares a configuration schema, so DSH renders a settings form for it (Plugins → the plugin's configuration, or Settings → plugin configuration on hosts that still have it):

| Setting | Default | Effect |
| --- | --- | --- |
| `strictness` | `balanced` | `strict` requires every minimum element; `balanced` allows a limited reading with the gaps stated; `lenient` allows a reading once coverage reaches the threshold. |
| `coverageThreshold` | `60` | Coverage line for `lenient`, 0–100. |
| `showFacts` | `true` | Attach derived facts to the intake result. Turn off to save tokens. |
| `auditMode` | `warn` | `off` reports nothing, `warn` reports findings, `strict` treats high-severity findings as a failed check. |
| `gatewayUrl` | `http://127.0.0.1:8000` | Local chart gateway. Non-loopback addresses are refused before any request. |
| `gatewayTimeoutMs` | `10000` | Gateway timeout in milliseconds. |

### Local chart gateway

When the user gives only birth information, the plugin asks a gateway on the same machine for a structured chart:

```
POST /calculate
{ "system": "ziwei", "birthDate": "1995-08-16", "birthTime": "14:30",
  "gender": "female", "location": "北京", "calendar": "solar",
  "useTrueSolarTime": false, "question": "事业" }
```

The default library per system is: Zi Wei `iztro`; BaZi, Liu Yao, Qi Men and date selection `mingyu-core`; astrology `opastro`; Tarot a local deck; Feng Shui and name analysis rule functions. A user-specified library is passed through as `library`.

Privacy and failure rules:

- only `127.0.0.1` / `localhost` / `::1` is accepted; any other host is rejected locally;
- no external site, commercial app or cloud API is ever used as a fallback;
- birth fields are not written to disk, not cached and not included in the tool result;
- if the gateway is unreachable, the tool returns the fixed reply asking the user to start it, and the reading stops there.

### Session tab

The plugin also adds a **命盘** tab beside the conversation. It shows the running version, the two registered tools, the settings file path, and the same four settings as editable controls. **保存设置** applies immediately and persists to `cosmogram.settings.json` in the profile; **恢复默认** clears it. Settings resolve as defaults → bundle config → values saved from this tab.

The tab lives in the Client half, so installing or updating the bundle needs a page refresh (or an app restart) before it appears.

### Adding a system

Add one entry to `SYSTEM_SPECS` in `lib/intake.js` with its minimum evidence checks, mirror it in `prompts/cosmogram.spec.json`, document it in `references/systems.md` and the two READMEs. The parity test fails until the spec file matches, which keeps the docs and the validator in sync.

## Community

Issues and pull requests are welcome. Please keep the two non-negotiables: **no chart calculation in code**, and **no absolutes or fear framing in prompts**. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Publishing it to a wider community

The package is publish-ready: MIT license, zero runtime dependencies, `files` lists every shipped resource, and Plugin Manager metadata comes from `locale/`.

1. If the npm name is taken, rename it in `package.json` (and in the `cordis.patch.yml` row and the profile dependency).
2. Publish to the public registry: `npm publish --registry=https://registry.npmjs.org`. Only scoped names (`@you/...`) need `--access public`.
3. Add topics such as `dsh-plugin`, `deepseek-harness`, `chinese-metaphysics`, `tarot`, `bazi` to the repository.

A registry install resolves the same manifest, so the icon, title and description need no extra hosting.

## License

[MIT](LICENSE). Fork it, translate it, ship it — keep the boundary rules intact.
