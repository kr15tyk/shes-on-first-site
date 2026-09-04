import { useEffect, useState } from 'react'

export type Team = {
  id: string
  name: string
  abbr: string
}

export type Game = {
  id: string
  start: string
  rawStart: string
  status: 'Final' | 'Live' | 'Upcoming'
  venue: string
  homeTeam: Team
  awayTeam: Team
  homeScore: number | null
  awayScore: number | null
}

export type BattingLeader = {
  id: string
  slug: string
  name: string
  team: string
  teamAbbr: string
  position: string
  g: number
  pa: number
  ab: number
  avg: number
  obp: number
  slg: number
  ops: number
  hr: number
  rbi: number
  bb: number
  sb: number
  rank: number
}

export type PitchingLeader = {
  id: string
  slug: string
  name: string
  team: string
  teamAbbr: string
  position: string
  g: number
  ip: string
  era: number
  whip: number
  so: number
  bb: number
  h: number
  rank: number
}

export type PlayerBattingStats = Omit<BattingLeader, 'rank'> & {
  r: number
  h: number
  doubles: number
  triples: number
  bb: number
  so: number
}

export type PlayerPitchingStats = Omit<PitchingLeader, 'rank'> & {
  er: number
}

export type PlayerSeasonRecord = {
  id: string
  slug: string
  name: string
  team: string
  teamAbbr: string
  position: string
  batting: PlayerBattingStats | null
  pitching: PlayerPitchingStats | null
}

type Source = { label: string; url: string }

export type WpblData = {
  schedule: {
    source: Source
    fetchedAt: string
    timeZone: string
    timeAdjustmentMinutes: number
    games: Game[]
  }
  leaders: {
    source: Source
    fetchedAt: string
    throughDate: string
    qualifications: {
      batting: string
      pitching: string
      note: string
    }
    batting: BattingLeader[]
    pitching: PitchingLeader[]
  }
  players: {
    source: Source
    fetchedAt: string
    throughDate: string
    method: string
    players: PlayerSeasonRecord[]
  }
  manifest: {
    source: Source
    fetchedAt: string
    throughDate: string
    timeZone: string
    transformations: string[]
    quality: {
      feedGames: number
      publishedGames: number
      duplicateOrPlaceholderGamesRemoved: number
      completedGames: number
      verifiedBoxscores: number
      boxscoreErrors: string[]
    }
  }
}

const dataPromises = new Map<string, Promise<WpblData>>()

function loadWpblData(path: string) {
  if (!dataPromises.has(path)) {
    dataPromises.set(path, fetch(path, { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error('The inaugural-season data could not be loaded.')
      const data = await response.json()
      if (data.schemaVersion !== 1 || !data.schedule?.games || !data.players?.players || !data.leaders || !data.manifest) {
        throw new Error('The season snapshot is unavailable. Please try again later.')
      }
      return data as WpblData
    }).catch((error) => { dataPromises.delete(path); throw error }))
  }
  return dataPromises.get(path)!
}

export function useWpblData(path = '/data/wpbl/snapshot.json') {
  const [data, setData] = useState<WpblData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    loadWpblData(path)
      .then((value) => mounted && setData(value))
      .catch((reason: Error) => mounted && setError(reason.message))
    return () => { mounted = false }
  }, [path])

  return { data, error, loading: !data && !error }
}

export const formatGameDate = (value: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(new Date(value))

export const formatGameTime = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value))

export const formatThroughDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T12:00:00Z`))

export const formatRate = (value: number) => value.toFixed(3).replace(/^0/, '')
