<?php
header('Content-Type: application/json');

$file = '/home/pi/trading-position-calculator/data.json';
$default = ['patrimonio' => 75000, 'nivel' => 'principiante'];
$niveles = ['principiante', 'intermedio', 'experto'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : $default;

    if (isset($body['patrimonio']) && is_numeric($body['patrimonio'])) {
        $data['patrimonio'] = (float)$body['patrimonio'];
    }
    if (isset($body['nivel']) && in_array($body['nivel'], $niveles)) {
        $data['nivel'] = $body['nivel'];
    }

    file_put_contents($file, json_encode($data));
    echo json_encode(['ok' => true]);
} else {
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : $default;
    if (!isset($data['nivel'])) $data['nivel'] = 'principiante';
    echo json_encode($data);
}
