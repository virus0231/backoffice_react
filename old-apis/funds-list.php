<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $tables = get_table_names($pdo);

  // Get appeal_id from query parameter
  $appealId = $_GET['appeal_id'] ?? null;

  if (!$appealId) {
    error_response('appeal_id is required', 400);
  }

  $stmt = $pdo->prepare("SELECT id, name, sort, disable as status FROM `{$tables['fundlist']}` WHERE appeal_id = ? ORDER BY sort ASC, name ASC");
  $stmt->execute([(int)$appealId]);
  $rows = $stmt->fetchAll();

  json_response([
    'success' => true,
    'data' => array_map(function($r) {
      return [
        'id' => (int)$r['id'],
        'name' => $r['name'],
        'sort' => (int)$r['sort'],
        'status' => (int)$r['status'] === 0 ? 'Enable' : 'Disable'
      ];
    }, $rows),
    'count' => count($rows),
    'message' => 'Retrieved funds'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching funds', 500, ['message' => $e->getMessage()]);
}
