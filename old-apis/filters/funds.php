<?php
require_once __DIR__ . '/../_bootstrap.php';

try {
  $pdo = get_pdo();

  $appealIdsParam = isset($_GET['appeal_ids']) ? trim($_GET['appeal_ids']) : '';
  $funds = [];

  if ($appealIdsParam !== '') {
    $ids = array_values(array_filter(array_map('intval', explode(',', $appealIdsParam)), function($v) { return $v > 0; }));
    if (count($ids) > 0) {
      $placeholders = implode(',', array_fill(0, count($ids), '?'));
      $sql = "SELECT * FROM pw_fundlist WHERE appeal_id IN ($placeholders)";
      $stmt = $pdo->prepare($sql);
      foreach ($ids as $i => $id) {
        $stmt->bindValue($i + 1, $id, PDO::PARAM_INT);
      }
      $stmt->execute();
      $rows = $stmt->fetchAll();
    } else {
      $rows = [];
    }
  } else {
    $sql = 'SELECT * FROM pw_fundlist';
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();
  }

  $data = array_map(function($r) {
    $disable = isset($r['disable']) ? (int)$r['disable'] : 0;
    return [
      'id' => (int)$r['id'],
      'fund_name' => $r['fund_name'] ?? ($r['name'] ?? 'Unnamed Fund'),
      'is_active' => ($disable === 0),
      'appeal_id' => isset($r['appeal_id']) ? (int)$r['appeal_id'] : null,
      'category' => $r['category'] ?? null,
    ];
  }, $rows);

  json_response([
    'success' => true,
    'data' => $data,
    'count' => count($data),
    'filters' => [ 'appeal_ids' => $appealIdsParam ],
    'message' => 'Retrieved funds'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching funds', 500, ['message' => $e->getMessage()]);
}

