<?php
header('Content-Type: application/json');

$file = '/home/pi/trading-position-calculator/data.json';
$default = ['patrimonio' => 75000];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (isset($body['patrimonio']) && is_numeric($body['patrimonio'])) {
        file_put_contents($file, json_encode(['patrimonio' => (float)$body['patrimonio']]));
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'invalid']);
    }
} else {
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : $default;
    echo json_encode($data);
}
