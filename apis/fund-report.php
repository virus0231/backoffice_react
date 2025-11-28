<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $tables = get_table_names($pdo);

  // Get filter parameters
  $fundId = $_GET['fund_id'] ?? null;
  $fromDate = $_GET['from_date'] ?? null;
  $toDate = $_GET['to_date'] ?? null;

  // Build WHERE conditions
  $conditions = ["t.status IN ('Completed', 'pending')"];
  $params = [];

  if ($fundId) {
    $conditions[] = 'td.fundlist_id = ?';
    $params[] = (int)$fundId;
  }

  if ($fromDate) {
    $conditions[] = 't.date >= ?';
    $params[] = $fromDate;
  }

  if ($toDate) {
    $conditions[] = 't.date <= ?';
    $params[] = $toDate;
  }

  $whereClause = implode(' AND ', $conditions);

  // Query to get fund donations
  $sql = "
    SELECT
      f.id,
      f.name as fund_name,
      COUNT(DISTINCT t.id) as donation_count,
      SUM(t.totalamount) as total_amount
    FROM `{$tables['transaction_details']}` td
    LEFT JOIN `{$tables['transactions']}` t ON t.id = td.TID
    LEFT JOIN `{$tables['fundlist']}` f ON f.id = td.fundlist_id
    WHERE {$whereClause}
    GROUP BY f.id, f.name
    ORDER BY total_amount DESC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll();

  json_response([
    'success' => true,
    'data' => array_map(function($r) {
      return [
        'id' => (int)$r['id'],
        'name' => $r['fund_name'] ?? 'Unknown Fund',
        'totalAmount' => (float)$r['total_amount'] ?? 0,
        'donations' => (int)$r['donation_count']
      ];
    }, $rows),
    'count' => count($rows),
    'total_amount' => array_sum(array_column($rows, 'total_amount')),
    'message' => 'Retrieved fund report'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching fund report', 500, ['message' => $e->getMessage()]);
}
