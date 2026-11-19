/**
 * Intake validation for traditional-metaphysics readings.
 *
 * Pure, dependency-free logic: it never casts a chart, never derives stars,
 * hexagrams, cards or planetary positions. It only checks whether the user
 * supplied material contains the minimum elements each system needs, then
 * builds the seven-section answer skeleton required by the skill.
 *
 * @module dsh-cosmogram/lib/intake
 */

import { deriveFacts, renderFacts } from './derive.js'
import { getSettings } from './settings.js'
import { BRANCHES } from './data.js'

/** One required evidence group inside a system's supplied data. */
/**
 * @typedef {object} Requirement
 * @property {string} key stable identifier
 * @property {string} label human label used in reports
 * @property {string} question one concrete follow-up question
 * @property {(text: string) => boolean} check whether the supplied text carries it
 */

/**
 * @typedef {object} SystemSpec
 * @property {string} id stable id
 * @property {string} label Chinese label
 * @property {string} en English label
 * @property {readonly string[]} aliases accepted spellings
 * @property {readonly Requirement[]} required minimum evidence
 * @property {readonly Requirement[]} recommended evidence that sharpens the reading
 * @property {readonly string[]} optional nice-to-have evidence
 * @property {string} scope what this system can and cannot answer
 */

/** The canonical follow-up sentence required when no chart data exists. */
export const ASK_FOR_DATA = '请提供具体命盘、卦象、牌阵或星盘信息。如果暂时没有，可以发出生时间、性别、出生地、问题主题，以及你希望使用的体系。'

/** Supported question topics. */
export const TOPICS = ['事业', '财运', '感情', '学业', '健康', '决策', '流年', '近期运势', '其他']

/** Supported data origins. */
export const DATA_SOURCES = ['本地排盘工具', '用户截图', '文字盘', '第三方网站', '未知']

/** @param {string} text @param {string} needle */
const has = (text, needle) => text.includes(needle)

/** @param {string} text @param {readonly string[]} needles @param {number} min */
const hasAny = (text, needles, min = 1) => needles.filter(needle => has(text, needle)).length >= min

/** @param {string} text @param {RegExp} re */
const matches = (text, re) => re.test(text)

const MAIN_STARS = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军']
const PALACES = ['命宫', '身宫', '财帛宫', '官禄宫', '事业宫', '夫妻宫', '子女宫', '田宅宫', '福德宫', '父母宫', '兄弟宫', '疾厄宫', '迁移宫', '交友宫', '仆役宫']
const GATES = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门']
const PLANETS = ['太阳', '月亮', '水星', '金星', '火星', '木星', '土星', '天王星', '海王星', '冥王星']
const SIGNS = ['白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼']
const TAROT_MAJOR = ['愚者', '魔术师', '女祭司', '女皇', '皇帝', '教皇', '恋人', '战车', '力量', '隐者', '命运之轮', '正义', '倒吊人', '死神', '节制', '恶魔', '高塔', '星星', '月亮', '太阳', '审判', '世界']
const TAROT_MINOR = ['权杖', '圣杯', '宝剑', '星币', '金币', '侍从', '骑士', '王后', '国王']

/**
 * Count GanZhi pillars in free text. A labelled pillar ("年柱") also counts.
 * @param {string} text
 */
function pillarCount(text) {
  const pairs = text.match(/[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]/g) ?? []
  const labelled = ['年柱', '月柱', '日柱', '时柱'].filter(label => has(text, label)).length
  return Math.max(pairs.length, labelled)
}

/** @param {string} text */
function palaceCount(text) {
  return PALACES.filter(palace => has(text, palace)).length
}

