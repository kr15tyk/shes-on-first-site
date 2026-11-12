import DataFreshness from './DataFreshness'
import { formatRate, formatThroughDate, PlayerSeasonRecord, SeasonPeriod, periodLabels } from '../data/wpbl'

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="player-stat"><b>{value}</b><span>{label}</span></div>
}

export default function PlayerSeasonStats({
  period,
  stats,
  throughDate,
  sourceUrl,
  loading,
  error,
  expanded = false,
}: {
  expanded?: boolean
  period: SeasonPeriod
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
          <div><span className="eyebrow">2026 WPBL Season</span><h2>{periodLabels[period]} Snapshot</h2></div>
          {throughDate && <span className="tag violet">Through {formatThroughDate(throughDate)}</span>}
        </div>

        <DataFreshness period={period} />
        {loading && <div className="data-state panel">Loading this player&rsquo;s season snapshot…</div>}
        {error && <div className="data-state panel">{error}</div>}
        {!loading && !error && !stats && (
          <div className="data-state panel">No completed-game 2026 {periodLabels[period].toLowerCase()} statistics are currently available for this player.</div>
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
                {expanded && <details className="profile-full-stats" key={`batting-${period}`}>
                  <summary>Full batting statistics</summary>
                  <StatTable caption={`${periodLabels[period]} batting — 2026 WPBL`} rows={[
                    ['G', 'Games', stats.batting.g], ['PA', 'Plate appearances', stats.batting.pa],
                    ['AB', 'At-bats', stats.batting.ab], ['R', 'Runs', stats.batting.r], ['H', 'Hits', stats.batting.h],
                    ['2B', 'Doubles', stats.batting.doubles], ['3B', 'Triples', stats.batting.triples],
                    ['HR', 'Home runs', stats.batting.hr], ['RBI', 'Runs batted in', stats.batting.rbi],
                    ['BB', 'Walks', stats.batting.bb], ['SO', 'Strikeouts', stats.batting.so], ['SB', 'Stolen bases', stats.batting.sb],
                    ['AVG', 'Batting average', formatRate(stats.batting.avg)], ['OBP', 'On-base percentage', formatRate(stats.batting.obp)],
                    ['SLG', 'Slugging percentage', formatRate(stats.batting.slg)], ['OPS', 'On-base plus slugging', formatRate(stats.batting.ops)],
                  ]} />
                </details>}
              </article>
            )}
            {stats.pitching && (
              <article className="player-stat-card panel">
                <h3>Pitching</h3>
                <div className="player-stat-metrics pitching">
                  <Metric label="G" value={stats.pitching.g} />
                  <Metric label="IP" value={stats.pitching.ip} />
                  <Metric label="ERA" value={stats.pitching.era?.toFixed(2) ?? '—'} />
                  <Metric label="WHIP" value={stats.pitching.whip?.toFixed(2) ?? '—'} />
                  <Metric label="SO" value={stats.pitching.so} />
                </div>
                {expanded && <details className="profile-full-stats" key={`pitching-${period}`}>
                  <summary>Full pitching statistics</summary>
                  <StatTable caption={`${periodLabels[period]} pitching — 2026 WPBL`} rows={[
                    ['G', 'Games', stats.pitching.g], ['IP', 'Innings pitched', stats.pitching.ip],
                    ['H', 'Hits allowed', stats.pitching.h], ['ER', 'Earned runs', stats.pitching.er],
                    ['BB', 'Walks', stats.pitching.bb], ['SO', 'Strikeouts', stats.pitching.so],
                    ['ERA', 'Earned run average', stats.pitching.era?.toFixed(2) ?? '—'],
                    ['WHIP', 'Walks plus hits per inning pitched', stats.pitching.whip?.toFixed(2) ?? '—'],
                  ]} />
                  <p className="data-source">Innings use baseball notation: .1 is one out and .2 is two outs.</p>
                </details>}
                {stats.pitching.era === null && (
                  <p className="data-source">ERA and WHIP are not calculated until a pitcher records an out.</p>
                )}
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

function StatTable({ caption, rows }: { caption: string; rows: [string, string, string | number][] }) {
  return <table className="profile-stat-table"><caption>{caption}</caption><thead><tr><th scope="col">Statistic</th><th scope="col">Value</th></tr></thead>
    <tbody>{rows.map(([label, description, value]) => <tr key={label}><th scope="row"><abbr title={description}>{label}</abbr><span>{description}</span></th><td>{value ?? '—'}</td></tr>)}</tbody>
  </table>
}
