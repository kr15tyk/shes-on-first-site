<?php
declare(strict_types=1);
require __DIR__ . '/../public/data/wpbl/pull.php';
$directory = sys_get_temp_dir() . '/wpbl-test-' . bin2hex(random_bytes(8));
mkdir($directory);
$body = file_get_contents(__DIR__ . '/../public/data/wpbl/snapshot.json');
try {
    if (!installSnapshot($body, $directory)) throw new RuntimeException('Initial snapshot not installed');
    if (installSnapshot($body, $directory)) throw new RuntimeException('Unchanged snapshot rewritten');
    $data = json_decode($body, true, 64, JSON_THROW_ON_ERROR);
    $data['manifest']['quality']['verifiedBoxscores']--;
    try { installSnapshot(json_encode($data), $directory); throw new LogicException('Accepted incomplete data'); }
    catch (RuntimeException $expected) {}
    if (file_get_contents($directory . '/snapshot.json') !== $body) throw new LogicException('Failure replaced good data');
    try { installSnapshot('{broken', $directory); throw new LogicException('Accepted malformed JSON'); }
    catch (JsonException $expected) {}
    echo "Host pull tests passed: valid install, unchanged data, incomplete data, malformed JSON, previous snapshot preserved.\n";
} finally {
    foreach (glob($directory . '/*') as $file) unlink($file);
    rmdir($directory);
}
