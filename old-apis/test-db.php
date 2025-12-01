<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

try {
  $cfg = require __DIR__ . '/config.php';
  $host = $cfg['DB_HOST'];
  $db   = $cfg['DB_NAME'];
  $user = $cfg['DB_USER'];
  $pass = $cfg['DB_PASSWORD'];
  $port = $cfg['DB_PORT'];

  $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

  $pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::ATTR_TIMEOUT => 5, // 5 second timeout
  ]);

  echo json_encode([
    'status' => 'ok',
    'message' => 'Database connection successful',
    'database' => $db,
    'host' => $host
  ]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => 'Database connection failed',
    'error' => $e->getMessage()
  ]);
}