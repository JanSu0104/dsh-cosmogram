/**
 * Zero-calendar derivation.
 *
 * Everything here is computed from material the user already pasted. The
 * module never turns a birth time into a chart: it does not know about
 * calendars, solar terms, time zones or ephemerides. What it does is the
 * arithmetic a reader would otherwise do in their head — ten gods, hidden
 * stems, element weights, clashes, void branches, aspects — so the model can
 * spend its attention on interpretation instead of recall.
 *
 * @module dsh-cosmogram/lib/derive
 */

import {
  STEMS, BRANCHES, STEM_ELEMENT, STEM_POLARITY, HIDDEN_STEMS, HIDDEN_WEIGHT,
  CLASHES, COMBINATIONS, TRIADS, GENERATES, CONTROLS,
  SIGNS, SIGN_EN, SIGN_ELEMENT, SIGN_MODE, PLANETS, PLANET_EN, ASPECTS,
} from './data.js'

/* ------------------------------------------------------------------ BaZi */

const PILLAR_RE = new RegExp(`([${STEMS.join('')}])([${BRANCHES.join('')}])`, 'g')
/**
 * Read the four pillars from pasted text.
 * Labelled pillars win; otherwise the first four stem-branch pairs in order.
 * @param {string} text
 * @returns {{ year?: Pillar, month?: Pillar, day?: Pillar, hour?: Pillar, source: 'labelled'|'sequence'|'none' }}
 */
export function parsePillars(text) {
  const source = String(text ?? '')
  const labelled = {}
  for (const [key, label] of [['year', '年柱'], ['month', '月柱'], ['day', '日柱'], ['hour', '时柱']]) {
    const re = new RegExp(`${label}[^${STEMS.join('')}]{0,8}([${STEMS.join('')}])\\s*([${BRANCHES.join('')}])`)
    const hit = source.match(re)
    if (hit) labelled[key] = { stem: hit[1], branch: hit[2] }
  }
  if (Object.keys(labelled).length >= 2) {
    return { ...labelled, source: 'labelled' }
  }
  const pairs = [...source.matchAll(PILLAR_RE)].map(match => ({ stem: match[1], branch: match[2] }))
  const unique = []
  for (const pair of pairs) {
    if (!unique.some(item => item.stem === pair.stem && item.branch === pair.branch)) unique.push(pair)
  }
  if (unique.length < 4) return { source: 'none' }
  return { year: unique[0], month: unique[1], day: unique[2], hour: unique[3], source: 'sequence' }
}

/**
 * Ten-god relation of `other` viewed from the day master.
 * @param {string} dayStem
 * @param {string} otherStem
 */
export function tenGod(dayStem, otherStem) {
  const di = STEMS.indexOf(dayStem)
  const oi = STEMS.indexOf(otherStem)
  if (di < 0 || oi < 0) return '未知'
  const de = STEM_ELEMENT[di]
  const oe = STEM_ELEMENT[oi]
  const same = STEM_POLARITY[di] === STEM_POLARITY[oi]
  if (de === oe) return same ? '比肩' : '劫财'
  if (GENERATES[de] === oe) return same ? '食神' : '伤官'
  if (CONTROLS[de] === oe) return same ? '偏财' : '正财'
  if (CONTROLS[oe] === de) return same ? '七杀' : '正官'
  if (GENERATES[oe] === de) return same ? '偏印' : '正印'
  return '未知'
}

/** Sexagenary index (0–59) of a stem-branch pair, or -1. */
export function jiaziIndex(stem, branch) {
  for (let i = 0; i < 60; i += 1) {
    if (STEMS[i % 10] === stem && BRANCHES[i % 12] === branch) return i
  }
  return -1
}

/** Void branches of the decade a pillar falls in. */
export function voidBranches(stem, branch) {
  const index = jiaziIndex(stem, branch)
  if (index < 0) return []
  const decade = Math.floor(index / 10)
  return [BRANCHES[(10 - 2 * decade + 12) % 12], BRANCHES[(11 - 2 * decade + 12) % 12]]
}

/**
 * Derive BaZi facts from the four pillars.
 * @param {ReturnType<typeof parsePillars>} pillars
 */
