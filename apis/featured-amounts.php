<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $tables = get_table_names($pdo);

  // Fetch all amounts where featured = 1
  $stmt = $pdo->prepare("
    SELECT
      a.id,
      a.name,
      a.amount,
      a.featured,
      a.disable as status,
      ap.name as appeal_name
    FROM `{$tables['amount']}` a
    LEFT JOIN `{$tables['appeal']}` ap ON ap.id = a.appeal_id
    WHERE a.featured = 1
    ORDER BY a.sort ASC, a.name ASC
  ");

  $stmt->execute();
  $rows = $stmt->fetchAll();

  json_response([
    'success' => true,
    'data' => array_map(function($r) {
      return [
        'id' => (int)$r['id'],
        'name' => $r['name'],
        'amount' => (float)$r['amount'],
        'appeal_name' => $r['appeal_name'] ?? 'N/A',
        'status' => (int)$r['status'] === 0 // 0 = enabled, 1 = disabled
      ];
    }, $rows),
    'count' => count($rows),
    'message' => 'Retrieved featured amounts'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching featured amounts', 500, ['message' => $e->getMessage()]);
}
