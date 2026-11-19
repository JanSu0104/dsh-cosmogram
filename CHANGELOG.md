# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/).

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
