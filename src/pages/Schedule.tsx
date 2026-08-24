import { useMemo, useState } from 'react'
import { formatGameDate, formatGameTime, Game, useWpblData } from '../data/wpbl'

const teamNames = ['Boston Hunters', 'Los Angeles Queens', 'New York Heights', 'San Francisco Firebells']

function GameCard({ game }: { game: Game }) {
  const final = game.status === 'Final'

  return (
    <article className="schedule-card panel">
      <div className="schedule-card-top">
        <span className={`game-status game-status-${game.status.toLowerCase()}`}>{game.status}</span>
        <span className="meta">{final ? 'Completed' : formatGameTime(game.start)}</span>
      </div>
      <div className="schedule-matchup">
        <div className="schedule-team-row">
          <span className="team-code">{game.awayTeam.abbr}</span>
          <span>{game.awayTeam.name}</span>
          <strong>{final || game.status === 'Live' ? game.awayScore : '—'}</strong>
        </div>
        <div className="schedule-team-row">
          <span className="team-code">{game.homeTeam.abbr}</span>
          <span>{game.homeTeam.name}</span>
          <strong>{final || game.status === 'Live' ? game.homeScore : '—'}</strong>
        </div>
      </div>
      {game.venue && <p className="meta schedule-venue">{game.venue}</p>}
    </article>
  )
}
export default function Schedule() {
  const { data, error, loading } = useWpblData()
  const [status, setStatus] = useState('All')
  const [team, setTeam] = useState('All teams')

  const grouped = useMemo(() => {
    const games = (data?.schedule.games || []).filter((game) => {
      const statusMatch = status === 'All' || game.status === status
      const teamMatch = team === 'All teams' || game.homeTeam.name === team || game.awayTeam.name === team
      return statusMatch && teamMatch
    })

    return games.reduce<Record<string, Game[]>>((groups, game) => {
      const key = game.start.slice(0, 10)
      groups[key] = [...(groups[key] || []), game]
      return groups
    }, {})
  }, [data, status, team])

  return (
    <>
      <header className="page-head">
        <div className="container">
          <span className="eyebrow">Inaugural Season</span>
          <h1>2026 WPBL Schedule</h1>
          <p className="page-lede muted">A clean, independent view of the league schedule and completed results.</p>
        </div>
      </header>

      <section className="section pt-0">
        <div className="container">
          <div className="data-toolbar panel" aria-label="Schedule filters">
            <div className="filters schedule-filters">
              {['All', 'Upcoming', 'Final'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`chip ${status === option ? 'chip-on' : ''}`}
                  onClick={() => setStatus(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <label className="team-filter">
              <span>Team</span>
              <select value={team} onChange={(event) => setTeam(event.target.value)}>
                <option>All teams</option>
                {teamNames.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
          </div>

          {loading && <div className="data-state panel">Loading the inaugural-season schedule…</div>}
          {error && <div className="data-state panel">{error}</div>}
          {!loading && !error && Object.entries(grouped).map(([date, games]) => (
            <section className="schedule-day" key={date}>
              <h2>{formatGameDate(games[0].start)}</h2>
              <div className="schedule-grid">
                {games.map((game) => <GameCard key={game.id} game={game} />)}
              </div>
            </section>
          ))}
          {!loading && !error && Object.keys(grouped).length === 0 && (
            <div className="data-state panel">No games match those filters.</div>
          )}

          {data && (
            <p className="data-source">
              Source: <a href={data.schedule.source.url} target="_blank" rel="noopener noreferrer">{data.schedule.source.label}</a>.
              Times shown in Eastern Time. Schedule records are checked and normalized by She&rsquo;s On First.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
