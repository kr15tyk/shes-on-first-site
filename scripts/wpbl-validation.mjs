import assert from 'node:assert/strict'

const count = (value) => value !== null && value !== '' && value !== undefined && Number.isInteger(Number(value)) && Number(value) >= 0
const id = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value)

export function validateGames(payload) {
  assert.ok(Array.isArray(payload.games) && payload.games.length > 0 && payload.games.length < 2000, 'Empty or invalid games feed')
  assert.equal(new Set(payload.games.map((g) => g.game_id)).size, payload.games.length, 'Duplicate source game IDs')
  for (const g of payload.games) {
    assert.ok(id(g.game_id), 'Invalid game ID')
    assert.ok(Number.isFinite(Date.parse(g.scheduled_start)), 'Invalid game date')
    assert.ok(typeof g.status === 'string' && /^(Not Started|Scheduled|Final.*|In Progress(?: - (?:Top|Bottom) of \d+(?:st|nd|rd|th))?|Live)$/i.test(g.status), 'Unrecognized game status; review required')
    if (/^Final/i.test(g.status)) {
      const teams = ['Boston Hunters', 'Los Angeles Queens', 'New York Heights', 'San Francisco Firebells']
      assert.ok(teams.includes(g.home_team_name) && teams.includes(g.away_team_name), 'Unmapped completed-game team')
    }
  }
}

export function validateBoxscore(game, box) {
  assert.equal(box?.game_id, game.game_id, 'Box score belongs to another game')
  assert.equal(box?.status?.complete, true, 'Box score is incomplete')
  assert.equal(box.teams?.length, 2, 'Box score needs two teams')
  assert.deepEqual(new Set(box.teams.map((t) => t.id)), new Set([game.home_team_id, game.away_team_id]), 'Box score team mismatch')
  for (const team of box.teams) {
    assert.ok(Array.isArray(team.players) && team.players.length > 0, 'Missing player lines')
    const activePlayers = team.players.filter((p) => p.hitting || p.pitching)
    assert.equal(new Set(activePlayers.map((p) => p.id)).size, activePlayers.length, 'Duplicate player lines')
    for (const player of activePlayers) {
      assert.ok(id(player.id) && typeof player.name === 'string' && player.name.length > 0 && player.name.length < 200, 'Missing player identity')
      for (const [kind, fields] of [['hitting', ['ab', 'h', 'r']], ['pitching', ['ip']]]) {
        const line = player[kind]
        if (!line) continue
        for (const field of fields) assert.ok(field in line, `Missing required ${kind} field: ${field}`)
        const counting = kind === 'hitting' ? ['ab','h','r','bb','hbp','sf','sh','hr','rbi','sb','double','triple','so'] : ['h','er','bb','so']
        for (const field of counting) if (field in line) assert.ok(count(line[field]), `Invalid ${kind} field: ${field}`)
        if (kind === 'hitting') {
          assert.ok(Number(line.h) <= Number(line.ab), 'Hits exceed at bats')
          assert.ok(Number(line.double || 0) + Number(line.triple || 0) + Number(line.hr || 0) <= Number(line.h), 'Extra-base hits exceed hits')
        } else assert.match(String(line.ip), /^\d+(?:\.[012])?$/, 'Invalid innings')
      }
    }
    const hitting = team.players.filter((p) => p.hitting)
    assert.ok(hitting.length, 'No batting data')
    const runs = hitting.reduce((sum, p) => sum + Number(p.hitting.r), 0)
    const side = team.id === game.home_team_id ? 'home' : 'away'
    const score = game.presto_data?.score?.[side] ?? game.state?.[`${side}_score`]
    assert.ok(count(score), 'Missing final score')
    assert.equal(runs, Number(score), 'Player runs disagree with final score')
  }
}

export function freshness(games, checkedAt) {
  const overdue = games.filter((g) => g.status !== 'Final' && Date.parse(g.start) < Date.parse(checkedAt) - 18 * 3600_000)
  return { sourceStale: overdue.length > 0, overdueGameIds: overdue.map((g) => g.id) }
}

