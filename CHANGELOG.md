# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/).

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
