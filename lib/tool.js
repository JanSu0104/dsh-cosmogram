/**
 * Model-facing intake tool: validates supplied chart material and returns the
 * seven-section skeleton. It never casts or derives a chart.
 *
 * @module dsh-suanming/lib/tool
 */

import { analyzeIntake, renderIntake, DATA_SOURCES, SYSTEM_SPECS, TOPICS } from './intake.js'

/** Registered tool name. */
export const TOOL_NAME = 'suanming_intake'

const SYSTEM_ENUM = SYSTEM_SPECS.map(spec => spec.label)

const DESCRIPTION = '校验命理/占卜解读的输入：确认用户给出的盘面、卦象、牌阵或星盘是否包含该体系的必要元素，'
  + '列出还缺什么，并生成七段式解读骨架与边界提示。不排盘、不计算、不生成任何星曜/干支/卦象/牌意。'
  + '在解读命理、占卜或择日问题之前调用。'

const PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    chartData: {
      type: 'string',
      description: '用户提供的原始盘面文字（十二宫、四柱、卦象、九宫、户型、牌阵、星盘、姓名或日期范围）。'
        + '没有就传空字符串；不要把记忆里的盘面或推测补进来。',
    },
    systems: {
      type: 'array',
      items: { type: 'string', enum: SYSTEM_ENUM },
      description: '用户明确指定的体系。省略时按 chartData 的数据特征自动判断。',
    },
    dataSource: {
      type: 'string',
      enum: DATA_SOURCES,
      description: '盘面来源。用户没说就省略。',
    },
    topic: {
      type: 'string',
      enum: TOPICS,
      description: '问题主题。省略时按用户原话归纳。',
    },
    userContext: {
      type: 'string',
      description: '用户补充的当前处境与想重点看的点，原文转述即可。',
    },
    birthInfo: {
      type: 'string',
      description: '用户给出的出生时间、性别、出生地。只用于提示还缺哪些盘面元素，不用于排盘。',
    },
  },
}

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    status: {
      type: 'string',
      enum: ['ready', 'need_data'],
      description: 'ready 表示可以开始解读；need_data 表示必须先向用户补充信息。',
    },
    systems: { type: 'array', items: { type: 'string' }, description: '本次采用的体系 id。' },
    systemLabels: { type: 'array', items: { type: 'string' }, description: '体系中文名。' },
    detected: { type: 'string', description: '仅凭数据特征识别出的体系名，未识别时为空字符串。' },
    dataSource: { type: 'string', description: '本次数据来源。' },
    topic: { type: 'string', description: '本次问题主题。' },
    missing: { type: 'array', items: { type: 'string' }, description: '需要向用户补充的具体问题。' },
    found: { type: 'array', items: { type: 'string' }, description: '已经具备的必要元素。' },
    notes: { type: 'array', items: { type: 'string' }, description: '使用提醒与体系边界。' },
    boundaries: { type: 'array', items: { type: 'string' }, description: '需要附在回答里的边界提示。' },
    scaffold: { type: 'string', description: '七段式输出骨架，占位符需替换成真实解读。' },
  },
  required: ['status', 'systems', 'systemLabels', 'detected', 'dataSource', 'topic', 'missing', 'found', 'notes', 'boundaries', 'scaffold'],
}

/**
 * Coerce model arguments without trusting their shape.
 * @param {unknown} args
 * @returns {{ chartData: string, systems: string[], dataSource: string, topic: string, userContext: string, birthInfo: string }}
 */
function toInput(args) {
  const record = args !== null && typeof args === 'object' ? args : {}
  const str = value => (typeof value === 'string' ? value : '')
  return {
    chartData: str(record.chartData),
    systems: Array.isArray(record.systems) ? record.systems.filter(value => typeof value === 'string') : [],
    dataSource: str(record.dataSource),
    topic: str(record.topic),
    userContext: str(record.userContext),
    birthInfo: str(record.birthInfo),
  }
}

/** @param {import('@deepseek-ai/cordis').Context} ctx */
export function registerIntakeTool(ctx) {
  ctx.tools.register({
    name: TOOL_NAME,
    description: DESCRIPTION,
    parameters: PARAMETERS,
    isConcurrencySafe: () => true,
    output: {
      schema: OUTPUT_SCHEMA,
      render(_args, value) {
        return [{ type: 'text', text: renderIntake(/** @type {ReturnType<typeof analyzeIntake>} */ (value)) }]
      },
    },
    async execute(args) {
      return analyzeIntake(toInput(args))
    },
  })
}
