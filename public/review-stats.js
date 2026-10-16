// Shared public/review refresh; all cards update together from one verified snapshot.
const labels = {
  batting: { G: 'g', PA: 'pa', AVG: 'avg', OBP: 'obp', SLG: 'slg', OPS: 'ops', HR: 'hr', RBI: 'rbi', SB: 'sb' },
  pitching: { G: 'g', IP: 'ip', ERA: 'era', WHIP: 'whip', SO: 'so' },
}
const inningsOuts = value => {
  const match = String(value).match(/^(\d+)\.([012])$/)
  if (!match) throw new Error('Invalid baseball innings')
  return Number(match[1]) * 3 + Number(match[2])
}
const countsValid = (record, keys) => keys.every(key => Number.isInteger(record[key]) && record[key] >= 0)
const decreased = (record, previous, keys) => keys.some(key => Number.isFinite(previous[key]) && record[key] < previous[key])

export function selectReviewSnapshot(snapshot, slug, baseline, previousBatting = {}, previousPitching = {}) {
  const data = snapshot?.players
  const manifest = snapshot?.manifest
  const quality = manifest?.quality
  if (!data || data.throughDate !== manifest?.throughDate || data.fetchedAt !== manifest?.fetchedAt ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.throughDate) || !Number.isFinite(Date.parse(data.fetchedAt)) ||
      data.throughDate < baseline || quality?.sourceStale === true ||
      !Number.isInteger(quality?.completedGames) || quality.completedGames < 1 ||
      quality.completedGames !== quality.verifiedBoxscores || !Array.isArray(quality.boxscoreErrors) || quality.boxscoreErrors.length) {
    throw new Error('Snapshot is incomplete, stale, or older than the displayed data')
  }
  const matches = data.players?.filter(player => player.slug === slug)
  if (matches?.length !== 1) throw new Error('Player not uniquely identified')
  const { batting } = matches[0]
  const pitching = matches[0].pitching ? { ...matches[0].pitching, outs: inningsOuts(matches[0].pitching.ip) } : null
  if (!batting && !pitching) throw new Error('Missing player statistics')
  if (!batting && Object.keys(previousBatting).length) throw new Error('Missing batting totals')
  if (!pitching && Object.keys(previousPitching).length) throw new Error('Missing pitching totals')
  if (batting) {
    if (!countsValid(batting, ['g','pa','hr','rbi','sb']) ||
        !['avg','obp','slg','ops'].every(key => Number.isFinite(batting[key]) && batting[key] >= 0) ||
        batting.avg > 1 || batting.obp > 1 || batting.slg > 4 || batting.ops > 5) throw new Error('Invalid batting record')
    if (decreased(batting, previousBatting, ['g','pa','hr','rbi','sb'])) throw new Error('Reduced batting totals')
  }
  if (pitching) {
    if (!countsValid(pitching, ['g','outs','so']) || (matches[0].pitching.outs !== undefined && matches[0].pitching.outs !== pitching.outs) ||
        !['era','whip'].every(key => pitching.outs === 0 ? pitching[key] === null : Number.isFinite(pitching[key]) && pitching[key] >= 0)) throw new Error('Invalid pitching record')
    if (decreased(pitching, previousPitching, ['g','outs','so'])) throw new Error('Reduced pitching totals')
  }
  return { throughDate: data.throughDate, fetchedAt: data.fetchedAt, batting, pitching }
}

export function formatReviewMetric(type, key, record) {
  if (type === 'pitching' && ['era', 'whip'].includes(key)) return record.outs === 0 ? '—' : record[key].toFixed(2)
  if (type === 'batting' && ['avg','obp','slg','ops'].includes(key)) return record[key].toFixed(3).replace(/^0/, '')
  return String(record[key])
}

export async function refreshReviewStats(section) {
  if (section.dataset.statsRefreshStarted === 'true') return
  section.dataset.statsRefreshStarted = 'true'
  const note = document.createElement('p')
  note.className = 'stats-note'
  note.setAttribute('role', 'status')
  section.querySelector('.shell').append(note)
  try {
    const cards = [...section.querySelectorAll('.stat-card')].map(card => {
      // Header fallback keeps previously published batting-only markup compatible.
      const type = card.dataset.statType || card.querySelector('h3').textContent.trim().toLowerCase()
      if (!labels[type]) throw new Error('Unexpected statistics card')
      const metrics = [...card.querySelectorAll('.stat-metric')].map(metric => {
        const key = labels[type][metric.querySelector('span').textContent.trim()]
        if (!key) throw new Error('Unexpected statistic')
        return { key, element: metric.querySelector('b') }
      })
      if (metrics.length !== Object.keys(labels[type]).length || new Set(metrics.map(m => m.key)).size !== metrics.length) throw new Error('Unexpected statistics layout')
      const previous = Object.fromEntries(metrics.map(({key, element}) => [key, Number(element.textContent)]))
      if (type === 'pitching') previous.outs = inningsOuts(metrics.find(m => m.key === 'ip').element.textContent)
      return { card, type, metrics, previous }
    })
    if (!cards.length) throw new Error('Missing statistics cards')
    const response = await fetch('/data/wpbl/snapshot.json', { cache: 'no-store', signal: AbortSignal.timeout(12000) })
    if (!response.ok) throw new Error('Snapshot unavailable')
    const next = selectReviewSnapshot(await response.json(), section.dataset.reviewStats, section.dataset.throughDate,
      cards.find(c => c.type === 'batting')?.previous, cards.find(c => c.type === 'pitching')?.previous)
    const updates = cards.flatMap(({type, metrics}) => {
      if (!next[type]) throw new Error('Missing statistics card data')
      return metrics.map(({key, element}) => [element, formatReviewMetric(type, key, next[type])])
    })
    // Validate all values and date targets before changing any displayed totals.
    const date = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' })
    const through = date.format(new Date(`${next.throughDate}T12:00:00Z`))
    const retrieved = date.format(new Date(next.fetchedAt))
    const dateElement = section.querySelector('.stats-note strong')
    const retrievedElement = section.querySelector('[data-stats-retrieved]')
    if (!dateElement || !retrievedElement) throw new Error('Missing date labels')
    updates.forEach(([element, value]) => { element.textContent = value })
    cards.filter(c => c.type === 'pitching').forEach(({card}) => {
      const rateNote = card.querySelector('.pitching-rate-note')
      if (rateNote) rateNote.hidden = next.pitching.outs !== 0
    })
    dateElement.textContent = through
    retrievedElement.textContent = retrieved
    section.dataset.throughDate = next.throughDate
    note.textContent = 'Loaded the latest available site snapshot. Statistics are through the date shown above.'
  } catch {
    note.textContent = 'A newer verified snapshot could not be loaded. The dated snapshot above is retained; newer games may not be included.'
  }
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-review-stats]').forEach(refreshReviewStats)
