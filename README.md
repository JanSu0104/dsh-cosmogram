# Cosmogram · 命理解读助手

A traditional Chinese metaphysics and divination reading assistant for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — and a portable prompt pack for any other LLM.

It covers **紫微斗数 / 八字四柱 / 六爻 / 奇门遁甲 / 风水 / 塔罗 / 星座星盘 / 姓名学 / 择日**.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](package.json)
[![tests](https://img.shields.io/badge/tests-30%20passing-brightgreen.svg)](test/)

> 中文说明见 [README.zh.md](README.zh.md)。

---

## What it is

A **reading** assistant, not a chart generator. It interprets chart material you already obtained from a local charting tool, a screenshot, a text chart, or a third-party site. It answers in a fixed seven-section structure, says what it cannot know, and refuses to fill gaps with invented stars, hexagrams, cards, or planetary positions.

| It does | It never does |
| --- | --- |
| Read the Zi Wei, BaZi, Liu Yao, Qi Men, Feng Shui, Tarot, natal-chart, name or date-selection material you paste | Cast a chart, draw cards, toss a hexagram, or compute ephemerides |
| Tell you which elements are missing before a reading is possible | Invent a missing palace, star, 四化, 干支, 爻, card or degree |
| Keep multiple systems separate and explain their disagreements | Merge them into one authoritative verdict |
| Give probabilities, boundaries and follow-up directions | Use "注定 / 一定 / 必发" style absolutes |
| Add medical, legal, investment, psychological and marriage boundaries | Replace professional advice |

## Two capabilities in the DSH bundle

1. **`cosmogram` skill** — loaded only when a reading is requested. It carries the reading contract, the seven-section output structure, the interpretation order for all nine systems, term-to-plain-language notes, tone rules and safety boundaries.
2. **`cosmogram_intake` tool** — a deterministic pre-check. Give it the pasted chart material; it returns:
   - `status: ready | need_data`;
   - which minimum elements are present and which are missing;
   - the exact follow-up questions to ask (never a guessed chart);
   - the seven-section answer skeleton;
   - boundary reminders triggered by the topic (health, legal, investment, psychology, marriage).

The tool contains no astrology: it is a checklist plus template builder, so it cannot fabricate.

## Supported systems and minimum data

| System | Minimum material it needs |
| --- | --- |
| 紫微斗数 | 十二宫 (at least 命宫 and five named palaces) + 3+ main stars + 生年四化; gender and 大限 make it fuller |
| 八字四柱 | all four pillars (干支); gender, 大运 and current year make it fuller |
| 六爻 | 本卦 and 变卦, 动爻, 月建/日辰 (or exact casting time); the question is passed separately |
| 奇门遁甲 | 阴阳遁 + 局数, 九宫盘 (八门/九星/八神/三奇六仪); 值符/值使 make it fuller |
| 风水 | 坐向/朝向 + 户型 layout + doors and functional rooms; compass degrees make it fuller |
| 塔罗 | spread name and position meanings + card names + upright/reversed |
| 星座星盘 | planets in signs + houses (Ascendant); aspects make it fuller |
| 姓名学 | name characters + stroke-count authority (traditional/simplified) + 三才五格 or 五行/字义 |
| 择日 | the matter + a date window; the principal person's info makes it fuller |

`cosmogram_intake` enforces the minimums and reports "make it fuller" items separately, so an optional detail never blocks a first reading.

If only a birth time is given, the assistant says it does not cast charts, lists the minimum material above, and asks for the missing data.

## Install in DeepSeek Harness

The bundle is a dependency-free Host-only plugin: `index.js`, a patch, locales, an icon and Markdown assets.

**From the Web GUI:** open **Plugins** → **Add plugin** → choose this directory.

**From an agent session:** call `plugin_manager` with `action: "install_bundle"` and the absolute directory of this package, then enable the `cosmogram` row if it arrives disabled.

A local directory install links this checkout, so edits show up after the plugin reloads. It changes the profile, so it affects every session in that profile; remove the bundle to undo it.

### Use it

```
体系：紫微斗数
数据来源：本地排盘工具
命盘：命宫在午，紫微、天相同宫；财帛宫武曲化禄；官禄宫七杀……
问题主题：事业
补充：最近想换工作，适不适合？
```

The assistant calls `cosmogram_intake`, asks for anything missing, then answers in:

1. 当前使用的体系与数据来源
2. 关键信息摘要
3. 核心判断
4. 主要依据
5. 不确定或需要补充的信息
6. 可执行建议
7. 可继续追问的问题

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
index.js              plugin entry: registers skill + tool
lib/intake.js         dependency-free validation, detection, scaffold
lib/tool.js           cosmogram_intake tool definition
lib/skill.js          cosmogram skill registration
assets/cosmogram.md    skill body (the reading contract)
references/           per-system guide, output examples, safety rules
prompts/              portable prompt pack for other communities
test/                 30 tests: intake logic, manifest, registration
cordis.patch.yml      bundle patch
locale/{en,zh}.json   Plugin Manager title/description
icon.svg              original artwork (three-line trigram inside a ring)
```

### Adding a system

Add one entry to `SYSTEM_SPECS` in `lib/intake.js` with its minimum evidence checks, mirror it in `prompts/cosmogram.spec.json`, document it in `references/systems.md` and the two READMEs. The parity test fails until the spec file matches, which keeps the docs and the validator in sync.

## Community

Issues and pull requests are welcome. Please keep the two non-negotiables: **no chart calculation in code**, and **no absolutes or fear framing in prompts**. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Publishing it to a wider community

The package is publish-ready: MIT license, zero runtime dependencies, `files` lists every shipped resource, and Plugin Manager metadata comes from `locale/`.

1. If the npm name is taken, rename it in `package.json` (and in the `cordis.patch.yml` row and the profile dependency).
2. `npm publish --access public`, or publish `prompts/` alone as a portable prompt repository.
3. Add topics such as `dsh-plugin`, `deepseek-harness`, `chinese-metaphysics`, `tarot`, `bazi` to the repository.

A registry install resolves the same manifest, so the icon, title and description need no extra hosting.

## License

[MIT](LICENSE). Fork it, translate it, ship it — keep the boundary rules intact.
