import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const reviewSourceDir = resolve(scriptDir, '../../content/reviews')
const reviewPublicDir = resolve(scriptDir, '../public/review')
const playerStatsPath = resolve(scriptDir, '../public/data/wpbl/players.json')

const reviews = [
  {
    displayName: 'Claire Eccles',
    source: 'claire-eccles-private-review.html',
    slug: 'claire-eccles',
    token: 'e1584d8c2f05a4afcf6d6cc0',
  },
  {
    displayName: 'Denae Benites',
    source: 'denae-benites-private-review.html',
    slug: 'denae-benites',
    token: '7dfd33614924a92eaf996c0b',
  },
  {
    displayName: 'Ashton Lansdell',
    source: 'ashton-lansdell-private-review.html',
    slug: 'ashton-lansdell',
    token: '2633f9498e3494d8e03cb16d',
  },
  {
    displayName: 'Kelsie Whitmore',
    source: 'kelsie-whitmore-private-review.html',
    slug: 'kelsie-whitmore',
    token: '7dc516a364834d0d7614340a',
  },
  {
    displayName: 'Alli Schroder',
    source: 'alli-schroder-private-review.html',
    slug: 'alli-schroder',
    token: '1da96e47829df578193e9ba5',
  },
]

const feedbackMarker = '<!-- PLAYER_REVIEW_FEEDBACK -->'

const reviewFeedback = ({ displayName, slug }) => `
    <section class="section review-feedback-section" data-review-feedback data-player-name="${displayName}">
      <div class="shell review-feedback-panel">
        <span class="eyebrow">Quick fact-check</span>
        <h2>Did we get it right?</h2>
        <p class="review-feedback-intro">One tap is enough. If something needs changing, tell us however you would naturally say it.</p>

        <div class="review-feedback-options" role="radiogroup" aria-label="Overall profile review">
          <label class="review-feedback-option">
            <input type="radio" name="profile-review-${slug}" value="Everything looks right">
            <span>&#10003; Everything looks right</span>
          </label>
          <label class="review-feedback-option">
            <input type="radio" name="profile-review-${slug}" value="I spotted something">
            <span>&#9998; I spotted something</span>
          </label>
        </div>

        <div class="review-feedback-correction" hidden>
          <label for="review-correction-${slug}">What should we change?</label>
          <textarea id="review-correction-${slug}" data-review-correction placeholder="For example: I played for that team in 2024, not 2023. Plain language is perfect."></textarea>
        </div>

        <details class="review-feedback-artwork">
          <summary>Optional: add a note about the illustration</summary>
          <label for="review-artwork-${slug}">Artwork note</label>
          <textarea id="review-artwork-${slug}" data-review-artwork placeholder="For example: The pose feels right, but I would change..."></textarea>
        </details>

        <div class="review-feedback-actions">
          <button type="button" class="review-prepare" data-review-prepare disabled>Prepare my reply</button>
          <p class="review-feedback-privacy">No account. Nothing is sent or saved automatically. You decide whether to share the reply.</p>
          <div class="review-feedback-result" data-review-result hidden aria-live="polite"></div>
          <div class="review-feedback-handoff" data-review-handoff hidden>
            <button type="button" data-review-copy>Copy for Instagram</button>
            <a data-review-email href="mailto:baseball@shesonfirst.com">Open email draft</a>
          </div>
          <p class="review-feedback-status" data-review-status aria-live="polite"></p>
        </div>
      </div>
    </section>`

const statsPayload = JSON.parse(await readFile(playerStatsPath, 'utf8'))
const formatRate = (value) => Number(value).toFixed(3).replace(/^0/, '')
const formatDate = (value) => new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date(`${value}T12:00:00Z`))

const metric = (label, value) => `
  <div class="stat-metric" style="padding:10px 6px;border:1px solid var(--line);border-radius:9px;background:rgba(11,6,32,.28);text-align:center">
    <b style="display:block;color:var(--text);font:italic 800 1.2rem/1 var(--display,Impact,sans-serif)">${value}</b>
    <span style="display:block;margin-top:5px;color:var(--muted);font:800 .68rem var(--display,Impact,sans-serif);letter-spacing:.08em;text-transform:uppercase">${label}</span>
  </div>`

