import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import PlayerSeasonStats from '../components/PlayerSeasonStats'
import { useWpblData } from '../data/wpbl'

const sources = [
  {
    id: 1,
    publisher: 'MLB.com',
    title: 'After years of being told women can’t play baseball, WPBL star Denae Benites is smashing dingers and having fun',
    url: 'https://www.mlb.com/news/denae-benites-wpbl-home-run-superstar-finally-belongs',
    note: 'Opening-day home run, captaincy, Banana Ball training and Benites’s account of finding belonging in baseball.',
  },
  {
    id: 2,
    publisher: 'USA Baseball',
    title: 'Denae Benites player profile',
    url: 'https://www.usabaseball.com/player/denae-benites',
    note: 'Position, handedness and date of birth.',
  },
  {
    id: 3,
    publisher: 'USA Baseball',
    title: 'Women’s National Team alumni record',
    url: 'https://www.usabaseball.com/about/alumni-players/b',
    note: 'National-team seasons through 2024.',
  },
  {
    id: 4,
    publisher: 'USA Baseball',
    title: 'Team USA Wins Gold at COPABE Pan-American Championships',
    url: 'https://www.usabaseball.com/news/team-usa-wins-gold-at-copabe-pan-american-championships-310278876',
    note: 'The United States’ undefeated 2019 championship.',
  },
  {
    id: 5,
    publisher: 'World Baseball Softball Confederation',
    title: 'USA Baseball reveals 2026 Women’s National Team roster for World Cup',
    url: 'https://www.wbsc.org/en/news/usa-baseball-reveals-2026-womens-national-team-roster-for-world-cup',
    note: 'Benites’s fifth national-team selection.',
  },
  {
    id: 6,
    publisher: 'Autostraddle',
    title: 'The Girls Are Ready To Play Hardball',
    url: 'https://www.autostraddle.com/ashton-lansdell-denae-benites-womens-baseball-interview/',
    note: 'High-school-to-Team-USA path, EMT and volunteer-firefighter work, men’s recreational baseball and Banana Ball.',
  },
  {
    id: 7,
    publisher: 'Women’s Pro Baseball League',
    title: 'Denae Benites',
    url: 'https://www.womensprobaseballleague.com/players/denae-benites/',
    note: 'Draft position, team assignment and dated 2026 statistical record.',
  },
  {
    id: 8,
    publisher: 'Official WPBL statistics feed',
    title: 'Completed-game box scores',
    url: 'https://stats.womensprobaseballleague.com/v1/games',
    note: 'Source data for the dated season snapshot calculated by She’s On First.',
  },
]

function Cite({ id }: { id: number }) {
  return <sup className="feature-cite"><a href={`#source-${id}`} aria-label={`Source ${id}`}>{id}</a></sup>
}

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Denae Benites Found the Stage Baseball Had Denied Her',
    description: 'The Team USA catcher carried years of self-made opportunity into the WPBL, then hit the first home run in league history.',
    dateCreated: '2026-08-25',
    dateModified: '2026-08-25',
    author: { '@type': 'Organization', name: "She's On First", url: 'https://shesonfirst.com/' },
    publisher: { '@type': 'Organization', name: "She's On First", url: 'https://shesonfirst.com/' },
    mainEntityOfPage: 'https://shesonfirst.com/features/denae-benites',
    about: { '@type': 'Person', name: 'Denae Benites' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Denae Benites',
    birthDate: '2001-09-10',
    nationality: 'United States',
    jobTitle: 'Professional baseball catcher',
    memberOf: [
      { '@type': 'SportsTeam', name: 'New York Heights' },
      { '@type': 'SportsTeam', name: 'United States women’s national baseball team' },
    ],
    sameAs: [
      'https://www.usabaseball.com/player/denae-benites',
      'https://www.womensprobaseballleague.com/players/denae-benites/',
      'https://en.wikipedia.org/wiki/Denae_Benites',
    ],
  },
]

