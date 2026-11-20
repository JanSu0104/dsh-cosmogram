/**
 * Local chart gateway client.
 *
 * The plugin never casts a chart itself. When the user supplies only birth
 * information, this module asks a gateway running on the same machine for a
 * structured chart, then hands that structure to the reading layer.
 *
 * Hard rules enforced here:
 * - the endpoint must be loopback; a non-local URL is refused before any
 *   request is made, so birth data cannot leave the machine;
 * - birth fields are sent once and never echoed, logged, cached or written;
 * - the result is rebuilt from an allow-list of fields, so extra keys from the
 *   gateway (including anything private) do not reach the model;
 * - if the gateway is unreachable the call fails with instructions instead of
 *   falling back to any external service.
 *
 * @module dsh-cosmogram/lib/gateway
 */

import { getSettings } from './settings.js'

/** System label (as used by the tools) to gateway id. */
export const SYSTEM_IDS = {
  紫微斗数: 'ziwei',
  八字四柱: 'bazi',
  六爻: 'liuyao',
  奇门遁甲: 'qimen',
  风水: 'fengshui',
  塔罗: 'tarot',
  星座星盘: 'astro',
  姓名学: 'name',
  择日: 'zeri',
}

/** Default library per gateway system, matching the agreed split. */
export const DEFAULT_LIBRARIES = {
  ziwei: 'iztro',
  bazi: 'mingyu-core',
  liuyao: 'mingyu-core',
  qimen: 'mingyu-core',
  zeri: 'mingyu-core',
  astro: 'opastro',
  tarot: 'local-deck',
  fengshui: 'rules',
  name: 'rules',
}

/** The reply required when no chart data, library or gateway answer exists. */
export const MISSING_CHART_REPLY = '当前缺少排盘数据。请提供你使用的开源库、排盘返回 JSON，或启动本地排盘网关。'
  + '默认方案为：紫微用 iztro，八字/六爻/奇门/择日用 mingyu-core，星盘用 opastro/Natal_chart，塔罗用本地牌库。'

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]'])

/**
 * A gateway URL is usable only when it stays on this machine.
 * @param {string} value
 * @returns {{ ok: true, url: string } | { ok: false, reason: string }}
 */
export function validateGatewayUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    return { ok: false, reason: `网关地址不是合法 URL：${value}` }
  }
  if (url.protocol !== 'http:') return { ok: false, reason: '本地排盘网关只支持 http://，不使用外部 HTTPS 服务。' }
  if (!LOOPBACK_HOSTS.has(url.hostname)) {
    return { ok: false, reason: `网关地址必须是本机回环地址（127.0.0.1 / localhost），拒绝访问 ${url.hostname}。` }
  }
  return { ok: true, url: url.toString() }
}

/** Fields the model may see; everything else from the gateway is dropped. */
function sanitize(payload) {
  const warnings = Array.isArray(payload.warnings) ? payload.warnings.filter(item => typeof item === 'string') : []
  return {
    system: typeof payload.system === 'string' ? payload.system : '',
    source: typeof payload.source === 'string' ? payload.source : '',
    chart: payload.chart !== null && typeof payload.chart === 'object' ? payload.chart : {},
    warnings,
    disclaimer: typeof payload.disclaimer === 'string' ? payload.disclaimer : '',
  }
}

/**
 * Render a structured chart as text so the intake validator can check it.
 * Only chart content is rendered; birth fields never reach this function.
 * @param {unknown} chart
 * @param {string} [prefix]
 */
export function chartToText(chart, prefix = '') {
  const lines = []
  const walk = (value, path) => {
    if (value === null || value === undefined) return
    if (Array.isArray(value)) {
      for (const item of value) walk(item, path)
      return
    }
    if (typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) walk(item, prefix ? `${prefix}.${key}` : key)
      return
    }
    if (typeof value === 'string' && value.trim() !== '') lines.push(prefix ? `${prefix}：${value}` : value)
    else if (typeof value === 'number' || typeof value === 'boolean') lines.push(prefix ? `${prefix}：${value}` : `${value}`)
  }
  walk(chart, '')
  return lines.join('\n')
}

/**
 * Ask the local gateway for a structured chart.
 * @param {{
 *   system: string,
 *   birthDate?: string,
 *   birthTime?: string,
 *   gender?: string,
 *   location?: string,
 *   calendar?: string,
 *   useTrueSolarTime?: boolean,
 *   question?: string,
 *   library?: string,
 * }} input
 * @param {{ fetchImpl?: typeof fetch, settings?: { gatewayUrl?: string, gatewayTimeoutMs?: number } }} [options]
 */
export async function castChart(input, options = {}) {
  const settings = options.settings ?? getSettings()
  const systemId = SYSTEM_IDS[input.system]
  if (systemId === undefined) {
    return { ok: false, reason: 'unsupported-system', message: `不支持的体系：${input.system}` }
  }
  const checked = validateGatewayUrl(settings.gatewayUrl)
  if (checked.ok === false) {
    return { ok: false, reason: 'not-loopback', message: checked.reason, reply: MISSING_CHART_REPLY }
  }

  const body = {
    system: systemId,
    birthDate: input.birthDate ?? '',
    birthTime: input.birthTime ?? '',
    gender: input.gender ?? '',
    location: input.location ?? '',
    calendar: input.calendar === 'lunar' ? 'lunar' : 'solar',
    useTrueSolarTime: Boolean(input.useTrueSolarTime),
    question: input.question ?? '',
    library: input.library ?? DEFAULT_LIBRARIES[systemId],
  }
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  if (typeof fetchImpl !== 'function') {
    return { ok: false, reason: 'no-fetch', message: '当前运行环境没有 fetch，无法访问本地排盘网关。', reply: MISSING_CHART_REPLY }
  }

  const timeout = Number(settings.gatewayTimeoutMs) > 0 ? Number(settings.gatewayTimeoutMs) : 10000
  let response
  try {
    response = await fetchImpl(`${checked.url.replace(/\/+$/, '')}/calculate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    })
  } catch {
    return {
      ok: false,
      reason: 'gateway-unreachable',
      message: `本地排盘网关不可用（${checked.url}）。请先启动本地服务，再重试；不要改用外部网站或第三方接口。`,
      reply: MISSING_CHART_REPLY,
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: 'gateway-error',
      message: `本地排盘网关返回 HTTP ${response.status}，请检查服务日志后重试。`,
      reply: MISSING_CHART_REPLY,
    }
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    return { ok: false, reason: 'invalid-json', message: '本地排盘网关返回的不是合法 JSON。', reply: MISSING_CHART_REPLY }
  }
  if (payload === null || typeof payload !== 'object' || payload.chart === null || typeof payload.chart !== 'object') {
    return { ok: false, reason: 'invalid-shape', message: '本地排盘网关的返回缺少 chart 字段。', reply: MISSING_CHART_REPLY }
  }

  const clean = sanitize(payload)
  return {
    ok: true,
    system: clean.system || systemId,
    source: clean.source || body.library,
    library: body.library,
    chart: clean.chart,
    warnings: clean.warnings,
    disclaimer: clean.disclaimer || '仅供传统文化学习与娱乐参考',
    material: chartToText(clean.chart),
  }
}
