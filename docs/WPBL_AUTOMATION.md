# WPBL statistics automation

Updated 2026-10-16. GitHub collects and validates official statistics daily, publishes a JSON-only `wpbl-data` branch, and retains source responses, a report, and the previous published snapshot for 30 days as Actions artifacts. This repository and its league-data artifacts are public.

## Current status — 2026-10-16

- GitHub collects and publishes on its existing daily `17 10 * * *` schedule; manual dispatch remains available. Scheduled runs may start later than their configured time.
- Hostinger retains its existing `0,30 * * * *` job and CLI-only PHP updater. No cron, PHP, credentials, or hosting configuration changes are required for the retry fix.
- Regular-season/postseason data generation is published in `21ed38f`; [workflow 38921443438](https://github.com/kr15tyk/shes-on-first-site/actions/runs/38921443438) passed. The October 16 snapshot covers 30 regular-season games through September 6 and 10 postseason games through September 22, retaining combined totals for compatibility.
- The deployed frontend source is synchronized in `9c448cb`. An isolated checkout reproduced all 91 frontend release files exactly, with only the separate build timestamp changing. Default public builds no longer require parent private editorial files.
- The retry fix is published in `bc116ff`. Hostinger baseline/status reads get at most three attempts, with one- and two-second delays, for network errors or HTTP 403, 408, 429, 500, 502, 503, and 504. Each attempt has a 20-second timeout. Malformed JSON and non-retryable responses fail immediately; persistent failures retain the last valid publication. No stale-checkout fallback is introduced.
- Hostinger's normal 15:30:03 UTC pull on October 16 reported success and the deployed season-split snapshot hash. This is dated evidence, not a continuous monitoring claim.
- ZIP extraction to `public_html` with overwrite succeeded for the October 16 releases. The September 4 extraction failure below is historical, not a current blanket restriction. Keep archives outside the web root and exclude live data/PHP/review files from frontend-only packages.
- `WPBL_HOST_PULL_ENABLED=true` remains configured. Retry-release verification is recorded below.

## Initial deployment record — 2026-09-04

The following describes that deployment session, not the current release:

- Daily GitHub workflow active at 10:17 UTC, plus manual dispatch.
- Run 33927402743 passed importer tests, PHP updater tests, collection, validation, and data-branch publication.
- Hostinger deployment is live. All 77 approved files were uploaded directly into their matching folders. Archive extraction and whole-folder upload returned HTTP 403 even in a fresh single session; direct file uploads, folder creation, and matching-file replacement succeeded. No permission reset was needed; the underlying bulk-operation error remains unconfirmed.
- Hostinger cron runs at minute 0 and 30 of every hour. The temporary every-minute test job was removed. First verified pull: 2026-09-04 23:12:03 UTC, successful, changed=true.
- Live snapshot matched the GitHub data-branch bytes after that pull. All 74 public release files other than the mutable snapshot, protected PHP updater, and hidden cache rule matched the approved local bytes. The snapshot sends no-store; the PHP URL, unknown route, and public ZIP path return 404.
- Repository variable WPBL_HOST_PULL_ENABLED=true. Integration run 33928624697 passed on retry after an initial transient fetch failure. The initial cutoff was later traced to missing API pagination; see correction below.
- Prepared release: `/tmp/shes-on-first-automation-b0d2620.zip`, 77 files, SHA256 `ab8ba6890a3a436406ce70576244731343be422e76b6b1e328762a4d548ead63`.
- The ZIP remains outside `public_html`. For that session, direct uploads into matching destination folders were used after whole-folder upload and extraction failed. The archive contains only `public_html/` public HTML route shells, the new JavaScript bundle, the seeded snapshot, frozen August 29 article archive, data cache rule, and CLI-only `pull.php`. It contains no review pages, images, credentials, or raw responses.

## How it works

1. GitHub fetches every completed official box score, including old games that may have corrections.
2. The importer validates identities, counts, innings, scores, complete coverage, and missing historical finals. Invalid input stops publication.
3. The workflow publishes only `snapshot.json` to the dedicated `wpbl-data` branch using its short-lived GitHub token. No hosting credentials are used.
4. Hostinger's PHP scheduled job retrieves the fixed HTTPS URL, verifies TLS, bounds the response size, checks the schema and coverage, and rejects older snapshots or disappeared finals.
5. The host preserves `snapshot.previous.json`, writes a temporary file, and atomically renames the complete dataset to `snapshot.json`. The frontend reads this single file so page sections cannot mix releases.
6. `pull-status.json` records success/failure and a content hash. Once enabled, the daily GitHub run also detects failed host pulls or a missing check for over two hours.

An overdue non-final game marks the league source stale. Valid corrections to earlier games can still publish with the visible warning. Missing optional source counting fields represent sparse zeros; null/empty/invalid fields are rejected. Unknown game statuses require review. Zero-out aggregate pitching records preserve counting statistics and use null ERA/WHIP, displayed as an em dash until an out is recorded; they cannot enter pitching leaderboards.

The Inaugural 60 cohort, biographies, and review drafts are unchanged. The first-month article reads its fixed August 29 archive, keeping its evidence cutoff stable.

## Hostinger activation

The active PHP cron job uses:

- Command suffix: `domains/shesonfirst.com/public_html/data/wpbl/pull.php`
- Hostinger supplies `/usr/bin/php /home/u687186041/` as the command prefix.
- Active cadence: minute 0 and 30 of every hour. Verify normal scheduled pulls without adding temporary recurring jobs.

Verify `/data/wpbl/snapshot.json` matches the GitHub data-branch bytes and `/data/wpbl/pull-status.json` reports success. The updater itself must return HTTP 404 when requested through the web. Verify the new JavaScript bundle, rendered freshness notices, core routes, actual unknown-route 404, and existing review headers. Keep the ZIP outside the public web root.

Repository Actions variable `WPBL_HOST_PULL_ENABLED=true` is set and the host-monitoring workflow has passed. No FTP account, SSH key, hosting password, or API token needs to be created or shared. `scripts/publish-wpbl.mjs` is the unused earlier SFTP proposal and is not invoked by the workflow.

## Tests and recovery

- `npm run test:wpbl`: importer and Hostinger-read retry tests.
- `node --test tests/wpbl-automation.test.mjs tests/wpbl-periods.test.mjs`: the workflow's importer, retry, and season-separation checks; all 28 pass locally for this retry release.
- `php -l public/data/wpbl/pull.php` and `php tests/wpbl-pull.test.php`: host updater tests. These passed on the GitHub runner, which has PHP installed.
- `npm run build`: frontend checks and build.
- `npm run check`: public build and repository tests. Private-source review checks are excluded from the default command because their inputs live outside this repository. The October 16 frontend-sync checkout passed its 36 applicable tests before the three retry tests were added.

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


## Historical failure review and proposed fix — 2026-09-13

Reviewed all 14 available runs and the failed first attempt of run 33928624697 (15 attempts total):

| Date | Run / attempt | Result / cause |
| --- | --- | --- |
| September 13 | [34762548119](https://github.com/kr15tyk/shes-on-first-site/actions/runs/34762548119) | Zero-out aggregate pitching guard |
| September 12 | [34696922026](https://github.com/kr15tyk/shes-on-first-site/actions/runs/34696922026) | Published snapshot HTTP 403 |
| September 11 | [34610147499](https://github.com/kr15tyk/shes-on-first-site/actions/runs/34610147499) | Published snapshot HTTP 403 |
| September 7 | [34140442680](https://github.com/kr15tyk/shes-on-first-site/actions/runs/34140442680) | Host read: fetch failed; original logs lack endpoint/cause |
| September 4 | [33928624697, attempt 1](https://github.com/kr15tyk/shes-on-first-site/actions/runs/33928624697/attempts/1) | Fetch failed; second attempt succeeded |

The other ten attempts succeeded. No test-step failures were found. Node deprecation warnings were not the cause of these failures. The exact cause of the Hostinger 403 responses is not established; repeated denials require checking hosting access/security logs.

Changes prepared at that time (zero-out handling is now live; retries were published October 16):
- Zero-out season totals now use explicit null ERA/WHIP, retain counts, and cannot enter pitching leaderboards. Player cards display dashes and an explanation. Finite, nonnegative rates remain mandatory once outs are recorded.
- Host baseline and updater-status reads retry network failures and selected HTTP errors (403, 408, 429, 500, 502, 503, 504) up to three attempts, waiting one then two seconds. Persistent failures remain fatal; errors identify the endpoint, attempts and available network cause. No fallback to an old checkout is introduced. Only the existing snapshot-404 migration fallback remains.
- Regression coverage includes null serialization, later innings with earlier zero-out counts retained, invalid rates, rendered player cards, transient recovery, persistent denial and malformed JSON.

Verification at 2026-09-13 14:44 UTC: read-only live refresh with Hostinger status monitoring enabled passed; 34 completed games / 34 verified box scores, 73 player records, through September 12, no overdue source games. Isabella Villarreal is the zero-out aggregate record. No data was published. An isolated build based on b17fc70 plus only these fixes passed, along with 18 public-site/importer tests and two component render tests. PHP is unavailable locally; unchanged PHP updater tests passed in the reviewed Actions runs.

Historical deployment order for the zero-out fix (already completed): deploy and verify the new frontend bundle and matching public route HTML first; then push the importer changes and start a new refresh from the updated commit. Rerunning the old failed commit would execute the old code. Publishing nullable rates before the frontend is updated can crash the existing player card. Keep unrelated editorial changes and private-review pages outside this release. Existing PHP files and frozen article data do not need replacement.


## Retry release verification — 2026-10-16

Commit `bc116ff` passed all 28 local importer/retry/period tests. [Workflow 38929106170](https://github.com/kr15tyk/shes-on-first-site/actions/runs/38929106170) ran that commit successfully, including PHP updater/live-service tests, collection, comparison, and publication at 16:05 UTC. Comparing its preserved previous and new snapshots confirms that schedule games, combined player records, and both season-specific player datasets are unchanged; retrieval metadata advanced normally.

Hostinger's last observed scheduled pull succeeded at 16:00:05 UTC, before this verification publication. The next normal half-hourly pull can retrieve the refreshed snapshot; no claim is made here that this subsequent pull has been observed. No Hostinger upload or schedule change was needed: the retry helper runs in GitHub Actions. Review pages, alternate About copy, and artwork were left untouched.
