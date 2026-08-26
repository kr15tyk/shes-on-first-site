import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const siteDir = resolve(scriptDir, '..')
const distDir = resolve(siteDir, 'dist')
const routeDir = resolve(distDir, '_routes')
const siteUrl = 'https://shesonfirst.com'
const lastModified = '2026-08-26'
const includePrivateReviews = process.env.INCLUDE_PRIVATE_REVIEWS === '1'

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const escapeXml = (value) => escapeHtml(value).replaceAll("'", '&apos;')
const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${escapePattern(key)}"\\s+content="[^"]*"\\s*/?>`, 'i')
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

function routeShell(baseHtml, route) {
  const url = `${siteUrl}${route.path === '/' ? '/' : route.path}`
  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${escapeHtml(url)}" />`)

  html = replaceMeta(html, 'name', 'description', route.description)
  html = replaceMeta(html, 'name', 'robots', route.indexable === false ? 'noindex,nofollow' : 'index,follow')
  html = replaceMeta(html, 'property', 'og:type', route.type || 'website')
  html = replaceMeta(html, 'property', 'og:title', route.title)
  html = replaceMeta(html, 'property', 'og:description', route.description)
  html = replaceMeta(html, 'property', 'og:url', url)
  html = replaceMeta(html, 'name', 'twitter:title', route.title)
  html = replaceMeta(html, 'name', 'twitter:description', route.description)

  if (route.structuredData) {
    const json = JSON.stringify(route.structuredData).replaceAll('<', '\\u003c')
    html = html.replace('</head>', `    <script id="sof-structured-data" type="application/ld+json">${json}</script>\n  </head>`)
  }

  return html
}

