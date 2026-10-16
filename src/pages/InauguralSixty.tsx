import { useMemo, useState } from 'react'
import { allPlayers } from '../data/players'
import PlayerCard from '../components/PlayerCard'
import Seo from '../components/Seo'

const collator = new Intl.Collator('en', { sensitivity: 'base', ignorePunctuation: true })
const teamNames = Array.from(new Set(allPlayers.map((player) => player.team))).sort(collator.compare)
const teams = ['All teams', ...teamNames]
const captains: Record<string, string> = {
  'Boston Hunters': 'alli-schroder',
  'Los Angeles Queens': 'ashton-lansdell',
  'New York Heights': 'denae-benites',
  'San Francisco Firebells': 'kelsie-whitmore',
}
const surname = (name: string) => name === 'Rosi del Castillo' ? 'del Castillo' : name.split(' ').slice(-1)[0] || name

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

export default function InauguralSixty() {
  const [query, setQuery] = useState('')
  const [team, setTeam] = useState('All teams')
  const filteredPlayers = useMemo(() => {
    const normalizedQuery = normalize(query.trim())
    return allPlayers.filter((player) => {
      const matchesTeam = team === 'All teams' || player.team === team
      const matchesQuery = !normalizedQuery || normalize(`${player.name} ${player.position} ${player.team}`).includes(normalizedQuery)
      return matchesTeam && matchesQuery
    })
  }, [query, team])

  const groups = teamNames.map((name) => ({
    name,
    players: filteredPlayers.filter((player) => player.team === name).sort((a, b) =>
      Number(b.slug === captains[name]) - Number(a.slug === captains[name]) ||
      collator.compare(surname(a.name), surname(b.name)) || collator.compare(a.name, b.name)),
  })).filter((group) => group.players.length > 0)

  const resetFilters = () => {
    setQuery('')
    setTeam('All teams')
  }

  return (
    <>
      <Seo
        title="The Inaugural 60 | She's On First"
        description="Search the working roster of 60 players across the four inaugural WPBL teams and open each player’s season page."
        path="/inaugural-60"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'The Inaugural 60',
          url: 'https://shesonfirst.com/inaugural-60',
          numberOfItems: allPlayers.length,
        }}
      />
      <section className="page-head sixty-head">
        <div className="container">
          <span className="eyebrow">Working Roster</span>
          <h1>The Inaugural 60</h1>
          <p className="page-lede">
            Sixty players across four inaugural teams. This working reconstruction remains
            provisional while the authoritative opening-day roster is confirmed.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="sixty-note panel">
            <div>
              <strong>60 players tracked.</strong>{' '}
              <span className="muted">
                Profiles publish only after their claims, sources, editorial review, and
                image rights are documented. Roster corrections remain possible.
              </span>
            </div>
          </div>

          <div className="roster-discovery panel">
            <div className="roster-search">
              <label htmlFor="roster-search">Find a player</label>
              <div className="roster-search-field">
                <input
                  id="roster-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, team, or position"
                  autoComplete="off"
                />
                {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear player search">Clear</button>}
              </div>
            </div>

            <div className="roster-team-filter" aria-label="Filter players by team">
              <span>Team</span>
              <div className="filters">
                {teams.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`chip ${team === option ? 'chip-on' : ''}`}
                    onClick={() => setTeam(option)}
                    aria-pressed={team === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="roster-results-row" aria-live="polite">
            <strong>{filteredPlayers.length}</strong> {filteredPlayers.length === 1 ? 'player' : 'players'} shown
            {(query || team !== 'All teams') && <button type="button" onClick={resetFilters}>Reset filters</button>}
          </div>

          {filteredPlayers.length > 0 ? (
            <div className="roster-groups">
              {groups.map((group) => (
                <section className="roster-group" key={group.name} aria-label={group.name}>
                  <div className="roster-group-heading">
                    <h2>{group.name}</h2>
                    <span className="muted">{group.players.length} {group.players.length === 1 ? 'player' : 'players'}</span>
                  </div>
                  <div className="sixty-grid">
                    {group.players.map((p) => <PlayerCard key={p.slug} player={p} captain={p.slug === captains[group.name]} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="roster-empty panel">
              <strong>No players match those filters.</strong>
              <button type="button" className="btn btn-secondary" onClick={resetFilters}>Show all 60</button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
