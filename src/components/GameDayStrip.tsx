import { useEffect, useState } from 'react'
import './game-day-strip.css'

type StripGame = { id: string; start: string; home: string; away: string; phase: 'pregame' | 'live' | 'final' | 'notice'; label: string; homeScore: number | null; awayScore: number | null; sourceUpdatedAt: string | null; delayed: boolean }
type StripData = { date: string; checkedAt: string | null; available: boolean; games: StripGame[] }
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const time = (value: string) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(value))
export default function GameDayStrip() {
  const [data, setData] = useState<StripData | null>(null)
  const [failed, setFailed] = useState(false)
  const [clock, setClock] = useState(Date.now())
  useEffect(() => {
    let disposed = false
    let timer: ReturnType<typeof setTimeout>
    let controller: AbortController | null = null
    async function refresh() {
      if (disposed) return
      if (document.hidden) { timer = setTimeout(refresh, 15000); return }
      controller = new AbortController()
      const timeout = setTimeout(() => controller?.abort(), 25000)
      try {
        const response = await fetch('/data/wpbl/live.php', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error('Unavailable')
        const next: StripData = await response.json()
        if (!next.available || !Array.isArray(next.games) || next.date !== today() || next.games.length > 8 || !next.checkedAt || !Number.isFinite(Date.parse(next.checkedAt))) throw new Error('Unavailable')
        if (next.games.some(g => !['NY','LA','SF','BOS'].includes(g.home) || !['NY','LA','SF','BOS'].includes(g.away) || !Number.isFinite(Date.parse(g.start)) || !['pregame','live','final','notice'].includes(g.phase) || typeof g.label !== 'string' || g.label.length > 80 || ([g.homeScore,g.awayScore].some(s => s !== null && (!Number.isInteger(s) || s < 0 || s > 999))))) throw new Error('Invalid game')
        if (!disposed) { setData(next); setFailed(false); setClock(Date.now()) }
      } catch { if (!disposed) { setFailed(true); setClock(Date.now()) } }
      finally { clearTimeout(timeout); if (!disposed) timer = setTimeout(refresh, 15000) }
    }
    refresh()
    return () => { disposed = true; clearTimeout(timer); controller?.abort() }
  }, [])
  const current = data?.date === today() ? data : null
  if (!current) return failed ? <aside className="game-day-strip" aria-label="WPBL game updates"><div className="container game-day-inner"><span className="game-day-kicker">WPBL</span><span className="game-day-note">Game updates unavailable</span><a href="https://www.womensprobaseballleague.com/schedule/">Official schedule ↗</a></div></aside> : null
  if (!current.games.length) return null
  const stale = failed || !current.checkedAt || clock - Date.parse(current.checkedAt) > 6 * 60_000
  return <aside className="game-day-strip" aria-label="Today's WPBL games">
    <div className="container game-day-inner">
      <span className="game-day-kicker">WPBL today</span>
      <div className="game-day-games">{current.games.map(game => {
        const scored = game.phase === 'live' || game.phase === 'final'
        const delayed = stale || game.delayed
        return <div className="game-day-game" key={game.id}>
          <span className="game-day-matchup">{game.away}{scored && <> <b>{game.awayScore}</b></>} <span className="game-day-divider">{scored ? '—' : 'at'}</span> {game.home}{scored && <> <b>{game.homeScore}</b></>}</span>
          <span className="game-day-phase">{game.phase === 'pregame' && game.label === 'Scheduled' ? time(game.start) : game.label}</span>
          {delayed && <span className="game-day-note">Updates delayed</span>}
        </div>
      })}</div>
      <a className="game-day-details" href="https://www.womensprobaseballleague.com/schedule/">Game details <span aria-hidden="true">↗</span></a>
      <span className="game-day-check" title="Refreshes every 15 seconds while this page is visible. Source delays may occur.">{current.checkedAt ? `Checked ${time(current.checkedAt)}` : 'Source delays may occur'}</span>
    </div>
  </aside>
}
