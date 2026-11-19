import test from 'node:test'
import assert from 'node:assert/strict'

import { auditAnswer, renderAudit } from '../lib/audit.js'

const SECTIONS = [
  '## 1. 体系与来源', '## 2. 关键信息摘要', '## 3. 核心判断',
  '## 4. 主要依据', '## 5. 不确定项', '## 6. 可执行建议', '## 7. 可继续追问',
].join('\n\n正文内容。\n\n')

const CHART = '命宫在午，紫微、天相同宫；财帛宫武曲化禄。'

test('a clean seven-section answer passes', () => {
  const result = auditAnswer({ answer: SECTIONS, chartData: CHART, systems: ['ziwei'], topic: '事业' })
  assert.equal(result.pass, true)
  assert.equal(result.findings.length, 0)
  assert.equal(result.stats.sections, 7)
})

test('absolute wording is flagged as high severity', () => {
  const result = auditAnswer({ answer: `${SECTIONS}\n你注定会升职，一定成功。`, chartData: CHART, systems: ['ziwei'] })
  assert.equal(result.pass, false)
  const finding = result.findings.find(item => item.code === 'absolute')
  assert.ok(finding)
  assert.equal(finding.severity, 'high')
  assert.ok(finding.evidence.includes('注定'))
})

test('an entity that is not in the material is reported as unsourced', () => {
  const result = auditAnswer({ answer: `${SECTIONS}\n迁移宫见天梁化科。`, chartData: CHART, systems: ['ziwei'] })
  const finding = result.findings.find(item => item.code === 'unsourced')
  assert.ok(finding)
  assert.ok(finding.evidence.includes('天梁'))
})

test('a negated mention is not treated as fabrication', () => {
  const result = auditAnswer({ answer: `${SECTIONS}\n盘中未见天梁，故不作此断。`, chartData: CHART, systems: ['ziwei'] })
  assert.equal(result.findings.some(item => item.code === 'unsourced'), false)
})

test('missing sections and boundaries are reported', () => {
  const short = '## 1. 体系\n\n只有一段。'
  const result = auditAnswer({ answer: short, chartData: CHART, systems: ['ziwei'], topic: '健康' })
  assert.ok(result.findings.some(item => item.code === 'sections'))
  assert.ok(result.findings.some(item => item.code === 'boundary'))
})

test('an empty answer fails instead of passing silently', () => {
  const result = auditAnswer({ answer: '', chartData: CHART })
  assert.equal(result.pass, false)
  assert.equal(result.score, 0)
  assert.match(renderAudit(result), /自检结果/)
})
