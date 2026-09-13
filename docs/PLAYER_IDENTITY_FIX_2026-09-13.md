# Player identity aggregation correction — 2026-09-13

## Confirmed defect

The importer keyed per-game totals by source player ID, then assembled player records in a map keyed by name-derived slug. The September 13 feed contained 126 active source IDs for 69 resolved players. Multiple IDs with the same slug silently overwrote earlier segments. Spelling variations also produced duplicate player records. The 34/34 box-score coverage checks did not detect this loss.

Ashton's regular source ID 4sf1dspa52dw7oew contributes 15 games/60 PA; kjbamn7yjnc3zwa6 contributes another 2 games/9 PA. Both explicitly use https://www.womensprobaseballleague.com/players/ashton-lansdell/. Correct combined totals across the existing completed-game scope: 17 G, 69 PA, 5 HR, 17 RBI, 9 SB. Denae: 17 G, 75 PA, 12 HR, 40 RBI, 15 SB.

Isabella also had split records. Correct combined pitching is 3 G, 4.0 IP, 7.00 ERA, 3.00 WHIP, rather than the zero-out segment alone. The zero-out handling remains valid for any genuinely zero-out aggregate.

## Prepared correction

- Resolve IDs using exact official profile URLs before summing. Retain canonical ID and all source IDs; use official URL slug to handle source name variations.
- Explicit, name-checked aliases for six players lacking consistent URLs: Diana Ibarra, Claire O'Sullivan, Paloma Benach, Suzu Narasaki, Olivia Bricker, Emi Saiki. Evidence is preserved source boxscores, exact names, and team/uniform continuity. Diana and Suzu have cross-team segments; these are explicitly reviewed mappings, not general name-only matching. Alias details are in scripts/wpbl-player-identity.mjs.
- Stop on conflicting profile URLs, unreviewed slug collisions, duplicate canonical appearances in a game, duplicated leaderboard players, or loss of a previously published source ID.
- Preserve the existing all-completed-games aggregation scope. This correction does not introduce separate regular-season/postseason views, alter the Inaugural 60, or change any frontend/editorial files.

## Validation and status

Sixteen importer tests pass. A read-only live collection generated 34 completed games, 69 resolved players, through September 12. An independent count audit checked every resolved player's appearances and batting/pitching counts against raw boxscores: 1,056 comparisons passed, all 126 active source IDs represented with none omitted. Official profile URLs resolve spelling variations for Maggie Fox/Foxx, Isabella Villareal/Villarreal, Alexi/Alexia Jorge, accented names, and Gabrielle/Gabriella Haas.

Evidence: preserved successful run 34765102788 source-responses.json and a fresh read-only collection under the isolated checkout's artifacts/wpbl. The candidate snapshot and audit are saved under the workspace artifacts/player-identity-fix-20260913 directory.

Prepared locally only; not pushed or published. The September 13 15:30 Hostinger sync correctly transferred the previous release, but its player aggregates have this defect. HTTP/workflow success does not establish correct player totals. The prior statement that live statistics were verified was too broad.

Publishing this data-only correction requires approval. Do not upload any app assets: a separate task has since published newer profile/frontend work. The profile task is adding a prior-good-totals display guard.

Publication validation found the September 12 boxscore izvbxd4w6mcr0bew labels kfli26dz84mtz2rh as Catherine O'Sullivan, while September 11 j4uofrn55sr4wnlt uses Claire for the same ID and uniform 18. Thirteen earlier appearances use Claire and uniform 18. Accept this exact source-ID/name variation and retain the reviewed Claire name; other names still fail. Added a regression test.

The same live collection contains Emi Saiki / Emi Saki on source ID n0gb2fusndobpf7p, uniform 23; accept only this exact spelling variation and retain Emi Saiki. All other reviewed source-ID names were checked. Eighteen tests pass.
