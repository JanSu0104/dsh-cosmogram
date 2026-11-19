/**
 * Registers the `suanming` skill: the reading contract, the seven-section
 * output structure, and the boundaries of every supported system.
 *
 * @module dsh-suanming/lib/skill
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** Registered skill name. */
export const SKILL_NAME = 'suanming'

const DESCRIPTION = '解读用户提供的紫微斗数、八字四柱、六爻、奇门遁甲、风水、塔罗、星座星盘、姓名学或择日资料。'
  + '只解读现成的盘面、卦象、牌阵、星盘与日期范围，不自行排盘，不编造星曜、宫位、四化、八字、卦象或牌意；'
  + '缺数据时先要数据，按七段式输出并标注边界。'

const WHEN_TO_USE = '用户贴出命盘、卦象、塔罗牌阵、星盘、姓名或择日信息并要求解读时；'
  + '用户只给出生时间、性别或问题、需要先确认还缺哪些数据时；'
  + '需要多体系对照、解释冲突，或整理七段式解读时。'

/** @param {import('@deepseek-ai/cordis').Context} ctx */
export function registerSuanmingSkill(ctx) {
  const bodyUrl = new URL('../assets/suanming.md', import.meta.url)
  const content = readFileSync(bodyUrl, 'utf8')
  const resourceBase = {
    kind: 'directory',
    path: fileURLToPath(new URL('../references', import.meta.url)),
  }

  ctx.skills.register({
    name: SKILL_NAME,
    description: DESCRIPTION,
    whenToUse: WHEN_TO_USE,
    content,
    invocation: { modelInvocable: true, userInvocable: true },
    source: 'runtime',
    provider: 'dsh-suanming',
    resourceBase,
  })
}
