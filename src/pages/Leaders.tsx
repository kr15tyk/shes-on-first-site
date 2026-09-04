import DataFreshness from '../components/DataFreshness'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { allPlayers } from '../data/players'
import { formatRate, formatThroughDate, useWpblData } from '../data/wpbl'
import Seo from '../components/Seo'

const profileSlugs = new Set(allPlayers.map((player) => player.slug))

function PlayerName({ slug, name }: { slug: string; name: string }) {
  return profileSlugs.has(slug) ? (
    <Link className="leader-player-link" to={`/inaugural-60/${slug}`}>{name}</Link>
  ) : <>{name}</>
}

export default function Leaders() {
  const { data, error, loading } = useWpblData()
  const [category, setCategory] = useState<'Batting' | 'Pitching'>('Batting')

  return (
    <>
      <Seo
        title="2026 WPBL Batting & Pitching Leaders | She's On First"
        description="Qualified 2026 WPBL batting and pitching leaders calculated from completed official box scores."
        path="/leaders"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: '2026 WPBL batting and pitching leaders',
          description: 'Qualified leaderboards calculated from completed official WPBL box scores.',
          url: 'https://shesonfirst.com/leaders',
        }}
      />
      <header className="page-head">
        <div className="container">
          <span className="eyebrow">Inaugural Season</span>
          <h1>2026 WPBL Leaders</h1>
          <p className="page-lede muted">The season&rsquo;s top qualified performers, calculated from completed official box scores.</p>
        </div>
      </header>

      <section className="section pt-0">
        <div className="container">
          <div className="filters leader-tabs" aria-label="Leaderboard category">
            {(['Batting', 'Pitching'] as const).map((option) => (
              <button
                type="button"
                key={option}
                className={`chip ${category === option ? 'chip-on' : ''}`}
                onClick={() => setCategory(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <DataFreshness />
          {loading && <div className="data-state panel">Calculating the inaugural-season leaders…</div>}
          {error && <div className="data-state panel">{error}</div>}

          {data && category === 'Batting' && (
            <div className="leaderboard-panel panel table-wrap">
              <table className="table leaders-table">
                <thead><tr><th>#</th><th className="ta-left">Player</th><th>Team</th><th>G</th><th>PA</th><th>AVG</th><th>OPS</th><th>HR</th><th>RBI</th><th>SB</th></tr></thead>
                <tbody>
                  {data.leaders.batting.map((player) => (
                    <tr key={player.id}>
                      <td className="rank">{player.rank}</td>
                      <td className="ta-left strong"><PlayerName slug={player.slug} name={player.name} /><span className="leader-position">{player.position}</span></td>
                      <td><span className="team-code compact">{player.teamAbbr}</span></td>
                      <td>{player.g}</td><td>{player.pa}</td><td>{formatRate(player.avg)}</td><td className="leader-highlight">{formatRate(player.ops)}</td><td>{player.hr}</td><td>{player.rbi}</td><td>{player.sb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && category === 'Pitching' && (
            <div className="leaderboard-panel panel table-wrap">
              <table className="table leaders-table">
                <thead><tr><th>#</th><th className="ta-left">Player</th><th>Team</th><th>G</th><th>IP</th><th>ERA</th><th>WHIP</th><th>SO</th></tr></thead>
                <tbody>
                  {data.leaders.pitching.map((player) => (
                    <tr key={player.id}>
                      <td className="rank">{player.rank}</td>
                      <td className="ta-left strong"><PlayerName slug={player.slug} name={player.name} /><span className="leader-position">{player.position}</span></td>
                      <td><span className="team-code compact">{player.teamAbbr}</span></td>
                      <td>{player.g}</td><td>{player.ip}</td><td className="leader-highlight">{player.era.toFixed(2)}</td><td>{player.whip.toFixed(2)}</td><td>{player.so}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && (
            <div className="data-source">
              <strong>Through {formatThroughDate(data.leaders.throughDate)}.</strong>{' '}
              {category === 'Batting' ? data.leaders.qualifications.batting : data.leaders.qualifications.pitching}.{' '}
              <a href={data.leaders.source.url} target="_blank" rel="noopener noreferrer">Official WPBL statistics feed</a>.
            </div>
          )}
        </div>
      </section>
    </>
  )
}
