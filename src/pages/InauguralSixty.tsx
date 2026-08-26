import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allPlayers, playerHero, Player } from '../data/players'
import Seo from '../components/Seo'

const teams = ['All teams', ...Array.from(new Set(allPlayers.map((player) => player.team)))]

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

function PlayerTile({ p }: { p: Player }) {
  const inner = (
    <>
      <div className="pt-photo" style={{ background: playerHero[p.hero] || 'linear-gradient(150deg,#241553,#1c1044)' }}>
        {!p.published && <span className="pt-soon">Season data</span>}
      </div>
      <div className="pt-body">
        <h3>{p.name}</h3>
        <span className="meta">{p.position} · {p.team}</span>
      </div>
    </>
  )
  return (
    <Link to={`/inaugural-60/${p.slug}`} className={`ptile ${p.published ? 'ptile-live' : 'ptile-pending ptile-stats'}`}>{inner}</Link>
  )
}

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
            <div className="sixty-grid">
              {filteredPlayers.map((p) => <PlayerTile key={p.slug} p={p} />)}
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
