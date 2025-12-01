<?php
// Simple test API to debug POST data
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log what we received
$response = [
    'received_post' => $_POST,
    'received_files' => $_FILES,
    'php_input' => file_get_contents('php://input'),
    'server_method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set'
];

echo json_encode($response, JSON_PRETTY_PRINT);
exit;
?>
