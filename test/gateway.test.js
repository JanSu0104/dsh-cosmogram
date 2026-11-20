import test from 'node:test'
import assert from 'node:assert/strict'

import { castChart, chartToText, validateGatewayUrl, MISSING_CHART_REPLY, DEFAULT_LIBRARIES } from '../lib/gateway.js'

const SETTINGS = { gatewayUrl: 'http://127.0.0.1:8000', gatewayTimeoutMs: 5000 }

function stubFetch(response) {
  const calls = []
  const impl = async (url, init) => {
    calls.push({ url, init })
    if (response instanceof Error) throw response
    return response
  }
  return { impl, calls }
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

test('only loopback gateway URLs are accepted', () => {
  assert.equal(validateGatewayUrl('http://127.0.0.1:8000').ok, true)
  assert.equal(validateGatewayUrl('http://localhost:8000').ok, true)
  assert.equal(validateGatewayUrl('https://127.0.0.1:8000').ok, false)
  const external = validateGatewayUrl('http://api.example.com:8000')
  assert.equal(external.ok, false)
  assert.match(external.reason, /回环/)
  assert.equal(validateGatewayUrl('not a url').ok, false)
})

test('a chart is requested from the local gateway and sanitized', async () => {
  const payload = {
    system: 'ziwei',
    source: 'iztro',
    chart: { palaces: [{ name: '命宫', stars: ['紫微'] }] },
    warnings: ['真太阳时未校正'],
    disclaimer: '仅供传统文化学习与娱乐参考',
    birthDate: '2008-01-04',
    location: '北京',
  }
  const { impl, calls } = stubFetch(jsonResponse(payload))
  const result = await castChart(
    { system: '紫微斗数', birthDate: '2008-01-04', birthTime: '22:43', gender: '男', location: '北京', question: '学业' },
    { fetchImpl: impl, settings: SETTINGS },
  )
  assert.equal(result.ok, true)
  assert.equal(result.source, 'iztro')
  assert.equal(result.library, DEFAULT_LIBRARIES.ziwei)
  assert.deepEqual(result.warnings, ['真太阳时未校正'])
  assert.match(result.material, /命宫/)
  // Birth fields are sent once but never returned.
  assert.equal(JSON.stringify(result).includes('2008-01-04'), false)
  assert.equal(JSON.stringify(result).includes('北京'), false)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'http://127.0.0.1:8000/calculate')
  const body = JSON.parse(calls[0].init.body)
  assert.equal(body.system, 'ziwei')
  assert.equal(body.birthDate, '2008-01-04')
  assert.equal(body.calendar, 'solar')
})

test('a non-loopback gateway is refused without any request', async () => {
  const { impl, calls } = stubFetch(jsonResponse({}))
  const result = await castChart(
    { system: '八字四柱', birthDate: '2008-01-04' },
    { fetchImpl: impl, settings: { gatewayUrl: 'http://example.com:8000', gatewayTimeoutMs: 5000 } },
  )
  assert.equal(result.ok, false)
  assert.equal(result.reason, 'not-loopback')
  assert.equal(result.reply, MISSING_CHART_REPLY)
  assert.equal(calls.length, 0)
})

test('an unreachable gateway stops the flow with the required reply', async () => {
  const { impl } = stubFetch(new Error('ECONNREFUSED'))
  const result = await castChart(
    { system: '紫微斗数', birthDate: '2008-01-04' },
    { fetchImpl: impl, settings: SETTINGS },
  )
  assert.equal(result.ok, false)
  assert.equal(result.reason, 'gateway-unreachable')
  assert.equal(result.reply, MISSING_CHART_REPLY)
  assert.match(result.message, /不要改用外部网站/)
})

test('an invalid gateway body is rejected', async () => {
  const { impl } = stubFetch(jsonResponse({ system: 'ziwei' }))
  const result = await castChart({ system: '紫微斗数' }, { fetchImpl: impl, settings: SETTINGS })
  assert.equal(result.ok, false)
  assert.equal(result.reason, 'invalid-shape')
})

test('chartToText flattens nested values for the intake check', () => {
  const text = chartToText({ palaces: [{ name: '命宫', stars: ['紫微', '天相'] }], note: null })
  assert.match(text, /命宫/)
  assert.match(text, /紫微/)
  assert.match(text, /天相/)
})
