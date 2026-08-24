import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_URL = 'https://stats.womensprobaseballleague.com/v1'
const TIME_ZONE = 'America/New_York'
const START_TIME_ADJUSTMENT_MINUTES = 60
const OUTPUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/wpbl')

const teamAbbreviations = {
  'Boston Hunters': 'BOS',
  'Los Angeles Queens': 'LA',
  'New York Heights': 'NY',
  'San Francisco Firebells': 'SF',
}

const number = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
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

function inningsToOuts(value) {
  const [innings = '0', outs = '0'] = String(value || '0').split('.')
  return number(innings) * 3 + Math.min(number(outs), 2)
}

function outsToInnings(outs) {
  return `${Math.floor(outs / 3)}.${outs % 3}`
}

function playerRecord(map, player, team, gameDate) {
  const key = player.id || `${slugify(player.name)}:${team.id}`
  const existing = map.get(key) || {
    id: player.id || slugify(player.name),
    slug: slugify(player.name),
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

function buildLeaderboards(boxscores, completedGames, fetchedAt) {
  const hitters = new Map()
  const pitchers = new Map()
  const teamGames = new Map()

  for (const game of completedGames) {
    teamGames.set(game.home_team_id, (teamGames.get(game.home_team_id) || 0) + 1)
    teamGames.set(game.away_team_id, (teamGames.get(game.away_team_id) || 0) + 1)
  }

  for (const boxscore of boxscores) {
    const gameDate = boxscore.source_updated_at || boxscore.fetched_at || fetchedAt
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

  const batting = [...hitters.values()]
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
        avg,
        obp,
        slg,
        ops: obp + slg,
        hr: record.hr,
        rbi: record.rbi,
        sb: record.sb,
      }
    })
    .filter((record) => record.pa >= battingMinPa)
    .sort((a, b) => b.ops - a.ops || b.hr - a.hr || b.rbi - a.rbi)
    .slice(0, 10)
    .map((record, index) => ({ ...record, rank: index + 1 }))

  const pitching = [...pitchers.values()]
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
      }
    })
    .filter((record) => number(record.ip) >= pitchingMinInnings)
    .sort((a, b) => a.era - b.era || a.whip - b.whip || b.so - a.so)
    .slice(0, 10)
    .map((record, index) => ({ ...record, rank: index + 1 }))

  return {
    source: { label: 'Official WPBL statistics feed', url: `${BASE_URL}/games` },
    fetchedAt,
    qualifications: {
      batting: `Minimum ${battingMinPa} plate appearances`,
      pitching: `Minimum ${pitchingMinInnings} innings pitched`,
      note: 'She’s On First qualification rules for this inaugural-season view.',
    },
    batting,
    pitching,
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return response.json()
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
  const { games, removed } = dedupeGames(payload.games || [])
  const completedGames = games.filter(isFinal)
  const { results: fetchedBoxscores, errors } = await fetchBoxscores(completedGames)
  const verifiedBoxscores = fetchedBoxscores
    .filter(({ boxscore }) => boxscore?.status?.complete)
    .map(({ boxscore }) => boxscore)

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
  const leaders = {
    ...buildLeaderboards(verifiedBoxscores, completedGames, fetchedAt),
    throughDate,
  }

  const manifest = {
    source: schedule.source,
    fetchedAt,
    throughDate,
    timeZone: TIME_ZONE,
    transformations: [
      `Adjusted 2026 scheduled_start values by ${START_TIME_ADJUSTMENT_MINUTES} minutes after source testing.`,
      'Removed unplayed duplicate records when a completed record existed for the same date and matchup.',
      'Calculated leaderboards from completed game box scores only.',
    ],
    quality: {
      feedGames: payload.games?.length || 0,
      publishedGames: schedule.games.length,
      duplicateOrPlaceholderGamesRemoved: removed,
      completedGames: completedGames.length,
      verifiedBoxscores: verifiedBoxscores.length,
      boxscoreErrors: errors,
    },
  }

  await mkdir(OUTPUT_DIR, { recursive: true })
  await Promise.all(
    [
      ['schedule.json', schedule],
      ['leaders.json', leaders],
      ['manifest.json', manifest],
    ].map(([file, data]) => writeFile(resolve(OUTPUT_DIR, file), `${JSON.stringify(data, null, 2)}\n`)),
  )

  console.log(
    `WPBL snapshot: ${schedule.games.length} games, ${leaders.batting.length} batting leaders, ${leaders.pitching.length} pitching leaders, through ${throughDate}`,
  )
  if (errors.length) console.warn(`Boxscore errors: ${errors.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
