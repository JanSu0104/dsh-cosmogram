/**
 * Deterministic post-check for a drafted reading.
 *
 * The skill tells the model not to invent stars, hexagrams, cards or degrees.
 * This module turns that rule from advice into a check: it compares the answer
 * against the material the user actually pasted, scans for absolute wording,
 * and verifies the seven sections and the professional-advice boundary.
 *
 * It is deliberately conservative. It flags an entity only when the answer
 * names it and the supplied material does not, and it ignores negated mentions
 * ("未见天梁") so a reader can still say what is absent.
 *
 * @module dsh-cosmogram/lib/audit
 */

import { ABSOLUTE_WORDS, SENSITIVE_TOPICS, ENTITIES, entityList } from './data.js'

const SECTION_RE = /(^|\n)\s*(?:#{1,4}\s*)?([1-7])[.、)]\s*(?=\S)/g

/** Systems whose vocabulary should be checked. */
function vocabFor(systems) {
  const wanted = systems.length > 0 ? systems : Object.keys(ENTITIES)
  const map = new Map()
  for (const system of wanted) {
    for (const name of entityList(system)) {
      if (!map.has(name)) map.set(name, system)
    }
  }
  return map
}

/** True when the term only appears as "not seen / not in the chart". */
function negatedAt(answer, index, term) {
  const before = answer.slice(Math.max(0, index - 6), index)
  return /(没|没有|无|未|缺|未见|不含|不在|不带|非)[^，。；;]*$/.test(before)
}

/**
 * @param {{ answer: string, chartData?: string, systems?: string[], topic?: string }} input
 * @returns {{ pass: boolean, score: number, findings: Array<{ code: string, severity: 'high'|'medium'|'low', message: string, evidence?: string[] }>, stats: Record<string, number> }}
 */
export function auditAnswer(input = {}) {
  const answer = typeof input.answer === 'string' ? input.answer : ''
  const chartData = typeof input.chartData === 'string' ? input.chartData : ''
  const systems = Array.isArray(input.systems) ? input.systems.filter(value => typeof value === 'string') : []
  const topic = typeof input.topic === 'string' ? input.topic : ''
  const findings = []

  if (answer.trim() === '') {
    return {
      pass: false,
      score: 0,
      findings: [{ code: 'empty', severity: 'high', message: '解读正文为空。' }],
      stats: { sections: 0, absolutes: 0, unsourced: 0, boundary: 0 },
    }
  }

  /* 1. Seven sections. */
  const sections = new Set()
  for (const match of answer.matchAll(SECTION_RE)) sections.add(Number(match[2]))
  if (sections.size < 7) {
    const missing = [1, 2, 3, 4, 5, 6, 7].filter(number => !sections.has(number))
    findings.push({
      code: 'sections',
      severity: 'medium',
      message: `七段式缺少第 ${missing.join('、')} 段。`,
    })
  }

  /* 2. Absolute wording. */
  const absolutes = []
  for (const word of ABSOLUTE_WORDS) {
    if (answer.includes(word)) absolutes.push(word)
  }
  if (absolutes.length > 0) {
    findings.push({
      code: 'absolute',
      severity: 'high',
      message: `出现绝对化表述：${absolutes.join('、')}。改为概率性、可被推翻的说法。`,
      evidence: absolutes,
    })
  }

  /* 3. Boundary for sensitive topics. */
  const sensitive = SENSITIVE_TOPICS.filter(item => topic.includes(item) || answer.includes(item))
  const hasBoundary = /(边界|专业|参考|不构成|咨询|就医|律师|投资顾问|心理咨询)/.test(answer)
  if (sensitive.length > 0 && !hasBoundary) {
    findings.push({
      code: 'boundary',
      severity: 'medium',
      message: `主题涉及${sensitive.join('、')}，但正文没有专业边界提示。`,
    })
  }

  /* 4. Entities that are not in the supplied material. */
  const unsourced = []
  if (chartData.trim() !== '') {
    for (const [name] of vocabFor(systems)) {
      if (chartData.includes(name)) continue
      let index = answer.indexOf(name)
      while (index >= 0) {
        if (!negatedAt(answer, index, name)) {
          unsourced.push(name)
          break
        }
        index = answer.indexOf(name, index + name.length)
      }
    }
  }
  if (unsourced.length > 0) {
    findings.push({
      code: 'unsourced',
      severity: 'high',
      message: `正文提到的 ${unsourced.join('、')} 不在用户提供的盘面里，疑似补写。`,
      evidence: unsourced,
    })
  }

  /* 5. Degrees and exact numbers. */
  const degrees = [...answer.matchAll(/(\d{1,3}(?:\.\d+)?)\s*°/g)].map(match => match[1])
  const strayDegrees = degrees.filter(value => !chartData.includes(value))
  if (strayDegrees.length > 0) {
    findings.push({
      code: 'degrees',
      severity: 'high',
      message: `正文出现的度数 ${strayDegrees.join('、')}° 未在输入中出现。`,
      evidence: strayDegrees,
    })
  }

  /* 6. Evidence section must not be a placeholder. */
  if (/【填写|待补充|TODO|占位/.test(answer)) {
    findings.push({
      code: 'placeholder',
      severity: 'high',
      message: '正文仍含未替换的占位符，先把占位符填成真实内容。',
    })
  }

  const penalty = findings.reduce((sum, finding) => sum + (finding.severity === 'high' ? 25 : finding.severity === 'medium' ? 10 : 5), 0)
  const score = Math.max(0, 100 - penalty)
  return {
    pass: findings.every(finding => finding.severity === 'low'),
    score,
    findings,
    stats: {
      sections: sections.size,
      absolutes: absolutes.length,
      unsourced: unsourced.length,
      boundary: hasBoundary ? 1 : 0,
      degrees: strayDegrees.length,
    },
  }
}

/**
 * Plain-text report; the tool render uses this verbatim.
 * @param {ReturnType<typeof auditAnswer>} result
 */
export function renderAudit(result) {
  const icon = result.findings.length === 0 ? '✅' : result.findings.some(item => item.severity === 'high') ? '⛔' : '⚠️'
  const lines = [
    `## 自检结果 ${icon}`,
    '',
    `- 通过：${result.pass ? '是' : '否'}`,
    `- 得分：${result.score} / 100`,
    `- 七段：${result.stats.sections} / 7　绝对化：${result.stats.absolutes}　未溯源实体：${result.stats.unsourced}`,
  ]
  if (result.findings.length === 0) {
    lines.push('', '没有发现需要修改的问题。')
    return lines.join('\n')
  }
  lines.push('', '| 级别 | 问题 |', '| --- | --- |')
  for (const finding of result.findings) {
    const mark = finding.severity === 'high' ? '⛔ 高' : finding.severity === 'medium' ? '⚠️ 中' : '· 低'
    lines.push(`| ${mark} | ${finding.message} |`)
  }
  lines.push('', '> 高优先级问题必须改完再交付；中优先级至少要在正文中说明。')
  return lines.join('\n')
}
