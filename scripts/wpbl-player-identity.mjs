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
]
const reviewedNames = ['Diana Ibarra', "Claire O'Sullivan", 'Paloma Benach', 'Suzu Narasaki', 'Olivia Bricker', 'Emi Saiki']
const reviewed = new Map(reviewedIds.flatMap(ids => ids.map(id => [id, ids[0]])))
const expectedNames = new Map(reviewedIds.flatMap((ids, i) => ids.map(id => [id, reviewedNames[i]])))

export function resolvePlayerIdentities(boxscores, games) {
  const dates = new Map(games.map(g => [g.game_id, g.scheduled_start]))
  const rows = [...boxscores].sort((a,b) => String(dates.get(a.game_id)).localeCompare(String(dates.get(b.game_id))) || a.game_id.localeCompare(b.game_id))
    .flatMap(box => box.teams.flatMap(team => team.players.filter(p => p.hitting || p.pitching).map(player => ({ player, game: box.game_id }))))
  const urls = new Map()
  for (const { player } of rows) {
    if (expectedNames.has(player.id) && player.name !== expectedNames.get(player.id)) throw new Error(`Reviewed alias name changed for ${player.id}`)
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
    let group = groups.get(key)
    if (!group) {
      group = { id: reviewed.get(player.id) || player.id, sourceIds: new Set(), profileUrl: url || null, slug: url ? new URL(url).pathname.split('/')[2] : null }
      groups.set(key, group)
    }
    const appearance = `${game}:${key}`
    if (appearances.has(appearance)) throw new Error(`Duplicate canonical player in game ${game}: ${player.name}`)
    appearances.add(appearance)
    group.sourceIds.add(player.id)
    byId.set(player.id, group)
  }
  return byId
}
