# Zero-out pitching statistics fix — 2026-09-13

A completed-game pitcher can have zero season outs recorded. Preserve the appearance and counting statistics, use explicit null ERA/WHIP until an out is recorded, and display an em dash with an explanation. Never display a misleading 0.00 rate or rank a zero-out pitcher among qualified pitching leaders. Once outs are recorded, finite nonnegative rates remain mandatory and earlier counts remain in the totals.

The zero-out guard caused run 34762548119 to fail. The initial live verification passed with 34/34 completed box scores, 73 player records through September 12, and no overdue games. Isabella Villarreal is the zero-out season record.

Reviewed 14 GitHub runs and one earlier failed attempt: ten succeeded, two returned snapshot HTTP 403, two had network fetch errors, and one hit the zero-out guard. Kristy approved publishing the zero-out fix and monitoring the intermittent host errors on September 13. Host fetch retry changes and hosting security changes are deferred. A daily noon Eastern monitor checks for new failures and recovery without modifying production.

Deployment uses an isolated b17fc70 checkout plus only this fix and the already-published Mission source patch, which was independently verified against all 74 live Mission-release files. This preserves the live Mission while excluding unpublished editorial changes. The public release replaces only 72 HTML shells and one new JavaScript asset; live data, PHP, CSS, images, review files, and routing configuration remain outside the frontend upload. The original validated Mission frontend is retained as rollback.

Publish frontend first, then push the zero-out importer commit and dispatch a new statistics refresh from that commit. Do not rerun the old failed commit. Wait for the normal Hostinger updater to pull the new snapshot, then verify the live snapshot and player rendering.

Validation: isolated production build and 17 tests passed, including zero-out aggregation, continued totals after later outs, invalid-rate rejection, and both null and finite player-card rendering. The PHP files are unchanged; their checks will run in GitHub Actions.

Sources: GitHub Actions logs for runs 34762548119, 34696922026, 34610147499, 34140442680 and attempt 1 of 33928624697, inspected September 13, 2026.