/** @type {readonly SystemSpec[]} */
export const SYSTEM_SPECS = [
  {
    id: 'ziwei',
    label: '紫微斗数',
    en: 'Zi Wei Dou Shu',
    aliases: ['紫微斗数', '紫微', 'ziwei', 'zwds'],
    scope: '擅长结构性格局、资源与压力分布、阶段重心；不回答精确事件日期、他人心思、健康诊断。',
    required: [
      {
        key: 'palaces',
        label: '宫位与命宫落点',
        question: '请补充完整十二宫（至少命宫、身宫、财帛、官禄、夫妻、福德）与各宫宫干。',
        check: text => has(text, '命宫') && palaceCount(text) >= 5,
      },
      {
        key: 'stars',
        label: '主星/辅星',
        question: '请补充各宫主星与重要辅星（紫微、天机、太阳、武曲等十四主星及常用辅星）。',
        check: text => hasAny(text, MAIN_STARS, 3),
      },
      {
        key: 'sihua',
        label: '生年四化',
        question: '请补充生年四化（化禄、化权、化科、化忌分别落在哪一宫）。',
        check: text => matches(text, /化禄|化权|化科|化忌|四化/),
      },
    ],
    recommended: [
      {
        key: 'gender',
        label: '性别与出生时间',
        question: '补充性别与出生时间，便于判断大限顺逆与起运。',
        check: text => matches(text, /男|女|性别|乾造|坤造|\d{4}年|\d{1,2}时/),
      },
    ],
    optional: ['大限与流年', '身宫落点'],
  },
  {
    id: 'bazi',
    label: '八字四柱',
    en: 'BaZi four pillars',
    aliases: ['八字', '四柱', '八字四柱', 'bazi', '子平'],
    scope: '擅长性格与做事方式、资源结构、阶段节奏；不回答具体婚期、精确财运数字、疾病诊断。',
    required: [
      {
        key: 'pillars',
        label: '四柱干支',
        question: '请补充完整四柱（年柱、月柱、日柱、时柱的天干地支），只有出生时间的话需要先排盘。',
        check: text => pillarCount(text) >= 4,
      },
    ],
    recommended: [
      {
        key: 'gender',
        label: '性别',
        question: '补充性别，便于判断大运顺逆。',
        check: text => matches(text, /男|女|性别|乾造|坤造/),
      },
      {
        key: 'luck',
        label: '大运与流年',
        question: '补充大运与当前流年，可把阶段判断落得更实。',
        check: text => matches(text, /大运|流年|起运/),
      },
    ],
    optional: ['出生地与真太阳时'],
  },
  {
    id: 'liuyao',
    label: '六爻',
    en: 'Liu Yao',
    aliases: ['六爻', 'liuyao', '卦', '文王卦'],
    scope: '擅长单件事的当下走势、阻力来源、推进节奏；不回答一卦多问、他人隐私、精确到日的保证。',
    required: [
      {
        key: 'hexagram',
        label: '本卦与变卦',
        question: '请补充本卦卦名，如有动爻请一并给出变卦（之卦）。',
        check: text => hasAny(text, ['本卦', '主卦', '卦名', '卦象', '变卦', '之卦'], 1) || matches(text, /[乾兑离震巽坎艮坤]为[天泽火雷风水山地]/),
      },
      {
        key: 'moving',
        label: '动爻',
        question: '请说明哪几爻发动（如二爻、五爻），以及对应的变爻；无动爻也请注明。',
        check: text => matches(text, /动爻|变卦|之卦|静卦|无动爻/),
      },
      {
        key: 'monthDay',
        label: '月建与日辰',
        question: '请补充起卦时的月建与日辰（或准确的起卦时间与节气），这是判断旺衰的必要条件。',
        check: text => matches(text, /月建|日辰|日建|月令|旬空|空亡|起卦时间|农历|公历/),
      },
    ],
    recommended: [
      {
        key: 'shiying',
        label: '世应与六亲',
        question: '补充世应、六亲与六神，可细化阻力来源与应期判断。',
        check: text => matches(text, /世爻|应爻|六亲|六神|用神/),
      },
    ],
    optional: ['用神取法'],
  },
  {
    id: 'qimen',
    label: '奇门遁甲',
    en: 'Qi Men Dun Jia',
    aliases: ['奇门', '奇门遁甲', 'qimen'],
    scope: '擅长特定时空下的配合度、方位与节奏倾向、协作关系；不回答无盘面时的方位建议、精确结果。',
    required: [
      {
        key: 'ju',
        label: '阴阳遁与局数',
        question: '请补充这是阳遁还是阴遁、第几局，以及起局时间。',
        check: text => matches(text, /阳遁|阴遁|[一二三四五六七八九1-9]局|局数/),
      },
      {
        key: 'palaces',
        label: '九宫盘面',
        question: '请补充九宫盘（每宫的天干、九星、八门、八神），至少给出用神所在宫。',
        check: text => hasAny(text, ['坎宫', '坤宫', '震宫', '巽宫', '中宫', '乾宫', '兑宫', '艮宫', '离宫'], 3),
      },
      {
        key: 'gates',
        label: '八门/九星/八神',
        question: '请补充八门、九星、八神的落宫情况，尤其是用神宫的配置。',
        check: text => hasAny(text, GATES, 1) || matches(text, /天蓬|天任|天冲|天辅|天英|天芮|天柱|天心|值符|腾蛇|太阴|六合|白虎|玄武|九地|九天/),
      },
    ],
    recommended: [
      {
        key: 'zhifu',
        label: '值符值使',
        question: '补充值符值使，判断这一盘的主导力量与执行力量。',
        check: text => matches(text, /值符|值使/),
      },
    ],
    optional: ['问事类别', '三奇六仪'],
  },
  {
    id: 'fengshui',
    label: '风水',
    en: 'Feng Shui',
    aliases: ['风水', 'fengshui', '堪舆', '阳宅'],
    scope: '擅长布局与动线改善、功能区安排；不回答不见现场就断吉凶、要求大额改造或替代建筑安全评估。',
    required: [
      {
        key: 'orientation',
        label: '坐向或朝向',
        question: '请补充房屋坐向（如坐北朝南）或至少说明大门朝向。',
        check: text => matches(text, /坐[东南西北]|向[东南西北]|坐向|朝向|坐山/),
      },
      {
        key: 'layout',
        label: '户型与功能区',
        question: '请描述户型或平面布局（大门、卧室、厨房、卫生间、客厅位置，有无缺角）。',
        check: text => hasAny(text, ['户型', '平面图', '布局', '卧室', '客厅', '厨房', '大门', '卫生间', '阳台', '书房'], 2),
      },
    ],
    recommended: [
      {
        key: 'compass',
        label: '罗盘与环境',
        question: '补充罗盘度数、楼层与周边环境，判断会更具体。',
        check: text => matches(text, /罗盘|度数|楼层|采光|周边/),
      },
    ],
    optional: ['居住人信息'],
  },
  {
    id: 'tarot',
    label: '塔罗',
    en: 'Tarot',
    aliases: ['塔罗', '塔罗牌', 'tarot'],
    scope: '擅长当下心理动力、选择的代价、关系互动模式；不回答医学诊断、他人隐私、精确日期。',
    required: [
      {
        key: 'spread',
        label: '牌阵与位置含义',
        question: '请说明使用的牌阵名称，以及每个位置分别代表什么。',
        check: text => matches(text, /牌阵|凯尔特|三张|五张|七张|十字|生命之树|关系牌阵|事业牌阵|二选一/),
      },
      {
        key: 'cards',
        label: '牌名',
        question: '请补充每张牌的名称（大牌或小牌皆可）。',
        check: text => hasAny(text, TAROT_MAJOR, 1) || hasAny(text, TAROT_MINOR, 1),
      },
      {
        key: 'orientation',
        label: '正位/逆位',
        question: '请标注每张牌是正位还是逆位。',
        check: text => matches(text, /正位|逆位|reversed|upright/i),
      },
    ],
    recommended: [
      {
        key: 'horizon',
        label: '时间范围',
        question: '补充你关心的时段（本周、本月或未来三个月），便于把牌阵落到近期可观察的变化。',
        check: text => matches(text, /时间范围|本周|本月|三个月|近期|未来|半年/),
      },
    ],
    optional: ['提问背景', '切牌或指示牌'],
  },
  {
    id: 'astrology',
    label: '星座星盘',
    en: 'Astrology chart',
    aliases: ['星座', '星盘', '占星', 'astrology', '本命盘'],
    scope: '擅长性格底色、情绪模式、关系需求、阶段主题；不回答未给时间地点却精确到宫的判断、健康诊断。',
    required: [
      {
        key: 'planets',
        label: '行星落座',
        question: '请补充行星落座（至少太阳、月亮、上升与其他主要行星所在的星座）。',
        check: text => hasAny(text, PLANETS, 3),
      },
      {
        key: 'signs',
        label: '星座/度数',
        question: '请补充每颗行星所在的星座或度数。',
        check: text => hasAny(text, SIGNS, 1),
      },
      {
        key: 'houses',
        label: '宫位',
        question: '请补充宫位信息（上升星座与各行星落入第几宫），没有出生时间与地点时请先说明。',
        check: text => matches(text, /第?[一二三四五六七八九十0-9]+宫|宫位|宫头/),
      },
    ],
    recommended: [
      {
        key: 'aspects',
        label: '主要相位',
        question: '补充主要相位（合相、三分、四分、对分），可看出内部张力与合作点。',
        check: text => matches(text, /相位|合相|三分|四分|对分|刑|冲|180|90|120|60/),
      },
    ],
    optional: ['宫主星', '行运或流年'],
  },
  {
    id: 'name',
    label: '姓名学',
    en: 'Name analysis',
    aliases: ['姓名', '姓名学', 'name', '取名'],
    scope: '擅长名字的语感与含义、称呼印象、用字层面的观察；不回答改名就能改运的断言。',
    required: [
      {
        key: 'name',
        label: '姓名用字',
        question: '请提供要分析的姓名用字（不必给全名，可只给名）。',
        check: text => matches(text, /姓名|名字|名叫|取名|用字/) || /[\u4e00-\u9fa5]{1,3}[，,、\s]/.test(text),
      },
      {
        key: 'strokes',
        label: '笔画依据',
        question: '请说明笔画依据（康熙字典繁体还是现代简体），以及是否已有三才五格结果。',
        check: text => matches(text, /笔画|五格|三才|康熙|繁体|简体/),
      },
      {
        key: 'element',
        label: '五行归类或字义',
        question: '请补充字的五行归类或字义偏好（是否补某项五行、想要什么气质）。',
        check: text => matches(text, /五行|属[金木水火土]|喜用|字义|偏旁/),
      },
    ],
    recommended: [
      {
        key: 'birth',
        label: '出生信息',
        question: '补充出生信息，可用于对照五行与用字偏好。',
        check: text => matches(text, /出生|生于|生日|\d{4}年/),
      },
    ],
    optional: ['性别', '英文名对照'],
  },
  {
    id: 'zeri',
    label: '择日',
    en: 'Auspicious date selection',
    aliases: ['择日', '择吉', 'zeri', '看日子'],
    scope: '擅长日期区间的取舍、传统宜忌对照、冲突点提醒；不回答替代审批与安全评估、保证某日必成。',
    required: [
      {
        key: 'matter',
        label: '所办事项',
        question: '请说明要办的事项（嫁娶、开业、动土、搬迁、签约、出行、手术等）。',
        check: text => matches(text, /嫁娶|结婚|订婚|开业|开市|动土|搬家|入宅|安葬|出行|签约|手术|剖腹产|上任|祭祀|修造|装修/),
      },
      {
        key: 'window',
        label: '日期范围',
        question: '请给出可选的日期范围或候选日期（如本月、下月、某几天）。',
        check: text => matches(text, /20[0-9]{2}|近期|本月|下月|年内|这几天|下周|候选日期|时间段/),
      },
    ],
    recommended: [
      {
        key: 'person',
        label: '主事人信息',
        question: '补充主事人属相或八字，用于避开冲煞。',
        check: text => matches(text, /属相|生肖|八字|本人|主事人|男|女/),
      },
    ],
    optional: ['忌避条件', '地点与参与者'],
  },
]

