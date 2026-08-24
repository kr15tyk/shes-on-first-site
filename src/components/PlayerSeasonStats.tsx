import { formatRate, formatThroughDate, PlayerSeasonRecord } from '../data/wpbl'

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="player-stat"><b>{value}</b><span>{label}</span></div>
}

export default function PlayerSeasonStats({
  stats,
  throughDate,
  sourceUrl,
  loading,
  error,
}: {
  stats?: PlayerSeasonRecord
  throughDate?: string
  sourceUrl?: string
  loading: boolean
  error: string
}) {
  return (
    <section className="section player-stats-section">
      <div className="container">
        <div className="section-head player-stats-head">
          <div><span className="eyebrow">2026 WPBL Season</span><h2>Player Snapshot</h2></div>
          {throughDate && <span className="tag violet">Through {formatThroughDate(throughDate)}</span>}
        </div>

        {loading && <div className="data-state panel">Loading this player&rsquo;s season snapshot…</div>}
        {error && <div className="data-state panel">{error}</div>}
        {!loading && !error && !stats && (
          <div className="data-state panel">No completed-game 2026 statistics are currently available for this player.</div>
        )}

        {stats && (
          <div className={`player-stats-grid ${stats.batting && stats.pitching ? 'player-stats-two-way' : ''}`}>
            {stats.batting && (
              <article className="player-stat-card panel">
                <h3>Batting</h3>
                <div className="player-stat-metrics">
                  <Metric label="G" value={stats.batting.g} />
                  <Metric label="PA" value={stats.batting.pa} />
                  <Metric label="AVG" value={formatRate(stats.batting.avg)} />
                  <Metric label="OBP" value={formatRate(stats.batting.obp)} />
                  <Metric label="SLG" value={formatRate(stats.batting.slg)} />
                  <Metric label="OPS" value={formatRate(stats.batting.ops)} />
                  <Metric label="HR" value={stats.batting.hr} />
                  <Metric label="RBI" value={stats.batting.rbi} />
                  <Metric label="SB" value={stats.batting.sb} />
                </div>
              </article>
            )}
            {stats.pitching && (
              <article className="player-stat-card panel">
                <h3>Pitching</h3>
                <div className="player-stat-metrics pitching">
                  <Metric label="G" value={stats.pitching.g} />
                  <Metric label="IP" value={stats.pitching.ip} />
                  <Metric label="ERA" value={stats.pitching.era.toFixed(2)} />
                  <Metric label="WHIP" value={stats.pitching.whip.toFixed(2)} />
                  <Metric label="SO" value={stats.pitching.so} />
                </div>
              </article>
            )}
          </div>
        )}

        {stats && sourceUrl && (
          <p className="data-source">
            Calculated from completed box scores in the{' '}
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">official WPBL statistics feed</a>.
            This dated snapshot will change as games are completed.
          </p>
        )}
      </div>
    </section>
  )
}
