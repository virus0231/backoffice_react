<?php
require_once __DIR__ . '/_bootstrap.php';

try {
  $pdo = get_pdo();

  // Get appeal_id from query parameter
  $appealId = isset($_GET['appeal_id']) ? (int)$_GET['appeal_id'] : null;

  if (!$appealId) {
    error_response('appeal_id is required', 400);
    exit;
  }

  $sql = 'SELECT * FROM ' . table('amount') . ' WHERE appeal_id = :appeal_id ORDER BY sort ASC, id ASC';
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':appeal_id', $appealId, PDO::PARAM_INT);
  $stmt->execute();
  $rows = $stmt->fetchAll();

  $data = array_map(function($r) {
    $disable = isset($r['disable']) ? (int)$r['disable'] : 0;
    $status = ($disable === 0) ? 'enabled' : 'disabled';
    $featured = isset($r['featured']) ? (int)$r['featured'] : 0;
    $featuredStatus = ($featured === 1) ? 'enabled' : 'disabled';

    return [
      'id' => (int)$r['id'],
      'appeal_id' => (int)$r['appeal_id'],
      'name' => $r['name'] ?? '',
      'amount' => $r['amount'] ?? '',
      'donationtype' => $r['donationtype'] ?? '',
      'sort' => isset($r['sort']) ? (int)$r['sort'] : 0,
      'featured' => $featuredStatus,
      'status' => $status,
    ];
  }, $rows);

  json_response([
    'success' => true,
    'data' => $data,
    'count' => count($data),
    'message' => 'Retrieved amounts for appeal ' . $appealId
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching amounts', 500, ['message' => $e->getMessage()]);
}
