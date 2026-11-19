/**
 * The plugin's configuration schema.
 *
 * DSH renders a plugin's settings page from `Config`, so declaring one gives
 * the plugin an adjustable form without shipping any browser code. The schema
 * is loaded dynamically: the plugin stays dependency-free, and if the host's
 * `@deepseek-ai/schemastery` cannot be resolved the plugin still starts, just
 * without a settings page.
 *
 * @module dsh-cosmogram/lib/config
 */

import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Try the bare specifier, then the schemastery copy shipped with the host. */
async function loadSchema() {
  try {
    const mod = await import('@deepseek-ai/schemastery')
    const z = mod?.default ?? mod
    if (z?.object) return z
  } catch {
    /* fall through to the host copy */
  }
  const roots = [process.env.DSH_PROFILE_DIR, join(homedir(), '.dsh', 'profiles', 'desktop'), join(process.cwd(), 'node_modules')]
  for (const root of roots) {
    if (!root) continue
    const candidates = [join(root, 'node_modules', '@deepseek-ai', 'schemastery', 'lib', 'index.mjs')]
    try {
      for (const name of readdirSync(join(root, 'node_modules', '@deepseek-ai'))) {
        if (name.startsWith('schemastery')) candidates.push(join(root, 'node_modules', '@deepseek-ai', name, 'lib', 'index.mjs'))
      }
    } catch {
      /* ignore missing directories */
    }
    for (const file of candidates) {
      if (!existsSync(file)) continue
      try {
        const mod = await import(pathToFileURL(file).href)
        const z = mod?.default ?? mod
        if (z?.object) return z
      } catch {
        /* try the next candidate */
      }
    }
  }
  return undefined
}

const z = await loadSchema()

/** Configuration schema, or undefined when the host provides none. */
export const Config = z === undefined ? undefined : z.object({
  strictness: z
    .union([z.const('strict'), z.const('balanced'), z.const('lenient')])
    .default('balanced')
    .description('数据门槛：strict 要求所有必要元素齐全；balanced 缺项时只做有限解读并注明；lenient 只要求覆盖率达到阈值。'),
  coverageThreshold: z
    .number()
    .min(0)
    .max(100)
    .default(60)
    .description('lenient 模式下的覆盖率门槛（0–100）。'),
  showFacts: z
    .boolean()
    .default(true)
    .description('在校验结果里附上由输入确定性推出的要点（八字十神、星盘相位）。关闭可省 token。'),
  auditMode: z
    .union([z.const('off'), z.const('warn'), z.const('strict')])
    .default('warn')
    .description('交付前自检强度：off 不提示；warn 只报告问题；strict 要求高优先级问题清零后才算通过。'),
})

export default Config
