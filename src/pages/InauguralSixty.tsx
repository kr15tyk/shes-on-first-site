import { Link } from 'react-router-dom'
import { allPlayers, playerHero, Player } from '../data/players'

function PlayerTile({ p }: { p: Player }) {
  const inner = (
    <>
      <div className="pt-photo" style={{ background: playerHero[p.hero] || 'linear-gradient(150deg,#241553,#1c1044)' }}>
        <span className="pt-num">{String(p.number).padStart(2, '0')}</span>
        {!p.published && <span className="pt-soon">Researching</span>}
      </div>
      <div className="pt-body">
        <h3>{p.name}</h3>
        <span className="meta">{p.position} · {p.team}</span>
      </div>
    </>
  )
  return p.published ? (
    <Link to={`/inaugural-60/${p.slug}`} className="ptile ptile-live">{inner}</Link>
  ) : (
    <div className="ptile ptile-pending">{inner}</div>
  )
}

export default function InauguralSixty() {
  return (
    <>
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

          <div className="sixty-grid">
            {allPlayers.map((p) => <PlayerTile key={p.number} p={p} />)}
          </div>
        </div>
      </section>
    </>
  )
}