/** Alias → canonical id. @type {Map<string, string>} */
const ALIAS_INDEX = new Map()
for (const spec of SYSTEM_SPECS) {
  ALIAS_INDEX.set(spec.id, spec.id)
  ALIAS_INDEX.set(spec.label, spec.id)
  for (const alias of spec.aliases) ALIAS_INDEX.set(alias.toLowerCase(), spec.id)
}

/**
 * Resolve a user/tool supplied system name to its canonical id.
 * @param {unknown} value
 * @returns {string | undefined}
 */
export function normalizeSystem(value) {
  if (typeof value !== 'string') return undefined
  const key = value.trim().toLowerCase()
  return ALIAS_INDEX.get(key) ?? ALIAS_INDEX.get(key.replace(/\s+/g, ''))
}

/** @param {string} id */
const specOf = id => SYSTEM_SPECS.find(spec => spec.id === id)

/**
 * Guess the system from the supplied material by counting matched requirements.
 * Confident only when at least two required elements are present.
 * @param {string} text
 * @returns {{ id: string, score: number, label: string } | undefined}
 */
export function detectSystem(text) {
  let best
  for (const spec of SYSTEM_SPECS) {
    const score = spec.required.filter(req => req.check(text)).length
    const threshold = Math.min(2, spec.required.length)
    if (score >= threshold && (best === undefined || score > best.score)) {
      best = { id: spec.id, score, label: spec.label }
    }
  }
  return best
}

