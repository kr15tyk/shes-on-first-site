import { mkdir, writeFile, readFile, rename } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { validateGames, validateBoxscore, validateSnapshot, freshness } from './wpbl-validation.mjs'

const BASE_URL = 'https://stats.womensprobaseballleague.com/v1'
const TIME_ZONE = 'America/New_York'
const START_TIME_ADJUSTMENT_MINUTES = 60
const OUTPUT_DIR = resolve(process.env.WPBL_OUTPUT_DIR || resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/wpbl'))
const RAW_DIR = process.env.WPBL_RAW_DIR
const rawResponses = []

const teamAbbreviations = {
  'Boston Hunters': 'BOS',
  'Los Angeles Queens': 'LA',
  'New York Heights': 'NY',
  'San Francisco Firebells': 'SF',
}

const number = (value) => {
  const parsed = Number(value)
  if (value === undefined) return 0 // The source omits zero-valued optional counting stats.
  if (value === null || value === '' || !Number.isFinite(parsed) || parsed < 0) throw new Error('Invalid statistical value')
  return parsed
}

const adjustedStart = (value) =>
  new Date(new Date(value).getTime() + START_TIME_ADJUSTMENT_MINUTES * 60_000)

const dateKey = (date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)

const slugify = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const playerSlugAliases = {
  'maggie-fox': 'maggie-foxx',
  'val-perez': 'valerie-perez',
}

const playerSlug = (name) => {
  const sourceSlug = slugify(name)
  return playerSlugAliases[sourceSlug] || sourceSlug
}

const isFinal = (game) => /final/i.test(game.status || '') || Boolean(game.completed_at)

const hasNamedTeams = (game) =>
  Boolean(
    teamAbbreviations[game.home_team_name] &&
      teamAbbreviations[game.away_team_name] &&
      game.home_team_id &&
      game.away_team_id,
  )

function dedupeGames(games) {
  const groups = new Map()

  for (const game of games.filter(hasNamedTeams)) {
    const pair = [game.home_team_id, game.away_team_id].sort().join(':')
    const key = `${dateKey(adjustedStart(game.scheduled_start))}:${pair}`
    const group = groups.get(key) || []
    group.push(game)
    groups.set(key, group)
  }

  const kept = []
  let removed = games.length - [...groups.values()].flat().length

  for (const group of groups.values()) {
    const finals = group.filter(isFinal)
    const scheduled = group.filter((game) => !isFinal(game))

    if (finals.length > 0) {
      kept.push(...finals)
      for (const candidate of scheduled) {
        const candidateTime = adjustedStart(candidate.scheduled_start).getTime()
        const nearFinal = finals.some(
          (game) => Math.abs(adjustedStart(game.scheduled_start).getTime() - candidateTime) <= 90 * 60_000,
        )
        if (nearFinal) removed += 1
        else kept.push(candidate)
      }
      continue
    }

    const sorted = [...scheduled].sort(
      (a, b) => adjustedStart(a.scheduled_start).getTime() - adjustedStart(b.scheduled_start).getTime(),
    )
    for (const candidate of sorted) {
      const candidateTime = adjustedStart(candidate.scheduled_start).getTime()
      const duplicateIndex = kept.findIndex((game) => {
        const samePair =
          [game.home_team_id, game.away_team_id].sort().join(':') ===
          [candidate.home_team_id, candidate.away_team_id].sort().join(':')
        return samePair && Math.abs(adjustedStart(game.scheduled_start).getTime() - candidateTime) <= 90 * 60_000
      })
      if (duplicateIndex >= 0) {
        if (adjustedStart(kept[duplicateIndex].scheduled_start) < adjustedStart(candidate.scheduled_start)) {
          kept[duplicateIndex] = candidate
        }
        removed += 1
      } else {
        kept.push(candidate)
      }
    }
  }

  return {
    games: kept.sort(
      (a, b) => adjustedStart(a.scheduled_start).getTime() - adjustedStart(b.scheduled_start).getTime(),
    ),
    removed,
  }
}

export function inningsToOuts(value) {
  if (!/^\d+(?:\.[012])?$/.test(String(value))) throw new Error('Invalid baseball innings')
  const [innings, outs = '0'] = String(value).split('.')
  return number(innings) * 3 + number(outs)
}

function outsToInnings(outs) {
  return `${Math.floor(outs / 3)}.${outs % 3}`
}

function playerRecord(map, player, team, gameDate) {
  const key = player.id || `${slugify(player.name)}:${team.id}`
  const existing = map.get(key) || {
    id: player.id || slugify(player.name),
    slug: playerSlug(player.name),
    name: player.name,
    team: team.name,
    teamAbbr: teamAbbreviations[team.name] || team.code || '',
    position: String(player.position || '').toUpperCase(),
    lastGame: '',
    games: new Set(),
  }

  if (gameDate >= existing.lastGame) {
    existing.team = team.name
    existing.teamAbbr = teamAbbreviations[team.name] || team.code || ''
    existing.position = String(player.position || existing.position || '').toUpperCase()
    existing.lastGame = gameDate
  }

  map.set(key, existing)
  return existing
}

export function buildSeasonStats(boxscores, completedGames, fetchedAt) {
  const hitters = new Map()
  const pitchers = new Map()
  const teamGames = new Map()

  for (const game of completedGames) {
    teamGames.set(game.home_team_id, (teamGames.get(game.home_team_id) || 0) + 1)
    teamGames.set(game.away_team_id, (teamGames.get(game.away_team_id) || 0) + 1)
  }

  for (const boxscore of boxscores) {
    const gameDate = completedGames.find((game) => game.game_id === boxscore.game_id)?.scheduled_start || fetchedAt
    for (const team of boxscore.teams || []) {
      for (const player of team.players || []) {
        if (player.hitting) {
          const record = playerRecord(hitters, player, team, gameDate)
          const hitting = player.hitting
          record.games.add(boxscore.game_id)
          record.ab = (record.ab || 0) + number(hitting.ab)
          record.h = (record.h || 0) + number(hitting.h)
          record.bb = (record.bb || 0) + number(hitting.bb)
          record.hbp = (record.hbp || 0) + number(hitting.hbp)
          record.sf = (record.sf || 0) + number(hitting.sf)
          record.sh = (record.sh || 0) + number(hitting.sh)
          record.hr = (record.hr || 0) + number(hitting.hr)
          record.rbi = (record.rbi || 0) + number(hitting.rbi)
          record.r = (record.r || 0) + number(hitting.r)
          record.sb = (record.sb || 0) + number(hitting.sb)
          record.double = (record.double || 0) + number(hitting.double)
          record.triple = (record.triple || 0) + number(hitting.triple)
          record.so = (record.so || 0) + number(hitting.so)
        }

        if (player.pitching) {
          const record = playerRecord(pitchers, player, team, gameDate)
          const pitching = player.pitching
          record.games.add(boxscore.game_id)
          record.outs = (record.outs || 0) + inningsToOuts(pitching.ip)
          record.er = (record.er || 0) + number(pitching.er)
          record.h = (record.h || 0) + number(pitching.h)
          record.bb = (record.bb || 0) + number(pitching.bb)
          record.so = (record.so || 0) + number(pitching.so)
        }
      }
    }
  }

  const maxTeamGames = Math.max(1, ...teamGames.values())
  const battingMinPa = maxTeamGames * 2
  const pitchingMinInnings = maxTeamGames * 0.5

  const allBatting = [...hitters.values()]
    .map((record) => {
      const pa = record.ab + record.bb + record.hbp + record.sf + record.sh
      const singles = Math.max(0, record.h - record.double - record.triple - record.hr)
      const totalBases = singles + record.double * 2 + record.triple * 3 + record.hr * 4
      const avg = record.ab ? record.h / record.ab : 0
      const obpDenominator = record.ab + record.bb + record.hbp + record.sf
      const obp = obpDenominator ? (record.h + record.bb + record.hbp) / obpDenominator : 0
      const slg = record.ab ? totalBases / record.ab : 0
      return {
        id: record.id,
        slug: record.slug,
        name: record.name,
        team: record.team,
        teamAbbr: record.teamAbbr,
        position: record.position,
        g: record.games.size,
        pa,
        ab: record.ab,
        r: record.r,
        h: record.h,
        doubles: record.double,
        triples: record.triple,
        avg,
        obp,
        slg,
        ops: obp + slg,
        hr: record.hr,
        rbi: record.rbi,
        bb: record.bb,
        so: record.so,
        sb: record.sb,
      }
    })

  const batting = allBatting
    .filter((record) => record.pa >= battingMinPa)
    .sort((a, b) => b.ops - a.ops || b.hr - a.hr || b.rbi - a.rbi)
    .slice(0, 10)
    .map((record, index) => ({ ...record, rank: index + 1 }))

  const allPitching = [...pitchers.values()]
    .map((record) => {
      const innings = record.outs / 3
      return {
        id: record.id,
        slug: record.slug,
        name: record.name,
        team: record.team,
        teamAbbr: record.teamAbbr,
        position: record.position,
        g: record.games.size,
        ip: outsToInnings(record.outs),
        era: innings ? (record.er * 9) / innings : 0,
        whip: innings ? (record.bb + record.h) / innings : 0,
        so: record.so,
        bb: record.bb,
        h: record.h,
        er: record.er,
      }
    })

  const pitching = allPitching
    .filter((record) => inningsToOuts(record.ip) >= Math.ceil(pitchingMinInnings * 3))
    .sort((a, b) => a.era - b.era || a.whip - b.whip || b.so - a.so)
    .slice(0, 10)
    .map((record, index) => ({ ...record, rank: index + 1 }))

  const playersBySlug = new Map()

  for (const record of allBatting) {
    playersBySlug.set(record.slug, {
      id: record.id,
      slug: record.slug,
      name: record.name,
      team: record.team,
      teamAbbr: record.teamAbbr,
      position: record.position,
      batting: record,
      pitching: null,
    })
  }

  for (const record of allPitching) {
    const existing = playersBySlug.get(record.slug)
    playersBySlug.set(record.slug, {
      id: record.id,
      slug: record.slug,
      name: record.name,
      team: record.team,
      teamAbbr: record.teamAbbr,
      position: record.position,
      batting: existing?.batting || null,
      pitching: record,
    })
  }

  return {
    leaderboards: {
      source: { label: 'Official WPBL statistics feed', url: `${BASE_URL}/games` },
      fetchedAt,
      qualifications: {
        batting: `Minimum ${battingMinPa} plate appearances`,
        pitching: `Minimum ${pitchingMinInnings} innings pitched`,
        note: 'She’s On First qualification rules for this inaugural-season view.',
      },
      batting,
      pitching,
    },
    players: [...playersBySlug.values()].sort((a, b) => a.name.localeCompare(b.name)),
  }
}

async function fetchJson(url) {
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(20000), redirect: 'error' })
      if (!response.ok) throw new Error(`Source HTTP ${response.status}`)
      const body = await response.text()
      if (body.length > 20_000_000) throw new Error('Source response exceeds size limit')
      const payload = JSON.parse(body)
      rawResponses.push({ url, retrievedAt: new Date().toISOString(), payload })
      return payload
    } catch (error) {
      lastError = error
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  throw lastError
}

