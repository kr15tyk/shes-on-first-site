import { Link } from 'react-router-dom'
import { Player, playerHero } from '../data/players'
import profiles from '../data/editorialProfiles.json'

export default function PlayerCard({ player: p, captain = false }: { player: Player; captain?: boolean }) {
  const profile = p.slug in profiles ? profiles[p.slug as keyof typeof profiles] : undefined
  return <Link to={profile ? `/features/${p.slug}` : `/inaugural-60/${p.slug}`}
    className={`ptile ${profile ? 'ptile-live ptile-comic' : p.published ? 'ptile-live' : 'ptile-pending ptile-stats'}`}>
    <div className="pt-photo" style={{ background: playerHero[p.hero] || 'linear-gradient(150deg,#241553,#1c1044)' }}>
      {profile ? <img src={profile.imageSrc} alt={profile.imageAlt} loading="lazy" /> : !p.published && <span className="pt-soon">Season data</span>}
    </div>
    <div className="pt-body">{captain && <span className="pt-captain">Captain</span>}<h3>{p.name}</h3><span className="meta">{p.position} · {p.team}</span>{profile && <span className="pt-profile-link">Read her profile →</span>}</div>
  </Link>
}
