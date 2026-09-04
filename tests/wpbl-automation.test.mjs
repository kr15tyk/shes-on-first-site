import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { inningsToOuts, buildSeasonStats } from '../scripts/fetch-wpbl-data.mjs'
import { validateGames, validateBoxscore, validateSnapshot, freshness } from '../scripts/wpbl-validation.mjs'

test('baseball innings qualify by outs, not decimal notation', () => {
  assert.equal(inningsToOuts('6.2'), 20)
  assert.throws(() => inningsToOuts('6.5'))
  const games = Array.from({ length: 13 }, (_, i) => ({ game_id: String(i), home_team_id: 'a', away_team_id: 'b' }))
  const boxes = [{ game_id: '0', teams: [{ id: 'a', name: 'Boston Hunters', players: [{ id: 'p', name: 'Test', pitching: { ip: '6.2', er: 1, h: 2, bb: 0, so: 5 } }] }] }]
  assert.equal(buildSeasonStats(boxes, games, '2026-09-04').leaderboards.pitching.length, 1)
})

test('empty feeds, reused IDs and unknown game states stop ingestion', () => {
  assert.throws(() => validateGames({ games: [] }))
  const g = { game_id: 'a', scheduled_start: '2026-08-01T12:00:00Z', status: 'Final', home_team_name: 'Boston Hunters', away_team_name: 'Los Angeles Queens' }
  validateGames({ games: [g] })
  assert.throws(() => validateGames({ games: [g, g] }))
  assert.throws(() => validateGames({ games: [{ ...g, status: 'Postponed' }] }))
})

test('incomplete, mismatched and missing box scores are rejected', () => {
  assert.throws(() => validateBoxscore({ game_id: 'a' }, undefined))
  assert.throws(() => validateBoxscore({ game_id: 'a' }, { game_id: 'b', status: { complete: true } }))
  assert.throws(() => validateBoxscore({ game_id: 'a' }, { game_id: 'a', status: { complete: false } }))
})

test('staleness depends on overdue scheduled games, not a fresh download timestamp', () => {
  const game = { id: 'old', start: '2026-08-30T22:30:00Z', status: 'Upcoming' }
  assert.equal(freshness([game], '2026-09-04T12:00:00Z').sourceStale, true)
  assert.equal(freshness([{ ...game, status: 'Final' }], '2026-09-04T12:00:00Z').sourceStale, false)
})

test('a missing previously completed game cannot replace the published snapshot', async () => {
  const [schedule, leaders, players, manifest] = await Promise.all(['schedule','leaders','players','manifest'].map(async (name) => JSON.parse(await readFile(new URL(`../public/data/wpbl/${name}.json`, import.meta.url)))))
  const previous = { schemaVersion: 1, schedule, leaders, players, manifest }
  validateSnapshot(previous)
  const next = structuredClone(previous)
  next.schedule.games.shift()
  next.manifest.quality.verifiedBoxscores -= 1
  next.manifest.quality.completedGames -= 1
  assert.throws(() => validateSnapshot(next, previous), /disappeared/)
})

test('optional sparse zero fields are accepted; missing core counts and score conflicts are not', () => {
  const game = { game_id: 'g', home_team_id: 'a', away_team_id: 'b', state: { home_score: 1, away_score: 0 } }
  const box = { game_id: 'g', status: { complete: true }, teams: [
    { id: 'a', players: [{ id: 'h', name: 'Hitter', hitting: { ab: '1', h: '1', r: '1' } }, { id: '', name: 'Unused roster entry' }] },
    { id: 'b', players: [{ id: 'b', name: 'Batter', hitting: { ab: '1', h: '0', r: '0' } }] },
  ] }
  validateBoxscore(game, box)
  const missing = structuredClone(box)
  delete missing.teams[0].players[0].hitting.h
  assert.throws(() => validateBoxscore(game, missing), /Missing required/)
  const conflict = structuredClone(box)
  conflict.teams[0].players[0].hitting.r = '2'
  assert.throws(() => validateBoxscore(game, conflict), /disagree/)
  const malformed = structuredClone(box)
  malformed.teams[0].players[0].hitting.sb = null
  assert.throws(() => validateBoxscore(game, malformed), /Invalid/)
})