const SENSITIVE = [
  { key: 'health', re: /健康|疾病|病症|手术|癌|肿瘤|就医|吃药|药物|体检|失眠|寿命/, text: '涉及健康的内容只作传统文化参考，不构成医疗建议；身体不适请及时就医。' },
  { key: 'legal', re: /官司|诉讼|起诉|仲裁|纠纷|合同|判决|律师|法律/, text: '涉及法律事务只作传统文化参考，请咨询执业律师。' },
  { key: 'investment', re: /投资|股票|基金|理财|炒股|加密|币圈|买卖点|收益/, text: '涉及投资只作传统文化参考，市场有风险，请独立判断并自担责任。' },
  { key: 'psych', re: /心理|抑郁|焦虑|情绪困扰|心理咨询|自伤|轻生|自杀/, text: '涉及心理状态只作传统文化参考，不替代心理咨询或诊断；如有持续困扰，建议寻求专业帮助。' },
  { key: 'marriage', re: /婚姻|结婚|离婚|复婚|复合|分手|彩礼|生育|怀孕|催婚/, text: '涉及婚姻与生育的重大决定，请以当事人沟通与真实处境为主，必要时咨询专业人士。' },
]

/**
 * Collect the boundary reminders that the supplied topic/context triggers.
 * @param {string} haystack
 * @returns {string[]}
 */
