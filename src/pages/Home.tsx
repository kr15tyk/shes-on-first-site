import { Link } from 'react-router-dom'
import { articles } from '../data/articles'
import { allPlayers, playerHero } from '../data/players'
import ArticleCard from '../components/ArticleCard'
import Newsletter from '../components/Newsletter'

export default function Home() {
  const latest = articles.slice(0, 3)
  const showcase = allPlayers.slice(0, 6)

  return (
    <>
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
            <img src="/logo-lockup.png" alt="She's On First" />
          </div>
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
                    {!p.published && <span className="pt-soon">Researching</span>}
                  </div>
                  <div className="pt-body">
                    <h3>{p.name}</h3>
                    <span className="meta">{p.position} · {p.team}</span>
                  </div>
                </>
              )
              return p.published ? (
                <Link key={p.number} to={`/inaugural-60/${p.slug}`} className="ptile ptile-live">{inner}</Link>
              ) : (
                <div key={p.number} className="ptile ptile-pending">{inner}</div>
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
