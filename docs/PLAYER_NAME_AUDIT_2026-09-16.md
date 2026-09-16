# Complete WPBL player-name audit — 2026-09-16

Checked 71 distinct players against current official WPBL profile headings: all 60 site roster entries and all 69 statistics records (58 overlap). Normalize Unicode to NFC; preserve published route slugs and original feed names as source evidence. Official profile headings control display spelling, rather than inconsistent boxscore labels.

## Confirmed corrections

- statistics: Andreanne Leblanc → Andréanne Leblanc. [WPBL](https://www.womensprobaseballleague.com/players/andreanne-leblanc/).
- statistics: Samaria Benitez → Samaria Benítez. [WPBL](https://www.womensprobaseballleague.com/players/samaria-benitez/).
- statistics: Tháima Maximiliana → Thaima Maximiliana. [WPBL](https://www.womensprobaseballleague.com/players/thaima-maximiliana/).
- roster: Maria Jose Valenzuela → Maria José Valenzuela. [WPBL](https://www.womensprobaseballleague.com/players/maria-jose-gutierrez-valenzuela/).
- roster: Valerie Perez → Val Perez. [WPBL](https://www.womensprobaseballleague.com/players/valerie-perez/).

Additional routing corrections connect Gigi Schiano, Mo'ne Davis, Jacqui Reynolds and Claire O'Sullivan to their existing canonical statistics slugs; their names and public URLs remain unchanged. Gabrielle’s earlier routing fix remains. Maria José Valenzuela and Leah Cornish have no completed-boxscore record in this snapshot; retain the unavailable state.

Suzu Naraski is an observed source-name variant for source ID 7kzyrbse7dsdz9eq, uniform 16, New York Heights. The canonical WPBL profile heading is Suzu Narasaki. The complete reviewed importer registry accepts observed aliases on verified identities, rejects unreviewed names and conflicting URLs, and does not introduce name-only merging.

## Validation

20 importer tests pass, including all 69 reviewed name entries and rejection of unexpected variants. Fresh read-only collection succeeds through September 14; 1,056 independent boxscore count comparisons pass, covering all 126 source IDs. Frontend build and 26 existing tests pass, plus an added routing/name regression test (27 total). Five narrative profiles retain their already-correct official names.

## Full comparison

| Scope | Site name before | Verified name | Source |
|---|---|---|---|
| statistics | Addisyn Baird | Addisyn Baird | [WPBL](https://www.womensprobaseballleague.com/players/addisyn-baird/) |
| statistics | Adelaide Frank | Adelaide Frank | [WPBL](https://www.womensprobaseballleague.com/players/adelaide-frank/) |
| statistics | Alexia Jorge | Alexia Jorge | [WPBL](https://www.womensprobaseballleague.com/players/alexia-jorge/) |
| statistics | Alli Schroder | Alli Schroder | [WPBL](https://www.womensprobaseballleague.com/players/alli-schroder/) |
| statistics | Alyssa Zettlemoyer | Alyssa Zettlemoyer | [WPBL](https://www.womensprobaseballleague.com/players/alyssa-zettlemoyer/) |
| statistics | Amanda Gianelloni | Amanda Gianelloni | [WPBL](https://www.womensprobaseballleague.com/players/amanda-gianelloni/) |
| statistics | Amira Hondras | Amira Hondras | [WPBL](https://www.womensprobaseballleague.com/players/amira-hondras/) |
| statistics | Andreanne Leblanc | Andréanne Leblanc | [WPBL](https://www.womensprobaseballleague.com/players/andreanne-leblanc/) |
| statistics | Ashton Lansdell | Ashton Lansdell | [WPBL](https://www.womensprobaseballleague.com/players/ashton-lansdell/) |
| statistics | Ayaka Yamamoto | Ayaka Yamamoto | [WPBL](https://www.womensprobaseballleague.com/players/ayaka-yamamoto/) |
| statistics | Ayami Sato | Ayami Sato | [WPBL](https://www.womensprobaseballleague.com/players/ayami-sato/) |
| statistics | Ayuri Shimano | Ayuri Shimano | [WPBL](https://www.womensprobaseballleague.com/players/ayuri-shimano/) |
| statistics | Beth Greenwood | Beth Greenwood | [WPBL](https://www.womensprobaseballleague.com/players/beth-greenwood/) |
| statistics | Brittany Apgar | Brittany Apgar | [WPBL](https://www.womensprobaseballleague.com/players/brittany-apgar/) |
| statistics | Caitlin Eynon | Caitlin Eynon | [WPBL](https://www.womensprobaseballleague.com/players/caitlin-eynon/) |
| statistics | Claire Eccles | Claire Eccles | [WPBL](https://www.womensprobaseballleague.com/players/claire-eccles/) |
| statistics | Claire O'Sullivan | Claire O'Sullivan | [WPBL](https://www.womensprobaseballleague.com/players/claire-osullivan/) |
| statistics | Denae Benites | Denae Benites | [WPBL](https://www.womensprobaseballleague.com/players/denae-benites/) |
| statistics | Denver Bryant | Denver Bryant | [WPBL](https://www.womensprobaseballleague.com/players/denver-bryant/) |
| statistics | Diana Ibarra | Diana Ibarra | [WPBL](https://www.womensprobaseballleague.com/players/diana-ibarra/) |
| statistics | Edith De Leija | Edith De Leija | [WPBL](https://www.womensprobaseballleague.com/players/edith-de-leija/) |
| statistics | Ela Day-Bédard | Ela Day-Bédard | [WPBL](https://www.womensprobaseballleague.com/players/ela-day-bedard/) |
| statistics | Elodie Ciamarro | Elodie Ciamarro | [WPBL](https://www.womensprobaseballleague.com/players/elodie-ciamarro/) |
| statistics | Emi Saiki | Emi Saiki | [WPBL](https://www.womensprobaseballleague.com/players/emi-saiki/) |
| statistics | Gabrielle Haas | Gabrielle Haas | [WPBL](https://www.womensprobaseballleague.com/players/gabrielle-haas/) |
| statistics | Gigi Schiano | Gigi Schiano | [WPBL](https://www.womensprobaseballleague.com/players/gisella-schiano/) |
| statistics | Hinano Beppu | Hinano Beppu | [WPBL](https://www.womensprobaseballleague.com/players/hinano-beppu/) |
| statistics | Hyeonah Kim | Hyeonah Kim | [WPBL](https://www.womensprobaseballleague.com/players/hyeonah-kim/) |
| statistics | Isabella Villarreal | Isabella Villarreal | [WPBL](https://www.womensprobaseballleague.com/players/isabella-villarreal/) |
| statistics | Jacqui Reynolds | Jacqui Reynolds | [WPBL](https://www.womensprobaseballleague.com/players/jacqueline-reynolds/) |
| statistics | Jaida Lee | Jaida Lee | [WPBL](https://www.womensprobaseballleague.com/players/jaida-lee/) |
| statistics | Jamie Mackay | Jamie Mackay | [WPBL](https://www.womensprobaseballleague.com/players/jamie-mackay/) |
| statistics | Jill Albayati | Jill Albayati | [WPBL](https://www.womensprobaseballleague.com/players/jill-albayati/) |
| statistics | Joely Leguizamon | Joely Leguizamon | [WPBL](https://www.womensprobaseballleague.com/players/joely-leguizamon/) |
| statistics | Jordan Eyster | Jordan Eyster | [WPBL](https://www.womensprobaseballleague.com/players/jordan-eyster/) |
| statistics | Jua Park | Jua Park | [WPBL](https://www.womensprobaseballleague.com/players/jua-park/) |
| statistics | Kate Blunt | Kate Blunt | [WPBL](https://www.womensprobaseballleague.com/players/kate-blunt/) |
| statistics | Katherine Murphy | Katherine Murphy | [WPBL](https://www.womensprobaseballleague.com/players/katherine-murphy/) |
| statistics | Keira Izumi | Keira Izumi | [WPBL](https://www.womensprobaseballleague.com/players/keira-izumi/) |
| statistics | Kelsie Whitmore | Kelsie Whitmore | [WPBL](https://www.womensprobaseballleague.com/players/kelsie-whitmore/) |
| statistics | Kylee Lahners | Kylee Lahners | [WPBL](https://www.womensprobaseballleague.com/players/kylee-lahners/) |
| statistics | Lexi Hastings | Lexi Hastings | [WPBL](https://www.womensprobaseballleague.com/players/lexi-hastings/) |
| statistics | Liz Gilder | Liz Gilder | [WPBL](https://www.womensprobaseballleague.com/players/liz-gilder/) |
| statistics | London Studer | London Studer | [WPBL](https://www.womensprobaseballleague.com/players/london-studer/) |
| statistics | Madison Willan | Madison Willan | [WPBL](https://www.womensprobaseballleague.com/players/madison-willan/) |
| statistics | Maggie Foxx | Maggie Foxx | [WPBL](https://www.womensprobaseballleague.com/players/maggie-foxx/) |
| statistics | Maïka Dumais | Maïka Dumais | [WPBL](https://www.womensprobaseballleague.com/players/maika-dumais/) |
| statistics | Meggie Meidlinger | Meggie Meidlinger | [WPBL](https://www.womensprobaseballleague.com/players/meggie-meidlinger/) |
| statistics | Michelle Roche | Michelle Roche | [WPBL](https://www.womensprobaseballleague.com/players/michelle-roche/) |
| statistics | Mo'ne Davis | Mo'ne Davis | [WPBL](https://www.womensprobaseballleague.com/players/mone-davis/) |
| statistics | Molly Paddison | Molly Paddison | [WPBL](https://www.womensprobaseballleague.com/players/molly-paddison/) |
| statistics | Natsuki Yonetani | Natsuki Yonetani | [WPBL](https://www.womensprobaseballleague.com/players/natsuki-yonetani/) |
| statistics | Niki Eckert | Niki Eckert | [WPBL](https://www.womensprobaseballleague.com/players/niki-eckert/) |
| statistics | Olivia Bricker | Olivia Bricker | [WPBL](https://www.womensprobaseballleague.com/players/olivia-bricker/) |
| statistics | Paloma Benach | Paloma Benach | [WPBL](https://www.womensprobaseballleague.com/players/paloma-benach/) |
| statistics | Peyton Coria | Peyton Coria | [WPBL](https://www.womensprobaseballleague.com/players/peyton-coria/) |
| statistics | Raine Padgham | Raine Padgham | [WPBL](https://www.womensprobaseballleague.com/players/raine-padgham/) |
| statistics | Rakyung Kim | Rakyung Kim | [WPBL](https://www.womensprobaseballleague.com/players/rakyung-kim/) |
| statistics | Rosi del Castillo | Rosi del Castillo | [WPBL](https://www.womensprobaseballleague.com/players/rosi-del-castillo/) |
| statistics | Sabrina Robinson | Sabrina Robinson | [WPBL](https://www.womensprobaseballleague.com/players/sabrina-robinson/) |
| statistics | Samantha Gutierrez | Samantha Gutierrez | [WPBL](https://www.womensprobaseballleague.com/players/samantha-gutierrez/) |
| statistics | Samaria Benitez | Samaria Benítez | [WPBL](https://www.womensprobaseballleague.com/players/samaria-benitez/) |
| statistics | Sarah Edwards | Sarah Edwards | [WPBL](https://www.womensprobaseballleague.com/players/sarah-edwards/) |
| statistics | Skylar Kaplan | Skylar Kaplan | [WPBL](https://www.womensprobaseballleague.com/players/skylar-kaplan/) |
| statistics | Suzu Narasaki | Suzu Narasaki | [WPBL](https://www.womensprobaseballleague.com/players/suzu-narasaki/) |
| statistics | Suzuka Yamamoto | Suzuka Yamamoto | [WPBL](https://www.womensprobaseballleague.com/players/suzuka-yamamoto/) |
| statistics | Tháima Maximiliana | Thaima Maximiliana | [WPBL](https://www.womensprobaseballleague.com/players/thaima-maximiliana/) |
| statistics | Ticara Geldenhuis | Ticara Geldenhuis | [WPBL](https://www.womensprobaseballleague.com/players/ticara-geldenhuis/) |
| statistics | Val Perez | Val Perez | [WPBL](https://www.womensprobaseballleague.com/players/valerie-perez/) |
| roster | Hyeonah Kim | Hyeonah Kim | [WPBL](https://www.womensprobaseballleague.com/players/hyeonah-kim/) |
| roster | Alli Schroder | Alli Schroder | [WPBL](https://www.womensprobaseballleague.com/players/alli-schroder/) |
| roster | Raine Padgham | Raine Padgham | [WPBL](https://www.womensprobaseballleague.com/players/raine-padgham/) |
| roster | Lexi Hastings | Lexi Hastings | [WPBL](https://www.womensprobaseballleague.com/players/lexi-hastings/) |
| roster | Kate Blunt | Kate Blunt | [WPBL](https://www.womensprobaseballleague.com/players/kate-blunt/) |
| roster | Denver Bryant | Denver Bryant | [WPBL](https://www.womensprobaseballleague.com/players/denver-bryant/) |
| roster | Ticara Geldenhuis | Ticara Geldenhuis | [WPBL](https://www.womensprobaseballleague.com/players/ticara-geldenhuis/) |
| roster | Suzuka Yamamoto | Suzuka Yamamoto | [WPBL](https://www.womensprobaseballleague.com/players/suzuka-yamamoto/) |
| roster | Maïka Dumais | Maïka Dumais | [WPBL](https://www.womensprobaseballleague.com/players/maika-dumais/) |
| roster | Gigi Schiano | Gigi Schiano | [WPBL](https://www.womensprobaseballleague.com/players/gisella-schiano/) |
| roster | Maria Jose Valenzuela | Maria José Valenzuela | [WPBL](https://www.womensprobaseballleague.com/players/maria-jose-gutierrez-valenzuela/) |
| roster | Molly Paddison | Molly Paddison | [WPBL](https://www.womensprobaseballleague.com/players/molly-paddison/) |
| roster | Beth Greenwood | Beth Greenwood | [WPBL](https://www.womensprobaseballleague.com/players/beth-greenwood/) |
| roster | Sabrina Robinson | Sabrina Robinson | [WPBL](https://www.womensprobaseballleague.com/players/sabrina-robinson/) |
| roster | Gabrielle Haas | Gabrielle Haas | [WPBL](https://www.womensprobaseballleague.com/players/gabrielle-haas/) |
| roster | Ayami Sato | Ayami Sato | [WPBL](https://www.womensprobaseballleague.com/players/ayami-sato/) |
| roster | Ashton Lansdell | Ashton Lansdell | [WPBL](https://www.womensprobaseballleague.com/players/ashton-lansdell/) |
| roster | Mo'ne Davis | Mo'ne Davis | [WPBL](https://www.womensprobaseballleague.com/players/mone-davis/) |
| roster | Meggie Meidlinger | Meggie Meidlinger | [WPBL](https://www.womensprobaseballleague.com/players/meggie-meidlinger/) |
| roster | Thaima Maximiliana | Thaima Maximiliana | [WPBL](https://www.womensprobaseballleague.com/players/thaima-maximiliana/) |
| roster | Jamie Mackay | Jamie Mackay | [WPBL](https://www.womensprobaseballleague.com/players/jamie-mackay/) |
| roster | Emi Saiki | Emi Saiki | [WPBL](https://www.womensprobaseballleague.com/players/emi-saiki/) |
| roster | Samaria Benítez | Samaria Benítez | [WPBL](https://www.womensprobaseballleague.com/players/samaria-benitez/) |
| roster | Maggie Foxx | Maggie Foxx | [WPBL](https://www.womensprobaseballleague.com/players/maggie-foxx/) |
| roster | Michelle Roche | Michelle Roche | [WPBL](https://www.womensprobaseballleague.com/players/michelle-roche/) |
| roster | Suzu Narasaki | Suzu Narasaki | [WPBL](https://www.womensprobaseballleague.com/players/suzu-narasaki/) |
| roster | Caitlin Eynon | Caitlin Eynon | [WPBL](https://www.womensprobaseballleague.com/players/caitlin-eynon/) |
| roster | Sarah Edwards | Sarah Edwards | [WPBL](https://www.womensprobaseballleague.com/players/sarah-edwards/) |
| roster | Brittany Apgar | Brittany Apgar | [WPBL](https://www.womensprobaseballleague.com/players/brittany-apgar/) |
| roster | Leah Cornish | Leah Cornish | [WPBL](https://www.womensprobaseballleague.com/players/leah-cornish/) |
| roster | Kylee Lahners | Kylee Lahners | [WPBL](https://www.womensprobaseballleague.com/players/kylee-lahners/) |
| roster | Denae Benites | Denae Benites | [WPBL](https://www.womensprobaseballleague.com/players/denae-benites/) |
| roster | Rakyung Kim | Rakyung Kim | [WPBL](https://www.womensprobaseballleague.com/players/rakyung-kim/) |
| roster | Valerie Perez | Val Perez | [WPBL](https://www.womensprobaseballleague.com/players/valerie-perez/) |
| roster | Jaida Lee | Jaida Lee | [WPBL](https://www.womensprobaseballleague.com/players/jaida-lee/) |
| roster | London Studer | London Studer | [WPBL](https://www.womensprobaseballleague.com/players/london-studer/) |
| roster | Keira Izumi | Keira Izumi | [WPBL](https://www.womensprobaseballleague.com/players/keira-izumi/) |
| roster | Natsuki Yonetani | Natsuki Yonetani | [WPBL](https://www.womensprobaseballleague.com/players/natsuki-yonetani/) |
| roster | Alyssa Zettlemoyer | Alyssa Zettlemoyer | [WPBL](https://www.womensprobaseballleague.com/players/alyssa-zettlemoyer/) |
| roster | Madison Willan | Madison Willan | [WPBL](https://www.womensprobaseballleague.com/players/madison-willan/) |
| roster | Claire Eccles | Claire Eccles | [WPBL](https://www.womensprobaseballleague.com/players/claire-eccles/) |
| roster | Elodie Ciamarro | Elodie Ciamarro | [WPBL](https://www.womensprobaseballleague.com/players/elodie-ciamarro/) |
| roster | Jacqui Reynolds | Jacqui Reynolds | [WPBL](https://www.womensprobaseballleague.com/players/jacqueline-reynolds/) |
| roster | Diana Ibarra | Diana Ibarra | [WPBL](https://www.womensprobaseballleague.com/players/diana-ibarra/) |
| roster | Claire O'Sullivan | Claire O'Sullivan | [WPBL](https://www.womensprobaseballleague.com/players/claire-osullivan/) |
| roster | Kelsie Whitmore | Kelsie Whitmore | [WPBL](https://www.womensprobaseballleague.com/players/kelsie-whitmore/) |
| roster | Amanda Gianelloni | Amanda Gianelloni | [WPBL](https://www.womensprobaseballleague.com/players/amanda-gianelloni/) |
| roster | Joely Leguizamon | Joely Leguizamon | [WPBL](https://www.womensprobaseballleague.com/players/joely-leguizamon/) |
| roster | Jill Albayati | Jill Albayati | [WPBL](https://www.womensprobaseballleague.com/players/jill-albayati/) |
| roster | Samantha Gutierrez | Samantha Gutierrez | [WPBL](https://www.womensprobaseballleague.com/players/samantha-gutierrez/) |
| roster | Ayaka Yamamoto | Ayaka Yamamoto | [WPBL](https://www.womensprobaseballleague.com/players/ayaka-yamamoto/) |
| roster | Niki Eckert | Niki Eckert | [WPBL](https://www.womensprobaseballleague.com/players/niki-eckert/) |
| roster | Andréanne Leblanc | Andréanne Leblanc | [WPBL](https://www.womensprobaseballleague.com/players/andreanne-leblanc/) |
| roster | Jua Park | Jua Park | [WPBL](https://www.womensprobaseballleague.com/players/jua-park/) |
| roster | Alexia Jorge | Alexia Jorge | [WPBL](https://www.womensprobaseballleague.com/players/alexia-jorge/) |
| roster | Ela Day-Bédard | Ela Day-Bédard | [WPBL](https://www.womensprobaseballleague.com/players/ela-day-bedard/) |
| roster | Rosi del Castillo | Rosi del Castillo | [WPBL](https://www.womensprobaseballleague.com/players/rosi-del-castillo/) |
| roster | Liz Gilder | Liz Gilder | [WPBL](https://www.womensprobaseballleague.com/players/liz-gilder/) |
| roster | Skylar Kaplan | Skylar Kaplan | [WPBL](https://www.womensprobaseballleague.com/players/skylar-kaplan/) |
| roster | Hinano Beppu | Hinano Beppu | [WPBL](https://www.womensprobaseballleague.com/players/hinano-beppu/) |
