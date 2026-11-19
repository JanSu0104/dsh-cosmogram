/**
 * dsh-cosmogram — a traditional-metaphysics and divination reading assistant
 * for DeepSeek Harness.
 *
 * The bundle contributes four capabilities, all dependency-free:
 * - a `cosmogram` skill with the reading contract, the seven-section output
 *   structure, and the boundaries of the nine supported systems;
 * - a `cosmogram_intake` tool that validates the supplied material, reports
 *   coverage and structural problems, derives what the material already
 *   determines (BaZi ten gods, elements, clashes, voids; chart aspects), and
 *   returns the answer skeleton plus the exact follow-up questions;
 * - a `cosmogram_audit` tool that checks a drafted answer against the supplied
 *   material before it is delivered;
 * - a session tab (Client half) that shows the plugin's runtime state and lets
 *   the user change its settings in place.
 *
 * Neither tool casts or derives a chart.
 *
 * @module dsh-cosmogram
 */

import { registerCosmogramSkill } from './lib/skill.js'
import { registerIntakeTool, registerAuditTool } from './lib/tool.js'
import { DEFAULTS, setSettings } from './lib/settings.js'
import { loadStored } from './lib/store.js'
import { registerRoutes } from './lib/routes.js'
import { Config } from './lib/config.js'

export { Config }

/** Cordis plugin name. */
export const name = 'dsh-cosmogram'

/** Services required by this plugin. */
export const inject = ['skills', 'tools']

/**
 * Register the skill, both tools, and the panel's host route.
 * Settings resolve as: defaults ← bundle config ← values saved in the panel.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {Record<string, unknown>} [config] resolved bundle config
 */
export function apply(ctx, config) {
  setSettings({ ...DEFAULTS, ...(config ?? {}), ...loadStored() })
  registerCosmogramSkill(ctx)
  registerIntakeTool(ctx)
  registerAuditTool(ctx)
  registerRoutes(ctx)
}
