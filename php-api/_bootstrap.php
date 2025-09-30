<?php
// Common bootstrap for PHP API endpoints

// Fail-safe runtime guards
ini_set('display_errors', '0');
ini_set('default_socket_timeout', '15'); // Network socket read timeout
set_time_limit(30); // Hard cap script runtime
ignore_user_abort(true);

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
  // Ensure the response is flushed and the connection can close
  if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
  } else {
    // Flush output buffers if any
    while (ob_get_level() > 0) { @ob_end_flush(); }
    @flush();
  }
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

  // Add connect_timeout to DSN for faster failures if DB is unreachable
  $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4;";

  $options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::ATTR_PERSISTENT => false,
    PDO::ATTR_TIMEOUT => 10, // seconds; best-effort for MySQL
  ];

  // If available, set init commands to enforce reasonable query timeouts
  if (defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
    // MySQL 5.7+: MAX_EXECUTION_TIME (milliseconds) — ignored on older versions
    $options[PDO::MYSQL_ATTR_INIT_COMMAND] = 'SET SESSION wait_timeout=30, interactive_timeout=30, SQL_BIG_SELECTS=1';
  }

  $pdo = new PDO($dsn, $user, $pass, $options);

  // Best-effort per-session limits (ignore failures quietly)
  try { $pdo->exec('SET SESSION MAX_EXECUTION_TIME=15000'); } catch (Throwable $e) {}
  try { $pdo->exec('SET SESSION innodb_lock_wait_timeout=15'); } catch (Throwable $e) {}

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