function statsCard(title, values) {
  return `
    <article class="stat-card" style="overflow:hidden;padding:0 18px 18px;border:1px solid var(--line);border-radius:15px;background:var(--panel)">
      <h3 style="margin:0 -18px 18px;padding:14px 18px;border-bottom:3px solid var(--teal);font-style:italic;text-transform:uppercase">${title}</h3>
      <div class="stat-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(68px,1fr));gap:8px">${values.join('')}</div>
    </article>`
}

function statsSnapshot(slug) {
  const player = statsPayload.players.find((record) => record.slug === slug)
  if (!player) {
    return `<section class="section"><div class="shell reading"><span class="eyebrow">2026 WPBL season</span><h2>Dated statistics snapshot</h2><p class="stats-note">No completed-box-score snapshot is currently available for this player.</p></div></section>`
  }

  const cards = []
  if (player.batting) {
    cards.push(statsCard('Batting', [
      metric('G', player.batting.g),
      metric('PA', player.batting.pa),
      metric('AVG', formatRate(player.batting.avg)),
      metric('OBP', formatRate(player.batting.obp)),
      metric('SLG', formatRate(player.batting.slg)),
      metric('OPS', formatRate(player.batting.ops)),
      metric('HR', player.batting.hr),
      metric('RBI', player.batting.rbi),
      metric('SB', player.batting.sb),
    ]))
  }
  if (player.pitching) {
    cards.push(statsCard('Pitching', [
      metric('G', player.pitching.g),
      metric('IP', player.pitching.ip),
      metric('ERA', player.pitching.era.toFixed(2)),
      metric('WHIP', player.pitching.whip.toFixed(2)),
      metric('SO', player.pitching.so),
    ]))
  }

  return `
    <section class="section stats-section">
      <div class="shell">
        <span class="eyebrow">2026 WPBL season</span>
        <h2>Dated statistics snapshot</h2>
        <p class="stats-note" style="color:var(--lavender);max-width:800px">Calculated from completed official WPBL box scores through <strong>${formatDate(statsPayload.throughDate)}</strong>. You can skip this section&mdash;we keep the numbers updated from league data.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px">${cards.join('')}</div>
        <p style="margin:18px 0 0;color:var(--muted);font-size:.82rem"><a href="${statsPayload.source.url}" target="_blank" rel="noopener noreferrer">Official WPBL statistics feed</a> · Retrieved ${formatDate(statsPayload.fetchedAt.slice(0, 10))}</p>
      </div>
    </section>`
}

await Promise.all(reviews.map(async ({ displayName, source, slug, token }) => {
  const sourcePath = resolve(reviewSourceDir, source)
  const outputDir = resolve(reviewPublicDir, token)
  const outputPath = resolve(outputDir, 'index.html')
  const marker = `<!-- WPBL_STATS_SNAPSHOT:${slug} -->`
  const sourceHtml = await readFile(sourcePath, 'utf8')
  if (!sourceHtml.includes(marker)) throw new Error(`Missing stats marker for ${slug}`)
  if (!sourceHtml.includes(feedbackMarker)) throw new Error(`Missing feedback marker for ${slug}`)

  const html = sourceHtml
    .replace(
      '<meta name="robots" content="noindex,nofollow,noarchive">',
      '<meta name="robots" content="noindex,nofollow,noarchive">\n  <meta name="referrer" content="no-referrer">',
    )
    .replaceAll('../../site/public/favicon.png', '/favicon.png?v=21e762b')
    .replaceAll('../../site/public/logo-lockup.png', '/logo-lockup.png?v=21e762b')
    .replace(marker, statsSnapshot(slug))
    .replace(feedbackMarker, reviewFeedback({ displayName, slug }))
    .replace('</body>', '  <script src="/review-feedback.js?v=20260829-simple-review" defer></script>\n</body>')

  if (html.includes(marker)) throw new Error(`Stats marker was not replaced for ${slug}`)
  if (html.includes(feedbackMarker)) throw new Error(`Feedback marker was not replaced for ${slug}`)

  await mkdir(outputDir, { recursive: true })
  await writeFile(outputPath, html)
}))

console.log(`Staged ${reviews.length} unlisted review pages.`)