export function deriveBazi(pillars) {
  if (pillars.source === 'none') return undefined
  const order = ['year', 'month', 'day', 'hour']
  const labels = { year: '年', month: '月', day: '日', hour: '时' }
  const dayStem = pillars.day?.stem
  const elements = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  const tenGods = []
  const hidden = []
  const issues = []

  if (!dayStem) {
    return { available: false, reason: '缺少日柱，无法定十神。', source: pillars.source }
  }

  for (const key of order) {
    const pillar = pillars[key]
    if (!pillar) continue
    tenGods.push({ pillar: labels[key], stem: pillar.stem, god: tenGod(dayStem, pillar.stem) })
    elements[STEM_ELEMENT[STEMS.indexOf(pillar.stem)]] += 1
    const stems = HIDDEN_STEMS[pillar.branch] ?? []
    hidden.push({
      pillar: labels[key],
      branch: pillar.branch,
      stems: stems.map((stem, depth) => {
        const weight = HIDDEN_WEIGHT[depth] ?? 0.3
        elements[STEM_ELEMENT[STEMS.indexOf(stem)]] += weight
        return { stem, god: tenGod(dayStem, stem), weight }
      }),
    })
  }

  const branches = order.filter(key => pillars[key]).map(key => pillars[key].branch)
  const relations = []
  for (let i = 0; i < branches.length; i += 1) {
    for (let j = i + 1; j < branches.length; j += 1) {
      const pair = [branches[i], branches[j]]
      if (CLASHES.some(item => item.includes(pair[0]) && item.includes(pair[1]))) relations.push(`${pair[0]}${pair[1]}冲`)
      if (COMBINATIONS.some(item => item.includes(pair[0]) && item.includes(pair[1]))) relations.push(`${pair[0]}${pair[1]}合`)
    }
  }
  for (const triad of TRIADS) {
    if (triad.every(branch => branches.includes(branch))) relations.push(`${triad.join('')}三合`)
  }

  const dayBranch = pillars.day.branch
  if (!pillars.hour) issues.push('缺少时柱：无法看子女宫与晚运，也无法核对时辰。')

  const total = Object.values(elements).reduce((sum, value) => sum + value, 0) || 1
  const percentages = Object.fromEntries(Object.entries(elements).map(([key, value]) => [key, Math.round((value / total) * 100)]))

  return {
    available: true,
    source: pillars.source,
    dayMaster: dayStem,
    dayMasterElement: STEM_ELEMENT[STEMS.indexOf(dayStem)],
    tenGods,
    hidden,
    elements: percentages,
    relations: [...new Set(relations)],
    voidBranches: voidBranches(pillars.day.stem, dayBranch),
    issues,
  }
}

/* ------------------------------------------------------------- astrology */

const PLANET_ALIASES = new Map(Object.entries(PLANET_EN))
const SIGN_ALIASES = new Map(Object.entries(SIGN_EN).map(([en, index]) => [en, index]))

/**
 * Parse planet positions such as `太阳 15° 白羊`, `月亮 天蝎 8`, `Sun: 3 Leo`.
 * @param {string} text
 */
export function parseAstro(text) {
  const source = String(text ?? '')
  const points = []
  const names = [...PLANETS, '上升', '天顶']
  for (const name of names) {
    const patterns = [
      new RegExp(`${name}\\s*[:：]?\\s*(\\d{1,3}(?:\\.\\d+)?)\\s*°?\\s*(白羊|金牛|双子|巨蟹|狮子|处女|天秤|天蝎|射手|摩羯|水瓶|双鱼)`),
      new RegExp(`${name}\\s*[:：]?\\s*(白羊|金牛|双子|巨蟹|狮子|处女|天秤|天蝎|射手|摩羯|水瓶|双鱼)\\s*(\\d{1,3}(?:\\.\\d+)?)\\s*°?`),
    ]
    for (const re of patterns) {
      const hit = source.match(re)
      if (!hit) continue
      const degreeFirst = /^\d/.test(hit[1])
      const sign = degreeFirst ? hit[2] : hit[1]
      const degree = Number(degreeFirst ? hit[1] : hit[2])
      const signIndex = SIGNS.indexOf(sign)
      if (signIndex < 0 || !Number.isFinite(degree) || degree >= 30) continue
      points.push({ name, sign, degree, longitude: signIndex * 30 + degree })
      break
    }
  }
  // English input: `Sun 15 Aries`
  for (const [en, name] of PLANET_ALIASES) {
    if (points.some(point => point.name === name)) continue
    const re = new RegExp(`\\b${en}\\b\\s*[:：]?\\s*(\\d{1,3}(?:\\.\\d+)?)\\s*°?\\s*([A-Za-z]+)`, 'i')
    const hit = source.match(re)
    if (!hit) continue
    const signIndex = SIGN_ALIASES.get(hit[2].toLowerCase())
    if (signIndex === undefined) continue
    const degree = Number(hit[1])
    if (!Number.isFinite(degree) || degree >= 30) continue
    points.push({ name, sign: SIGNS[signIndex], degree, longitude: signIndex * 30 + degree })
  }
  return points
}

