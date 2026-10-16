import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/data/players.ts', import.meta.url), 'utf8')
const corrections = JSON.parse(readFileSync(new URL('../src/data/playerNameCorrections.json', import.meta.url), 'utf8'))
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } })
const module = { exports: {} }
new Function('require', 'module', 'exports', outputText)((id) => {
  assert.equal(id, './playerNameCorrections.json')
  return corrections
}, module, module.exports)

test('corrected Gabrielle name preserves her published route and connects to canonical statistics', () => {
  const player = module.exports.getPlayer('gabriella-haas')
  assert.equal(player.name, 'Gabrielle Haas')
  assert.equal(player.statsSlug, 'gabrielle-haas')
  assert.equal(player.number, 15)
  assert.equal(module.exports.allPlayers.length, 60)
  const dir = new URL('../dist/_routes/', import.meta.url)
  const route = readdirSync(dir).map(file => readFileSync(new URL(file, dir), 'utf8')).find(html => html.includes('https://shesonfirst.com/inaugural-60/gabriella-haas'))
  assert.ok(route)
  assert.match(route, /Gabrielle Haas/)
  assert.match(route, /inaugural-60\/gabriella-haas/)
})

test('audited names and statistics aliases preserve established player routes', () => {
  const cases = [
    ['maria-jose-valenzuela','Maria José Valenzuela','maria-jose-valenzuela'],
    ['valerie-perez','Val Perez','valerie-perez'],
    ['gigi-schiano','Gigi Schiano','gisella-schiano'],
    ['mo-ne-davis',"Mo'ne Davis",'mone-davis'],
    ['jacqui-reynolds','Jacqui Reynolds','jacqueline-reynolds'],
    ['claire-o-sullivan',"Claire O'Sullivan",'claire-osullivan'],
  ]
  for (const [slug,name,statsSlug] of cases) {
    const player = module.exports.getPlayer(slug)
    assert.equal(player.name,name)
    assert.equal(player.statsSlug,statsSlug)
    assert.equal(player.slug,slug)
  }
  assert.equal(new Set(module.exports.allPlayers.map(p=>p.slug)).size,60)
})
