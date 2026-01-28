<?php
declare(strict_types=1);

$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://www.rekru-medforum.jspace.pl',
    'http://www.rekru-medforum.jspace.pl',
    'https://rekrum.jspace.pl',
    'http://rekrum.jspace.pl'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = file_get_contents(__DIR__ . '/categories.json');
if ($data === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Data file not found']);
    exit;
}

header('Cache-Control: public, max-age=3600');
echo $data;
