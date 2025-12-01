<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $tables = get_table_names($pdo);

  // Get filter parameters
  $campaigns = $_GET['campaigns'] ?? null;
  $fromDate = $_GET['from_date'] ?? null;
  $toDate = $_GET['to_date'] ?? null;
  $donorEmail = $_GET['donor_email'] ?? null;

  // Build WHERE conditions
  $conditions = ["t.status IN ('Completed', 'pending')"];
  $params = [];

  if ($fromDate) {
    $conditions[] = 't.date >= ?';
    $params[] = $fromDate;
  }

  if ($toDate) {
    $conditions[] = 't.date <= ?';
    $params[] = $toDate;
  }

  if ($campaigns) {
    $conditions[] = 'a.name LIKE ?';
    $params[] = '%' . $campaigns . '%';
  }

  if ($donorEmail) {
    $conditions[] = 't.email = ?';
    $params[] = $donorEmail;
  }

  $whereClause = implode(' AND ', $conditions);

  // Query to get campaign donations
  $sql = "
    SELECT
      COALESCE(a.name, 'Unknown') as campaign_name,
      COUNT(DISTINCT t.id) as donation_count,
      SUM(t.totalamount) as total_amount
    FROM `{$tables['transactions']}` t
    LEFT JOIN `{$tables['transaction_details']}` td ON t.id = td.TID
    LEFT JOIN `{$tables['appeal']}` a ON a.id = td.appeal_id
    WHERE {$whereClause}
    GROUP BY a.name
    ORDER BY total_amount DESC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll();

  json_response([
    'success' => true,
    'data' => array_map(function($r) {
      return [
        'name' => $r['campaign_name'] ?? 'Unknown',
        'totalAmount' => (float)$r['total_amount'],
        'donations' => (int)$r['donation_count']
      ];
    }, $rows),
    'count' => count($rows),
    'total_amount' => array_sum(array_column($rows, 'total_amount')),
    'message' => 'Retrieved campaign report'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching campaign report', 500, ['message' => $e->getMessage()]);
}
