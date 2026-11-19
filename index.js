/**
 * dsh-suanming — a traditional-metaphysics and divination reading assistant
 * for DeepSeek Harness.
 *
 * The bundle contributes two capabilities, both dependency-free:
 * - a `suanming` skill with the reading contract, the seven-section output
 *   structure, and the boundaries of the nine supported systems;
 * - a `suanming_intake` tool that checks whether the user's supplied chart
 *   material is complete and returns the answer skeleton plus the exact
 *   follow-up questions. The tool never casts or derives a chart.
 *
 * @module dsh-suanming
 */

import { registerSuanmingSkill } from './lib/skill.js'
import { registerIntakeTool } from './lib/tool.js'

/** Cordis plugin name. */
export const name = 'dsh-suanming'

/** Services required by this plugin. */
export const inject = ['skills', 'tools']

/**
 * Register the skill and the intake tool on the installing profile.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  registerSuanmingSkill(ctx)
  registerIntakeTool(ctx)
}
