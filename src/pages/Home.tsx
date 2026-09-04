import DataFreshness from '../components/DataFreshness'
import { Link } from 'react-router-dom'
import { articles } from '../data/articles'
import { allPlayers, playerHero } from '../data/players'
import ArticleCard from '../components/ArticleCard'
import Newsletter from '../components/Newsletter'
import { formatGameDate, formatGameTime, formatRate, Game, useWpblData } from '../data/wpbl'
import Seo from '../components/Seo'

function SeasonGame({ game, label }: { game: Game; label: string }) {
  const final = game.status === 'Final'
  return (
    <div className="season-game">
      <span className="season-card-label">{label}</span>
      <div className="season-game-meta">
        <strong>{formatGameDate(game.start, { weekday: 'short', month: 'short' })}</strong>
        <span>{final ? 'Final' : formatGameTime(game.start)}</span>
      </div>
      <div className="season-team"><span className="team-code">{game.awayTeam.abbr}</span><span>{game.awayTeam.name}</span><b>{final ? game.awayScore : '—'}</b></div>
      <div className="season-team"><span className="team-code">{game.homeTeam.abbr}</span><span>{game.homeTeam.name}</span><b>{final ? game.homeScore : '—'}</b></div>
    </div>
  )
}

export default function Home() {
  const latest = articles.slice(0, 3)
  const showcase = allPlayers.slice(0, 6)
  const { data, error, loading } = useWpblData()
  const nextGame = data?.schedule.games.find((game) => game.status === 'Upcoming' && Date.parse(game.start) >= Date.now())
  const completedGames = data?.schedule.games.filter((game) => game.status === 'Final') || []
  const lastFinal = completedGames[completedGames.length - 1]

  return (
    <>
      <Seo
        title="She's On First — Women's Baseball Profiles, Data & Stories"
        description="Independent women’s baseball coverage built around sourced player profiles, transparent WPBL data, and original stories."
        path="/"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: "She's On First",
          url: 'https://shesonfirst.com/',
          description: 'Independent women’s baseball coverage built around sourced player profiles, transparent WPBL data, and original stories.',
          publisher: { '@type': 'Organization', name: "She's On First" },
        }}
      />
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Women&rsquo;s Baseball</span>
            <h1>
              It starts with sixty.<br /><span className="grad-text">It doesn&rsquo;t end there.</span>
            </h1>
            <p className="hero-lede">
              She&rsquo;s On First is an independent record of the Inaugural 60 — the
              provisional working cohort of players who opened the WPBL&rsquo;s first season.
            </p>
            <div className="hero-cta">
              <Link to="/inaugural-60" className="btn btn-primary">Meet the Inaugural 60</Link>
              <Link to="/blog" className="btn btn-ghost">Read Project Notes</Link>
            </div>
          </div>
          <div className="hero-art">
            <img src="/logo-lockup.png?v=21e762b" alt="She's On First" />
          </div>
        </div>
      </section>

      {/* Inaugural season pulse */}
      <section className="section season-section">
        <div className="container">
          <div className="section-head season-head">
            <div>
              <span className="eyebrow">On the Field Now</span>
              <h2>The Inaugural Season</h2>
            </div>
            <div className="season-actions">
              <Link to="/schedule" className="btn btn-ghost">Full Schedule</Link>
              <Link to="/leaders" className="btn btn-primary">View Leaders</Link>
            </div>
          </div>

          <DataFreshness />
          {loading && <div className="data-state panel">Loading the season pulse…</div>}
          {error && <div className="data-state panel">{error}</div>}
          {data && (
            <div className="season-dashboard panel">
              <div className="season-games">
                {nextGame && <SeasonGame game={nextGame} label="Up Next" />}
                {lastFinal && <SeasonGame game={lastFinal} label="Latest Final" />}
              </div>
              <div className="season-leaders">
                <div className="season-leaders-head">
                  <span className="season-card-label">Batting Leaders</span>
                  <span className="meta">By OPS</span>
                </div>
                {data.leaders.batting.slice(0, 3).map((player) => (
                  <div className="season-leader" key={player.id}>
                    <span className="season-rank">{player.rank}</span>
                    <div><strong>{player.name}</strong><span>{player.teamAbbr} · {player.position}</span></div>
                    <b>{formatRate(player.ops)}</b>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && (
            <p className="data-source season-source">
              Results through {new Date(`${data.leaders.throughDate}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}.{' '}
              <a href={data.leaders.source.url} target="_blank" rel="noopener noreferrer">Official WPBL statistics feed</a>.
            </p>
          )}
        </div>
      </section>

      {/* Inaugural 60 showcase */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">The Founding Class</span>
              <h2>The Inaugural 60</h2>
            </div>
            <Link to="/inaugural-60" className="see-all">Meet all 60 →</Link>
          </div>
          <div className="sixty-grid home-sixty">
            {showcase.map((p) => {
              const inner = (
                <>
                  <div className="pt-photo" style={{ background: playerHero[p.hero] }}>
                    {!p.published && <span className="pt-soon">Season data</span>}
                  </div>
                  <div className="pt-body">
                    <h3>{p.name}</h3>
                    <span className="meta">{p.position} · {p.team}</span>
                  </div>
                </>
              )
              return (
                <Link key={p.number} to={`/inaugural-60/${p.slug}`} className={`ptile ${p.published ? 'ptile-live' : 'ptile-pending ptile-stats'}`}>{inner}</Link>
              )
            })}
          </div>
          <p className="meta sixty-caption">
            All 60 players tracked — profiles publish after source, editorial, and image-rights review.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section mission-section">
        <div className="container">
          <div className="mission-block panel">
            <span className="eyebrow">Our Mission</span>
            <p className="mission-text">
              She&rsquo;s On First is an independent documentation project. The Inaugural 60 marks the
              beginning of WPBL history, while honoring the much longer history of women in baseball.
              This is where those stories get sourced, recorded, and carried forward.{' '}
              <span className="grad-text">First base was never the finish line.</span>
            </p>
            <Link to="/about" className="btn btn-ghost">Our Mission</Link>
          </div>
        </div>
      </section>

      {/* Latest from the blog */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">From the Project</span>
              <h2>Latest Notes</h2>
            </div>
            <Link to="/blog" className="see-all">All project notes →</Link>
          </div>
          <div className="news-grid">
            {latest.map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  )
}
