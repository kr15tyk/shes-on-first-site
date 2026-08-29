import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { formatRate, formatThroughDate, useWpblData } from '../data/wpbl'

const baseStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'What the WPBL’s First Month Can Tell Us — and What It Cannot',
  description: 'A transparent look at the early WPBL leaderboards, the sample sizes behind them, and the conclusions the first month cannot yet support.',
  dateCreated: '2026-08-25',
  author: { '@type': 'Organization', name: "She's On First", url: 'https://shesonfirst.com/' },
  publisher: { '@type': 'Organization', name: "She's On First", url: 'https://shesonfirst.com/' },
  mainEntityOfPage: 'https://shesonfirst.com/analysis/wpbl-first-month',
  about: { '@type': 'SportsOrganization', name: "Women's Professional Baseball League" },
}

const inningsAsOuts = (value: string) => {
  const [innings = '0', outs = '0'] = value.split('.')
  return Number(innings) * 3 + Number(outs)
}

const formatRetrieved = (value: string) => new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
}).format(new Date(value))

export default function WpblFirstMonthAnalysis() {
  const { data, error, loading } = useWpblData()
  const batting = data?.leaders.batting.slice(0, 5) ?? []
  const pitching = data?.leaders.pitching.slice(0, 5) ?? []
  const maxOps = Math.max(...batting.map((player) => player.ops), 1)
  const maxPitchingEra = Math.max(...pitching.map((player) => player.era), 1)
  const benites = data?.leaders.batting.find((player) => player.slug === 'denae-benites')
  const whitmore = data?.leaders.batting.find((player) => player.slug === 'kelsie-whitmore')
  const lansdell = data?.leaders.batting.find((player) => player.slug === 'ashton-lansdell')
  const battingMinimum = data?.leaders.qualifications.batting.match(/\d+(?:\.\d+)?/)?.[0] ?? '—'
  const pitchingMinimum = data?.leaders.qualifications.pitching.match(/\d+(?:\.\d+)?/)?.[0] ?? '—'
  const pitchingByWorkload = [...pitching].sort((a, b) => inningsAsOuts(a.ip) - inningsAsOuts(b.ip))
  const pitchingRange = pitchingByWorkload.length
    ? `${pitchingByWorkload[0].ip} and ${pitchingByWorkload[pitchingByWorkload.length - 1].ip}`
    : '—'
  const structuredData = {
    ...baseStructuredData,
    dateModified: data?.manifest.fetchedAt.slice(0, 10) ?? baseStructuredData.dateCreated,
  }

  return (
    <article className="analysis-page">
      <Seo
        title="What the WPBL’s First Month Can Tell Us | She’s On First"
        description="A transparent look at the early WPBL leaderboards, the sample sizes behind them, and the conclusions the first month cannot yet support."
        path="/analysis/wpbl-first-month"
        type="article"
        noindex
        structuredData={structuredData}
      />

      <header className="analysis-hero">
        <div className="container analysis-hero-grid">
          <div>
            <span className="tag">Data Analysis</span>
            <h1>What the WPBL&rsquo;s first month can tell us — and what it cannot</h1>
            <p className="analysis-dek">The early numbers are loud. The strongest way to read them is with the opportunity and sample size behind every rate still visible.</p>
            <div className="feature-byline">
              <span>By She&rsquo;s On First</span><span>•</span><span>Drafted August 25, 2026</span><span>•</span><span>7 min read</span>
            </div>
          </div>

          <div className="analysis-scoreboard" aria-label="Data snapshot">
            <span>WPBL 2026</span>
            <strong>{data?.manifest.quality.completedGames ?? '—'}</strong>
            <b>completed games</b>
            <small>{data ? `Through ${formatThroughDate(data.manifest.throughDate)}` : 'Loading through-date…'}</small>
          </div>
        </div>
      </header>

      <section className="analysis-snapshot">
        <div className="container">
          {loading && <div className="data-state panel">Building the first-month snapshot…</div>}
          {error && <div className="data-state panel">{error}</div>}

          {data && (
            <div className="analysis-snapshot-grid">
              <div><strong>{data.manifest.quality.completedGames}</strong><span>completed games</span></div>
              <div><strong>{data.manifest.quality.verifiedBoxscores}</strong><span>verified box scores</span></div>
              <div><strong>{battingMinimum}</strong><span>minimum plate appearances</span></div>
              <div><strong>{pitchingMinimum}</strong><span>minimum innings pitched</span></div>
            </div>
          )}
        </div>
      </section>

      {data && (
        <>
          <div className="container analysis-prose">
            <p className="analysis-lead">The first month of a new league invites oversized conclusions. Through {formatThroughDate(data.leaders.throughDate)}, the official WPBL box scores support something more useful: a snapshot of exceptional starts, different forms of offensive value and a pitching leaderboard still shaped by limited innings.</p>

            <p>This analysis uses only games marked complete in the official feed. She&rsquo;s On First removed duplicate or placeholder records, calculated player totals from the completed box scores and applied a minimum of {battingMinimum} plate appearances for hitters and {pitchingMinimum} innings for pitchers. Those choices make the comparison reproducible. They do not make the sample large.</p>

            <h2>The clearest signal is elite early offense</h2>
            <p>Denae Benites and Kelsie Whitmore share the early home-run lead, but the top of the batting table is not one-dimensional. Benites pairs power with stolen bases, while Ashton Lansdell&rsquo;s combination of walks, speed and extra-base impact creates another route to a top-five OPS.</p>
          </div>

          <section className="section analysis-visual-section" aria-labelledby="batting-visual-title">
            <div className="container">
              <div className="analysis-section-head">
                <div>
                  <span className="eyebrow">Qualified batting leaders</span>
                  <h2 id="batting-visual-title">OPS, with opportunity attached</h2>
                </div>
                <p>{data.leaders.qualifications.batting}</p>
              </div>

              <div className="analysis-chart panel" role="img" aria-label={`Top five qualified WPBL hitters by OPS through ${formatThroughDate(data.leaders.throughDate)}. Plate appearances are shown for each hitter.`}>
                {batting.map((player) => (
                  <div className="analysis-bar-row" key={player.id}>
                    <div className="analysis-bar-label">
                      <strong>{player.name}</strong>
                      <span>{player.teamAbbr} · {player.pa} PA</span>
                    </div>
                    <div className="analysis-bar-track" aria-hidden="true">
                      <span style={{ width: `${Math.max((player.ops / maxOps) * 100, 8)}%` }} />
                    </div>
                    <b>{formatRate(player.ops)}</b>
                  </div>
                ))}
              </div>

              <p className="analysis-chart-note">OPS combines on-base percentage and slugging percentage. The bar shows the rate; the plate-appearance count shows how much early-season opportunity sits behind it.</p>
            </div>
          </section>

          <section className="section analysis-shapes-section">
            <div className="container">
              <div className="analysis-section-head">
                <div>
                  <span className="eyebrow">The shape of offense</span>
                  <h2>Similar rankings can come from different games</h2>
                </div>
              </div>

              <div className="analysis-shape-grid">
                <div className="analysis-shape-card panel">
                  <span>Power at the top</span>
                  <strong>{benites?.hr ?? '—'} + {whitmore?.hr ?? '—'}</strong>
                  <p>Home runs for Benites and Whitmore, respectively. Benites reached that total in {benites?.g ?? '—'} games; Whitmore did it in {whitmore?.g ?? '—'}.</p>
                </div>
                <div className="analysis-shape-card panel">
                  <span>Power plus pressure</span>
                  <strong>{benites?.hr ?? '—'} HR · {benites?.sb ?? '—'} SB</strong>
                  <p>Benites&rsquo;s early line combines the shared home-run lead with the most stolen bases among the top five OPS hitters.</p>
                </div>
                <div className="analysis-shape-card panel">
                  <span>Another route</span>
                  <strong>{lansdell?.bb ?? '—'} BB · {lansdell?.sb ?? '—'} SB</strong>
                  <p>Lansdell reached the top five with fewer home runs, plus walks and speed across {lansdell?.pa ?? '—'} plate appearances.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="container analysis-prose">
            <h2>Pitching rates need their innings beside them</h2>
            <p>The qualified ERA leaders have thrown between {pitchingRange} innings. That is enough to describe what happened, but not enough to treat each rate as settled ability. One difficult appearance can still move an early ERA or WHIP sharply.</p>
          </div>

          <section className="section analysis-visual-section" aria-labelledby="pitching-visual-title">
            <div className="container">
              <div className="analysis-section-head">
                <div>
                  <span className="eyebrow">Qualified pitching leaders</span>
                  <h2 id="pitching-visual-title">ERA, with innings in view</h2>
                </div>
                <p>{data.leaders.qualifications.pitching}</p>
              </div>

              <div className="analysis-chart panel" role="img" aria-label={`Top five qualified WPBL pitchers by ERA through ${formatThroughDate(data.leaders.throughDate)}. Innings and WHIP are shown for each pitcher. Lower ERA is better.`}>
                {pitching.map((player) => (
                  <div className="analysis-bar-row analysis-pitch-row" key={player.id}>
                    <div className="analysis-bar-label">
                      <strong>{player.name}</strong>
                      <span>{player.teamAbbr} · {player.ip} IP · {player.whip.toFixed(2)} WHIP</span>
                    </div>
                    <div className="analysis-bar-track" aria-hidden="true">
                      <span style={{ width: `${Math.max((player.era / maxPitchingEra) * 100, 8)}%` }} />
                    </div>
                    <b>{player.era.toFixed(2)}</b>
                  </div>
                ))}
              </div>

              <p className="analysis-chart-note">Lower ERA is better; the bars visualize the rate rather than rank. Innings and WHIP stay visible so no rate appears without its workload and a second measure of traffic allowed.</p>
            </div>
          </section>

          <div className="container analysis-prose">
            <h2>What this snapshot cannot answer yet</h2>
            <p>It cannot establish who will finish as the league&rsquo;s best hitter or pitcher. It cannot separate a durable breakout from a short hot streak. It also cannot make every player comparable when roles, playing time and team schedules differ.</p>

            <p>The next useful questions are measurable: whether the top offensive rates hold as plate appearances double, which pitchers maintain both run prevention and control over longer outings, and whether early multi-category contributors remain valuable as the season&rsquo;s workload grows.</p>
          </div>

          <section className="section analysis-method-section">
            <div className="container">
              <div className="analysis-method panel">
                <div className="analysis-method-intro">
                  <span className="eyebrow">How we built this</span>
                  <h2>Visible methodology</h2>
                  <p>The public-facing numbers are derived from completed official box scores. They remain provisional until the full season can be reconciled.</p>
                </div>

                <dl className="analysis-method-grid">
                  <div><dt>Feed records</dt><dd>{data.manifest.quality.feedGames}</dd></div>
                  <div><dt>Published games retained</dt><dd>{data.manifest.quality.publishedGames}</dd></div>
                  <div><dt>Duplicate or placeholder records removed</dt><dd>{data.manifest.quality.duplicateOrPlaceholderGamesRemoved}</dd></div>
                  <div><dt>Completed games calculated</dt><dd>{data.manifest.quality.completedGames}</dd></div>
                  <div><dt>Verified box scores</dt><dd>{data.manifest.quality.verifiedBoxscores}</dd></div>
                  <div><dt>Box-score errors</dt><dd>{data.manifest.quality.boxscoreErrors.length}</dd></div>
                </dl>

                <div className="analysis-transformations">
                  <h3>Transformations disclosed</h3>
                  <ul>{data.manifest.transformations.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>

                <p className="analysis-retrieved">Retrieved {formatRetrieved(data.manifest.fetchedAt)} · Statistics through {formatThroughDate(data.manifest.throughDate)} · <a href={data.manifest.source.url} target="_blank" rel="noopener noreferrer">Official WPBL statistics feed</a></p>
              </div>
            </div>
          </section>

          <section className="section analysis-close">
            <div className="container analysis-prose">
              <div className="analysis-links">
                <Link className="btn btn-primary" to="/leaders">Explore the full leaders</Link>
                <Link className="btn btn-secondary" to="/schedule">View the schedule</Link>
              </div>
            </div>
          </section>
        </>
      )}
    </article>
  )
}
