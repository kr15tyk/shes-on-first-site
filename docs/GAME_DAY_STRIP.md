# Homepage game-day strip

Implemented September 5, 2026. A muted, non-sticky strip sits below navigation on the homepage only and disappears when the official calendar has no games that day (America/New_York). Player profiles are unchanged.

The browser checks `/data/wpbl/live.php` every 15 seconds while visible, with no overlapping requests. Hostinger shares a filesystem cache across visitors and uses a lock to prevent duplicate upstream refreshes. No cron, hosting credentials or awake personal computer are required. Cache files live in a private server temporary directory; only normalized public scoreboard data is returned.

The official WordPress calendar controls matchups and start times, avoiding the older collector's fixed time shift. Calendar data is cached for five minutes. Starting 15 minutes before the scheduled game, the service discovers the correct single-game ID from paginated stats listings (one-minute shared cache) and refreshes that game's data at most once per 15 seconds. Completed games and pregame periods use a five-minute cache. Sources and IDs are fixed or validated; caller parameters never select URLs or file paths. TLS verification, redirect refusal, time/size bounds and error backoff apply.

The September 4 observation informs the safeguards: an early “Top of 1st” placeholder is not enough to claim live play; structured innings/outs are not invented; the status text supplies inning/half when meaningful evidence of play exists. Conflicting scores retain the last coherent result with a delay label; decreasing scores require two consistent observations, allowing official corrections. A final state cannot regress to pregame/live. “Checked” is retrieval time, not a guarantee of play-to-display latency.

The official calendar is refreshed on demand, not through per-visitor direct league requests. Source errors retry no more frequently than once per minute. No documented long-term provider rate allowance or live-data SLA has been established. The pilot cadence can be adjusted centrally in the endpoint.

Validate with `npm run build`, the public-site/importer Node tests, and `php tests/wpbl-live.test.php`. The manually dispatched Game-day strip validation workflow runs PHP and a real source integration check. Hostinger supports PHP; the local build preview uses a clearly identified recorded JSON response instead of executing PHP.

Deploy the new PHP endpoint before activating the new frontend bundles. Keep existing season data, root server rules, images and private reviews intact. Roll back the homepage/route HTML to the prior bundle references if needed; the endpoint is independent of the daily statistics updater.

Sources checked September 5, 2026:
- https://www.womensprobaseballleague.com/wp-json/wpbl/v1/calendar-events
- https://stats.womensprobaseballleague.com/v1/games?limit=50&offset=0
- Local experiment: ../research/live-feed/2026-09-04/report.md
