// Deploy exactly one data file. No shell commands are executed on the host.
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { validateSnapshot } from './wpbl-validation.mjs'

assert.equal(process.env.WPBL_PUBLISH_ENABLED, 'true', 'Publishing has not been enabled')
const { HOSTINGER_HOST: host, HOSTINGER_USER: user, HOSTINGER_PORT: port, HOSTINGER_DATA_DIR: directory, HOSTINGER_SSH_KEY: key, HOSTINGER_KNOWN_HOSTS: knownHosts } = process.env
assert.match(host || '', /^[a-zA-Z0-9][a-zA-Z0-9.-]+$/)
assert.match(user || '', /^[a-zA-Z0-9_][a-zA-Z0-9_-]*$/)
assert.match(port || '', /^\d{1,5}$/)
assert.ok(Number(port) > 0 && Number(port) <= 65535)
assert.match(directory || '', /^\/[a-zA-Z0-9_./-]+\/public_html\/data\/wpbl$/)
assert.ok(!directory.includes('..'), 'Unsafe deployment directory')
assert.ok(key && knownHosts, 'Verified SSH key and host keys are required')
const nextBytes = await readFile('artifacts/wpbl/data/snapshot.json')
const next = JSON.parse(nextBytes)
const previous = JSON.parse(await readFile('artifacts/wpbl/previous.json', 'utf8'))
validateSnapshot(next, previous)
const url = 'https://shesonfirst.com/data/wpbl/snapshot.json'
const live = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(20000), redirect: 'error' })
assert.ok(live.ok, 'Deploy the snapshot-enabled frontend before enabling automatic publication')
const liveBytes = Buffer.from(await live.arrayBuffer())
assert.deepEqual(JSON.parse(liveBytes), previous, 'Published data changed during this run; retry with a fresh baseline')
const temporary = await mkdtemp(join(tmpdir(), 'wpbl-publish-'))
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
try {
  await writeFile(join(temporary, 'key'), key, { mode: 0o600 })
  await writeFile(join(temporary, 'known_hosts'), knownHosts, { mode: 0o600 })
  await writeFile(join(temporary, 'next.json'), nextBytes)
  await writeFile(join(temporary, 'previous.json'), liveBytes)
  const remoteTemp = `snapshot-${hash(nextBytes).slice(0, 16)}.tmp`
  function upload(local, target, activate = true) {
    const commands = `cd ${directory}\nput ${local} ${target}\n${activate ? `rename -f ${target} snapshot.json\n` : ''}`
    const result = spawnSync('sftp', ['-q', '-b', '-', '-P', port, '-i', join(temporary, 'key'), '-oBatchMode=yes', '-oIdentitiesOnly=yes', '-oStrictHostKeyChecking=yes', `-oUserKnownHostsFile=${join(temporary, 'known_hosts')}`, `${user}@${host}`], { input: commands, encoding: 'utf8', timeout: 60000 })
    // Do not print connection details or credential-related diagnostic output.
    if (result.status !== 0) throw new Error('SFTP publication failed; check connection settings and host support for atomic rename')
  }
  upload(join(temporary, 'previous.json'), `snapshot-backup-${hash(liveBytes).slice(0, 16)}.json`, false)
  upload(join(temporary, 'next.json'), remoteTemp)
  try {
    const response = await fetch(`${url}?version=${hash(nextBytes)}`, { cache: 'no-store', signal: AbortSignal.timeout(20000), redirect: 'error' })
    assert.ok(response.ok)
    assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(nextBytes), 'Live data verification failed')
  } catch (error) {
    upload(join(temporary, 'previous.json'), 'snapshot-rollback.tmp')
    throw new Error('Live verification failed; restored the previous snapshot via SFTP')
  }
  console.log('Published and verified the complete WPBL snapshot.')
} finally {
  await rm(temporary, { recursive: true, force: true })
}