/**
 * Angles between every pair of points.
 * @param {ReturnType<typeof parseAstro>} points
 */
export function deriveAstro(points) {
  if (points.length === 0) return undefined
  const aspects = []
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const raw = Math.abs(points[i].longitude - points[j].longitude)
      const angle = raw > 180 ? 360 - raw : raw
      for (const aspect of ASPECTS) {
        const orb = Math.abs(angle - aspect.angle)
        if (orb <= aspect.orb) {
          aspects.push({ a: points[i].name, b: points[j].name, type: aspect.name, orb: Number(orb.toFixed(1)) })
          break
        }
      }
    }
  }
  const elements = { 火: 0, 土: 0, 风: 0, 水: 0 }
  const modes = { 基本: 0, 固定: 0, 变动: 0 }
  for (const point of points) {
    const index = SIGNS.indexOf(point.sign)
    if (index < 0) continue
    elements[SIGN_ELEMENT[index]] += 1
    modes[SIGN_MODE[index]] += 1
  }
  return {
    available: true,
    points,
    aspects: aspects.sort((a, b) => a.orb - b.orb),
    elements,
    modes,
    missing: PLANETS.filter(name => !points.some(point => point.name === name)),
  }
}

/**
 * Markdown summary of the derived facts, used in the tool result.
 * @param {Record<string, any>} facts
 */
export function renderFacts(facts = {}) {
  const lines = ['## 确定性推演（由输入算出，可直接引用）']
  const bazi = facts.bazi
  if (bazi?.available) {
    lines.push(`- 日主：${bazi.dayMaster}（${bazi.dayMasterElement}）`)
    lines.push(`- 十神：${bazi.tenGods.map(item => `${item.pillar}干${item.stem}=${item.god}`).join('｜')}`)
    lines.push(`- 五行：${Object.entries(bazi.elements).map(([key, value]) => `${key}${value}%`).join(' ')}`)
    if (bazi.relations.length > 0) lines.push(`- 刑冲合：${bazi.relations.join('、')}`)
    if (bazi.voidBranches.length > 0) lines.push(`- 旬空：${bazi.voidBranches.join('、')}`)
    for (const issue of bazi.issues) lines.push(`- 注意：${issue}`)
  }
  const astro = facts.astro
  if (astro?.available) {
    lines.push('', '| 星体 | 星座 | 度数 |', '| --- | --- | --- |')
    for (const point of astro.points) lines.push(`| ${point.name} | ${point.sign} | ${point.degree}° |`)
    if (astro.aspects.length > 0) {
      lines.push('', `- 主要相位：${astro.aspects.slice(0, 8).map(item => `${item.a}·${item.b} ${item.type}（${item.orb}°）`).join('｜')}`)
    }
    lines.push(`- 元素分布：${Object.entries(astro.elements).map(([key, value]) => `${key}${value}`).join(' ')}｜模式：${Object.entries(astro.modes).map(([key, value]) => `${key}${value}`).join(' ')}`)
    if (astro.missing.length > 0) lines.push(`- 未给出的星体：${astro.missing.join('、')}`)
  }
  return lines.join('\n')
}

/**
 * Derive whatever the supplied material supports.
 * @param {{ chartData?: string, systems?: readonly string[] }} input
 */
export function deriveFacts(input = {}) {
  const text = typeof input.chartData === 'string' ? input.chartData : ''
  const systems = Array.isArray(input.systems) ? input.systems : []
  const facts = {}
  if (systems.includes('bazi') || /\d*\s*[年月日时]柱|四柱/.test(text)) {
    const pillars = parsePillars(text)
    const bazi = deriveBazi(pillars)
    if (bazi) facts.bazi = bazi
  }
  if (systems.includes('astro') || /上升|太阳.{0,4}(白羊|金牛|双子|巨蟹|狮子|处女|天秤|天蝎|射手|摩羯|水瓶|双鱼)/.test(text)) {
    const astro = deriveAstro(parseAstro(text))
    if (astro) facts.astro = astro
  }
  return facts
}
