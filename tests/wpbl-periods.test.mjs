import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPeriods, buildSeasonStats, gamePeriod } from '../scripts/fetch-wpbl-data.mjs'
import { validateSnapshot } from '../scripts/wpbl-validation.mjs'

const games = ['regular', 'postSeason'].map((game_type, i) => ({
  game_id: `g${i}`, game_type, scheduled_start: `2026-09-${i ? '22' : '06'}T23:00:00Z`,
  home_team_id: 'a', away_team_id: 'b', presto_data: { eventType: { isPostSeason: !!i } },
}))
const boxes = games.map((game, i) => ({ game_id: game.game_id, teams: [{ id: 'a', name: 'Boston Hunters', players: [{
  id: 'p', name: 'Test Player', hitting: { ab: 2 + i, h: 1 + i, hr: i, bb: 1, rbi: i },
  pitching: { ip: i ? '0.2' : '1.1', er: i, h: i, bb: i, so: 1 },
}] }] }))
const checked = '2026-10-16T12:00:00Z'
function snapshot() {
  const stats = buildSeasonStats(boxes, games, checked)
  return {
    schemaVersion: 1,
    schedule: { games: games.map(g => ({ id: g.game_id, start: g.scheduled_start, status: 'Final', period: gamePeriod(g) })) },
    leaders: { ...stats.leaderboards, throughDate: '2026-09-22' },
    players: { throughDate: '2026-09-22', players: stats.players },
    manifest: { fetchedAt: checked, throughDate: '2026-09-22', timeZone: 'America/New_York', quality: { verifiedBoxscores: 2, completedGames: 2, boxscoreErrors: [] } },
    periods: buildPeriods(boxes, games, checked),
  }
}

test('period follows explicit source metadata, not the game date', () => {
  assert.equal(gamePeriod({ ...games[0], scheduled_start: games[1].scheduled_start }), 'regular')
  assert.equal(gamePeriod(games[1]), 'postseason')
  assert.throws(() => gamePeriod({ ...games[0], game_type: 'exhibition' }), /classification/)
  assert.throws(() => gamePeriod({ ...games[0], presto_data: games[1].presto_data }), /classification/)
})

test('independent season rates, qualifications, cutoffs and innings reconcile with combined totals', () => {
  const data = snapshot()
  validateSnapshot(data)
  const { regular, postseason } = data.periods
  assert.equal(regular.players.throughDate, '2026-09-06')
  assert.equal(postseason.players.throughDate, '2026-09-22')
  assert.equal(regular.players.players[0].batting.avg, 1 / 2)
  assert.equal(postseason.players.players[0].batting.avg, 2 / 3)
  assert.equal(postseason.players.players[0].pitching.ip, '0.2')
  assert.match(postseason.leaders.qualifications.batting, /2 plate/)
  assert.equal(regular.players.players[0].id, postseason.players.players[0].id)
})

test('missing, misassigned or altered period records cannot publish', () => {
  for (const mutate of [
    d => d.periods.postseason.gameIds.pop(),
    d => { d.periods.regular.players.players[0].batting.hr += 1 },
    d => { d.periods.regular.players.throughDate = '2026-09-22' },
    d => { d.schedule.games[0].period = 'postseason' },
  ]) {
    const data = snapshot(); mutate(data); assert.throws(() => validateSnapshot(data))
  }
  const old = snapshot(); const next = structuredClone(old); delete next.periods
  assert.throws(() => validateSnapshot(next, old), /periods disappeared/)
})

test('no postseason yet is empty, and missing box scores fail closed', () => {
  const data = buildPeriods(boxes.slice(0, 1), games.slice(0, 1), checked)
  assert.equal(data.postseason.players.throughDate, '')
  assert.deepEqual(data.postseason.players.players, [])
  assert.throws(() => buildPeriods([], games, checked), /coverage/)
})

test('postseason qualification uses each team’s own games, including eliminated teams', () => {
  const short = { ...games[1], game_id: 'short', home_team_id: 'c', away_team_id: 'd' }
  const long = Array.from({ length: 8 }, (_, i) => ({ ...games[1], game_id: `long${i}` }))
  const shortBox = { game_id: 'short', teams: [{ id: 'c', name: 'New York Heights', players: [{ id: 'short-player', name: 'Short Player', hitting: { ab: 2, h: 2 } }] }] }
  const longBoxes = long.map(g => ({ ...boxes[1], game_id: g.game_id }))
  const stats = buildPeriods([shortBox, ...longBoxes], [short, ...long], checked)
  assert.ok(stats.postseason.leaders.batting.some(p => p.name === 'Short Player'))
})
