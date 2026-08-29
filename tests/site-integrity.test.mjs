import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const siteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFile(resolve(siteDir, path), 'utf8')
const json = async (path) => JSON.parse(await read(path))

const slugify = (name) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

async function rosterPlayers() {
  const source = await read('src/data/players.ts')
  const teamPattern = /team: '([^']+)',\s+players: \[([\s\S]*?)\]\s*,\s+\},/g
  const playerPattern = /^\s+\[(['"])(.*?)\1,\s*(['"])(.*?)\3\],$/gm
  const teams = [...source.matchAll(teamPattern)].map((team) => ({
    name: team[1],
    players: [...team[2].matchAll(playerPattern)].map((player) => ({
      name: player[2],
      position: player[4],
      slug: slugify(player[2]),
    })),
  }))
  return { teams, players: teams.flatMap((team) => team.players) }
}

test('the working roster has four unique 15-player teams', async () => {
  const { teams, players } = await rosterPlayers()
  assert.equal(teams.length, 4)
  assert.deepEqual(teams.map((team) => team.players.length), [15, 15, 15, 15])
  assert.equal(players.length, 60)
  assert.equal(new Set(players.map((player) => player.name)).size, 60)
  assert.equal(new Set(players.map((player) => player.slug)).size, 60)
})

test('the WPBL snapshot is internally consistent', async () => {
  const [manifest, schedule, leaders, playerData] = await Promise.all([
    json('public/data/wpbl/manifest.json'),
    json('public/data/wpbl/schedule.json'),
    json('public/data/wpbl/leaders.json'),
    json('public/data/wpbl/players.json'),
  ])

  assert.equal(manifest.quality.feedGames, manifest.quality.publishedGames + manifest.quality.duplicateOrPlaceholderGamesRemoved)
  assert.equal(manifest.quality.completedGames, manifest.quality.verifiedBoxscores)
  assert.deepEqual(manifest.quality.boxscoreErrors, [])
  assert.equal(schedule.games.filter((game) => game.status === 'Final').length, manifest.quality.completedGames)
  assert.equal(new Set(schedule.games.map((game) => game.id)).size, schedule.games.length)
  assert.equal(leaders.throughDate, manifest.throughDate)
  assert.equal(playerData.throughDate, manifest.throughDate)
  assert.equal(new Set(playerData.players.map((player) => player.id)).size, playerData.players.length)
  assert.equal(new Set(playerData.players.map((player) => player.slug)).size, playerData.players.length)
  assert.ok(leaders.batting.every((player) => player.pa >= 20))
  assert.ok(leaders.pitching.every((player) => Number.parseFloat(player.ip) >= 5))
})

test('the first-month analysis derives changing claims from the current snapshot', async () => {
  const analysis = await read('src/pages/WpblFirstMonthAnalysis.tsx')

  assert.match(analysis, /const battingMinimum = data\?\.leaders\.qualifications\.batting/)
  assert.match(analysis, /const pitchingMinimum = data\?\.leaders\.qualifications\.pitching/)
  assert.match(analysis, /const pitchingRange = pitchingByWorkload\.length/)
  assert.match(analysis, /Benites reached that total in \{benites\?\.g/)
  assert.match(analysis, /Whitmore did it in \{whitmore\?\.g/)
  assert.doesNotMatch(analysis, /minimum of 20 plate appearances/)
  assert.doesNotMatch(analysis, /Both reached that total in 10 games/)
  assert.doesNotMatch(analysis, /roughly 10 and 19 innings/)
  assert.doesNotMatch(analysis, /Before publication/)
})

test('the public build contains exact deep routes, metadata, sitemap, and a true 404 rule', async () => {
  const { players } = await rosterPlayers()
  const [htaccess, sitemap, notFound, buildManifest] = await Promise.all([
    read('dist/.htaccess'),
    read('dist/sitemap.xml'),
    read('dist/404.html'),
    json('dist/build-manifest.json'),
  ])
  const routeFiles = await readdir(resolve(siteDir, 'dist/_routes'))
  const routeHtml = await Promise.all(routeFiles.map((file) => read(`dist/_routes/${file}`)))

  assert.equal(routeFiles.length, 70)
  assert.equal(buildManifest.routeShells, 71)
  assert.equal(buildManifest.sitemapUrls, 69)
  assert.equal((sitemap.match(/<url>/g) || []).length, 69)
  assert.ok(!sitemap.includes('/features/denae-benites'))
  assert.ok(!sitemap.includes('/analysis/wpbl-first-month'))
  assert.ok(!sitemap.includes('/review/'))
  assert.match(htaccess, /ErrorDocument 404 \/404\.html/)
  assert.doesNotMatch(htaccess, /RewriteRule \^ index\.html/)
  for (const player of players) {
    assert.ok(sitemap.includes(`/inaugural-60/${player.slug}`), `sitemap is missing ${player.slug}`)
    assert.ok(htaccess.includes(`RewriteRule ^inaugural-60/${player.slug}/?$`), `route rule is missing ${player.slug}`)
  }

  const denaeShell = routeHtml.find((html) => html.includes('Denae Benites — WPBL Player'))
  assert.ok(denaeShell)
  assert.match(denaeShell, /<meta name="robots" content="index,follow"/)
  assert.match(denaeShell, /<link rel="canonical" href="https:\/\/shesonfirst\.com\/inaugural-60\/denae-benites"/)
  assert.match(denaeShell, /"@type":"Person"/)

  const analysisShell = routeHtml.find((html) => html.includes('What the WPBL’s First Month Can Tell Us'))
  assert.ok(analysisShell)
  assert.match(analysisShell, /<meta name="robots" content="noindex,nofollow"/)
  assert.match(notFound, /<meta name="robots" content="noindex,nofollow"/)
  assert.match(notFound, /<title>Page Not Found/)

  if (buildManifest.privateReviewsIncluded) {
    const builtReviews = (await readdir(resolve(siteDir, 'dist/review'), { withFileTypes: true })).filter((entry) => entry.isDirectory())
    assert.equal(builtReviews.length, 5)
  } else {
    await assert.rejects(readdir(resolve(siteDir, 'dist/review')))
  }
})

test('staged review sources retain privacy headers and use the consistent question structure', async () => {
  const reviewRoot = resolve(siteDir, 'public/review')
  const reviewEntries = (await readdir(reviewRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory())
  assert.equal(reviewEntries.length, 5)
  let sharedComicProfiles = 0

  const reviewConfig = await read('public/review/.htaccess')
  const reviewTemplate = await read('../docs/PLAYER_REVIEW_PRESENTATION_TEMPLATE.md')
  const reviewComicCss = await read('public/review-comic.css')
  assert.match(reviewConfig, /X-Robots-Tag "noindex, nofollow, noarchive"/)
  assert.match(reviewConfig, /Referrer-Policy "no-referrer"/)
  assert.match(reviewTemplate, /Three quick things to check/)
  assert.match(reviewTemplate, /Use one continuous five-item list/)
  assert.match(reviewTemplate, /You can skip the statistics/)
  assert.match(reviewTemplate, /She's On First website palette/)
  assert.match(reviewComicCss, /--comic-ink: #090719/)
  assert.match(reviewComicCss, /--comic-deep: #100b2c/)
  assert.match(reviewComicCss, /--comic-panel: #21184d/)
  assert.match(reviewComicCss, /--comic-violet: #8b7cf2/)
  assert.match(reviewComicCss, /--comic-teal: #26d7cc/)
  assert.match(reviewComicCss, /--comic-mint: #76f0d8/)
  assert.match(reviewComicCss, /--comic-lavender: #d4cff2/)
  assert.match(reviewComicCss, /--comic-paper: #fff2d5/)
  assert.match(reviewComicCss, /body\.comic-profile \.review-panel > \.eyebrow \{\n  display: block;/)
  assert.match(reviewComicCss, /body\.comic-profile \.section h2 \{\n  display: block;/)
  assert.match(reviewComicCss, /object-fit: contain/)
  assert.match(reviewComicCss, /width: max-content/)
  assert.match(reviewComicCss, /margin-bottom: 8px/)
  assert.match(reviewTemplate, /single source of truth for page colors/)
  assert.match(reviewTemplate, /Every review or section label and its heading must occupy separate visual lines/)

  for (const entry of reviewEntries) {
    const html = await read(`public/review/${entry.name}/index.html`)
    const playerFacingHtml = html.replace(/<style[\s\S]*?<\/style>/g, '')
    const questionList = html.match(/<ol class="question-list">([\s\S]*?)<\/ol>/)?.[1]
    assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/)
    assert.match(html, /<meta name="referrer" content="no-referrer">/)
    assert.match(html, /baseball@shesonfirst\.com/)
    assert.match(html, /Three quick things to check/)
    assert.match(html, /You can skip the statistics&mdash;we keep those updated from league data\./)
    assert.match(html, /Only answer the ones you want\. Short answers are great\./)
    assert.match(html, /class="image-checks"/)
    assert.equal((html.match(/class="image-checks"[\s\S]*?<\/ol>/)?.[0].match(/<li>/g) || []).length, 2)
    assert.ok(questionList, `review ${entry.name} is missing its player question list`)
    assert.equal((questionList.match(/<li><span class="question-copy">/g) || []).length, 5)
    assert.equal((questionList.match(/<strong>Optional:<\/strong>/g) || []).length, 2)
    assert.ok(!questionList.includes('<li><strong>'), `review ${entry.name} has an unwrapped optional label`)
    assert.doesNotMatch(html, /not endorsement|approval or endorsement|independently check|published record does not answer cleanly|Separate from factual review|separate rights review|image rights|underlying photograph|May we use the finished illustration|photographer has permission/i)
    assert.doesNotMatch(playerFacingHtml, /\bweight\b/i)
    assert.ok(!html.includes('Permission for She’s On First would not automatically permit use on Wikimedia Commons.'))
    if (html.includes('class="comic-profile')) {
      sharedComicProfiles += 1
      assert.match(html, /\/review-comic\.css\?v=20260828-denae-palette/)
      assert.doesNotMatch(html, /body\.comic-profile\.[^{]+\{--comic-/)
    }
  }
  assert.equal(sharedComicProfiles, 5)

  const denaeReview = await read('public/review/7dfd33614924a92eaf996c0b/index.html')
  const ashtonReview = await read('public/review/2633f9498e3494d8e03cb16d/index.html')
  const kelsieReview = await read('public/review/7dc516a364834d0d7614340a/index.html')
  const alliReview = await read('public/review/1da96e47829df578193e9ba5/index.html')
  const denaeFeature = await read('src/pages/DenaeFeature.tsx')
  for (const captainReview of [denaeReview, ashtonReview, kelsieReview, alliReview]) {
    assert.match(captainReview, /class="brand-home" href="\/"/)
    assert.match(captainReview, /class="home-link" href="\/"/)
    assert.equal((captainReview.match(/class="fact"/g) || []).length, 9)
    assert.equal((captainReview.match(/class="milestone"/g) || []).length, 3)
  }
  assert.match(kelsieReview, /kelsie-whitmore-pitching-editorial-v3\.png/)
  assert.match(denaeReview, /Private profile preview · Not published/)
  assert.match(denaeReview, /Hi Denae &mdash; here&rsquo;s your profile preview/)
  assert.match(denaeReview, /<strong>Reply:<\/strong> Instagram or email/)
  assert.match(denaeReview, /About 5 minutes/)
  assert.match(denaeReview, /aria-label="She&rsquo;s On First home"/)
  assert.match(denaeReview, /class="home-link" href="\/"/)
  assert.doesNotMatch(denaeReview, /September 3|Reply by|Deadline to be set when sent/)
  assert.doesNotMatch(denaeReview, /Your private profile preview/)
  assert.match(denaeFeature, /Player factual review pending/)
  assert.doesNotMatch(denaeFeature, /Factual review not yet sent/)
  assert.doesNotMatch(denaeFeature, /has not yet been invited/)
})
