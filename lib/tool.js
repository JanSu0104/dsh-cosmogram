/**
 * Model-facing tools.
 *
 * - `cosmogram_intake` validates supplied chart material, reports coverage and
 *   structural problems, and returns derived facts plus the seven-section
 *   skeleton. It never casts a chart.
 * - `cosmogram_audit` checks a drafted answer against the supplied material:
 *   seven sections, absolute wording, professional boundaries, and names that
 *   do not appear in the input.
 *
 * @module dsh-cosmogram/lib/tool
 */

import { analyzeIntake, renderIntake, DATA_SOURCES, SYSTEM_SPECS, TOPICS } from './intake.js'
import { auditAnswer, renderAudit } from './audit.js'
import { getSettings } from './settings.js'

/** Registered intake tool name. */
export const TOOL_NAME = 'cosmogram_intake'

/** Registered audit tool name. */
export const AUDIT_TOOL_NAME = 'cosmogram_audit'

const SYSTEM_ENUM = SYSTEM_SPECS.map(spec => spec.label)

const DESCRIPTION = '校验命理/占卜解读的输入：确认用户给出的盘面、卦象、牌阵或星盘是否包含该体系的必要元素，'
  + '算出数据覆盖率、指出结构性问题（时辰与日柱是否对得上、四化缺生年干等），并给出可确定性推演出的要点'
  + '（八字十神、五行分布、冲合旬空、星盘相位）与七段式骨架。不排盘、不计算历法、不生成任何星曜/干支/卦象/牌意。'
  + '在解读命理、占卜或择日问题之前调用。Use before any Zi Wei Dou Shu, BaZi, Liu Yao, Qi Men, '
  + 'Feng Shui, Tarot, astrology, name or date-selection reading to check the pasted material.'

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

const COVERAGE_ITEM = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    label: { type: 'string' },
    score: { type: 'number' },
  },
  required: ['id', 'label', 'score'],
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
    coverage: { type: 'number', description: '数据覆盖率 0–100。' },
    coverageBySystem: { type: 'array', items: COVERAGE_ITEM, description: '分体系的覆盖率。' },
    issues: { type: 'array', items: { type: 'string' }, description: '结构性问题：矛盾或缺失的锚点。' },
    missing: { type: 'array', items: { type: 'string' }, description: '必须向用户补充的问题（缺失时不能强行解读）。' },
    gaps: { type: 'array', items: { type: 'string' }, description: '可补充项：不影响初步解读，补上更完整。' },
    found: { type: 'array', items: { type: 'string' }, description: '已经具备的必要元素。' },
    notes: { type: 'array', items: { type: 'string' }, description: '使用提醒与体系边界。' },
    boundaries: { type: 'array', items: { type: 'string' }, description: '需要附在回答里的边界提示。' },
    facts: {
      type: 'object',
      additionalProperties: true,
      description: '由输入确定性推出的要点：bazi（十神、五行、冲合、旬空）与 astro（相位、元素分布）。',
    },
    scaffold: { type: 'string', description: '七段式输出骨架，占位符需替换成真实解读。' },
  },
  required: ['status', 'systems', 'systemLabels', 'detected', 'dataSource', 'topic', 'coverage', 'coverageBySystem', 'issues', 'missing', 'gaps', 'found', 'notes', 'boundaries', 'facts', 'scaffold'],
}

const AUDIT_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    answer: { type: 'string', description: '已经写好的解读正文（七段式 Markdown）。' },
    chartData: { type: 'string', description: '用户提供的原始盘面，用于核对正文是否引用了输入之外的内容。' },
    systems: {
      type: 'array',
      items: { type: 'string', enum: SYSTEM_ENUM },
      description: '正文使用的体系。省略时检查全部体系的词汇。',
    },
    topic: { type: 'string', enum: TOPICS, description: '问题主题，用于判断是否需要专业边界提示。' },
  },
  required: ['answer'],
}

const AUDIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    pass: { type: 'boolean', description: '没有高优先级问题时为 true。' },
    score: { type: 'number', description: '自检得分 0–100。' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          code: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          message: { type: 'string' },
          evidence: { type: 'array', items: { type: 'string' } },
        },
        required: ['code', 'severity', 'message'],
      },
      description: '发现的问题。',
    },
    stats: {
      type: 'object',
      additionalProperties: true,
      description: '七段数量、绝对化用词数、未溯源实体数、边界提示是否存在。',
    },
  },
  required: ['pass', 'score', 'findings', 'stats'],
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

/** @param {unknown} args */
function toAuditInput(args) {
  const record = args !== null && typeof args === 'object' ? args : {}
  const str = value => (typeof value === 'string' ? value : '')
  return {
    answer: str(record.answer),
    chartData: str(record.chartData),
    systems: Array.isArray(record.systems) ? record.systems.filter(value => typeof value === 'string') : [],
    topic: str(record.topic),
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

/** Register the post-draft audit tool. @param {import('@deepseek-ai/cordis').Context} ctx */
export function registerAuditTool(ctx) {
  const mode = getSettings().auditMode
  ctx.tools.register({
    name: AUDIT_TOOL_NAME,
    description: '交付前自检：把写好的七段式解读正文和用户原始盘面一起传入，检查七段是否齐全、是否出现绝对化表述、'
      + '敏感主题是否带专业边界、正文是否引用了输入中不存在的星曜/宫位/干支/牌名/行星度数。'
      + '返回问题清单与得分；高优先级问题必须改完再交付。不修改正文、不排盘。'
      + (mode === 'off' ? '（当前设置 auditMode=off，用户已关闭自检提示。）' : ''),
    parameters: AUDIT_PARAMETERS,
    isConcurrencySafe: () => true,
    output: {
      schema: AUDIT_SCHEMA,
      render(_args, value) {
        return [{ type: 'text', text: renderAudit(/** @type {ReturnType<typeof auditAnswer>} */ (value)) }]
      },
    },
    async execute(args) {
      const result = auditAnswer(toAuditInput(args))
      const settings = getSettings()
      if (settings.auditMode === 'strict' && !result.pass) {
        return { ...result, pass: false }
      }
      return result
    },
  })
}