export function sensitiveNotes(haystack) {
  const notes = []
  for (const item of SENSITIVE) {
    if (item.re.test(haystack)) notes.push(item.text)
  }
  return notes
}

/**
 * Build the seven-section answer skeleton. Every placeholder is explicitly
 * marked so it is never mistaken for reading content.
 * @param {{ systems: readonly string[], explicit: boolean, dataSource: string, topic: string, detection?: { label: string, score: number } | undefined, missing: readonly string[], gaps: readonly string[], boundaries: readonly string[], needData: boolean, timeSensitive: boolean }} input
 * @returns {string}
 */
export function buildScaffold(input) {
  const systemLabels = input.systems.map(id => specOf(id)?.label ?? id)
  const systemLine = systemLabels.length > 0 ? systemLabels.join(' / ') : '【填写：尚未确定体系，请向用户确认或说明选择依据】'
  const basis = input.explicit
    ? '用户指定该体系'
    : input.detection !== undefined
      ? `根据数据特征判断（${input.detection.label}：命中 ${input.detection.score} 项关键要素），需向用户说明依据`
      : '【填写：体系选择依据】'
  const boundaryLines = input.boundaries.length > 0
    ? input.boundaries.map(item => `- ${item}`)
    : ['- 以上为传统文化与娱乐参考，不构成医疗、法律、投资或心理建议。']

  if (input.needData) {
    const askLines = input.missing.length > 0
      ? input.missing.map(item => `- 需补充：${item}`)
      : ['- 需补充：该体系的完整盘面。']
    return [
      '## 1. 当前使用的体系与数据来源',
      `- 体系：${systemLine}`,
      `- 数据来源：${input.dataSource || '未提供'}`,
      `- 选择依据：${basis}`,
      `- 问题主题：${input.topic || '未指定'}`,
      '',
      '## 2. 不确定或需要补充的信息',
      ...askLines,
      '',
      '> 数据不足：本轮不要输出解读、结论或七段正文，只向用户请求补充信息。',
      '',
      '> 边界提示',
      ...boundaryLines,
    ].join('\n')
  }

  const dataState = input.missing.length > 0
    ? '部分数据缺失：以下解读以现有信息为限，缺失项会限制结论强度。'
    : input.gaps.length > 0
      ? '现有数据可做初步解读；补上下列信息会更完整。'
      : '现有数据基本够用；仍需说明其他不确定项。'
  const evidenceLines = [
    `- ${dataState}`,
    ...input.missing.map(item => `- 需补充：${item}`),
    ...input.gaps.map(item => `- 可补充：${item}`),
  ]
  const otherNote = input.timeSensitive
    ? '- 【填写：其他不确定项及其影响范围（时辰校正、真太阳时、流派差异等）】'
    : '- 【填写：其他不确定项及其影响范围（流派差异、前提假设等）】'

  return [
    '## 1. 当前使用的体系与数据来源',
    `- 体系：${systemLine}`,
    `- 数据来源：${input.dataSource || '未提供'}`,
    `- 选择依据：${basis}`,
    `- 问题主题：${input.topic || '未指定'}`,
    `- 数据完整度：${input.coverage ?? 0} / 100`,
    '',
    '## 2. 关键信息摘要',
    '- 【填写：只摘与问题相关的盘面要点，3–6 条，用白话复述，标注这是盘面呈现而非结论】',
    '',
    '## 3. 核心判断',
    '- 【填写：1–3 句结论，回答用户问的那件事，用“更可能/更值得留意”而非绝对表述】',
    '',
    '## 4. 主要依据',
    '- 【填写：逐条对应摘要中的盘面要点，说明为什么这么看；有流派差异时写明】',
    '',
    '## 5. 不确定或需要补充的信息',
    ...evidenceLines,
    otherNote,
    '',
    '## 6. 可执行建议',
    '- 【填写：2–4 条用户自己能做的事，不承诺效果，不推荐付费服务】',
    '',
    '## 7. 可继续追问的问题',
    '- 【填写：2–4 个具体方向，说明补哪些数据能看得更细】',
    '',
    '> 边界提示',
    ...boundaryLines,
  ].join('\n')
}

