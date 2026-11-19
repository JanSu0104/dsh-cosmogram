/**
 * Shared reference tables for the deterministic layers.
 *
 * Everything here is a lookup table, not a calendar. Nothing in this module
 * turns a birth time into a chart; the tables only translate material the
 * user already supplied.
 *
 * @module dsh-cosmogram/lib/data
 */

/** Ten heavenly stems, in order. */
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

/** Twelve earthly branches, in order. */
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/** Element of each stem. */
export const STEM_ELEMENT = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']

/** Polarity of each stem: 阳 or 阴. */
export const STEM_POLARITY = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴']

/** Element of each branch (primary). */
export const BRANCH_ELEMENT = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水']

/** Hidden stems per branch, strongest first. */
export const HIDDEN_STEMS = {
  子: ['癸'],
  丑: ['己', '癸', '辛'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲'],
}

/** Weight of each hidden stem by depth: 本气 / 中气 / 余气. */
export const HIDDEN_WEIGHT = [1, 0.5, 0.3]

/** Six clashes. */
export const CLASHES = [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']]

/** Six combinations. */
export const COMBINATIONS = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']]

/** Three-harmony groups. */
export const TRIADS = [['申', '子', '辰'], ['亥', '卯', '未'], ['寅', '午', '戌'], ['巳', '酉', '丑']]

/** Which element each element generates. */
export const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }

/** Which element each element controls. */
export const CONTROLS = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

/** Zodiac sign order and their elements / modes. */
export const SIGNS = ['白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼']
export const SIGN_EN = {
  aries: 0, taurus: 1, gemini: 2, cancer: 3, leo: 4, virgo: 5,
  libra: 6, scorpio: 7, sagittarius: 8, capricorn: 9, aquarius: 10, pisces: 11,
}
export const SIGN_ELEMENT = ['火', '土', '风', '水', '火', '土', '风', '水', '火', '土', '风', '水']
export const SIGN_MODE = ['基本', '固定', '变动', '基本', '固定', '变动', '基本', '固定', '变动', '基本', '固定', '变动']

/** Planets the reader is asked to paste, in conventional order. */
export const PLANETS = ['太阳', '月亮', '水星', '金星', '火星', '木星', '土星', '天王星', '海王星', '冥王星']
export const PLANET_EN = {
  sun: '太阳', moon: '月亮', mercury: '水星', venus: '金星', mars: '火星',
  jupiter: '木星', saturn: '土星', uranus: '天王星', neptune: '海王星', pluto: '冥王星',
}

/** Major aspects with their exact angle and a generous default orb. */
export const ASPECTS = [
  { name: '合相', angle: 0, orb: 8 },
  { name: '对分相', angle: 180, orb: 8 },
  { name: '三分相', angle: 120, orb: 6 },
  { name: '四分相', angle: 90, orb: 6 },
  { name: '六分相', angle: 60, orb: 4 },
]

/** Zi Wei main stars. */
export const ZIWEI_MAIN_STARS = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军']

/** Zi Wei palaces (both spellings used in the wild). */
export const ZIWEI_PALACES = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '仆役宫', '官禄宫', '事业宫', '田宅宫', '福德宫', '父母宫', '身宫']

/** Qi Men gates. */
export const QIMEN_GATES = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门']

/** Qi Men stars. */
export const QIMEN_STARS = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心']

/** Qi Men spirits. */
export const QIMEN_SPIRITS = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天']

/** Tarot major arcana (Rider-Waite order). */
export const TAROT_MAJOR = ['愚者', '魔术师', '女祭司', '女皇', '皇帝', '教皇', '恋人', '战车', '力量', '隐者', '命运之轮', '正义', '倒吊人', '死神', '节制', '恶魔', '高塔', '星星', '月亮', '太阳', '审判', '世界']

/** Tarot suits and court ranks, used to recognize minor cards. */
export const TAROT_SUITS = ['权杖', '圣杯', '宝剑', '星币', '金币']
export const TAROT_RANKS = ['侍从', '骑士', '王后', '国王']

/** Absolute or fate-like wording the assistant must not use. */
export const ABSOLUTE_WORDS = ['注定', '一定', '必然', '必定', '绝对', '必发', '肯定会', '毫无疑问', '死局', '铁定', '百分之百', '100%']

/** Topics that require a professional-advice boundary. */
export const SENSITIVE_TOPICS = ['健康', '法律', '投资', '心理', '婚姻']

/**
 * All entity names an answer may cite, grouped by the system that owns them.
 * Used by the audit to catch material that is not in the supplied chart.
 */
export const ENTITIES = {
  ziwei: [...ZIWEI_MAIN_STARS, ...ZIWEI_PALACES, '化禄', '化权', '化科', '化忌'],
  bazi: [...STEMS, ...BRANCHES],
  liuyao: ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤', '世爻', '应爻', '动爻'],
  qimen: [...QIMEN_GATES, ...QIMEN_STARS, ...QIMEN_SPIRITS],
  tarot: [...TAROT_MAJOR, ...TAROT_SUITS, ...TAROT_RANKS],
  astro: [...PLANETS, ...SIGNS, '上升', '天顶'],
  fengshui: ['坐向', '朝向', '罗盘', '玄关', '明堂'],
  name: ['三才', '五格', '天格', '人格', '地格', '外格', '总格'],
  date: ['黄道', '黑道', '建除', '十二神'],
}

/** Entities that are too common in prose to be treated as fabricated. */
const COMMON = new Set(['乾', '坤', '震', '巽', '坎', '离', '艮', '兑', '太阳', '月亮', '金', '木', '水', '火', '土', '子', '午', '门', '星', '神'])

/** @param {string} system */
export function entityList(system) {
  return (ENTITIES[system] ?? []).filter(name => !COMMON.has(name))
}
