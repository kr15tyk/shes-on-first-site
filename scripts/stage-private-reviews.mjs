import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const reviewSourceDir = resolve(scriptDir, '../../content/reviews')
const reviewPublicDir = resolve(scriptDir, '../public/review')

const reviews = [
  {
    source: 'claire-eccles-private-review.html',
    token: 'e1584d8c2f05a4afcf6d6cc0',
  },
  {
    source: 'denae-benites-private-review.html',
    token: '7dfd33614924a92eaf996c0b',
  },
  {
    source: 'ashton-lansdell-private-review.html',
    token: '2633f9498e3494d8e03cb16d',
  },
]

await Promise.all(reviews.map(async ({ source, token }) => {
  const sourcePath = resolve(reviewSourceDir, source)
  const outputDir = resolve(reviewPublicDir, token)
  const outputPath = resolve(outputDir, 'index.html')
  const html = (await readFile(sourcePath, 'utf8'))
    .replace(
      '<meta name="robots" content="noindex,nofollow,noarchive">',
      '<meta name="robots" content="noindex,nofollow,noarchive">\n  <meta name="referrer" content="no-referrer">',
    )
    .replaceAll('../../site/public/favicon.png', '/favicon.png?v=21e762b')
    .replaceAll('../../site/public/logo-lockup.png', '/logo-lockup.png?v=21e762b')

  await mkdir(outputDir, { recursive: true })
  await writeFile(outputPath, html)
}))

console.log(`Staged ${reviews.length} unlisted review pages.`)
