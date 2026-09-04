import { useWpblData, formatThroughDate } from '../data/wpbl'

export default function DataFreshness() {
  const { data } = useWpblData()
  if (!data) return null
  const overdue = data.schedule.games.some((game) => game.status !== 'Final' && Date.parse(game.start) < Date.now() - 18 * 3600_000)
  const oldCheck = Date.now() - Date.parse(data.manifest.fetchedAt) > 36 * 3600_000
  return (
    <p className="data-source" role="status">
      Stats through {formatThroughDate(data.manifest.throughDate)}.{' '}
      Last checked {new Date(data.manifest.fetchedAt).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}.
      {overdue && <strong> The source still lists a past game as uncompleted; newer results are not confirmed.</strong>}
      {oldCheck && <strong> This snapshot is awaiting a fresh source check.</strong>}
    </p>
  )
}
