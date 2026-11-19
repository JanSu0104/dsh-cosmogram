/**
 * Runtime settings for the plugin.
 *
 * The values come from the bundle row's `config`, which DSH renders as a
 * settings page from `Config`. `setSettings` is called once per activation, so
 * a configuration change takes effect when the plugin recomposes.
 *
 * @module dsh-cosmogram/lib/settings
 */

/** Defaults; every setting has a working default so the plugin runs unconfigured. */
export const DEFAULTS = {
  strictness: 'balanced',
  coverageThreshold: 60,
  showFacts: true,
  auditMode: 'warn',
}

let current = { ...DEFAULTS }

/** @param {unknown} value */
export function setSettings(value) {
  const record = value !== null && typeof value === 'object' ? value : {}
  const strictness = ['strict', 'balanced', 'lenient'].includes(record.strictness) ? record.strictness : DEFAULTS.strictness
  const auditMode = ['off', 'warn', 'strict'].includes(record.auditMode) ? record.auditMode : DEFAULTS.auditMode
  const threshold = Number(record.coverageThreshold)
  current = {
    strictness,
    auditMode,
    showFacts: record.showFacts === undefined ? DEFAULTS.showFacts : Boolean(record.showFacts),
    coverageThreshold: Number.isFinite(threshold) ? Math.min(100, Math.max(0, threshold)) : DEFAULTS.coverageThreshold,
  }
  return current
}

/** @returns {typeof DEFAULTS} */
export function getSettings() {
  return current
}
