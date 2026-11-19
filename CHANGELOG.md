# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-11-19

### Added

- `suanming` skill covering 紫微斗数, 八字四柱, 六爻, 奇门遁甲, 风水, 塔罗, 星座星盘, 姓名学 and 择日, with reading order, term-to-plain-language notes, the seven-section output structure, tone rules and safety boundaries.
- `suanming_intake` tool: deterministic completeness check per system, system detection from pasted material, missing-item questions, answer skeleton and topic-triggered boundary reminders. No chart calculation of any kind.
- Portable prompt pack in `prompts/` for non-DSH communities, including a machine-readable system/evidence spec.
- 26 dependency-free tests (intake logic, manifest, locale, icon, skill body, registration, spec parity).
- MIT license, English and Chinese READMEs, contributing guide and CI workflow.
