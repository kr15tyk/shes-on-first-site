# Player display-name corrections — 2026-09-13

Status: implemented and validated locally; not published. This follow-up includes a frontend roster/metadata/statistics lookup correction as well as the data importer.

| Canonical display | Feed variation | Official source checked 2026-09-13 |
|---|---|---|
| Alexia Jorge | Alexi Jorge | [Official player page](https://www.womensprobaseballleague.com/players/alexia-jorge/) |
| Ela Day-Bédard | Ela Day-Bedard | [Official player page](https://www.womensprobaseballleague.com/players/ela-day-bedard/) |
| Gabrielle Haas | Gabriella Haas | [Official player page](https://www.womensprobaseballleague.com/players/gabrielle-haas/) |
| Isabella Villarreal | Isabella Villareal | [Official player page](https://www.womensprobaseballleague.com/players/isabella-villarreal/) |
| Maggie Foxx | Maggie Fox | [Official player page](https://www.womensprobaseballleague.com/players/maggie-foxx/) |
| Maïka Dumais | Maika Dumais | [Official player page](https://www.womensprobaseballleague.com/players/maika-dumais/) |
| Claire O’Sullivan | Catherine O’Sullivan | [Official player page](https://www.womensprobaseballleague.com/players/claire-osullivan/) |
| Emi Saiki | Emi Saki | [Official player page](https://www.womensprobaseballleague.com/players/emi-saiki/) |

Claire and Emi were already normalized by the previous release; six more name rules now make hitting, pitching, player records and leaderboards consistent. Claire retains the site’s straight apostrophe style. Unicode accents are NFC-normalized. Rules attach to verified profile identities, never name-only merges; unexpected names stop collection for review. Original names remain in preserved raw source responses.

Gabrielle’s frontend display uses the official page spelling while preserving the existing /inaugural-60/gabriella-haas URL, roster number 15 and cohort membership. An explicit statistics slug connects that page to gabrielle-haas. Static metadata uses the same correction record as the app. The earlier roster spelling remains the stable route input, not the display name.

Validation: 19 importer tests passed. Fresh read-only collection: 34/34 completed boxscores, 69 players, 126 source IDs. Independent audit: 1,056 count comparisons passed. Compared with the last published snapshot, every statistical value, identity, source ID, slug and leaderboard rank is unchanged. All nested player names now agree. Frontend TypeScript/build and 25 existing tests passed; the added route/name/statistics mapping test also passed (26 frontend tests total).

Importer working copy: /private/tmp/sof-zero-outs-release-20260913, based on published f5e37bb. Frontend changes are in the shared site checkout alongside already-existing profile work; do not overwrite them from the older isolated frontend. Publish only after reviewing the current frontend release scope. The candidate data must go through the normal GitHub publication path, not a stale dist/data upload.
