# WPBL statistics automation

Created 2026-09-04. The scheduled workflow collects public official data, validates it, and retains a report, source responses, and the previous published snapshot for 30 days as GitHub Actions artifacts. Artifacts contain public league data only. The repository is public.

## Operation

- Workflow: `WPBL statistics refresh`, daily at 10:17 UTC (06:17 Eastern during daylight saving; 05:17 in winter), plus manual dispatch.
- No npm installation, third-party scraping service, AI extraction, or database is needed by the scheduled job. It uses Node 22 and pinned official GitHub Actions.
- The collector retrieves every completed box score again to include scoring corrections. It validates identities, required counting fields, innings, coverage, team identity, and player runs against final scores. Missing optional counting fields represent sparse source zeros; null/empty/invalid fields are rejected.
- Unknown game states, disappeared finals, incomplete box scores, malformed records, and zero-out aggregate pitching statistics stop publication. The last valid published data is the comparison baseline.
- An overdue non-final game marks the source stale. This is a warning, not a fabricated final or a reason to discard valid corrections to older games.
- The historical 60-player cohort and review drafts are untouched. The first-month analysis reads its frozen August 29 archive. Its historical cutoff no longer advances with the current-season dataset.
- Initial collection does not publish. `WPBL_PUBLISH_ENABLED=true` enables publication only after the connection and frontend migration below have been completed.

## One-time Hostinger connection

1. Deploy the frontend that reads `/data/wpbl/snapshot.json`, the seeded snapshot, the frozen archive, and the data-directory cache rule. Preserve existing unlisted review pages and unrelated assets.
2. Confirm Hostinger supports key-based SFTP and atomic OpenSSH rename. Use a dedicated account restricted to this site's data directory if the hosting plan supports it. Do not assume an SSH key alone restricts the account's access. Review the actual scope before installing any key.
3. Configure repository Actions secrets: `HOSTINGER_HOST`, `HOSTINGER_PORT`, `HOSTINGER_USER`, `HOSTINGER_DATA_DIR`, `HOSTINGER_SSH_KEY`, and `HOSTINGER_KNOWN_HOSTS`. Verify host-key fingerprints through a trusted channel; never automatically trust an unverified `ssh-keyscan` result. The directory must be the absolute path ending in `/public_html/data/wpbl`.
4. Enable the repository variable `WPBL_PUBLISH_ENABLED` with value `true`, dispatch one run, and verify the live JSON and rendered stats. Configure GitHub Actions failure notifications in the owner's account if not already enabled; the workflow itself sends no email or messages.

Deployment exposes credentials only to the publication step. The publisher writes a backup of the current JSON, uploads the complete new JSON under a temporary filename, and atomically renames it to `snapshot.json`. It verifies the public file hash and attempts to restore the previous snapshot if verification fails. If SSH connectivity is lost, rollback may also fail; retain artifacts for recovery. Backups are retained on the host and require occasional storage review; they are not automatically deleted.

The scheduler is not a real-time score service. GitHub may delay scheduled jobs and can disable schedules in inactive public repositories. Periodically verify the Actions schedule remains active.

## Known inherited normalization rules

The initial importer retains the existing 60-minute time correction and 90-minute duplicate-listing heuristic. They are explicit in every manifest and need authoritative revalidation before changing them or claiming general-purpose live-score coverage. The workflow fails on unknown status labels instead of labeling postponements as live. League source access/storage/redistribution terms remain an open project question; public availability is not a license statement.

## Local checks and recovery

Run `npm run test:wpbl` for importer checks and `npm run data:refresh` for a full source run. Results are in ignored `artifacts/wpbl/`. Run `npm run build` and `npm test` before frontend deployment.

Disable `WPBL_PUBLISH_ENABLED` to stop uploads while continuing collection. Disable the workflow to stop collection too. Recover from a host backup or the Actions artifact's `previous.json` using the same verified SFTP connection. Do not upload raw source responses, credentials, or the artifact ZIP to the web root.

Sources checked 2026-09-04:
- https://stats.womensprobaseballleague.com/v1/games
- https://shesonfirst.com/data/wpbl/manifest.json
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
