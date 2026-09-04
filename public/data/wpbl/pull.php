<?php
declare(strict_types=1);
// CLI-only updater: no credentials and no remote code execution.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }

function checkSnapshot(array $data, ?array $previous = null): void {
    if (($data['schemaVersion'] ?? null) !== 1) throw new RuntimeException('Unsupported schema');
    foreach (['schedule','leaders','players','manifest'] as $key) {
        if (!isset($data[$key]) || !is_array($data[$key])) throw new RuntimeException('Missing dataset');
    }
    $manifest = $data['manifest'];
    $checked = strtotime($manifest['fetchedAt'] ?? '');
    if (!$checked || $checked > time() + 300) throw new RuntimeException('Invalid check time');
    $through = $manifest['throughDate'] ?? '';
    if (!preg_match('/^2026-\d{2}-\d{2}$/', $through)) throw new RuntimeException('Unexpected season');
    if (($data['players']['throughDate'] ?? null) !== $through || ($data['leaders']['throughDate'] ?? null) !== $through) throw new RuntimeException('Mixed dataset dates');
    if (($manifest['source']['url'] ?? '') !== 'https://stats.womensprobaseballleague.com/v1/games') throw new RuntimeException('Unexpected source');
    $games = $data['schedule']['games'] ?? [];
    $players = $data['players']['players'] ?? [];
    if (count($games) < 1 || count($games) > 2000 || count($players) < 1 || count($players) > 1000) throw new RuntimeException('Invalid record counts');
    $finals = array_values(array_filter($games, fn($g) => ($g['status'] ?? '') === 'Final'));
    $quality = $manifest['quality'] ?? [];
    if (count($finals) < 1 || count($finals) !== ($quality['verifiedBoxscores'] ?? null) || count($finals) !== ($quality['completedGames'] ?? null) || ($quality['boxscoreErrors'] ?? null) !== []) throw new RuntimeException('Incomplete box scores');
    $ids = array_column($finals, 'id');
    if (count(array_unique($ids)) !== count($finals)) throw new RuntimeException('Duplicate game IDs');
    if ($previous) {
        if ($checked < strtotime($previous['manifest']['fetchedAt']) || $through < $previous['manifest']['throughDate']) throw new RuntimeException('Older snapshot rejected');
        foreach ($previous['schedule']['games'] as $game) {
            if ($game['status'] === 'Final' && !in_array($game['id'], $ids, true)) throw new RuntimeException('Completed game disappeared');
        }
    }
}

function installSnapshot(string $body, string $directory): bool {
    $data = json_decode($body, true, 64, JSON_THROW_ON_ERROR);
    if (!is_array($data)) throw new RuntimeException('Invalid JSON object');
    $target = $directory . '/snapshot.json';
    $old = is_file($target) ? file_get_contents($target) : null;
    $previous = $old === null ? null : json_decode($old, true, 64, JSON_THROW_ON_ERROR);
    checkSnapshot($data, $previous);
    if ($old === $body) return false;
    if ($old !== null && file_put_contents($directory . '/snapshot.previous.json', $old, LOCK_EX) === false) throw new RuntimeException('Backup failed');
    $temporary = $directory . '/snapshot.download.tmp';
    if (file_put_contents($temporary, $body, LOCK_EX) !== strlen($body)) throw new RuntimeException('Incomplete write');
    chmod($temporary, 0644);
    if (!rename($temporary, $target)) throw new RuntimeException('Atomic replacement failed');
    return true;
}

function runUpdater(): void {
    $lock = fopen(__DIR__ . '/pull.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) return;
    try {
        $body = '';
        $curl = curl_init('https://raw.githubusercontent.com/kr15tyk/shes-on-first-site/wpbl-data/snapshot.json');
        curl_setopt_array($curl, [CURLOPT_FOLLOWLOCATION => false, CURLOPT_CONNECTTIMEOUT => 15, CURLOPT_TIMEOUT => 45,
            CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2, CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_USERAGENT => 'ShesOnFirst-StatsUpdater/1.0',
            CURLOPT_WRITEFUNCTION => function ($handle, string $chunk) use (&$body): int {
                if (strlen($body) + strlen($chunk) > 2000000) return 0;
                $body .= $chunk;
                return strlen($chunk);
            }]);
        if (curl_exec($curl) === false || curl_getinfo($curl, CURLINFO_HTTP_CODE) !== 200) throw new RuntimeException('HTTPS data download failed');
        curl_close($curl);
        $changed = installSnapshot($body, __DIR__);
        file_put_contents(__DIR__ . '/pull-status.json', json_encode(['ok' => true, 'checkedAt' => gmdate('c'), 'changed' => $changed, 'sha256' => hash('sha256', $body)]));
        echo $changed ? "Validated statistics installed.\n" : "Statistics already current.\n";
    } catch (Throwable $error) {
        file_put_contents(__DIR__ . '/pull-status.json', json_encode(['ok' => false, 'checkedAt' => gmdate('c'), 'message' => 'Update failed; previous snapshot retained.']));
        fwrite(STDERR, $error->getMessage() . "\n");
        exit(1);
    } finally { flock($lock, LOCK_UN); fclose($lock); }
}
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) runUpdater();
