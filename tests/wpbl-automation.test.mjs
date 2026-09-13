import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { inningsToOuts, buildSeasonStats, fetchAllGames } from '../scripts/fetch-wpbl-data.mjs'
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

const pageGame = (i) => ({ game_id: String(i), scheduled_start: '2026-09-03T23:30:00Z', status: 'Final', home_team_name: 'Boston Hunters', away_team_name: 'Los Angeles Queens' })

test('collects beyond the default 50 and verifies the end after a short page', async () => {
  const source = Array.from({ length: 59 }, (_, i) => pageGame(i))
  const offsets = []
  const result = await fetchAllGames(async (url) => {
    const offset = Number(new URL(url).searchParams.get('offset'))
    offsets.push(offset)
    const games = source.slice(offset, offset + 50)
    return { count: games.length, games }
  })
  assert.deepEqual(offsets, [0, 50, 59])
  assert.equal(result.games.length, 59)
  assert.equal(result.games.at(-1).game_id, '58')
})

test('pagination failures and ignored offsets cannot publish partial data', async () => {
  const games = Array.from({ length: 50 }, (_, i) => pageGame(i))
  await assert.rejects(fetchAllGames(async () => ({ count: 50, games })), /repeated/)
  await assert.rejects(fetchAllGames(async (url) => {
    if (new URL(url).searchParams.get('offset') === '50') throw new Error('network failure')
    return { count: 50, games }
  }), /network failure/)
  await assert.rejects(fetchAllGames(async () => ({ count: 50, games: [] })), /Invalid games page/)
})

test('recognizes source inning states without treating a live game as final', () => {
  validateGames({ games: [{ ...pageGame(1), status: 'In Progress - Top of 1st' }] })
  validateGames({ games: [{ ...pageGame(1), status: 'In Progress - Bottom of 9th' }] })
  assert.throws(() => validateGames({ games: [{ ...pageGame(1), status: 'In Progress - unknown' }] }))
})

test('ERA follows the official seven-inning scale', () => {
  const games = [{ game_id: 'g', home_team_id: 'a', away_team_id: 'b' }]
  const boxes = [{ game_id: 'g', teams: [{ id: 'a', name: 'Boston Hunters', players: [{ id: 'p', name: 'Pitcher', pitching: { ip: '7.0', er: 2, h: 4, bb: 3, so: 5 } }] }] }]
  const result = buildSeasonStats(boxes, games, '2026-09-04')
  assert.equal(result.leaderboards.pitching[0].era, 2)
  assert.equal(result.leaderboards.pitching[0].whip, 1)
})

test('zero-out totals preserve counts and null rates; later outs produce correct season rates', async () => {
  const games = [{ game_id: 'g', home_team_id: 'a', away_team_id: 'b' }]
  for (const er of [0, 2]) {
    const box = { game_id: 'g', teams: [{ id: 'a', name: 'Boston Hunters', players: [{ id: 'p', name: 'Pitcher', pitching: { ip: '0.0', er, h: 3, bb: 2, so: 0 } }] }] }
    const result = buildSeasonStats([box], games, '2026-09-13')
    const p = result.players[0].pitching
    assert.deepEqual([p.ip, p.era, p.whip, p.er, p.h, p.bb, p.g], ['0.0', null, null, er, 3, 2, 1])
    assert.equal(result.leaderboards.pitching.length, 0)
    const snapshot = JSON.parse(await readFile(new URL('../public/data/wpbl/snapshot.json', import.meta.url)))
    snapshot.players.players = result.players
    validateSnapshot(JSON.parse(JSON.stringify(snapshot)))
    for (const invalid of [0, undefined, NaN, Infinity, '0']) {
      const broken = structuredClone(snapshot)
      broken.players.players[0].pitching.era = invalid
      assert.throws(() => validateSnapshot(broken), /Zero-out era/)
    }
    const later = structuredClone(box)
    later.game_id = 'g2'
    later.teams[0].players[0].pitching = { ip: '1.0', er: 1, h: 1, bb: 0, so: 2 }
    const combined = buildSeasonStats([box, later], [...games, { ...games[0], game_id: 'g2' }], '2026-09-13').players[0].pitching
    assert.deepEqual([combined.era, combined.whip, combined.g], [(er + 1) * 7, 6, 2])
    snapshot.players.players[0].pitching = combined
    validateSnapshot(snapshot)
    for (const invalid of [null, undefined, NaN, Infinity, -1, '0']) {
      const broken = structuredClone(snapshot)
      broken.players.players[0].pitching.whip = invalid
      assert.throws(() => validateSnapshot(broken), /Invalid whip/)
    }
  }
})

