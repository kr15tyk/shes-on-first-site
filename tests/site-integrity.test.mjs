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
    assert.equal(builtReviews.length, 3)
  } else {
    await assert.rejects(readdir(resolve(siteDir, 'dist/review')))
  }
})

test('staged review sources retain privacy headers and use the consistent question structure', async () => {
  const reviewRoot = resolve(siteDir, 'public/review')
  const reviewEntries = (await readdir(reviewRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory())
  assert.equal(reviewEntries.length, 3)

  const reviewConfig = await read('public/review/.htaccess')
  const reviewTemplate = await read('../docs/PLAYER_REVIEW_PRESENTATION_TEMPLATE.md')
  assert.match(reviewConfig, /X-Robots-Tag "noindex, nofollow, noarchive"/)
  assert.match(reviewConfig, /Referrer-Policy "no-referrer"/)
  assert.match(reviewTemplate, /Use one continuous five-item list/)
  assert.match(reviewTemplate, /not being asked to validate league-calculated totals/)

  for (const entry of reviewEntries) {
    const html = await read(`public/review/${entry.name}/index.html`)
    const questionList = html.match(/<ol class="question-list">([\s\S]*?)<\/ol>/)?.[1]
    assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/)
    assert.match(html, /<meta name="referrer" content="no-referrer">/)
    assert.match(html, /baseball@shesonfirst\.com/)
    assert.match(html, /Dated league statistics are included as sourced context; we are not asking you to validate league-calculated totals\./)
    assert.match(html, /class="image-checks"/)
    assert.ok(questionList, `review ${entry.name} is missing its player question list`)
    assert.equal((questionList.match(/<li><span class="question-copy">/g) || []).length, 5)
    assert.equal((questionList.match(/Your perspective &mdash; optional:/g) || []).length, 2)
    assert.ok(!questionList.includes('<li><strong>'), `review ${entry.name} has an unwrapped optional label`)
    assert.ok(!html.includes('Permission for She’s On First would not automatically permit use on Wikimedia Commons.'))
  }

  const denaeReview = await read('public/review/7dfd33614924a92eaf996c0b/index.html')
  const denaeFeature = await read('src/pages/DenaeFeature.tsx')
  assert.match(denaeReview, /Unlisted factual review · Not published/)
  assert.match(denaeReview, /Reply by September 3, 2026/)
  assert.match(denaeReview, /four inaugural team captains/)
  assert.match(denaeReview, /Denae&rsquo;s is the first profile in that round/)
  assert.match(denaeReview, /aria-label="She&rsquo;s On First home"/)
  assert.match(denaeReview, /class="home-link" href="\/"/)
  assert.doesNotMatch(denaeReview, /Deadline to be set when sent/)
  assert.doesNotMatch(denaeReview, /Your private profile preview/)
  assert.match(denaeFeature, /Player factual review pending/)
  assert.doesNotMatch(denaeFeature, /Factual review not yet sent/)
  assert.doesNotMatch(denaeFeature, /has not yet been invited/)
})
