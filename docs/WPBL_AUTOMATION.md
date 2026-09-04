# WPBL statistics automation

Updated 2026-09-04. GitHub collects and validates official statistics daily, publishes a JSON-only `wpbl-data` branch, and retains source responses, a report, and the previous published snapshot for 30 days as Actions artifacts. This repository and its league-data artifacts are public.

## Current status

- Daily GitHub workflow active at 10:17 UTC, plus manual dispatch.
- Run 33927402743 passed importer tests, PHP updater tests, collection, validation, and data-branch publication.
- Hostinger deployment is live. All 77 approved files were uploaded directly into their matching folders. Archive extraction and whole-folder upload returned HTTP 403 even in a fresh single session; direct file uploads, folder creation, and matching-file replacement succeeded. No permission reset was needed; the underlying bulk-operation error remains unconfirmed.
- Hostinger cron runs at minute 0 and 30 of every hour. The temporary every-minute test job was removed. First verified pull: 2026-09-04 23:12:03 UTC, successful, changed=true.
- Live snapshot matched the GitHub data-branch bytes after that pull. All 74 public release files other than the mutable snapshot, protected PHP updater, and hidden cache rule matched the approved local bytes. The snapshot sends no-store; the PHP URL, unknown route, and public ZIP path return 404.
- Repository variable WPBL_HOST_PULL_ENABLED=true. Integration run 33928624697 passed on retry after an initial transient fetch failure. The initial cutoff was later traced to missing API pagination; see correction below.
- Prepared release: `/tmp/shes-on-first-automation-b0d2620.zip`, 77 files, SHA256 `ab8ba6890a3a436406ce70576244731343be422e76b6b1e328762a4d548ead63`.
- The ZIP remains outside `public_html`. For future deployments, upload files directly into each matching destination folder; whole-folder upload and extraction failed in this session. The archive contains only `public_html/` public HTML route shells, the new JavaScript bundle, the seeded snapshot, frozen August 29 article archive, data cache rule, and CLI-only `pull.php`. It contains no review pages, images, credentials, or raw responses.

## How it works

1. GitHub fetches every completed official box score, including old games that may have corrections.
2. The importer validates identities, counts, innings, scores, complete coverage, and missing historical finals. Invalid input stops publication.
3. The workflow publishes only `snapshot.json` to the dedicated `wpbl-data` branch using its short-lived GitHub token. No hosting credentials are used.
4. Hostinger's PHP scheduled job retrieves the fixed HTTPS URL, verifies TLS, bounds the response size, checks the schema and coverage, and rejects older snapshots or disappeared finals.
5. The host preserves `snapshot.previous.json`, writes a temporary file, and atomically renames the complete dataset to `snapshot.json`. The frontend reads this single file so page sections cannot mix releases.
6. `pull-status.json` records success/failure and a content hash. Once enabled, the daily GitHub run also detects failed host pulls or a missing check for over two hours.

An overdue non-final game marks the league source stale. Valid corrections to earlier games can still publish with the visible warning. Missing optional source counting fields represent sparse zeros; null/empty/invalid fields are rejected. Unknown game statuses and zero-out aggregate pitching statistics require review rather than invented values.

The Inaugural 60 cohort, biographies, and review drafts are unchanged. The first-month article reads its fixed August 29 archive, keeping its evidence cutoff stable.

## Hostinger activation

The active PHP cron job uses:

- Command suffix: `domains/shesonfirst.com/public_html/data/wpbl/pull.php`
- Hostinger supplies `/usr/bin/php /home/u687186041/` as the command prefix.
- Target cadence: every 30 minutes. Use every minute only temporarily for the initial observed run, then change to every 30 minutes.

Verify `/data/wpbl/snapshot.json` matches the GitHub data-branch bytes and `/data/wpbl/pull-status.json` reports success. The updater itself must return HTTP 404 when requested through the web. Verify the new JavaScript bundle, rendered freshness notices, core routes, actual unknown-route 404, and existing review headers. Keep the ZIP outside the public web root.

Repository Actions variable `WPBL_HOST_PULL_ENABLED=true` is set and the host-monitoring workflow has passed. No FTP account, SSH key, hosting password, or API token needs to be created or shared. `scripts/publish-wpbl.mjs` is the unused earlier SFTP proposal and is not invoked by the workflow.

## Tests and recovery

- `npm run test:wpbl`: importer tests.
- `php -l public/data/wpbl/pull.php` and `php tests/wpbl-pull.test.php`: host updater tests. These passed on the GitHub runner, which has PHP installed.
- `npm run build`: frontend checks and build.
- The isolated release passed all ten public-site/importer tests. The existing review test depends on a template outside the site repository; it is not part of this release.

A failed download or validation leaves the last valid live snapshot in place. Host status is checked daily by GitHub after activation; notification delivery follows the owner's GitHub Actions notification settings, which have not been changed. Restore `snapshot.previous.json` through Hostinger if rollback is needed.

Disable the Hostinger cron job to stop pulls; disable the GitHub workflow to stop collection. GitHub may delay scheduled jobs or disable schedules in inactive public repositories. This is periodic statistics updating, not real-time scoring.

## Remaining source constraints

The importer retains the existing explicit 60-minute time correction and 90-minute duplicate-listing heuristic. They still need authoritative revalidation before general-purpose live-score use. Source access/storage/redistribution terms remain an open project question; public access does not itself establish reuse rights.

Sources checked 2026-09-04:
- https://stats.womensprobaseballleague.com/v1/games
- https://shesonfirst.com/data/wpbl/manifest.json
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

## Pagination and ERA correction — 2026-09-04

The official statistics page displayed newer results than this site. Investigation confirmed `/v1/games` defaults to 50 records; 59 were available. The importer now follows `limit=50&offset=...` until an empty page and rejects duplicate pages, malformed counts, failed later pages, and excessive totals. It recognizes the observed detailed live inning statuses while excluding unfinished games from season totals.

The corrected collection contains 59 source records, 30 deduplicated schedule entries, 27 verified completed box scores, and 69 feed players. This does not change the historical Inaugural 60. Latest completed-game coverage is September 3, with September 4 in progress at verification. The official page labels its display September 4. Our cutoff is the date of the latest completed game, separate from retrieval time.

Comparison also found an existing nine-inning ERA calculation; corrected to the official seven-inning scale. Across unambiguous name matches, all 16 compared batting values for 64 players and all seven compared pitching values for 36 players match the official table within floating-point tolerance. Multi-team/name-ambiguous rows were excluded from this comparison. Ten automated tests pass, including pagination truncation/repetition, failed later pages, live statuses, and ERA scale. The frozen August 29 article data is preserved. Workflow run 33929090312 passed; Hostinger pulled the corrected snapshot at 2026-09-04 23:22:02 UTC, and live bytes matched the published branch. The temporary verification cron was removed, retaining the regular twice-hourly job.

Sources checked 2026-09-04:
- https://www.womensprobaseballleague.com/stats/
- https://stats.womensprobaseballleague.com/v1/games?limit=500
- https://stats.womensprobaseballleague.com/v1/games?limit=2&offset=2
