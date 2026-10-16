import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import profiles from '../data/editorialProfiles.json'
// The same browser module refreshes both the public profile and unlisted preview.
// @ts-expect-error Local JavaScript module has no TypeScript declaration.
import { refreshReviewStats } from '../../public/review-stats.js'
import './player-profile.css'

export default function PlayerProfile({ slug }: { slug: keyof typeof profiles }) {
  const profile = profiles[slug]
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    root.current?.querySelectorAll('[data-review-stats]').forEach(refreshReviewStats)
  }, [slug])
  return <article className="public-player-profile">
    <Seo title={`${profile.name} — Player Profile | She’s On First`}
      description={`The baseball story, career timeline and dated statistics of ${profile.name}.`}
      path={`/features/${slug}`} type="article" noindex={!profile.published}
      structuredData={{ '@context': 'https://schema.org', '@type': 'Article', headline: `${profile.name} — Player Profile`, dateModified: profile.updated, about: { '@type': 'Person', name: profile.name } }} />
    {!profile.published && <div className="draft-banner">Public profile draft · Not published</div>}
    <div className="profile-intro container"><Link to={`/inaugural-60/${slug}`}>← {profile.name}’s season page</Link><p>Player profile · Updated September 13, 2026</p></div>
    {/* Locally authored, build-generated markup; never player submissions or remote HTML. */}
    <div ref={root} className="profile-editorial" dangerouslySetInnerHTML={{ __html: profile.html }} />
    <div className="container profile-corrections"><h2>Data notes</h2><p>Statistics combine regular-season and postseason games and show their own through-date. For separate totals, visit the player’s season page. Sources carry their original check dates; updating this profile does not imply every source was checked again.</p><p>Have a correction or a source to add? <a href="mailto:baseball@shesonfirst.com">Email She’s On First.</a></p></div>
  </article>
}
