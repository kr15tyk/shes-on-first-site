import { useParams, Link } from 'react-router-dom'
import { getPlayer, playerHero, linkMeta, PlayerLinks, publishedPlayers } from '../data/players'

export default function Player() {
  const { slug } = useParams()
  const p = slug ? getPlayer(slug) : undefined

  if (!p || !p.published) {
    return (
      <section className="section container notfound">
        <span className="eyebrow">The Inaugural 60</span>
        <h1>Profile coming soon</h1>
        <p className="muted">
          This player&rsquo;s profile is still being researched. Profiles go live only after
          source, editorial, and image-rights review.
        </p>
        <div className="hero-cta">
          <Link to="/inaugural-60" className="btn btn-primary">Back to the 60</Link>
        </div>
      </section>
    )
  }

  const links = (p.links || {}) as PlayerLinks
  const linkKeys = (Object.keys(links) as (keyof PlayerLinks)[]).filter((k) => links[k])
  const others = publishedPlayers.filter((x) => x.slug !== p.slug).slice(0, 4)

  return (
    <article>
      <section className="player-hero">
        <div className="container player-hero-grid">
          <div className="player-photo" style={{ background: playerHero[p.hero] }}>
            <span className="player-photo-num">{String(p.number).padStart(2, '0')}</span>
            <span className="player-photo-note">Image pending rights review</span>
          </div>
          <div className="player-intro">
            <Link to="/inaugural-60" className="back-link">← The Inaugural 60</Link>
            <span className="tag">No. {p.number} of 60</span>
            <h1>{p.name}</h1>
            <div className="player-facts">
              <span><b>Position</b>{p.position}</span>
              {p.bats && <span><b>Bats</b>{p.bats}</span>}
              {p.throws && <span><b>Throws</b>{p.throws}</span>}
              {p.hometown && <span><b>Hometown</b>{p.hometown}</span>}
            </div>
            {linkKeys.length > 0 && (
              <div className="player-links">
                {linkKeys.map((k) => (
                  <a key={k} href={links[k]} target="_blank" rel="noopener noreferrer" className="plink">
                    <span className="plink-badge">{linkMeta[k].short}</span>
                    {linkMeta[k].label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container player-body">
          {p.quote && <blockquote className="player-quote">“{p.quote}”</blockquote>}
          {(p.bio || []).map((para, i) => <p key={i} className={i === 0 ? 'lead-para' : ''}>{para}</p>)}
          <div className="article-note">
            Every public profile distinguishes verified facts, uncertainty, and first-person
            material, with sources and image rights documented.
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section pt-0">
          <div className="container">
            <div className="section-head"><div><span className="eyebrow">More of the 60</span><h2>Meet the Class</h2></div>
              <Link to="/inaugural-60" className="see-all">All 60 →</Link>
            </div>
            <div className="sixty-grid">
              {others.map((o) => (
                <Link key={o.number} to={`/inaugural-60/${o.slug}`} className="ptile ptile-live">
                  <div className="pt-photo" style={{ background: playerHero[o.hero] }}>
                  </div>
                  <div className="pt-body"><h3>{o.name}</h3><span className="meta">{o.position}</span></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