/**
 * Validate the supplied material and prepare the answer skeleton.
 * @param {{ systems?: readonly string[], chartData?: string, dataSource?: string, topic?: string, userContext?: string, birthInfo?: string }} input
 * @returns {{
 *   status: 'ready' | 'need_data',
 *   systems: string[],
 *   systemLabels: string[],
 *   detected: string,
 *   dataSource: string,
 *   topic: string,
 *   missing: string[],
 *   gaps: string[],
 *   found: string[],
 *   notes: string[],
 *   boundaries: string[],
 *   scaffold: string
 * }}
 */
export function analyzeIntake(input = {}) {
  const chartData = typeof input.chartData === 'string' ? input.chartData.trim() : ''
  const birthInfo = typeof input.birthInfo === 'string' ? input.birthInfo.trim() : ''
  const userContext = typeof input.userContext === 'string' ? input.userContext.trim() : ''
  const dataSource = typeof input.dataSource === 'string' && input.dataSource.trim() !== ''
    ? input.dataSource.trim()
    : '未提供'
  const topic = typeof input.topic === 'string' && input.topic.trim() !== '' ? input.topic.trim() : '未指定'

  const requested = []
  for (const value of Array.isArray(input.systems) ? input.systems : []) {
    const id = normalizeSystem(value)
    if (id !== undefined && !requested.includes(id)) requested.push(id)
  }

  const detection = chartData === '' ? undefined : detectSystem(chartData)
  const systems = requested.length > 0 ? requested : (detection !== undefined ? [detection.id] : [])

  const missing = []
  const gaps = []
  const found = []
  const notes = []
  const coverageBySystem = []
  let anyUsable = false

  for (const id of systems) {
    const spec = specOf(id)
    if (spec === undefined) continue
    const hits = spec.required.filter(req => chartData !== '' && req.check(chartData))
    if (hits.length > 0) anyUsable = true
    for (const req of hits) found.push(`${spec.label}：${req.label}`)
    for (const req of spec.required) {
      if (!hits.includes(req)) missing.push(`【${spec.label}】${req.question}`)
    }
    for (const req of spec.recommended ?? []) {
      if (chartData !== '' && !req.check(chartData)) gaps.push(`【${spec.label}】${req.question}`)
    }
    if (hits.length === 0) {
      notes.push(`未在提供的材料中检测到${spec.label}数据，不要解读该体系，也不要自行补算。`)
    }
    if (hits.length > 0 && hits.length < spec.required.length) {
      notes.push(`${spec.label}数据不完整（${hits.length}/${spec.required.length} 项必要元素）：先就能确定的部分做有限解读，并注明以现有信息为限。`)
    }
    notes.push(`${spec.label}的边界：${spec.scope}`)

    const totalWeight = spec.required.length
    const gained = hits.length
    coverageBySystem.push({ id, label: spec.label, score: totalWeight === 0 ? 0 : Math.round((gained / totalWeight) * 100) })
  }

  const coverage = coverageBySystem.length === 0
    ? 0
    : Math.round(coverageBySystem.reduce((sum, item) => sum + item.score, 0) / coverageBySystem.length)
  const issues = systems.flatMap(id => consistencyIssues(id, chartData))

  if (chartData !== '' && topic === '未指定' && userContext === '') {
    gaps.push('补充想重点看的具体问题（一卦一问、一次一问），解读会更聚焦。')
  }

  const timeSensitiveSystems = new Set(['ziwei', 'bazi', 'astrology', 'name', 'zeri'])
  const timeSensitive = systems.some(id => timeSensitiveSystems.has(id))

  const boundaries = sensitiveNotes(`${topic} ${userContext} ${chartData}`)
  let status = 'ready'

  if (chartData === '') {
    status = 'need_data'
    if (systems.length === 0) {
      missing.push(ASK_FOR_DATA)
      notes.push('没有任何盘面、卦象、牌阵或星盘数据；不得先给通用运势或猜测式解读。')
    } else {
      for (const id of systems) {
        const spec = specOf(id)
        if (spec === undefined) continue
        notes.push(`用户指定了${spec.label}，但未提供任何盘面数据；先列出该体系最少需要的元素，再请用户补充。`)
      }
    }
    if (birthInfo !== '') {
      notes.push('只给了出生时间或个人信息。本助手不排盘，不能据此直接生成命盘；可以说明需要哪些盘面元素，或建议用户用排盘工具出盘。')
    }
  } else if (systems.length === 0) {
    status = 'need_data'
    missing.push('无法从现有文字判断使用哪个体系。请说明希望使用的体系（紫微斗数/八字/六爻/奇门/风水/塔罗/星座/姓名/择日），或提供该体系的完整盘面格式。')
    notes.push('材料里没有足够特征识别体系；不要猜测体系后硬套解读。')
  } else if (!anyUsable) {
    status = 'need_data'
    notes.push('提供的文字没有命中任何体系的必要元素，可能只是描述而非盘面；请用户确认是否贴入了完整盘面。')
  }

  const settings = getSettings()
  if (status === 'need_data' && settings.strictness === 'lenient' && anyUsable && coverage >= settings.coverageThreshold) {
    status = 'ready'
    notes.push(`lenient 模式放行：覆盖率 ${coverage} / 100 达到阈值 ${settings.coverageThreshold}，缺失项必须在正文中标注。`)
  }

  if (topic === '健康' && !boundaries.some(text => text.includes('医疗'))) {
    boundaries.push(SENSITIVE[0].text)
  }

  const facts = settings.showFacts && chartData !== '' ? deriveFacts({ chartData, systems }) : {}

  const scaffold = buildScaffold({
    systems,
    explicit: requested.length > 0,
    dataSource,
    topic,
    detection,
    missing,
    gaps,
    boundaries,
    needData: status === 'need_data',
    timeSensitive,
    coverage,
  })

  return {
    status,
    systems,
    systemLabels: systems.map(id => specOf(id)?.label ?? id),
    detected: detection !== undefined ? detection.label : '',
    dataSource,
    topic,
    coverage,
    coverageBySystem,
    issues: dedupe(issues),
    missing: dedupe(missing),
    gaps: dedupe(gaps),
    found: dedupe(found),
    notes: dedupe(notes),
    boundaries: dedupe(boundaries),
    facts,
    scaffold,
  }
}

