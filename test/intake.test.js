import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ASK_FOR_DATA,
  SYSTEM_SPECS,
  analyzeIntake,
  detectSystem,
  normalizeSystem,
  renderIntake,
  sensitiveNotes,
} from '../lib/intake.js'

const ZIWEI_CHART = [
  '命宫在午，紫微、天相同宫；身宫在官禄。',
  '财帛宫武曲化禄；官禄宫七杀；夫妻宫廉贞化忌；福德宫天梁；迁移宫天机。',
].join('\n')

const TAROT_SPREAD = '牌阵：三张牌（过去/现在/未来）；愚者 正位；力量 逆位；圣杯骑士 正位。'

test('a complete chart is ready and reports no missing evidence', () => {
  const result = analyzeIntake({ systems: ['紫微斗数'], chartData: ZIWEI_CHART, dataSource: '用户截图', topic: '事业' })
  assert.equal(result.status, 'ready')
  assert.deepEqual(result.systemLabels, ['紫微斗数'])
  assert.deepEqual(result.missing, [])
  assert.ok(result.found.length >= 3)
})

test('no data returns need_data with the canonical request sentence', () => {
  const result = analyzeIntake({})
  assert.equal(result.status, 'need_data')
  assert.ok(result.missing.includes(ASK_FOR_DATA))
  assert.match(result.notes.join('\n'), /不得先给通用运势/)
})

test('birth info alone never produces a chart or a reading', () => {
  const result = analyzeIntake({ birthInfo: '1990年5月3日 上午9点，女，杭州' })
  assert.equal(result.status, 'need_data')
  const notes = result.notes.join('\n')
  assert.match(notes, /不排盘/)
  assert.equal(result.systems.length, 0)
})

test('partial BaZi asks for the missing pillars instead of guessing', () => {
  const result = analyzeIntake({ systems: ['八字'], chartData: '年柱甲子，月柱丙寅' })
  assert.equal(result.status, 'need_data')
  assert.equal(result.missing.length, 1)
  assert.match(result.missing[0], /四柱/)
})

test('a full four-pillar chart is accepted', () => {
  const result = analyzeIntake({ systems: ['八字'], chartData: '年柱甲子 月柱丙寅 日柱戊午 时柱庚申' })
  assert.equal(result.status, 'ready')
  assert.deepEqual(result.missing, [])
})

test('the system is detected from the supplied material when omitted', () => {
  assert.equal(detectSystem(TAROT_SPREAD)?.id, 'tarot')
  const result = analyzeIntake({ chartData: TAROT_SPREAD, topic: '近期运势' })
  assert.equal(result.status, 'ready')
  assert.deepEqual(result.systems, ['tarot'])
  assert.equal(result.detected, '塔罗')
})

test('the scaffold always carries the seven sections', () => {
  const result = analyzeIntake({ systems: ['六爻'], chartData: '本卦乾为天，动爻三爻，变卦天风姤，月建寅，日辰甲子。' })
  const headings = result.scaffold.match(/^## \d\. /gm) ?? []
  assert.equal(headings.length, 7)
  assert.match(result.scaffold, /边界提示/)
})

test('mixed material keeps systems separate and does not merge them', () => {
  const result = analyzeIntake({ systems: ['八字', '六爻'], chartData: '年柱甲子 月柱丙寅 日柱戊午 时柱庚申' })
  assert.equal(result.status, 'ready')
  assert.equal(result.systemLabels.length, 2)
  assert.ok(result.missing.some(item => item.includes('六爻')))
  assert.match(result.notes.join('\n'), /不要解读该体系/)
})

test('sensitive topics add a boundary reminder', () => {
  assert.ok(sensitiveNotes('我想问健康，最近失眠').some(text => text.includes('医疗')))
  const result = analyzeIntake({ systems: ['八字'], chartData: '年柱甲子 月柱丙寅 日柱戊午 时柱庚申', topic: '健康' })
  assert.ok(result.boundaries.some(text => text.includes('医疗')))
})

test('aliases resolve to canonical ids and unknown names stay undefined', () => {
  assert.equal(normalizeSystem('紫微'), 'ziwei')
  assert.equal(normalizeSystem('bazi'), 'bazi')
  assert.equal(normalizeSystem('奇门'), 'qimen')
  assert.equal(normalizeSystem('星座'), 'astrology')
  assert.equal(normalizeSystem('紫微斗数'), 'ziwei')
  assert.equal(normalizeSystem('西式占星'), undefined)
  assert.equal(normalizeSystem(42), undefined)
})

test('every system declares required evidence and a scope', () => {
  assert.equal(SYSTEM_SPECS.length, 9)
  for (const spec of SYSTEM_SPECS) {
    assert.ok(spec.required.length >= 1, `${spec.id} has required evidence`)
    assert.ok(spec.scope.length > 0, `${spec.id} declares its scope`)
    assert.ok(spec.label.length > 0)
  }
})

test('rendered output repeats missing questions verbatim', () => {
  const result = analyzeIntake({ systems: ['塔罗'], chartData: '牌阵：三张牌' })
  const text = renderIntake(result)
  assert.match(text, /校验结果/)
  assert.match(text, /七段式输出骨架/)
  for (const item of result.missing) assert.ok(text.includes(item))
})
