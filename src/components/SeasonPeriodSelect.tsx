import { periodLabels, SeasonPeriod } from '../data/wpbl'

export default function SeasonPeriodSelect({ value, onChange }: { value: SeasonPeriod; onChange: (period: SeasonPeriod) => void }) {
  return <div className="filters leader-tabs" role="group" aria-label="Statistics period">
    {(['regular', 'postseason'] as const).map(period => <button key={period} type="button"
      className={`chip ${value === period ? 'chip-on' : ''}`} aria-pressed={value === period}
      onClick={() => onChange(period)}>{periodLabels[period]}</button>)}
  </div>
}
