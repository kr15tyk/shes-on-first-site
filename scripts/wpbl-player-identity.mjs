import { readFileSync } from 'node:fs'

// These six source-ID groups lack a consistent profile_url. Reviewed against
// the preserved 2026-09-13 box scores (name, team and uniform continuity).
// Explicit aliases only: never merge unreviewed players by name alone.
const reviewedIds = [
  ['moizfkn9dtrm4vno', '27svefz41ds4k58k', 'codwzeph1tx75yns'], // Diana Ibarra
  ['pz426861jkjn70d3', 'kfli26dz84mtz2rh'], // Claire O'Sullivan
  ['ow19tkcctx9fd643', 'gwnsxjnoq1owclex'], // Paloma Benach
  ['lehztczt9t20uuv8', 'y920acalpn22r200', '7kzyrbse7dsdz9eq'], // Suzu Narasaki
  ['g03ry24i1v31ubum', '3vw0yx2ob4wb4me0'], // Olivia Bricker
  ['i7y6bj0a1i8uwwgu', 'n0gb2fusndobpf7p'], // Emi Saiki
  ['vjeeaoxap16nadnw', 'amwr4e8td49jgh3p'], // Peyton Coria (SF): feed reassigned her source ID after 2026-09-06; new ID debuts 2026-09-16, no profile_url to join on
]
const reviewedNames = ['Diana Ibarra', "Claire O'Sullivan", 'Paloma Benach', 'Suzu Narasaki', 'Olivia Bricker', 'Emi Saiki', 'Peyton Coria']
const reviewed = new Map(reviewedIds.flatMap(ids => ids.map(id => [id, ids[0]])))
const expectedNames = new Map(reviewedIds.flatMap((ids, i) => ids.map(id => [id, reviewedNames[i]])))

// Complete reviewed name registry, sourced from official WPBL profile headings.
// Name corrections never merge identities; URL/ID grouping remains separate.
const verifiedNames = JSON.parse(readFileSync(new URL('./wpbl-player-names.json', import.meta.url), 'utf8'))
const profileNames = new Map(verifiedNames.map(p => [p.source, { ...p, accepted: new Set(p.acceptedNames) }]))
const sourceNames = new Map(verifiedNames.flatMap(p => p.sourceIds.map(id => [id, p])))

export function resolvePlayerIdentities(boxscores, games) {
  const dates = new Map(games.map(g => [g.game_id, g.scheduled_start]))
  const rows = [...boxscores].sort((a,b) => String(dates.get(a.game_id)).localeCompare(String(dates.get(b.game_id))) || a.game_id.localeCompare(b.game_id))
    .flatMap(box => box.teams.flatMap(team => team.players.filter(p => p.hitting || p.pitching).map(player => ({ player, game: box.game_id }))))
  const urls = new Map()
  for (const { player } of rows) {
    const verified = sourceNames.get(player.id)
    if (verified && !verified.acceptedNames.includes(player.name.normalize('NFC'))) throw new Error(`Reviewed alias name changed for ${player.id}`)
    if (verified?.profileUrl && player.profile_url && player.profile_url !== verified.profileUrl) throw new Error(`Conflicting profile URLs for ${player.id}`)
    if (!player.profile_url) continue
    const url = new URL(player.profile_url)
    if (url.origin !== 'https://www.womensprobaseballleague.com' || !/^\/players\/[a-z0-9-]+\/$/.test(url.pathname) || url.search || url.hash) throw new Error(`Invalid official profile URL for ${player.id}`)
    const key = reviewed.get(player.id) || player.id
    if (urls.has(key) && urls.get(key) !== url.href) throw new Error(`Conflicting profile URLs for ${key}`)
    urls.set(key, url.href)
  }
  const groups = new Map(), byId = new Map(), appearances = new Set()
  for (const { player, game } of rows) {
    const sourceKey = reviewed.get(player.id) || player.id
    const url = urls.get(sourceKey)
    const key = url || sourceKey
    const display = profileNames.get(url) || (sourceNames.has(player.id) ? profileNames.get(sourceNames.get(player.id).source) : null)
    const sourceName = player.name.normalize('NFC')
    if (display && !display.accepted.has(sourceName)) throw new Error(`Unreviewed player name for ${key}: ${player.name}`)
    const canonicalName = display?.name || expectedNames.get(player.id) || sourceName
    let group = groups.get(key)
    if (!group) {
      group = { id: reviewed.get(player.id) || player.id, sourceIds: new Set(), name: canonicalName, profileUrl: url || null, slug: url ? new URL(url).pathname.split('/')[2] : null }
      groups.set(key, group)
    }
    if (group.name !== canonicalName) throw new Error(`Unreviewed player name conflict for ${key}`)
    const appearance = `${game}:${key}`
    if (appearances.has(appearance)) throw new Error(`Duplicate canonical player in game ${game}: ${player.name}`)
    appearances.add(appearance)
    group.sourceIds.add(player.id)
    byId.set(player.id, group)
  }
  return byId
}
