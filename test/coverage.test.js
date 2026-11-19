import test from 'node:test'
import assert from 'node:assert/strict'

import { analyzeIntake } from '../lib/intake.js'

const FULL_BAZI = '年柱甲子 月柱丙寅 日柱戊午 时柱庚申'
const PARTIAL_ZIWEI = '命宫在午，紫微、天相同宫；财帛宫武曲化禄。'

test('a complete chart reports high coverage and ready', () => {
  const value = analyzeIntake({ systems: ['八字四柱'], chartData: FULL_BAZI, topic: '事业' })
  assert.equal(value.status, 'ready')
  assert.ok(value.coverage >= 80, `coverage should be high, got ${value.coverage}`)
  assert.equal(value.coverageBySystem.length, 1)
})

test('a partial chart lowers coverage without pretending data is complete', () => {
  const value = analyzeIntake({ systems: ['紫微斗数'], chartData: PARTIAL_ZIWEI, topic: '事业' })
  assert.ok(value.coverage > 0 && value.coverage < 100, `coverage should be partial, got ${value.coverage}`)
  assert.ok(value.missing.length > 0)
})

test('absent material reports zero coverage and need_data', () => {
  const value = analyzeIntake({})
  assert.equal(value.status, 'need_data')
  assert.equal(value.coverage, 0)
})

test('structural problems surface as issues, not as silent data', () => {
  const value = analyzeIntake({ systems: ['八字四柱'], chartData: '四柱：甲子 丙寅 戊午 庚申，出生于 8 时', topic: '事业' })
  assert.ok(Array.isArray(value.issues))
  assert.ok(value.issues.some(item => item.includes('时柱地支')))
})

test('facts are derived from the supplied chart only', () => {
  const value = analyzeIntake({ systems: ['八字四柱'], chartData: FULL_BAZI })
  assert.equal(value.facts.bazi.available, true)
  assert.equal(value.facts.bazi.dayMaster, '戊')
  assert.equal(value.facts.astro, undefined)
})
