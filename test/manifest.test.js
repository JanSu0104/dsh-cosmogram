import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = relative => readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8')
const packageJson = JSON.parse(read('package.json'))

test('manifest declares a DSH bundle patch', () => {
  assert.equal(packageJson.name, 'dsh-cosmogram')
  assert.equal(packageJson.type, 'module')
  assert.equal(packageJson.license, 'MIT')
  assert.equal(packageJson.dsh?.bundle?.patch, './cordis.patch.yml')
})

test('manifest exports the icon and locale resources Plugin Manager reads', () => {
  assert.equal(packageJson.exports['./icon'], './icon.svg')
  assert.equal(packageJson.exports['./locale/*.json'], './locale/*.json')
  assert.equal(packageJson.icon, './icon.svg')
  for (const needed of ['index.js', 'cordis.patch.yml', 'locale/*.json', 'icon.svg', 'assets', 'references', 'prompts']) {
    assert.ok(packageJson.files.includes(needed), `files includes ${needed}`)
  }
})

test('patch inserts one package-root row with the package name', () => {
  const patch = read('cordis.patch.yml')
  assert.match(patch, /- insert:/)
  assert.match(patch, /id: cosmogram/)
  assert.match(patch, /name: dsh-cosmogram/)
})

test('locales carry a title and description for the row and details page', () => {
  for (const locale of ['en', 'zh']) {
    const messages = JSON.parse(read(`locale/${locale}.json`))
    assert.ok(messages.meta.title.length > 0, `${locale} title`)
    assert.ok(messages.meta.description.length > 40, `${locale} description`)
  }
  assert.equal(JSON.parse(read('locale/zh.json')).meta.title, 'Cosmogram 命理解读')
})

test('icon is a self-contained SVG within the size limit', () => {
  const icon = read('icon.svg')
  assert.ok(Buffer.byteLength(icon) < 256 * 1024)
  assert.match(icon, /^<svg[\s>]/)
  assert.doesNotMatch(icon, /<script|<text|<foreignObject|<style|<image/)
})

test('the skill body states the non-fabrication rules and the request sentence', () => {
  const body = read('assets/cosmogram.md')
  assert.match(body, /不排盘/)
  assert.match(body, /不编造|自造数据/)
  assert.match(body, /请提供具体命盘、卦象、牌阵或星盘信息/)
  assert.match(body, /七段式/)
})

test('reference sheets cover all nine systems and the safety boundaries', () => {
  const systems = read('references/systems.md')
  for (const label of ['紫微斗数', '八字四柱', '六爻', '奇门遁甲', '风水', '塔罗', '星座星盘', '姓名学', '择日']) {
    assert.ok(systems.includes(label), `systems.md covers ${label}`)
  }
  const safety = read('references/output-and-safety.md')
  assert.match(safety, /不诊断/)
  assert.match(safety, /不构成医疗建议/)
  assert.match(safety, /红线清单/)
})

test('the machine-readable spec matches the implemented systems', async () => {
  const { SYSTEM_SPECS } = await import('../lib/intake.js')
  const spec = JSON.parse(read('prompts/cosmogram.spec.json'))
  assert.deepEqual(spec.systems.map(item => item.id), SYSTEM_SPECS.map(item => item.id))
  for (const [index, item] of spec.systems.entries()) {
    const implemented = SYSTEM_SPECS[index]
    assert.equal(item.label, implemented.label)
    assert.deepEqual(item.required.map(req => req.label), implemented.required.map(req => req.label))
  }
  assert.equal(spec.outputStructure.length, 7)
})

test('the portable prompt pack exists for non-DSH communities', () => {
  const prompt = read('prompts/cosmogram.prompt.md')
  assert.match(prompt, /只解读/)
  assert.match(prompt, /请提供具体命盘/)
  assert.ok(read('prompts/README.md').includes('ChatGPT'))
})
