/**
 * Client half: a session tab that shows this plugin's runtime state and lets
 * the user change its settings without leaving the conversation.
 *
 * The tab registers into `conversation.view`, the same slot the host's own
 * "对话" tab uses. State and saving go through `/__cosmogram/api`, served by
 * the Host half; the browser never reads the profile directly.
 */

window.__ModuleLoader__.load({
  id: 'dsh-cosmogram',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    function api(method, args) {
      return fetch('/__cosmogram/api', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ method, args: args || {} }),
      }).then(function (response) {
        return response.json().then(function (body) {
          if (!response.ok || body.ok === false) throw new Error((body && body.error) || 'HTTP ' + response.status)
          return body
        })
      })
    }

    const CARD = {
      border: '1px solid rgba(127,127,127,.28)',
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 14,
      background: 'rgba(127,127,127,.05)',
    }
    const LABEL = { fontSize: 12, opacity: 0.72, marginBottom: 6, display: 'block' }
    const ROW = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }
    const INPUT = {
      background: 'transparent',
      color: 'inherit',
      border: '1px solid rgba(127,127,127,.4)',
      borderRadius: 6,
      padding: '6px 8px',
      fontSize: 13,
      minWidth: 160,
    }
    const BUTTON = {
      border: '1px solid rgba(127,127,127,.4)',
      borderRadius: 6,
      padding: '6px 14px',
      fontSize: 13,
      background: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
    }
    const PRIMARY = { ...BUTTON, background: 'rgba(88,166,255,.18)', borderColor: 'rgba(88,166,255,.55)' }
    const HINT = { fontSize: 12, opacity: 0.62, marginTop: 4 }

    const STRICTNESS = [
      ['balanced', 'balanced · 缺项时做有限解读并注明缺口（默认）'],
      ['strict', 'strict · 必要元素不全就不解读'],
      ['lenient', 'lenient · 覆盖率达到阈值即放行'],
    ]
    const AUDIT = [
      ['warn', 'warn · 报告问题，不阻断（默认）'],
      ['strict', 'strict · 高优先级问题未清零不算通过'],
      ['off', 'off · 关闭自检提示'],
    ]

    function Field(props) {
      return h('div', { style: ROW },
        h('div', { style: { flex: 1 } },
          h('span', { style: LABEL }, props.title),
          h('span', { style: HINT }, props.hint)),
        props.children,
      )
    }

    function Panel() {
      const [state, setState] = React.useState(null)
      const [draft, setDraft] = React.useState(null)
      const [message, setMessage] = React.useState('')
      const [busy, setBusy] = React.useState(false)

      function apply(next) {
        setState(next)
        setDraft(next.settings)
      }
      function load() {
        api('state').then(apply).catch(function (error) { setMessage('读取失败：' + error.message) })
      }
      React.useEffect(load, [])

      function save() {
        setBusy(true)
        setMessage('')
        api('save', { settings: draft })
          .then(function (next) { apply(next); setMessage('已保存，下一轮解读按新设置执行') })
          .catch(function (error) { setMessage('保存失败：' + error.message) })
          .then(function () { setBusy(false) })
      }
      function reset() {
        if (!window.confirm('恢复默认设置？')) return
        setBusy(true)
        api('reset')
          .then(function (next) { apply(next); setMessage('已恢复默认') })
          .catch(function (error) { setMessage('恢复失败：' + error.message) })
          .then(function () { setBusy(false) })
      }

      if (!state || !draft) {
        return h('div', { style: { padding: 24, fontSize: 13, opacity: 0.75 } },
          message || '正在读取 Cosmogram 设置…')
      }

      return h('div', { style: { padding: '18px 22px', maxWidth: 720 } },
        h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 } },
          h('div', { style: { fontSize: 16, fontWeight: 600 } }, 'Cosmogram · 命理解读'),
          h('span', { style: { fontSize: 12, opacity: 0.62 } }, 'v' + state.version)),
        h('div', { style: { fontSize: 12, opacity: 0.62, marginBottom: 16 } },
          '九大体系解读插件：不排盘、不编造；缺数据先追问，交付前自检。'),

        h('div', { style: CARD },
          h('div', { style: { fontSize: 13, fontWeight: 600, marginBottom: 10 } }, '运行状态'),
          h('div', { style: { display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 6, fontSize: 13 } },
            h('span', { style: { opacity: 0.62 } }, '插件'),
            h('span', null, state.name),
            h('span', { style: { opacity: 0.62 } }, '状态'),
            h('span', null, '已启用 · 技能 1 · 工具 2（intake / audit）'),
            h('span', { style: { opacity: 0.62 } }, '设置文件'),
            h('span', { style: { fontFamily: 'ui-monospace, monospace', fontSize: 11, opacity: 0.8 } }, state.settingsPath))),

        h('div', { style: CARD },
          h('div', { style: { fontSize: 13, fontWeight: 600, marginBottom: 12 } }, '解读设置'),
          h(Field, { title: '数据门槛', hint: '决定材料不全时是追问还是先做有限解读' },
            h('select', {
              style: INPUT,
              value: draft.strictness,
              onChange: function (event) { setDraft({ ...draft, strictness: event.target.value }) },
            }, STRICTNESS.map(function (item) {
              return h('option', { key: item[0], value: item[0] }, item[1])
            }))),

          h(Field, { title: '覆盖率门槛', hint: '仅 lenient 使用；0–100' },
            h('input', {
              type: 'number', min: 0, max: 100, style: { ...INPUT, width: 90 },
              value: draft.coverageThreshold,
              onChange: function (event) { setDraft({ ...draft, coverageThreshold: Number(event.target.value) }) },
            })),

          h(Field, { title: '推演要点', hint: '八字十神、五行、星盘相位等由输入算出的要点' },
            h('label', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 } },
              h('input', {
                type: 'checkbox', checked: !!draft.showFacts,
                onChange: function (event) { setDraft({ ...draft, showFacts: event.target.checked }) },
              }),
              h('span', null, draft.showFacts ? '已开启' : '已关闭'))),

          h(Field, { title: '交付前自检', hint: '七段、绝对化用词、边界、未溯源实体' },
            h('select', {
              style: INPUT,
              value: draft.auditMode,
              onChange: function (event) { setDraft({ ...draft, auditMode: event.target.value }) },
            }, AUDIT.map(function (item) {
              return h('option', { key: item[0], value: item[0] }, item[1])
            }))),

          h('div', { style: { display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 } },
            h('button', { type: 'button', style: PRIMARY, disabled: busy, onClick: save }, busy ? '保存中…' : '保存设置'),
            h('button', { type: 'button', style: BUTTON, disabled: busy, onClick: reset }, '恢复默认'),
            message ? h('span', { style: { fontSize: 12, opacity: 0.75 } }, message) : null)),

        h('div', { style: { fontSize: 12, opacity: 0.55, lineHeight: 1.6 } },
          '设置保存在 profile 目录，重启后仍然生效。插件配置页里的值作为初始默认，本面板保存过的项以面板为准。'))
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const slots = ctx.get('slots')
        ctx.effect(function () {
          return slots.register(
            { name: 'conversation.view', id: 'dsh-cosmogram', label: '命盘', order: 8 },
            function () { return Panel }
          )
        })
      },
    }
  },
})
