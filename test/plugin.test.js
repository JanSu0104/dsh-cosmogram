import test from 'node:test'
import assert from 'node:assert/strict'

import { apply } from '../index.js'

const ZIWEI_CHART = '命宫在午，紫微、天相同宫；财帛宫武曲化禄；官禄宫七杀；夫妻宫廉贞化忌；身宫在官禄。'

/** Minimal Cordis context double that records registrations. */
function fakeContext() {
  const skills = []
  const tools = []
  return {
    skills,
    tools,
    ctx: {
      skills: { register: skill => { skills.push(skill); return () => {} } },
      tools: { register: tool => { tools.push(tool); return () => {} } },
    },
  }
}

test('apply registers one model-invocable skill and one tool', () => {
  const fake = fakeContext()
  apply(fake.ctx)
  assert.equal(fake.skills.length, 1)
  assert.equal(fake.tools.length, 1)

  const [skill] = fake.skills
  assert.equal(skill.name, 'cosmogram')
  assert.equal(skill.invocation.modelInvocable, true)
  assert.ok(skill.content.includes('不排盘'))
  assert.equal(skill.resourceBase.kind, 'directory')
  assert.ok(skill.description.includes('不自行排盘'))
})

test('the tool exposes the documented schema and output contract', () => {
  const fake = fakeContext()
  apply(fake.ctx)
  const [tool] = fake.tools
  assert.equal(tool.name, 'cosmogram_intake')
  assert.equal(typeof tool.output.render, 'function')
  assert.equal(tool.parameters.type, 'object')
  assert.deepEqual(tool.parameters.properties.systems.items.enum.slice(0, 3), ['紫微斗数', '八字四柱', '六爻'])
  assert.deepEqual(tool.output.schema.properties.status.enum, ['ready', 'need_data'])
})

test('the tool returns a ready analysis with a renderable payload', async () => {
  const fake = fakeContext()
  apply(fake.ctx)
  const [tool] = fake.tools

  const value = await tool.execute({ systems: ['紫微斗数'], chartData: ZIWEI_CHART, topic: '事业' })
  assert.equal(value.status, 'ready')
  assert.deepEqual(value.missing, [])

  const content = tool.output.render({}, value)
  assert.equal(content.length, 1)
  assert.equal(content[0].type, 'text')
  assert.match(content[0].text, /校验结果：现有材料可以开始解读/)
})

test('the tool refuses to fabricate when chart data is absent', async () => {
  const fake = fakeContext()
  apply(fake.ctx)
  const [tool] = fake.tools

  const value = await tool.execute({})
  assert.equal(value.status, 'need_data')
  assert.ok(value.missing.some(item => item.includes('请提供具体命盘')))
})

test('malformed tool arguments are coerced, not trusted', async () => {
  const fake = fakeContext()
  apply(fake.ctx)
  const [tool] = fake.tools

  const value = await tool.execute({ chartData: 42, systems: '紫微斗数', topic: null })
  assert.equal(value.status, 'need_data')
  assert.deepEqual(value.systems, [])
  assert.equal(value.topic, '未指定')
})
