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
      'description' => $r['description'] ?? null,
      'image' => $r['image'] ?? null,
      'category' => $r['category'] ?? null,
      'goal' => isset($r['goal']) ? (float)$r['goal'] : null,
      'sort' => isset($r['sort']) ? (int)$r['sort'] : null,
      'ishome_v' => isset($r['ishome_v']) ? (int)$r['ishome_v'] : null,
      'isfooter' => isset($r['isfooter']) ? (int)$r['isfooter'] : null,
      'isdonate_v' => isset($r['isdonate_v']) ? (int)$r['isdonate_v'] : null,
      'isother_v' => isset($r['isother_v']) ? (int)$r['isother_v'] : null,
      'isquantity_v' => isset($r['isquantity_v']) ? (int)$r['isquantity_v'] : null,
      'isdropdown_v' => isset($r['isdropdown_v']) ? (int)$r['isdropdown_v'] : null,
      'isrecurring_v' => isset($r['isrecurring_v']) ? (int)$r['isrecurring_v'] : null,
      'recurring_interval' => $r['recurring_interval'] ?? null,
      'isassociate' => isset($r['isassociate']) ? (int)$r['isassociate'] : null,
      'type' => $r['type'] ?? null,
      'country' => $r['country'] ?? null,
      'cause' => $r['cause'] ?? null,
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
