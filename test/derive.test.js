import test from 'node:test'
import assert from 'node:assert/strict'

import { parsePillars, tenGod, voidBranches, deriveBazi, parseAstro, deriveAstro, deriveFacts } from '../lib/derive.js'

test('ten gods follow the day master', () => {
  assert.equal(tenGod('甲', '甲'), '比肩')
  assert.equal(tenGod('甲', '乙'), '劫财')
  assert.equal(tenGod('甲', '丙'), '食神')
  assert.equal(tenGod('甲', '丁'), '伤官')
  assert.equal(tenGod('甲', '戊'), '偏财')
  assert.equal(tenGod('甲', '己'), '正财')
  assert.equal(tenGod('甲', '庚'), '七杀')
  assert.equal(tenGod('甲', '辛'), '正官')
  assert.equal(tenGod('甲', '壬'), '偏印')
  assert.equal(tenGod('甲', '癸'), '正印')
})

test('void branches follow the decade', () => {
  assert.deepEqual(voidBranches('甲', '子'), ['戌', '亥'])
  assert.deepEqual(voidBranches('甲', '戌'), ['申', '酉'])
  assert.deepEqual(voidBranches('甲', '寅'), ['子', '丑'])
})

test('pillars parse from labelled text and from a raw sequence', () => {
  const labelled = parsePillars('年柱甲子 月柱丙寅 日柱戊午 时柱庚申')
  assert.equal(labelled.source, 'labelled')
  assert.equal(labelled.day.stem, '戊')
  assert.equal(labelled.hour.branch, '申')

  const sequence = parsePillars('甲子 丙寅 戊午 庚申')
  assert.equal(sequence.source, 'sequence')
  assert.equal(sequence.day.branch, '午')
})

test('bazi facts carry ten gods, elements, clashes and voids', () => {
  const facts = deriveBazi(parsePillars('年柱甲子 月柱丙寅 日柱戊午 时柱庚申'))
  assert.equal(facts.available, true)
  assert.equal(facts.dayMaster, '戊')
  assert.equal(facts.tenGods.length, 4)
  const total = Object.values(facts.elements).reduce((sum, value) => sum + value, 0)
  assert.ok(Math.abs(total - 100) <= 2, `elements should be percentages, got ${total}`)
  assert.ok(facts.relations.some(item => item.includes('冲')))
  assert.deepEqual(facts.voidBranches, ['子', '丑'])
})

test('two identical branches are not a clash or a combination', () => {
  const facts = deriveBazi(parsePillars('年柱丁亥 月柱壬子 日柱癸卯 时柱癸亥'))
  assert.equal(facts.relations.some(item => item.startsWith('亥亥')), false)
  assert.equal(facts.relations.length, 0)
})

test('a real clash and a real combination are still reported once', () => {
  const facts = deriveBazi(parsePillars('年柱甲寅 月柱丙子 日柱戊午 时柱辛亥'))
  assert.ok(facts.relations.includes('子午冲'))
  assert.ok(facts.relations.includes('寅亥合'))
  assert.equal(facts.relations.filter(item => item === '子午冲').length, 1)
})

test('astrology positions and aspects derive from degrees', () => {
  const points = parseAstro('太阳 15° 白羊，月亮 15° 天秤，水星 16° 白羊')
  assert.equal(points.length, 3)
  const facts = deriveAstro(points)
  assert.equal(facts.available, true)
  assert.ok(facts.aspects.some(item => item.type === '对分相'))
  assert.ok(facts.aspects.some(item => item.type === '合相'))
  assert.equal(facts.elements['火'], 2)
})

test('deriveFacts only produces systems the material supports', () => {
  const facts = deriveFacts({ chartData: '年柱甲子 月柱丙寅 日柱戊午 时柱庚申', systems: ['bazi'] })
  assert.ok(facts.bazi)
  assert.equal(facts.astro, undefined)

  const empty = deriveFacts({ chartData: '随便一段描述', systems: ['tarot'] })
  assert.deepEqual(empty, {})
})