export function validateSnapshot(snapshot, previous) {
  assert.equal(snapshot.schemaVersion, 1)
  const { schedule, leaders, players, manifest } = snapshot
  const finals = schedule.games.filter((g) => g.status === 'Final')
  assert.ok(Number.isFinite(Date.parse(manifest.fetchedAt)), 'Missing retrieval timestamp')
  assert.ok(finals.length > 0, 'No final games; review before replacing season data')
  assert.equal(finals.length, manifest.quality.verifiedBoxscores)
  assert.equal(finals.length, manifest.quality.completedGames)
  assert.equal(manifest.quality.boxscoreErrors.length, 0)
  assert.equal(leaders.throughDate, players.throughDate)
  assert.equal(players.throughDate, manifest.throughDate)
  assert.equal(new Set(players.players.map((p) => p.id)).size, players.players.length, 'Player identity collision')
  assert.equal(new Set(players.players.map((p) => p.slug)).size, players.players.length, 'Player slug collision')
  assert.ok(players.players.length > 0)
  for (const player of players.players) {
    if (!player.pitching) continue
    const { ip, era, whip } = player.pitching
    assert.match(String(ip), /^\d+(?:\.[012])?$/, 'Invalid aggregate innings')
    for (const [name, rate] of Object.entries({ era, whip })) {
      if (Number(ip) === 0) assert.equal(rate, null, `Zero-out ${name} must be null for ${player.id}`)
      else assert.ok(Number.isFinite(rate) && rate >= 0, `Invalid ${name} for ${player.id}`)
    }
  }
  for (const kind of ['batting', 'pitching']) {
    assert.equal(new Set(leaders[kind].map(p => p.slug)).size, leaders[kind].length, `Duplicate ${kind} leaderboard player`)
  }
  const sourceIds = players.players.flatMap(p => p.sourceIds || [p.id])
  assert.equal(new Set(sourceIds).size, sourceIds.length, 'Source player ID belongs to multiple identities')
  for (const pitcher of leaders.pitching) {
    assert.ok(Number(pitcher.ip) > 0 && Number.isFinite(pitcher.era) && pitcher.era >= 0 && Number.isFinite(pitcher.whip) && pitcher.whip >= 0,
      'Pitching leaders require recorded outs and finite rates')
  }
  validatePeriods(snapshot, previous)
  if (previous) {
    const coveredIds = new Set(sourceIds)
    for (const player of previous.players.players) {
      assert.ok((player.sourceIds || [player.id]).every(id => coveredIds.has(id)), `Previously published player source ID disappeared: ${player.slug}`)
    }
    const currentIds = new Set(finals.map((g) => g.id))
    assert.ok(previous.schedule.games.filter((g) => g.status === 'Final').every((g) => currentIds.has(g.id)), 'Previously completed game disappeared; review required')
    assert.ok(manifest.throughDate >= previous.manifest.throughDate, 'Statistics cutoff regressed')
  }
}

function validatePeriods(snapshot, previous) {
  if (!snapshot.periods) {
    assert.ok(!previous?.periods, 'Season periods disappeared')
    return // Legacy snapshots remain readable during rollout.
  }
  const finals = snapshot.schedule.games.filter(game => game.status === 'Final')
  assert.ok(finals.every(game => ['regular', 'postseason'].includes(game.period)), 'Missing game period')
  for (const period of ['regular', 'postseason']) {
    const scoped = snapshot.periods[period]
    assert.ok(scoped, 'Missing season period')
    const games = finals.filter(game => game.period === period)
    assert.deepEqual([...scoped.gameIds].sort(), games.map(game => game.id).sort(), 'Period game coverage mismatch')
    const dates = games.map(game => new Intl.DateTimeFormat('en-CA', {
      timeZone: snapshot.manifest.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(game.start))).sort()
    assert.equal(scoped.leaders.throughDate, dates.at(-1) || '', 'Incorrect period cutoff')
    assert.equal(scoped.players.throughDate, scoped.leaders.throughDate, 'Mixed period dates')
    if (games.length) validateSnapshot({ schemaVersion: 1, schedule: { ...snapshot.schedule, games },
      leaders: scoped.leaders, players: scoped.players,
      manifest: { ...snapshot.manifest, throughDate: scoped.leaders.throughDate,
        quality: { ...snapshot.manifest.quality, completedGames: games.length, verifiedBoxscores: games.length } },
    })
    else assert.equal(scoped.players.players.length + scoped.leaders.batting.length + scoped.leaders.pitching.length, 0)
  }
  const outs = ip => { const [whole, part = '0'] = String(ip).split('.'); return Number(whole) * 3 + Number(part) }
  for (const player of snapshot.players.players) {
    const parts = Object.values(snapshot.periods).map(period => period.players.players.find(p => p.id === player.id))
    for (const [kind, fields] of Object.entries({ batting: ['g','pa','ab','r','h','doubles','triples','hr','rbi','bb','so','sb'], pitching: ['g','so','bb','h','er'] })) {
      for (const field of fields) {
        assert.equal(parts.reduce((sum, p) => sum + (p?.[kind]?.[field] || 0), 0), player[kind]?.[field] || 0, `Period totals disagree: ${player.slug} ${kind} ${field}`)
      }
    }
    assert.equal(parts.reduce((sum, p) => sum + outs(p?.pitching?.ip || '0'), 0), outs(player.pitching?.ip || '0'), 'Period innings disagree')
  }
  const ids = new Set(snapshot.players.players.map(p => p.id))
  for (const period of Object.values(snapshot.periods)) assert.ok(period.players.players.every(p => ids.has(p.id)), 'Unknown period player')
}
