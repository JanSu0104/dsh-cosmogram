/**
 * Settings persistence for the session-tab panel.
 *
 * The panel writes to a JSON file beside the profile so a change survives
 * a restart without touching the profile's own manifest. The bundle config
 * still provides defaults; this file wins for the keys it holds.
 *
 * @module dsh-cosmogram/lib/store
 */

import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const base = process.env.DSH_PROFILE_DIR || join(homedir(), '.dsh', 'profiles', 'desktop')

/** Absolute path of the stored settings file. */
export const SETTINGS_PATH = join(base, 'cosmogram.settings.json')

/** @returns {Record<string, unknown>} */
export function loadStored() {
  try {
    const value = JSON.parse(readFileSync(SETTINGS_PATH, 'utf8'))
    return value !== null && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

/** @param {Record<string, unknown>} value */
export function saveStored(value) {
  writeFileSync(SETTINGS_PATH, `${JSON.stringify(value, null, 2)}\n`)
}

export function clearStored() {
  try {
    rmSync(SETTINGS_PATH, { force: true })
  } catch {
    /* nothing to remove */
  }
}
