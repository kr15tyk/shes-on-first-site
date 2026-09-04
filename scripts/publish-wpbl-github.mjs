import { readFile, appendFile } from 'node:fs/promises'
import { validateSnapshot } from './wpbl-validation.mjs'

const bytes = await readFile('artifacts/wpbl/data/snapshot.json')
validateSnapshot(JSON.parse(bytes), JSON.parse(await readFile('artifacts/wpbl/previous.json')))
const api = 'https://api.github.com/repos/kr15tyk/shes-on-first-site'
async function request(path, method = 'GET', body, allowMissing = false) {
  const response = await fetch(`${api}${path}`, { method, headers: {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json',
    'content-type': 'application/json', 'x-github-api-version': '2022-11-28',
  }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000), redirect: 'error' })
  if (allowMissing && response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub data publication failed: HTTP ${response.status}`)
  return response.json()
}
if (!process.env.GITHUB_TOKEN) throw new Error('Missing GitHub workflow token')
const ref = await request('/git/ref/heads/wpbl-data', 'GET', undefined, true)
const blob = await request('/git/blobs', 'POST', { content: bytes.toString('base64'), encoding: 'base64' })
const tree = await request('/git/trees', 'POST', { tree: [{ path: 'snapshot.json', mode: '100644', type: 'blob', sha: blob.sha }] })
const commit = await request('/git/commits', 'POST', { message: 'Publish validated WPBL statistics', tree: tree.sha, parents: ref ? [ref.object.sha] : [] })
if (ref) await request('/git/refs/heads/wpbl-data', 'PATCH', { sha: commit.sha, force: false })
else await request('/git/refs', 'POST', { ref: 'refs/heads/wpbl-data', sha: commit.sha })
console.log('Validated statistics published to the dedicated wpbl-data branch.')
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, '\nValidated data published for Hostinger to retrieve over HTTPS.\n')
