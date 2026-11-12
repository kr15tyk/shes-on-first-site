import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// Render the real component; freshness fetching and unrelated batting/date
// formatting are isolated so the test needs no browser or network.
const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../src/components/PlayerSeasonStats.tsx', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: {
  jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
} })
const module = { exports: {} }
new Function('require', 'module', 'exports', outputText)((id) => {
  if (id === './DataFreshness') return { default: () => null, __esModule: true }
  if (id === '../data/wpbl') return { periodLabels: { regular: 'Regular season', postseason: 'Postseason' }, formatRate: (n) => n.toFixed(3), formatThroughDate: (d) => d }
  return require(id)
}, module, module.exports)
const Component = module.exports.default
const snapshot = JSON.parse(readFileSync(new URL('./fixtures/profile-season-periods.json', import.meta.url), 'utf8'))
const slugs = ['denae-benites', 'ashton-lansdell', 'claire-eccles', 'kelsie-whitmore', 'alli-schroder']
test('full profile tables preserve source counting stats independently for both periods', () => {
  for (const period of ['regular', 'postseason']) for (const slug of slugs) {
    const stats = snapshot.periods[period].players.players.find(p => p.slug === slug)
    assert.ok(stats, `${slug} ${period} fixture`)
    const html = renderToStaticMarkup(React.createElement(Component, { period, stats, loading: false, error: '', expanded: true }))
    const tables = [...html.matchAll(/<table.*?<caption>(.*?)<\/caption>(.*?)<\/table>/gs)]
    for (const category of ['batting', 'pitching']) {
      if (!stats[category]) continue
      const table = tables.find(t => t[1].includes(category))
      assert.ok(table, `${slug} ${period} ${category}`)
      assert.ok(table[1].startsWith(period === 'regular' ? 'Regular season' : 'Postseason'))
      const rows = Object.fromEntries([...table[2].matchAll(/<abbr[^>]*>(.*?)<\/abbr>.*?<td>(.*?)<\/td>/gs)].map(m => [m[1], m[2]]))
      const fields = category === 'batting' ? {AB:'ab',R:'r',H:'h','2B':'doubles','3B':'triples',BB:'bb',SO:'so'} : {IP:'ip',H:'h',ER:'er',BB:'bb',SO:'so'}
      for (const [label, field] of Object.entries(fields)) assert.equal(rows[label], String(stats[category][field]), `${slug} ${period} ${label}`)
    }
    assert.doesNotMatch(html, /NaN|Infinity|undefined/)
  }
})