async function fetchBoxscores(games) {
  const results = []
  const errors = []

  for (let index = 0; index < games.length; index += 5) {
    const batch = games.slice(index, index + 5)
    const responses = await Promise.all(
      batch.map(async (game) => {
        try {
          const payload = await fetchJson(`${BASE_URL}/games/${game.game_id}/boxscore`)
          return { game, boxscore: payload.boxscore }
        } catch (error) {
          errors.push(`${game.game_id}: ${error.message}`)
          return null
        }
      }),
    )
    results.push(...responses.filter(Boolean))
  }

  return { results, errors }
}

async function main() {
  const fetchedAt = new Date().toISOString()
  const payload = await fetchJson(`${BASE_URL}/games`)
  validateGames(payload)
  const { games, removed } = dedupeGames(payload.games)
  const completedGames = games.filter(isFinal)
  const { results: fetchedBoxscores, errors } = await fetchBoxscores(completedGames)
  if (errors.length) throw new Error(`Missing ${errors.length} box scores; retaining previous data`)
  for (const { game, boxscore } of fetchedBoxscores) validateBoxscore(game, boxscore)
  const verifiedBoxscores = fetchedBoxscores
    .filter(({ boxscore }) => boxscore?.status?.complete)
    .map(({ boxscore }) => boxscore)

  if (verifiedBoxscores.length !== completedGames.length) throw new Error('Incomplete box-score coverage')
  const schedule = {
    source: { label: 'Official WPBL statistics feed', url: `${BASE_URL}/games` },
    fetchedAt,
    timeZone: TIME_ZONE,
    timeAdjustmentMinutes: START_TIME_ADJUSTMENT_MINUTES,
    games: games.map((game) => {
      const final = isFinal(game)
      const rawStatus = String(game.status || '')
      const live = !final && !/not started|scheduled/i.test(rawStatus)
      return {
        id: game.game_id,
        start: adjustedStart(game.scheduled_start).toISOString(),
        rawStart: game.scheduled_start,
        status: final ? 'Final' : live ? 'Live' : 'Upcoming',
        venue: game.venue || '',
        homeTeam: {
          id: game.home_team_id,
          name: game.home_team_name,
          abbr: teamAbbreviations[game.home_team_name],
        },
        awayTeam: {
          id: game.away_team_id,
          name: game.away_team_name,
          abbr: teamAbbreviations[game.away_team_name],
        },
        homeScore: final || live ? number(game.presto_data?.score?.home ?? game.state?.home_score) : null,
        awayScore: final || live ? number(game.presto_data?.score?.away ?? game.state?.away_score) : null,
      }
    }),
  }

  const finalDates = schedule.games.filter((game) => game.status === 'Final').map((game) => game.start)
  const throughDate = finalDates.length ? dateKey(new Date(finalDates.sort().at(-1))) : ''
  const { leaderboards, players: playerRecords } = buildSeasonStats(
    verifiedBoxscores,
    completedGames,
    fetchedAt,
  )
  const leaders = {
    ...leaderboards,
    throughDate,
  }
  const players = {
    source: schedule.source,
    fetchedAt,
    throughDate,
    method: 'Calculated from box scores marked complete by the official WPBL statistics feed.',
    players: playerRecords,
  }

  const manifest = {
    source: schedule.source,
    fetchedAt,
    throughDate,
    timeZone: TIME_ZONE,
    transformations: [
      'Used completed official box scores only for leaderboards and player snapshots.',
      'Removed duplicate unplayed listings when a completed game existed for the same date and matchup.',
      `Applied a consistent ${START_TIME_ADJUSTMENT_MINUTES}-minute correction to the feed's 2026 game times.`,
    ],
    quality: {
      feedGames: payload.games?.length || 0,
      publishedGames: schedule.games.length,
      duplicateOrPlaceholderGamesRemoved: removed,
      completedGames: completedGames.length,
      verifiedBoxscores: verifiedBoxscores.length,
      boxscoreErrors: errors,
      ...freshness(schedule.games, fetchedAt),
    },
  }

  const snapshot = { schemaVersion: 1, schedule, leaders, players, manifest }
  let previous
  try { previous = JSON.parse(await readFile(resolve(OUTPUT_DIR, 'snapshot.json'), 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
  validateSnapshot(snapshot, previous)
  await mkdir(OUTPUT_DIR, { recursive: true })
  await Promise.all(
    [
      ['schedule.json', schedule],
      ['leaders.json', leaders],
      ['players.json', players],
      ['manifest.json', manifest],
    ].map(([file, data]) => writeFile(resolve(OUTPUT_DIR, file), `${JSON.stringify(data, null, 2)}\n`)),
  )

  await writeFile(resolve(OUTPUT_DIR, 'snapshot.json.tmp'), `${JSON.stringify(snapshot, null, 2)}\n`)
  await rename(resolve(OUTPUT_DIR, 'snapshot.json.tmp'), resolve(OUTPUT_DIR, 'snapshot.json'))

  console.log(
    `WPBL snapshot: ${schedule.games.length} games, ${players.players.length} players, ${leaders.batting.length} batting leaders, ${leaders.pitching.length} pitching leaders, through ${throughDate}`,
  )
  if (errors.length) console.warn(`Boxscore errors: ${errors.length}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  }).finally(async () => {
    if (RAW_DIR) {
      await mkdir(RAW_DIR, { recursive: true })
      await writeFile(resolve(RAW_DIR, 'source-responses.json'), JSON.stringify(rawResponses))
    }
  })
}
