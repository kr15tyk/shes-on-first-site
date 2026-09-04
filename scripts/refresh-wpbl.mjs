import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { validateSnapshot } from './wpbl-validation.mjs'

const root = resolve('artifacts/wpbl')
await mkdir(root, { recursive: true })
const output = resolve(root, 'data')
await mkdir(output, { recursive: true })
const base = 'https://shesonfirst.com/data/wpbl'
async function get(name) {
  const response = await fetch(`${base}/${name}.json`, { cache: 'no-store', signal: AbortSignal.timeout(20000), redirect: 'error' })
  if (name === 'snapshot' && response.status === 404) return null
  if (!response.ok) throw new Error(`Published ${name}: HTTP ${response.status}`)
  return response.json()
}
try {
  // Baseline is the last published version, not an old checkout or failed run.
  let previous = await get('snapshot')
  if (!previous) {
    const [schedule, leaders, players, manifest] = await Promise.all(['schedule','leaders','players','manifest'].map(get))
    previous = { schemaVersion: 1, schedule, leaders, players, manifest }
  }
  validateSnapshot(previous)
  if (process.env.WPBL_HOST_PULL_ENABLED === 'true') {
    const statusResponse = await fetch(`${base}/pull-status.json`, { cache: 'no-store', signal: AbortSignal.timeout(20000) })
    if (!statusResponse.ok) throw new Error('Hostinger updater status is unavailable')
    const status = await statusResponse.json()
    if (!status.ok || !Number.isFinite(Date.parse(status.checkedAt)) || Date.now() - Date.parse(status.checkedAt) > 2 * 3600_000) {
      throw new Error('Hostinger pull failed or has not run for over two hours; check its scheduled job')
    }
  }
  await writeFile(resolve(root, 'previous.json'), JSON.stringify(previous, null, 2))
  await writeFile(resolve(output, 'snapshot.json'), JSON.stringify(previous))
  const result = spawnSync(process.execPath, ['scripts/fetch-wpbl-data.mjs'], {
    stdio: 'inherit', env: { ...process.env, WPBL_OUTPUT_DIR: output, WPBL_RAW_DIR: resolve(root, 'raw') },
  })
  if (result.status !== 0) throw new Error('Collection or validation failed; no publication allowed')
  const next = JSON.parse(await readFile(resolve(output, 'snapshot.json'), 'utf8'))
  validateSnapshot(next, previous)
  const changedPlayers = next.players.players.filter((p) => JSON.stringify(p) !== JSON.stringify(previous.players.players.find((old) => old.id === p.id))).length
  const summary = `WPBL refresh\n\nChecked: ${next.manifest.fetchedAt}\nStatistics through: ${next.manifest.throughDate}\nCompleted games: ${next.manifest.quality.completedGames}\nVerified box scores: ${next.manifest.quality.verifiedBoxscores}\nChanged player records: ${changedPlayers}\nSource stale: ${next.manifest.quality.sourceStale ? 'YES — past game remains uncompleted in source' : 'No overdue games detected'}\nPublication: Validated output prepared for the GitHub data branch; Hostinger pull ${process.env.WPBL_HOST_PULL_ENABLED === 'true' ? 'enabled' : 'not yet connected'}\n`
  await writeFile(resolve(root, 'report.md'), summary)
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary)
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `source_stale=${next.manifest.quality.sourceStale}\n`)
} catch (error) {
  await writeFile(resolve(root, 'failure.txt'), `${error.message}\n`)
  console.error(error.message)
  process.exitCode = 1
}
