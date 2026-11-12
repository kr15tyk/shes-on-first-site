import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import SeasonPeriodSelect from '../components/SeasonPeriodSelect'
import PlayerSeasonStats from '../components/PlayerSeasonStats'
import { usePeriodData, SeasonPeriod } from '../data/wpbl'
import profiles from '../data/editorialProfiles.json'
import './player-profile.css'
import { profileLayout } from '../data/profileLayout'

export default function PlayerProfile({ slug }: { slug: keyof typeof profiles }) {
  const profile = profiles[slug]
  const [period, setPeriod] = useState<SeasonPeriod>('regular')
  const { data, error, loading } = usePeriodData(period)
  const stats = data?.players.players.find(player => player.slug === slug)
  const layout = useMemo(() => profileLayout(profile.html), [profile.html])
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
    <nav className="profile-jump-links shell" aria-label="On this player profile">
      <a href="#player-story">Her story</a><a href="#player-career">Career timeline</a><a href="#season-stats">Statistics</a><a href="#player-sources">Sources</a>
    </nav>
    <section className="shell profile-hero" aria-labelledby="player-name">
      <div dangerouslySetInnerHTML={{ __html: layout.art }} />
      <div><span className="eyebrow">The Inaugural 60</span><h1 className="player-name" id="player-name">{profile.name}</h1>
        <dl className="facts">{layout.facts.map(fact => <div className="fact" key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
        <p className="note">{layout.factNote}</p>
      </div>
    </section>
    <section className="shell milestone-strip" aria-label="Career milestones">{layout.milestones.map(item => <div className="milestone" key={item.value + item.detail}><b>{item.value}</b>{item.detail}</div>)}</section>
    <section className="section" id="player-story"><div className="shell reading"><span className="eyebrow">Player snapshot</span><h2>{layout.snapshot.heading}</h2><div dangerouslySetInnerHTML={{ __html: layout.snapshot.html }} /></div></section>
    <section className="section" id="player-career"><div className="shell"><span className="eyebrow">Documented team history</span><h2>Career timeline</h2>
      <ol className="history-list">{layout.timeline.map((item, index) => <li className="history-row" key={index}><b>{item.date}</b><strong>{item.team}</strong><span>{item.detail}</span></li>)}</ol>
    </div></section>
    <section className="section"><div className="shell"><span className="eyebrow">Career path</span><h2>{layout.career.heading}</h2><div dangerouslySetInnerHTML={{ __html: layout.career.html }} /></div></section>
    <section className="section"><div className="shell reading"><span className="eyebrow">How she plays</span><h2>{layout.playing.heading}</h2><div dangerouslySetInnerHTML={{ __html: layout.playing.html }} /></div></section>
    <div id="season-stats" className="profile-season-stats">
      <div className="container"><SeasonPeriodSelect value={period} onChange={setPeriod} prominent /></div>
      <PlayerSeasonStats period={period} stats={stats} throughDate={data?.players.throughDate}
        sourceUrl={data?.players.source.url} loading={loading} error={error} expanded />
    </div>
    <div className="profile-editorial" dangerouslySetInnerHTML={{ __html: layout.additional }} />
    <section className="section" id="player-sources"><div className="shell reading"><span className="eyebrow">Sources</span><h2>What we checked</h2><div dangerouslySetInnerHTML={{ __html: layout.sources.html }} /></div></section>
    <div className="container profile-corrections"><h2>Data notes</h2><p>Regular-season and postseason statistics are kept separate and show their own through-dates. Those dates describe league-wide coverage, not necessarily this player’s last appearance. Sources carry their original check dates; refreshing statistics does not imply every biographical source was checked again.</p><p>Have a correction or a source to add? <a href="mailto:baseball@shesonfirst.com">Email She’s On First.</a></p></div>
  </article>
}
