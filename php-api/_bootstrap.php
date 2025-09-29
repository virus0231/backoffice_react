<?php
// Common bootstrap for PHP API endpoints

// CORS headers (adjust origin as needed)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

function json_response($data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

function error_response(string $message, int $status = 400, array $meta = []): void {
  json_response([ 'success' => false, 'error' => $message, 'meta' => $meta ], $status);
}

function get_env_or(array $arr, string $key, $default = null) {
  $val = getenv($key);
  if ($val !== false && $val !== null && $val !== '') return $val;
  return $arr[$key] ?? $default;
}

function get_pdo(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  $cfg = require __DIR__ . '/config.php';
  $host = get_env_or($cfg, 'DB_HOST', 'localhost');
  $db   = get_env_or($cfg, 'DB_NAME', '');
  $user = get_env_or($cfg, 'DB_USER', '');
  $pass = get_env_or($cfg, 'DB_PASSWORD', '');
  $port = (int)get_env_or($cfg, 'DB_PORT', 3306);
  $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

  $pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]);
  return $pdo;
}

// Parses YYYY-MM-DD as a local calendar date string (no timezone shift)
function parse_date_ymd(string $s): ?DateTime {
  if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $s)) return null;
  [$y, $m, $d] = array_map('intval', explode('-', $s));
  return new DateTime(sprintf('%04d-%02d-%02d 00:00:00', $y, $m, $d));
}

function format_date_only(DateTime $dt): string {
  return $dt->format('Y-m-d');
}

// Build inclusive day bounds with microseconds strings
function build_day_bounds(string $startDate, string $endDate): array {
  $start = parse_date_ymd($startDate);
  $end = parse_date_ymd($endDate);
  if (!$start || !$end) {
    return [null, null];
  }
  $startStr = format_date_only($start) . ' 00:00:00.000000';
  $endStr   = format_date_only($end)   . ' 23:59:59.999999';
  return [$startStr, $endStr];
}

function frequency_condition(string $frequency): string {
  switch ($frequency) {
    case 'one-time':
      return ' AND d.freq = 0';
    case 'recurring':
      return ' AND d.freq = 1';
    case 'recurring-first':
      return ' AND d.freq = 1 AND t.order_id NOT REGEXP "_"';
    case 'recurring-next':
      return ' AND d.freq = 1 AND t.order_id REGEXP "_"';
    default:
      return '';
  }
}

