# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/).

## [0.4.0] - 2026-11-20

### Added

- **`cosmogram_cast`.** When the user supplies only birth information, the plugin asks a chart gateway on the same machine (`POST /calculate`, default `http://127.0.0.1:8000`) for a structured chart, then passes the flattened `material` to `cosmogram_intake`. Default libraries: `iztro` for Zi Wei, `mingyu-core` for BaZi / Liu Yao / Qi Men / date selection, `opastro` for astrology, a local deck for Tarot, rule functions for Feng Shui and name analysis; a user-specified library is passed through.
- **Gateway settings.** `gatewayUrl` and `gatewayTimeoutMs`; the session tab shows the gateway address and lets you edit it.

### Changed

- The skill now starts with "where does the chart come from": pasted chart → straight to validation; birth info only → cast through the local gateway; gateway down → stop and ask the user to start it.
- The fixed no-data reply is now the gateway-aware sentence, and the seven sections must name the source library in section 1.

### Security

- Only loopback gateway URLs are accepted; anything else is refused before a request is made, with no external fallback.
- Birth fields are sent once and never echoed, cached, logged or written to disk; the tool result is rebuilt from an allow-list of `chart`, `source`, `warnings` and `disclaimer`.

## [0.3.3] - 2026-11-20

### Fixed

- The derivation layer treated two identical branches as both a clash and a combination: the pair matcher used `includes`, so `亥` paired with `亥` through `巳亥` and `寅亥`. Identical branches are now skipped and pairs are compared as exact sets, so a real `子午冲` or `寅亥合` is still reported exactly once. Two regression tests cover both directions (49 tests total).

## [0.3.2] - 2026-11-19

### Fixed

- The **命盘** tab still rendered an empty body because `conversation.view` takes a component, not a factory that returns one. The panel now registers `CosmogramPanel` directly, the same shape the host uses for its own `chat` and `language` tabs.

## [0.3.1] - 2026-11-19

### Fixed

- The **命盘** tab registered but the view body stayed empty. The panel now registers through `slots.inject` exactly like the host's own view tabs, prints its heading before the state request resolves, and wraps rendering in an error boundary that shows the failure instead of a blank area.
- Client-side render errors are appended to `cosmogram-client.log` in the profile through `/__cosmogram/api` (`log`), so a blank or broken panel can be diagnosed without browser devtools.

## [0.3.0] - 2026-11-19

### Added

- **Session tab `命盘`.** A client view in the conversation tab strip that shows the plugin's runtime state (version, enabled, tools, settings file) and edits the four settings in place: `strictness`, `coverageThreshold`, `showFacts`, `auditMode`. Saving applies immediately and persists to `cosmogram.settings.json` in the profile; **恢复默认** clears it.
- **Host route `/__cosmogram/api`.** `state`, `save` and `reset` for the tab. It is registered only when the host exposes `webServer`, so a host without the web layer still loads the plugin.

### Changed

- Settings precedence is now: defaults → bundle config → values saved from the session tab.

## [0.2.0] - 2026-11-19

### Added

- **Coverage scoring.** `cosmogram_intake` now returns a 0–100 `coverage` score and per-system `coverageBySystem`, so "how complete is this material" is a number instead of a yes/no.
- **Structural checks.** `issues` reports contradictions the keyword check cannot see: an hour pillar that disagrees with the stated clock time, four transformations without a birth-year stem, a moving line without a changed hexagram, a Qi Men board with a ju number but no yin/yang dun, a natal chart with an Ascendant but no houses, tarot cards without orientation.
- **Zero-calendar derivation.** The intake result carries a `facts` block computed from the pasted material only: BaZi ten gods, hidden stems, weighted five elements, clashes, combinations and void branches; chart aspects from longitudes, plus element and mode distribution. No calendar, no solar terms, no ephemeris, no chart casting.
- **`cosmogram_audit` tool.** A post-draft check that compares the answer with the supplied material: seven sections, absolute wording, professional boundaries for sensitive topics, and stars / palaces / stem-branches / cards / degrees that the input does not contain. It ignores negated mentions so a reader can still say what is absent.
- **Settings.** The bundle declares a configuration schema, so DSH renders an adjustable form: `strictness` (strict / balanced / lenient), `coverageThreshold`, `showFacts`, `auditMode` (off / warn / strict).
- **Readable reports.** Tool output renders a coverage bar, per-system scores, derived-fact tables and an audit table with severity.

### Changed

- The test suite grows from 30 to 47 cases, covering ten gods, void branches, aspects, coverage, structural checks and the audit.

## [0.1.1] - 2026-11-19

### Fixed

- A local-directory install is a symlink: moving or deleting the checkout makes the plugin manager fail with `Plugin metadata … ENOENT …/locale`. Both READMEs now state the risk, name the symptom, and point to the registry install as the normal path and to reinstall (not remapping) as the remedy.
- The published tarball now ships `CHANGELOG.md`.

## [0.1.0] - 2026-11-19

First release as **Cosmogram**.

### Added

- `cosmogram` skill covering 紫微斗数, 八字四柱, 六爻, 奇门遁甲, 风水, 塔罗, 星座星盘, 姓名学 and 择日, with reading order, term-to-plain-language notes, the seven-section output structure, tone rules and safety boundaries. Descriptions are bilingual so English chart requests also trigger it.
- `cosmogram_intake` tool: deterministic completeness check per system, system detection from pasted material, a hard "missing" list and a separate "can be added" list, an answer skeleton tailored to the data state, and topic-triggered boundary reminders. No chart calculation of any kind.
- Portable prompt pack in `prompts/` for non-DSH communities, including a machine-readable system/evidence spec.
- 30 dependency-free tests (intake logic, auto-detection, manifest, locale, icon, skill body, registration, spec parity).
- MIT license, English and Chinese READMEs, contributing guide and CI workflow.

### Fixed after the first review

- A complete four-pillar paste is now auto-detected even though 八字 declares a single required check.
- The answer skeleton records "根据数据特征判断" when the system came from detection, instead of claiming the user chose it.
- Optional evidence (gender, 大运, 值符值使, 罗盘度数, 主事人 …) is reported as a softer suggestion and no longer prevents the "data is sufficient" note from firing.
- `need_data` returns a two-section request instead of a ready-looking seven-section skeleton.
- The icon is a trigram inside a ring, so it no longer reads as a list, and the README description matches it.

### Changed

- Renamed from the working title `dsh-suanming` to **Cosmogram**: package `dsh-cosmogram`, skill `cosmogram`, tool `cosmogram_intake`, display title `Cosmogram` / `Cosmogram 命理解读`. A checkout directory created before the rename may still be called `suanming`.