const identityGame = (id, date) => ({ game_id: id, home_team_id: 'a', away_team_id: 'b', scheduled_start: date })
const identityBox = (game, id, profile_url) => ({ game_id: game, teams: [{ id: 'a', name: 'Boston Hunters', players: [{ id, name: 'Test Player', profile_url, hitting: { ab: 2, h: 1, r: 1, bb: 1 }, pitching: { ip: '1.0', er: 1, h: 1, bb: 0, so: 1 } }] }] })

test('changing IDs with the same official profile retain all totals and source identities', () => {
  const url = 'https://www.womensprobaseballleague.com/players/test-player/'
  const games = [identityGame('g1','2026-08-01'),identityGame('g2','2026-09-11')]
  const boxes = [identityBox('g1','old',url),identityBox('g2','new',url)]
  const result = buildSeasonStats(boxes, games, '2026-09-13')
  assert.equal(result.players.length, 1)
  const p = result.players[0]
  assert.equal(p.id,'old')
  assert.deepEqual(p.sourceIds,['new','old'])
  assert.deepEqual([p.batting.g,p.batting.pa,p.batting.h,p.pitching.g,p.pitching.ip,p.pitching.er],[2,6,2,2,'2.0',2])
  assert.deepEqual(buildSeasonStats([...boxes].reverse(),games,'2026-09-13').players,result.players)
})

test('unresolved same-name IDs cannot overwrite earlier hitting or pitching totals', () => {
  const games = [identityGame('g1','2026-08-01'),identityGame('g2','2026-09-11')]
  assert.throws(()=>buildSeasonStats([identityBox('g1','old'),identityBox('g2','new')],games,'2026-09-13'),/identity collision/)
})

test('duplicate canonical appearances and conflicting URLs stop aggregation', () => {
  const url = 'https://www.womensprobaseballleague.com/players/test-player/'
  const box = identityBox('g','old',url)
  box.teams[0].players.push({...box.teams[0].players[0],id:'new'})
  assert.throws(()=>buildSeasonStats([box],[identityGame('g','2026-08-01')],'2026-09-13'),/Duplicate canonical/)
  assert.throws(()=>buildSeasonStats([identityBox('g1','id',url),identityBox('g2','id',url.replace('test-player','other-player'))],[identityGame('g1','2026-08-01'),identityGame('g2','2026-09-11')],'2026-09-13'),/Conflicting profile/)
})

test('reviewed missing-URL aliases preserve totals and reject unexpected names', () => {
  const boxes = [identityBox('g1','ow19tkcctx9fd643'),identityBox('g2','gwnsxjnoq1owclex')]
  for (const box of boxes) box.teams[0].players[0].name = 'Paloma Benach'
  const games = [identityGame('g1','2026-08-01'),identityGame('g2','2026-09-11')]
  assert.equal(buildSeasonStats(boxes,games,'2026-09-13').players[0].batting.g,2)
  boxes[1].teams[0].players[0].name = 'Someone Else'
  assert.throws(()=>buildSeasonStats(boxes,games,'2026-09-13'),/alias name changed/)
})

test('a snapshot cannot silently lose a previously published source player ID', async () => {
  const previous = JSON.parse(await readFile(new URL('../public/data/wpbl/snapshot.json',import.meta.url)))
  const next = structuredClone(previous)
  next.players.players[0].id = 'replacement-id'
  assert.throws(()=>validateSnapshot(next,previous),/source ID disappeared/)
})


test('reviewed Claire source name variation keeps one stable player and rejects other names', () => {
  const boxes = [identityBox('g1','pz426861jkjn70d3'),identityBox('g2','kfli26dz84mtz2rh')]
  boxes[0].teams[0].players[0].name = "Claire O'Sullivan"
  boxes[1].teams[0].players[0].name = "Catherine O'Sullivan"
  const games = [identityGame('g1','2026-08-01'),identityGame('g2','2026-09-12')]
  const result = buildSeasonStats(boxes,games,'2026-09-13')
  assert.equal(result.players.length,1)
  assert.equal(result.players[0].name,"Claire O'Sullivan")
  assert.equal(result.players[0].batting.g,2)
  boxes[1].teams[0].players[0].name = 'Someone Else'
  assert.throws(()=>buildSeasonStats(boxes,games,'2026-09-13'),/alias name changed/)
})


test('reviewed Emi spelling variation retains her totals and display name', () => {
  const boxes = [identityBox('g1','i7y6bj0a1i8uwwgu'),identityBox('g2','n0gb2fusndobpf7p')]
  boxes[0].teams[0].players[0].name = 'Emi Saiki'
  boxes[1].teams[0].players[0].name = 'Emi Saki'
  const result = buildSeasonStats(boxes,[identityGame('g1','2026-08-01'),identityGame('g2','2026-09-12')],'2026-09-13')
  assert.equal(result.players.length,1)
  assert.equal(result.players[0].name,'Emi Saiki')
  assert.equal(result.players[0].batting.g,2)
})
