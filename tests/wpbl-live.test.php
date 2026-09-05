<?php
declare(strict_types=1);
require __DIR__.'/../public/data/wpbl/live.php';
function check($yes,$message){if(!$yes)throw new RuntimeException($message);}
$start=strtotime('2026-09-04T23:30:00Z');
$e=['id'=>'event','start'=>gmdate('c',$start),'home'=>'NY','away'=>'SF','phase'=>'pregame','label'=>'Scheduled','homeScore'=>null,'awayScore'=>null,'sourceUpdatedAt'=>null,'delayed'=>false,'calendarStatus'=>'scheduled'];
$g=['game_id'=>'actual','scheduled_start'=>'2026-09-04T23:30:00Z','home_team_name'=>'New York Heights','away_team_name'=>'San Francisco Firebells','status'=>'In Progress - Top of 1st','updated_at'=>'2026-09-04T22:58:26Z','state'=>['home_score'=>0,'away_score'=>0,'inning'=>0,'half'=>'','outs'=>0],'presto_data'=>['score'=>['home'=>'0','away'=>'0']]];
check(sofNormalize($e,$g,null,$start-60)['phase']==='pregame','Pregame live placeholder shown as live');
check(sofNormalize($e,$g,null,$start+600)['phase']==='pregame','Clock alone claimed first pitch');
$g['status']='In Progress - Bottom of 2nd';$g['updated_at']='2026-09-05T00:12:56Z';$g['state']['home_score']=4;$g['presto_data']['score']['home']='4';
$live=sofNormalize($e,$g,null,$start+3000);
check($live['phase']==='live' && $live['label']==='Bottom 2' && $live['homeScore']===4,'Status parsing failed');
$g['state']['home_score']=2;$conflict=sofNormalize($e,$g,$live,$start+3015);
check($conflict['homeScore']===4 && $conflict['delayed'],'Conflict replaced coherent score');
$g['state']['home_score']=3;$g['presto_data']['score']['home']='3';
$pending=sofNormalize($e,$g,$live,$start+3030);
check($pending['homeScore']===4 && $pending['delayed'],'Transient decrease published');
$corrected=sofNormalize($e,$g,$pending,$start+3045);
check($corrected['homeScore']===3 && !$corrected['delayed'],'Confirmed correction rejected');
$g['status']='Final';$final=sofNormalize($e,$g,$corrected,$start+3600);
check($final['phase']==='final','Explicit final not handled');
$placeholder=$g;$placeholder['game_id']='placeholder';$placeholder['status']='Not Started';
check(sofMatch($e,[$placeholder,$g])['game_id']==='actual','Duplicate placeholder chosen');
$other=$g;$other['game_id']='other';check(sofMatch($e,[$g,$other])===null,'Ambiguous games guessed');
$events=[['id'=>1,'start'=>'2026-09-04T23:30:00Z','extendedProps'=>['hasTeams'=>true,'homeAbbr'=>'NY','awayAbbr'=>'SF']]];
check(count(sofToday($events,strtotime('2026-09-05T02:00:00Z')))===1,'Eastern evening lost at UTC midnight');
check(count(sofToday($events,strtotime('2026-09-05T04:00:00Z')))===0,'Yesterday retained after Eastern midnight');
check(sofToday($events,$start)[0]['start']==='2026-09-04T23:30:00+00:00','Official start time shifted');
$d=sys_get_temp_dir().'/sof-live-test-'.bin2hex(random_bytes(5));mkdir($d);$calls=0;
try {
 $get=function()use(&$calls){$calls++;return ['sample'=>true];};
 sofCached($d,'sample',15,$start,$get);sofCached($d,'sample',15,$start+14,$get);check($calls===1,'Shared cache re-fetched early');
 sofCached($d,'sample',15,$start+15,$get);check($calls===2,'Expired cache not refreshed');
} finally {foreach(glob($d.'/*') as $p)unlink($p);rmdir($d);}
echo "Score strip tests passed: pregame placeholder, inning text, score conflicts, confirmed corrections, final, duplicate games, timezone rollover, official start, shared cache.\n";
