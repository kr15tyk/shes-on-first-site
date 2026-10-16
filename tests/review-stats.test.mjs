import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { selectReviewSnapshot } from '../public/review-stats.js'
const baseline = JSON.parse(await readFile(new URL('../public/data/wpbl/snapshot.json', import.meta.url)))
const slug = 'denae-benites'
test('review stats use the requested player and reject incomplete, stale, regressing, and malformed data', () => {
  assert.equal(selectReviewSnapshot(baseline, slug, '2026-08-01').batting.hr, baseline.players.players.find(p => p.slug === slug).batting.hr)
  for (const mutate of [
    s => { s.manifest.quality.boxscoreErrors.push('failed game') },
    s => { s.manifest.quality.sourceStale = true },
    s => { s.manifest.quality.verifiedBoxscores-- },
    s => { s.players.throughDate = '2000-01-01' },
    s => { s.players.players = [] },
    s => { s.players.players.find(p => p.slug === slug).batting.avg = null },
    s => { s.players.players.find(p => p.slug === slug).batting.hr = '<script>' },
  ]) {
    const changed = structuredClone(baseline); mutate(changed)
    assert.throws(() => selectReviewSnapshot(changed, slug, '2026-08-01'))
  }
  assert.throws(() => selectReviewSnapshot(baseline, slug, '2099-01-01'))
})


test('a newer date cannot silently replace season totals with a smaller record', () => {
  const batting = baseline.players.players.find(p => p.slug === slug).batting
  for (const key of ['g', 'pa', 'hr', 'rbi', 'sb']) {
    assert.throws(() => selectReviewSnapshot(baseline, slug, '2026-08-01', { ...batting, [key]: batting[key] + 1 }))
  }
  assert.deepEqual(selectReviewSnapshot(baseline, slug, '2026-08-01', batting).batting, batting)
})

test('two-way and pitching-only snapshots validate innings, null rates and preserved totals', async () => {
  const { formatReviewMetric } = await import('../public/review-stats.js')
  const snapshot = structuredClone(baseline)
  const player = snapshot.players.players.find(p => p.slug === slug)
  player.pitching = { g: 1, ip: '0.0', era: null, whip: null, so: 0 }
  let result = selectReviewSnapshot(snapshot, slug, '2026-08-01')
  assert.equal(result.pitching.outs, 0)
  assert.equal(formatReviewMetric('pitching', 'era', result.pitching), '—')
  player.pitching = { g: 2, ip: '1.2', era: 4.2, whip: 1.2, so: 3 }
  result = selectReviewSnapshot(snapshot, slug, '2026-08-01', {}, { g: 1, outs: 0, so: 0 })
  assert.equal(result.pitching.outs, 5)
  assert.equal(formatReviewMetric('pitching', 'era', result.pitching), '4.20')
  assert.throws(() => selectReviewSnapshot(snapshot, slug, '2026-08-01', {}, { outs: 6 }))
  assert.throws(() => selectReviewSnapshot(snapshot, slug, '2026-08-01', {}, { so: 4 }))
  for (const bad of [{ ip: '1.3' }, { era: null }, { whip: -1 }, { outs: 4 }]) {
    const changed = structuredClone(snapshot)
    Object.assign(changed.players.players.find(p => p.slug === slug).pitching, bad)
    assert.throws(() => selectReviewSnapshot(changed, slug, '2026-08-01'))
  }
  player.batting = null
  assert.ok(selectReviewSnapshot(snapshot, slug, '2026-08-01').pitching)
  assert.throws(() => selectReviewSnapshot(snapshot, slug, '2026-08-01', { g: 1 }))
})
