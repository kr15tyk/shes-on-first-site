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
  if (id === '../data/wpbl') return { formatRate: (n) => n.toFixed(3), formatThroughDate: (d) => d }
  return require(id)
}, module, module.exports)
const Component = module.exports.default
const render = (pitching) => renderToStaticMarkup(React.createElement(Component, {
  stats: { pitching, batting: null }, loading: false, error: '',
}))

test('zero-out pitching renders dashes and explains undefined rates', () => {
  const html = render({ g: 1, ip: '0.0', era: null, whip: null, so: 0 })
  assert.equal((html.match(/<b>—<\/b>/g) || []).length, 2)
  assert.match(html, /until a pitcher records an out/)
  assert.doesNotMatch(html, /NaN|Infinity|0\.00/)
})

test('finite pitching rates retain two decimal places without the zero-out notice', () => {
  const html = render({ g: 2, ip: '7.0', era: 2, whip: 1, so: 5 })
  assert.match(html, /<b>2\.00<\/b>/)
  assert.match(html, /<b>1\.00<\/b>/)
  assert.doesNotMatch(html, /until a pitcher records an out/)
})