export default function DenaeFeature() {
  const { data, error, loading } = useWpblData()
  const stats = data?.players.players.find((record) => record.slug === 'denae-benites')

  return (
    <article className="feature-page">
      <Seo
        title="Denae Benites Found the Stage Baseball Had Denied Her | She’s On First"
        description="The Team USA catcher carried years of self-made opportunity into the WPBL, then hit the first home run in league history."
        path="/features/denae-benites"
        type="article"
        noindex
        structuredData={structuredData}
      />

      <div className="draft-banner">Editorial draft · Not published · Factual review not yet sent</div>

      <header className="feature-hero">
        <div className="container feature-hero-grid">
          <div className="feature-hero-copy">
            <Link to="/inaugural-60/denae-benites" className="back-link">← Denae’s season page</Link>
            <span className="tag">Flagship Profile</span>
            <h1>Denae Benites found the stage baseball had denied her</h1>
            <p className="feature-dek">The Team USA catcher spent years finding her own places to play. In the WPBL’s first game, she authored the league’s first home run.</p>
            <div className="feature-byline">
              <span>By She&rsquo;s On First</span><span>•</span><span>Drafted August 25, 2026</span><span>•</span><span>8 min read</span>
            </div>
          </div>

          <div className="feature-monogram" aria-label="Rights-safe Denae Benites profile graphic">
            <div className="feature-monogram-field"><span>DB</span><small>C · New York</small></div>
          </div>
        </div>
      </header>

      <section className="feature-facts-wrap">
        <div className="container feature-facts">
          <div><b>Team</b><span>New York Heights</span></div>
          <div><b>Position</b><span>C / UTIL</span></div>
          <div><b>Bats / throws</b><span>Right / Right</span></div>
          <div><b>National team</b><span>United States</span></div>
          <div><b>Documented span</b><span>2017–present</span></div>
        </div>
      </section>

      <div className="container feature-prose">
        <p className="feature-lead">The first home run in Women&rsquo;s Professional Baseball League history came on a low-and-away curveball in the fourth inning of the league&rsquo;s first game. Denae Benites drove it out, sprinted from the box and did not realize what had happened until the crowd and her first-base coach reacted.<Cite id={1} /></p>

        <p>The swing lasted seconds. Reaching that plate appearance took years of piecing together a baseball career in a system that rarely offered women a continuous place to play.</p>

        <h2>Finding innings wherever they existed</h2>
        <p>Benites grew up in Las Vegas and stayed with baseball through high school. After graduation, she worked as an emergency medical technician and volunteer firefighter while playing in a local men&rsquo;s recreational league and training toward the United States women&rsquo;s national team.<Cite id={6} /></p>

        <p>That path matters because women&rsquo;s baseball has often demanded that players create continuity for themselves. National-team tournaments could provide the highest level of competition, but not a full professional season. Benites reached Team USA in 2019, then returned in 2022, 2023, 2024 and 2026.<Cite id={3} /><Cite id={5} /></p>

        <div className="feature-callout">
          <span className="eyebrow">The international record</span>
          <strong>Five documented Team USA seasons</strong>
          <p>Benites was part of the undefeated 2019 team that won the COPABE Women&rsquo;s Pan-American Championship and the 2024 team that earned World Cup silver.<Cite id={4} /><Cite id={7} /></p>
        </div>

        <h2>A louder version of the game</h2>
        <p>Banana Ball supplied something different in 2026: regular training, a stage built around personality and another place to play baseball. Benites joined the Loco Beach Coconuts while preparing for Team USA and the WPBL. She described the environment as a place where the performance and the baseball could reinforce each other instead of competing.<Cite id={1} /><Cite id={6} /></p>

        <p>The same visibility followed her into New York. The Heights made Benites their captain, and her opening-day home run turned a long development path into the first individual milestone of the new league.<Cite id={1} /></p>

        <h2>The documented path</h2>
        <div className="feature-timeline">
          <div><b>2017–2019</b><strong>Centennial High School</strong><span>Las Vegas high-school baseball · catcher / utility</span></div>
          <div><b>2019</b><strong>United States</strong><span>COPABE Women&rsquo;s Pan-American Championship · gold</span></div>
          <div><b>2022–2024</b><strong>United States</strong><span>National-team seasons, including 2024 World Cup silver</span></div>
          <div><b>2026</b><strong>United States</strong><span>Fifth documented national-team selection</span></div>
          <div><b>2026–present</b><strong>Loco Beach Coconuts</strong><span>Banana Ball Championship League</span></div>
          <div><b>2026–present</b><strong>New York Heights</strong><span>Women&rsquo;s Professional Baseball League · catcher and captain</span></div>
        </div>

        <p className="feature-method">“Documented span” describes the competitive record supported by the reviewed sources. It does not imply uninterrupted participation in every intervening season.</p>
      </div>

      <PlayerSeasonStats
        stats={stats}
        throughDate={data?.players.throughDate}
        sourceUrl={data?.players.source.url}
        loading={loading}
        error={error}
      />

      <section className="section feature-close">
        <div className="container feature-prose">
          <h2>What the numbers cannot show</h2>
          <p>The 2026 snapshot records what happened in completed games. It does not capture the years when Benites had to search for a league, build a training routine around work, or enter a baseball environment without a professional season waiting at the end.</p>
          <p>The WPBL changed the last part of that equation. Benites did not need the first home run to establish that she belonged in baseball. The home run made the record harder to overlook.</p>

          <div className="feature-editorial-note">
            <span className="eyebrow">Editorial note</span>
            <p>This draft uses published and official sources checked through August 25, 2026. The statistics panel is a separate dated calculation from completed official WPBL box scores. Denae Benites has not yet been invited to review this draft, and the project has not obtained rights to a player photograph.</p>
          </div>

          <section className="feature-sources" aria-labelledby="feature-sources-title">
            <span className="eyebrow">Source trail</span>
            <h2 id="feature-sources-title">What we checked</h2>
            <ol>
              {sources.map((source) => (
                <li id={`source-${source.id}`} key={source.id}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer"><strong>{source.publisher}:</strong> {source.title}</a>
                  <span>{source.note}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>
    </article>
  )
}
