import { periodLabels, SeasonPeriod } from '../data/wpbl'

export default function SeasonPeriodSelect({ value, onChange, prominent = false }: { prominent?: boolean; value: SeasonPeriod; onChange: (period: SeasonPeriod) => void }) {
  return <div className={prominent ? "profile-period-control" : undefined}>
    {prominent && <><h2>2026 WPBL statistics</h2><p>Choose a period. Regular-season and postseason totals are shown separately.</p></>}
    <div className="filters leader-tabs" role="group" aria-label="Statistics period">
    {(['regular', 'postseason'] as const).map(period => <button key={period} type="button"
      className={`chip ${value === period ? 'chip-on' : ''}`} aria-pressed={value === period}
      onClick={() => onChange(period)}>{periodLabels[period]}</button>)}
  </div></div>
}