const playerSource = await readFile(resolve(siteDir, 'src/data/players.ts'), 'utf8')
const playerLinePattern = /^\s+\[(['"])(.*?)\1,\s*(['"])(.*?)\3\],$/gm
const players = [...playerSource.matchAll(playerLinePattern)].map((match) => ({
  name: match[2],
  position: match[4],
  slug: match[2]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, ''),
}))

if (players.length !== 60) throw new Error(`Expected 60 roster players, found ${players.length}`)

const articleSource = await readFile(resolve(siteDir, 'src/data/articles.ts'), 'utf8')
const articlePattern = /\{\s+slug: '([^']+)',\s+title: '([^']+)',\s+dek: '([^']+)',[\s\S]*?\s+date: '([^']+)'/g
const articles = [...articleSource.matchAll(articlePattern)].map((match) => ({
  slug: match[1],
  title: match[2],
  description: match[3],
  date: match[4],
}))

const routes = [
  {
    path: '/',
    title: "She's On First — Women's Baseball Profiles, Data & Stories",
    description: 'Independent women’s baseball coverage built around sourced player profiles, transparent WPBL data, and original stories.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: "She's On First",
      url: `${siteUrl}/`,
    },
  },
  {
    path: '/inaugural-60',
    title: "The Inaugural 60 | She's On First",
    description: 'Search the working roster of 60 players across the four inaugural WPBL teams and open each player’s season page.',
    structuredData: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'The Inaugural 60', numberOfItems: 60, url: `${siteUrl}/inaugural-60` },
  },
  { path: '/schedule', title: "2026 WPBL Schedule & Results | She's On First", description: 'Browse the inaugural WPBL schedule and completed results by date, status, and team.' },
  {
    path: '/leaders',
    title: "2026 WPBL Batting & Pitching Leaders | She's On First",
    description: 'Qualified 2026 WPBL batting and pitching leaders calculated from completed official box scores.',
    structuredData: { '@context': 'https://schema.org', '@type': 'Dataset', name: '2026 WPBL batting and pitching leaders', url: `${siteUrl}/leaders` },
  },
  { path: '/blog', title: "Project Notes | She's On First", description: "Reporting, methodology, sourcing notes, and collaboration information from She's On First." },
  {
    path: '/about',
    title: "Our Mission | She's On First",
    description: "Why She's On First is building a sourced, independent record of women’s baseball and the WPBL’s Inaugural 60.",
    structuredData: { '@context': 'https://schema.org', '@type': 'AboutPage', name: "Our Mission — She's On First", url: `${siteUrl}/about` },
  },
  ...players.map((player) => ({
    path: `/inaugural-60/${player.slug}`,
    title: `${player.name} — WPBL Player | She's On First`,
    description: `${player.name} is part of the WPBL’s Inaugural 60. View her dated season snapshot and developing sourced profile.`,
    type: 'profile',
    structuredData: { '@context': 'https://schema.org', '@type': 'Person', name: player.name, jobTitle: `Professional baseball ${player.position}`, url: `${siteUrl}/inaugural-60/${player.slug}` },
  })),
  ...articles.map((article) => ({
    path: `/blog/${article.slug}`,
    title: `${article.title} | She's On First`,
    description: article.description,
    type: 'article',
    lastmod: article.date,
    structuredData: { '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.description, datePublished: article.date, mainEntityOfPage: `${siteUrl}/blog/${article.slug}` },
  })),
  {
    path: '/features/denae-benites',
    title: "Denae Benites Found the Stage Baseball Had Denied Her | She's On First",
    description: 'An unpublished flagship-profile draft about Denae Benites and the path that led her to the WPBL.',
    type: 'article',
    indexable: false,
  },
  {
    path: '/analysis/wpbl-first-month',
    title: "What the WPBL’s First Month Can Tell Us | She's On First",
    description: 'An unpublished analysis draft examining the sample sizes behind the early WPBL leaderboards.',
    type: 'article',
    indexable: false,
  },
]

const baseHtml = await readFile(resolve(distDir, 'index.html'), 'utf8')
await mkdir(routeDir, { recursive: true })

if (!includePrivateReviews) {
  await rm(resolve(distDir, 'review'), { recursive: true, force: true })
}

const routeRules = []
for (const [index, route] of routes.entries()) {
  const html = routeShell(baseHtml, route)
  if (route.path === '/') {
    await writeFile(resolve(distDir, 'index.html'), html)
    continue
  }

  const filename = `${String(index).padStart(3, '0')}.html`
  await writeFile(resolve(routeDir, filename), html)
  routeRules.push(`  RewriteRule ^${escapePattern(route.path.slice(1))}/?$ _routes/${filename} [L]`)
}

const notFoundHtml = routeShell(baseHtml, {
  path: '/404',
  title: "Page Not Found | She's On First",
  description: 'The requested page could not be found.',
  indexable: false,
})
await writeFile(resolve(distDir, '404.html'), notFoundHtml)

const sitemapRoutes = routes.filter((route) => route.indexable !== false)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes.map((route) => `  <url><loc>${escapeXml(`${siteUrl}${route.path === '/' ? '/' : route.path}`)}</loc><lastmod>${route.lastmod || lastModified}</lastmod></url>`).join('\n')}
</urlset>
`
await writeFile(resolve(distDir, 'sitemap.xml'), sitemap)

const htaccess = `# Generated by scripts/build-static-routes.mjs. Do not edit dist/.htaccess by hand.
Options -MultiViews
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
${routeRules.join('\n')}
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 7 days"
  ExpiresByType image/svg+xml "access plus 7 days"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(png|jpg|jpeg|svg|woff2?)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
`
await writeFile(resolve(distDir, '.htaccess'), htaccess)
await writeFile(resolve(distDir, 'build-manifest.json'), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  routeShells: routes.length,
  sitemapUrls: sitemapRoutes.length,
  privateReviewsIncluded: includePrivateReviews,
}, null, 2)}\n`)

console.log(`Generated ${routes.length} route shells, ${sitemapRoutes.length} sitemap URLs, and a true 404 fallback. Private reviews: ${includePrivateReviews ? 'included' : 'excluded'}.`)
