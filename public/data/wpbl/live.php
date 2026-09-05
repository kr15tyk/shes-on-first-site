<?php
declare(strict_types=1);
// Fixed public sources only; callers cannot choose URLs, dates or filesystem paths.
const SOF_CALENDAR = 'https://www.womensprobaseballleague.com/wp-json/wpbl/v1/calendar-events';
const SOF_FEED = 'https://stats.womensprobaseballleague.com/v1';
function sofDay(int $time): string { return (new DateTimeImmutable('@'.$time))->setTimezone(new DateTimeZone('America/New_York'))->format('Y-m-d'); }
function sofCount($v): ?int { return (is_int($v) || is_string($v)) && preg_match('/^\d{1,3}$/', (string)$v) ? (int)$v : null; }
function sofToday(array $events, int $now): array {
    $codes = ['NY','LA','BOS','SF']; $out = [];
    foreach ($events as $e) {
        $start = strtotime($e['start'] ?? ''); $p = $e['extendedProps'] ?? [];
        if (!$start || sofDay($start) !== sofDay($now) || empty($p['hasTeams'])) continue;
        if (!in_array($p['homeAbbr'] ?? '', $codes, true) || !in_array($p['awayAbbr'] ?? '', $codes, true)) continue;
        $out[] = ['id'=>(string)$e['id'],'start'=>gmdate('c',$start),'home'=>$p['homeAbbr'],'away'=>$p['awayAbbr'],
            'phase'=>'pregame','label'=>'Scheduled','homeScore'=>null,'awayScore'=>null,'sourceUpdatedAt'=>null,'delayed'=>false,
            'calendarStatus'=>strtolower($p['status'] ?? 'scheduled')];
    }
    usort($out,fn($a,$b)=>strcmp($a['start'],$b['start']));
    if (count($out)>8) throw new RuntimeException('Unexpected game count');
    return $out;
}
function sofMatch(array $event, array $games): ?array {
    $teams = ['New York Heights'=>'NY','Los Angeles Queens'=>'LA','Boston Hunters'=>'BOS','San Francisco Firebells'=>'SF'];
    $matches = array_values(array_filter($games, function($g) use($event,$teams) {
        $t=strtotime($g['scheduled_start'] ?? '');
        return $t && sofDay($t)===sofDay(strtotime($event['start'])) && ($teams[$g['home_team_name'] ?? ''] ?? '')===$event['home'] && ($teams[$g['away_team_name'] ?? ''] ?? '')===$event['away'];
    }));
    // Prefer the actual game over the feed's earlier unplayed placeholder.
    $active = array_values(array_filter($matches,fn($g)=>!preg_match('/^(Not Started|Scheduled)$/i',$g['status'] ?? '')));
    if (count($active)===1) return $active[0];
    if (count($active)>1 || count($matches)>1) return null; // Ambiguous doubleheader: do not guess.
    return $matches[0] ?? null;
}
function sofNormalize(array $event, array $g, ?array $previous, int $now): array {
    $base=$event; unset($base['calendarStatus']);
    $raw=(string)($g['status'] ?? ''); $state=$g['state'] ?? [];
    $scores=$g['presto_data']['score'] ?? []; $home=sofCount($scores['home'] ?? null); $away=sofCount($scores['away'] ?? null);
    $sh=sofCount($state['home_score'] ?? null); $sa=sofCount($state['away_score'] ?? null);
    $source=strtotime($g['updated_at'] ?? '');
    if (!$source || $source>$now+300) throw new RuntimeException('Invalid source time');
    $base['sourceUpdatedAt']=gmdate('c',$source);
    $final=preg_match('/^Final(?:\b|$)/i',$raw)===1;
    $inning=preg_match('/^In Progress - (Top|Bottom) of (\d{1,2})(?:st|nd|rd|th)$/i',$raw,$parts)===1;
    $evidence=$home>0 || $away>0 || ($inning && (strtolower($parts[1])==='bottom' || (int)$parts[2]>1)) || (int)($state['outs'] ?? 0)>0 || !empty($state['batter_id']);
    $live=$inning && $now>=strtotime($event['start']) && $evidence;
    if ($previous && $previous['phase']==='final' && !$final) { $previous['delayed']=true; return $previous; }
    if ($final || $live) {
        if ($home===null || $away===null || ($sh!==null && $sh!==$home) || ($sa!==null && $sa!==$away)) {
            $base=$previous ?? $base; $base['delayed']=true; return $base;
        }
        if ($previous && !empty($previous['sourceUpdatedAt']) && $source<strtotime($previous['sourceUpdatedAt'])) { $previous['delayed']=true; return $previous; }
        // Accept score corrections only after the same lower value is seen twice.
        $lower=$previous && $previous['homeScore']!==null && ($home<$previous['homeScore'] || $away<$previous['awayScore']);
        if ($lower && ($previous['pendingScore'] ?? null)!==[$home,$away]) {
            $previous['pendingScore']=[$home,$away]; $previous['delayed']=true; return $previous;
        }
        $base['phase']=$final?'final':'live'; $base['label']=$final?'Final':ucfirst(strtolower($parts[1])).' '.$parts[2];
        $base['homeScore']=$home; $base['awayScore']=$away;
    } elseif (preg_match('/postponed|cancelled|canceled|suspended|delayed/i',$raw)) {
        $base['phase']='notice'; $base['label']=preg_match('/postponed/i',$raw)?'Postponed':(preg_match('/cancel/i',$raw)?'Cancelled':'Game delayed');
    } elseif ($previous && in_array($previous['phase'],['live','final'],true)) {
        $previous['delayed']=true; return $previous;
    } elseif ($now>=strtotime($event['start'])) {
        $base['label']='Awaiting first update';
    }
    return $base;
}
function sofHttp(string $url): array {
    $body=''; $c=curl_init($url);
    curl_setopt_array($c,[CURLOPT_FOLLOWLOCATION=>false,CURLOPT_CONNECTTIMEOUT=>3,CURLOPT_TIMEOUT=>6,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS,
        CURLOPT_USERAGENT=>'ShesOnFirst-ScoreStrip/1.0',CURLOPT_HTTPHEADER=>['Accept: application/json'],
        CURLOPT_WRITEFUNCTION=>function($c,$part)use(&$body){if(strlen($body)+strlen($part)>3000000)return 0;$body.=$part;return strlen($part);}]);
    $ok=curl_exec($c);$status=curl_getinfo($c,CURLINFO_HTTP_CODE);curl_close($c);
    if ($ok===false || $status!==200) throw new RuntimeException('Source unavailable');
    $data=json_decode($body,true,64,JSON_THROW_ON_ERROR);if(!is_array($data))throw new RuntimeException('Invalid source');return $data;
}
function sofCached(string $dir,string $key,int $ttl,int $now,callable $get): array {
    $path=$dir.'/'.$key.'.json';$old=is_file($path)?json_decode(file_get_contents($path),true):null;
    if ($old && $now-$old['at']<$ttl) return $old['data'];
    $data=$get();file_put_contents($path,json_encode(['at'=>$now,'data'=>$data]),LOCK_EX);return $data;
}
function sofCollect(string $dir,int $now,?array $old): array {
    $calendar=sofCached($dir,'calendar',300,$now,fn()=>sofHttp(SOF_CALENDAR));
    $events=sofToday($calendar,$now);$games=[];$listing=null;
    foreach($events as $event) {
        $prior=null;foreach(($old['games'] ?? []) as $p)if($p['id']===$event['id'])$prior=$p;
        $base=$event;unset($base['calendarStatus']);
        if (in_array($event['calendarStatus'],['postponed','cancelled','canceled'],true)) { $base['phase']='notice';$base['label']=$event['calendarStatus']==='postponed'?'Postponed':'Cancelled';$games[]=$base;continue; }
        if ($now<strtotime($event['start'])-900) {$games[]=$base;continue;}
        try {
            if ($listing===null) $listing=sofCached($dir,'listing',60,$now,function(){
                $all=[];$seen=[];
                for($page=0;$page<40;$page++) {
                    $p=sofHttp(SOF_FEED.'/games?limit=50&offset='.count($all));
                    if(!isset($p['games']) || !is_array($p['games']) || ($p['count'] ?? null)!==count($p['games']))throw new RuntimeException('Invalid page');
                    if(!$p['games'])return $all;
                    foreach($p['games'] as $g){$id=$g['game_id'] ?? '';if(!preg_match('/^[a-zA-Z0-9_-]{1,100}$/',$id)||isset($seen[$id]))throw new RuntimeException('Invalid pagination');$seen[$id]=true;$all[]=$g;}
                }throw new RuntimeException('Incomplete pagination');
            });
            $g=sofMatch($event,$listing);
            if (!$g)throw new RuntimeException('No unambiguous game');
            $fresh=sofHttp(SOF_FEED.'/games/'.$g['game_id']);
            if (($fresh['game_id'] ?? '')!==$g['game_id'] || ($fresh['home_team_id'] ?? '')!==($g['home_team_id'] ?? '') || ($fresh['away_team_id'] ?? '')!==($g['away_team_id'] ?? '')) throw new RuntimeException('Game identity changed');
            $games[]=sofNormalize($event,$fresh,$prior,$now);
        } catch(Throwable $e) { $base=$prior ?? $base;$base['delayed']=true;$games[]=$base; }
    }
    return ['version'=>1,'date'=>sofDay($now),'checkedAt'=>gmdate('c',$now),'available'=>true,'games'=>$games];
}
function sofServe(): void {
    header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET')!=='GET'){http_response_code(405);return;}
    $now=time();$dir=sys_get_temp_dir().'/sof-live-'.substr(hash('sha256',__DIR__),0,16);
    if(!is_dir($dir) && !mkdir($dir,0700,true) && !is_dir($dir)){http_response_code(503);echo '{"available":false}';return;}
    $path=$dir.'/response.json';$old=is_file($path)?json_decode(file_get_contents($path),true):null;
    $sameDay=$old && ($old['date'] ?? '')===sofDay($now);
    $ttl=300;
    if($sameDay)foreach($old['games'] as $g)if(!in_array($g['phase'],['final','notice'],true) && $now>=strtotime($g['start'])-900)$ttl=15;
    if($sameDay && (($old['retryAt'] ?? 0)>$now || $now-strtotime($old['checkedAt'] ?? '')<$ttl)) {echo json_encode($old);return;}
    $lock=fopen($dir.'/lock','c');
    if(!$lock || !flock($lock,LOCK_EX|LOCK_NB)){echo json_encode($sameDay?$old:['available'=>false,'date'=>sofDay($now),'games'=>[]]);return;}
    try {
        $data=sofCollect($dir,$now,$sameDay?$old:null);
        if(array_filter($data['games'],fn($g)=>$g['delayed']))$data['retryAt']=$now+60;
    } catch(Throwable $e) {
        $data=$sameDay?$old:['version'=>1,'date'=>sofDay($now),'checkedAt'=>null,'available'=>false,'games'=>[]];
        foreach($data['games'] as &$g)$g['delayed']=true;unset($g);$data['retryAt']=$now+60;
    }
    file_put_contents($path.'.tmp',json_encode($data),LOCK_EX);rename($path.'.tmp',$path);flock($lock,LOCK_UN);fclose($lock);echo json_encode($data);
}
if (PHP_SAPI!=='cli') sofServe();
