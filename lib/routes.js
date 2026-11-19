/**
 * Host routes for the session-tab panel.
 *
 * The panel needs current state and a way to save settings; both go through a
 * small JSON endpoint instead of reaching into host internals. The route is
 * registered only when the host exposes `webServer`, so the plugin keeps
 * working on a host without the web layer.
 *
 * @module dsh-cosmogram/lib/routes
 */

import { readFileSync } from 'node:fs'
import { DEFAULTS, getSettings, setSettings } from './settings.js'
import { SETTINGS_PATH, clearStored, loadStored, saveStored } from './store.js'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

/** @param {Record<string, unknown>} settings */
function payload(settings) {
  return {
    ok: true,
    version: pkg.version,
    name: pkg.name,
    settings,
    defaults: DEFAULTS,
    settingsPath: SETTINGS_PATH,
    stored: loadStored(),
  }
}

/** @param {import('@deepseek-ai/cordis').Context} ctx */
export function registerRoutes(ctx) {
  let web
  try {
    web = typeof ctx.get === 'function' ? ctx.get('webServer') : undefined
  } catch {
    return false
  }
  if (!web || typeof web.register !== 'function') return false

  const api = {
    state: async () => payload(getSettings()),
    save: async args => {
      const next = args !== null && typeof args === 'object' && args.settings !== null && typeof args.settings === 'object'
        ? args.settings
        : {}
      const applied = setSettings({ ...getSettings(), ...next })
      saveStored(applied)
      return payload(applied)
    },
    reset: async () => {
      clearStored()
      const applied = setSettings(DEFAULTS)
      return payload(applied)
    },
  }

  const handler = (req, res) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      let parsed = {}
      try {
        parsed = JSON.parse(body || '{}')
      } catch {
        /* ignore malformed bodies */
      }
      const method = String(parsed?.method ?? '')
      const fn = api[method]
      if (typeof fn !== 'function') {
        res.writeHead(404, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: `unknown method ${method}` }))
        return
      }
      Promise.resolve(fn(parsed?.args))
        .then(result => {
          res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-cache' })
          res.end(JSON.stringify(result))
        })
        .catch(error => {
          res.writeHead(500, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: String(error?.message ?? error) }))
        })
    })
  }

  ctx.effect(() => web.register({ kind: 'prefix', path: '/__cosmogram', handler }))
  return true
}
