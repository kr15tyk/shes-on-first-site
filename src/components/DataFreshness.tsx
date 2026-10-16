import { useWpblData, formatThroughDate, SeasonPeriod, periodLabels } from '../data/wpbl'

export default function DataFreshness({ period, schedule = false }: { period?: SeasonPeriod; schedule?: boolean }) {
  const { data } = useWpblData()
  if (!data) return null
  const throughDate = period ? data.periods?.[period]?.leaders.throughDate : data.manifest.throughDate
  const label = schedule ? `Latest completed${period ? ` ${periodLabels[period].toLowerCase()}` : ''} game:` : period ? `${periodLabels[period]} stats through` : 'Combined regular-season and postseason stats through'
  const overdue = data.schedule.games.some((game) => game.status !== 'Final' && Date.parse(game.start) < Date.now() - 18 * 3600_000)
  const oldCheck = Date.now() - Date.parse(data.manifest.fetchedAt) > 36 * 3600_000
  return (
    <p className="data-source" role="status">
      {throughDate ? `${label} ${formatThroughDate(throughDate)}.` : 'No completed-game statistics available for this period.'}{' '}
      Last checked {new Date(data.manifest.fetchedAt).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}.
      {overdue && <strong> The source still lists a past game as uncompleted; newer results are not confirmed.</strong>}
      {oldCheck && <strong> This snapshot is awaiting a fresh source check.</strong>}
    </p>
  )
}
