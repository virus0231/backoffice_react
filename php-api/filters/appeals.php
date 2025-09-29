<?php
require_once __DIR__ . '/../_bootstrap.php';

try {
  $pdo = get_pdo();

  $sql = 'SELECT * FROM pw_appeal';
  $stmt = $pdo->query($sql);
  $rows = $stmt->fetchAll();

  $data = array_map(function($r) {
    $disable = isset($r['disable']) ? (int)$r['disable'] : 0;
    $status = ($disable === 0) ? 'active' : 'inactive';
    $start = isset($r['start_date']) && $r['start_date'] ? date(DATE_ISO8601, strtotime($r['start_date'])) : null;
    $end   = isset($r['end_date']) && $r['end_date'] ? date(DATE_ISO8601, strtotime($r['end_date'])) : null;
    return [
      'id' => (int)$r['id'],
      'appeal_name' => $r['appeal_name'] ?? ($r['name'] ?? 'Unnamed Appeal'),
      'status' => $status,
      'start_date' => $start,
      'end_date' => $end,
    ];
  }, $rows);

  json_response([
    'success' => true,
    'data' => $data,
    'count' => count($data),
    'message' => 'Retrieved appeals'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching appeals', 500, ['message' => $e->getMessage()]);
}