/** @param {readonly string[]} list @returns {string[]} */
function dedupe(list) {
  return [...new Set(list)]
}

/**
 * Structural checks that go beyond "did the keyword appear": contradictions
 * and missing anchors that make a reading unreliable even when every required
 * keyword is present.
 * @param {string} id
 * @param {string} text
 * @returns {string[]}
 */
export function consistencyIssues(id, text) {
  if (text === '') return []
  const issues = []
  if (id === 'bazi') {
    const labelledHour = text.match(/时柱[^甲乙丙丁戊己庚辛壬癸]{0,6}([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/)
    const pairs = [...text.matchAll(/([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/g)]
    const pillar = labelledHour ?? (pairs.length >= 4 ? pairs[3] : null)
    const clock = text.match(/(\d{1,2})\s*[点時时]/)
    if (pillar !== null && clock !== null) {
      const hour = Number(clock[1])
      const expected = BRANCHES[Math.floor(((hour + 1) % 24) / 2)]
      if (expected !== pillar[2]) {
        issues.push(`时柱地支 ${pillar[2]} 与文中 ${hour} 点对应的 ${expected} 不一致，先请用户核对时辰。`)
      }
    }
    if (!/日柱|日干|日元|日主/.test(text) && !/[甲乙丙丁戊己庚辛壬癸]\s*日/.test(text)) {
      issues.push('没有可识别的日柱/日干，十神无从谈起。')
    }
  }
  if (id === 'ziwei') {
    if (/化[禄权科忌]/.test(text) && !/[甲乙丙丁戊己庚辛壬癸]\s*(年|干)/.test(text)) {
      issues.push('列了四化，但没有生年天干，四化落点无法核对。')
    }
    const palaces = new Set(text.match(/命宫|兄弟宫|夫妻宫|子女宫|财帛宫|疾厄宫|迁移宫|交友宫|官禄宫|田宅宫|福德宫|父母宫|身宫/g) ?? [])
    if (palaces.size > 0 && palaces.size < 10) issues.push(`只识别到 ${palaces.size} 个宫位，命盘结构不完整。`)
  }
  if (id === 'liuyao') {
    if (/动爻/.test(text) && !/变卦|之卦/.test(text)) issues.push('提到了动爻，却没有变卦（之卦）。')
    if (/卦/.test(text) && !/月建|日辰|日建|起卦时间|农历|公历/.test(text)) issues.push('缺月建日辰，旺衰判断没有依据。')
  }
  if (id === 'qimen' && /[一二三四五六七八九1-9]局/.test(text) && !/阳遁|阴遁/.test(text)) {
    issues.push('只给了局数，没有阴阳遁。')
  }
  if (id === 'astro' && /上升/.test(text) && !/宫/.test(text)) issues.push('给了上升，但没有宫位信息。')
  if (id === 'tarot' && /(权杖|圣杯|宝剑|星币|愚者|女祭司|魔术师)/.test(text) && !/(正位|逆位)/.test(text)) {
    issues.push('有牌名但缺正逆位。')
  }
  return issues
}

/**
 * Render the analysis as the markdown a model reads from the tool result.
 * @param {ReturnType<typeof analyzeIntake>} value
 * @returns {string}
 */
export function renderIntake(value) {
  const bar = number => `${'█'.repeat(Math.round(number / 10))}${'░'.repeat(10 - Math.round(number / 10))}`
  const lines = []
  lines.push(value.status === 'ready'
    ? '校验结果：现有材料可以开始解读。'
    : '校验结果：数据不足，先向用户补充信息，不要硬猜。')
  lines.push(`- 体系：${value.systemLabels.length > 0 ? value.systemLabels.join(' / ') : '未确定'}`)
  if (value.detected !== '') lines.push(`- 数据特征识别：${value.detected}`)
  lines.push(`- 数据来源：${value.dataSource}｜问题主题：${value.topic}`)
  lines.push(`- 数据完整度：${bar(value.coverage ?? 0)} ${value.coverage ?? 0} / 100`)
  if ((value.coverageBySystem ?? []).length > 1) {
    lines.push(`  - 分体系：${value.coverageBySystem.map(item => `${item.label} ${item.score}`).join('｜')}`)
  }
  if (value.found.length > 0) {
    lines.push(`- 已具备：${value.found.join('；')}`)
  }
  if (value.missing.length > 0) {
    lines.push('- 仍需补充（原样向用户提问，不要自行补数据）：')
    for (const item of value.missing) lines.push(`  - ${item}`)
  }
  if (value.gaps.length > 0) {
    lines.push('- 可补充（不影响先做初步解读，别当成必需项去追问）：')
    for (const item of value.gaps) lines.push(`  - ${item}`)
  }
  if ((value.issues ?? []).length > 0) {
    lines.push('- 结构性问题（先核对，不要绕过）：')
    for (const item of value.issues) lines.push(`  - ${item}`)
  }
  if (value.facts && Object.keys(value.facts).length > 0) {
    lines.push('', renderFacts(value.facts))
  }
  if (value.status === 'need_data') {
    lines.push('', '本轮只回复补充信息的请求，不要输出解读、结论或七段正文。')
    lines.push('', '当前可用的回复骨架（仅两段）：', '', value.scaffold)
  } else {
    lines.push('', '七段式输出骨架（占位符需替换成真实解读，不得把骨架当结论）：', '', value.scaffold)
  }
  if (value.notes.length > 0) {
    lines.push('', '使用提醒：')
    for (const note of value.notes) lines.push(`- ${note}`)
  }
  return lines.join('\n')
}
