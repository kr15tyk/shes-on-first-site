import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import SeasonPeriodSelect from '../components/SeasonPeriodSelect'
import PlayerSeasonStats from '../components/PlayerSeasonStats'
import { usePeriodData, SeasonPeriod } from '../data/wpbl'
import profiles from '../data/editorialProfiles.json'
import './player-profile.css'

export default function PlayerProfile({ slug }: { slug: keyof typeof profiles }) {
  const profile = profiles[slug]
  const [period, setPeriod] = useState<SeasonPeriod>('regular')
  const { data, error, loading } = usePeriodData(period)
  const stats = data?.players.players.find(player => player.slug === slug)
  // Replace the authored dated WPBL block with the shared live period component.
  // Preserve the surrounding editorial text and artwork exactly as approved.
  const [beforeStats, ...afterStats] = profile.html.split(/<section class="section stats-section"[\s\S]*?<\/section>/g)
  const updated = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${profile.updated}T12:00:00Z`))
  return <article className="public-player-profile">
    <Seo title={`${profile.name} — Player Profile | She’s On First`}
      description={`The baseball story, career timeline and regular-season and postseason statistics of ${profile.name}.`}
      path={`/inaugural-60/${slug}`} type="profile" noindex={!profile.published}
      structuredData={{ '@context': 'https://schema.org', '@type': 'Person', name: profile.name, url: `https://shesonfirst.com/inaugural-60/${slug}` }} />
    {!profile.published && <div className="draft-banner">Public profile draft · Not published</div>}
    <div className="profile-intro container">
      <Link to="/inaugural-60">← The Inaugural 60</Link>
      <p>Profile reporting updated {updated} · <a href="#season-stats">Jump to season statistics</a></p>
    </div>
    {/* Locally authored markup, never player submissions or remote HTML. */}
    <div className="profile-editorial" dangerouslySetInnerHTML={{ __html: beforeStats }} />
    <div id="season-stats" className="profile-season-stats">
      <div className="container"><SeasonPeriodSelect value={period} onChange={setPeriod} /></div>
      <PlayerSeasonStats period={period} stats={stats} throughDate={data?.players.throughDate}
        sourceUrl={data?.players.source.url} loading={loading} error={error} />
    </div>
    <div className="profile-editorial" dangerouslySetInnerHTML={{ __html: afterStats.join('') }} />
    <div className="container profile-corrections"><h2>Data notes</h2><p>Regular-season and postseason statistics are kept separate and show their own through-dates. Those dates describe league-wide coverage, not necessarily this player’s last appearance. Sources carry their original check dates; refreshing statistics does not imply every biographical source was checked again.</p><p>Have a correction or a source to add? <a href="mailto:baseball@shesonfirst.com">Email She’s On First.</a></p></div>
  </article>
}
