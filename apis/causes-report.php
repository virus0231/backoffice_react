<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $tables = get_table_names($pdo);

  // Get filter parameters
  $appealId = $_GET['appeal_id'] ?? null;
  $categoryId = $_GET['category_id'] ?? null;
  $countryName = $_GET['country'] ?? null;
  $minAmount = $_GET['min_amount'] ?? null;
  $maxAmount = $_GET['max_amount'] ?? null;

  // Build WHERE conditions
  $conditions = ['1=1'];
  $params = [];

  if ($appealId) {
    $conditions[] = 'ap.id = ?';
    $params[] = (int)$appealId;
  }

  if ($categoryId) {
    $conditions[] = 'ap.category = ?';
    $params[] = (int)$categoryId;
  }

  if ($countryName) {
    $conditions[] = 'ap.country = ?';
    $params[] = $countryName;
  }

  $whereClause = implode(' AND ', $conditions);

  // Query to get causes with aggregated data
  $sql = "
    SELECT
      ap.id,
      ap.name as appeal_name,
      ap.category,
      ap.country,
      cat.name as category_name,
      COUNT(DISTINCT t.id) as donation_count,
      SUM(t.totalamount) as total_amount,
      GROUP_CONCAT(DISTINCT f.name SEPARATOR ', ') as fund_names
    FROM `{$tables['appeal']}` ap
    LEFT JOIN `{$tables['category']}` cat ON cat.id = ap.category
    LEFT JOIN `{$tables['transaction_details']}` td ON td.appeal_id = ap.id
    LEFT JOIN `{$tables['transactions']}` t ON t.id = td.TID AND t.status IN ('Completed', 'pending')
    LEFT JOIN `{$tables['fundlist']}` f ON f.id = td.fundlist_id
    WHERE {$whereClause}
    GROUP BY ap.id, ap.name, ap.category, ap.country, cat.name
    ORDER BY total_amount DESC, ap.name ASC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll();

  // Apply amount filtering on results (if needed)
  $filteredRows = $rows;
  if ($minAmount !== null || $maxAmount !== null) {
    $filteredRows = array_filter($rows, function($row) use ($minAmount, $maxAmount) {
      $amount = (float)$row['total_amount'];
      if ($minAmount !== null && $amount < (float)$minAmount) return false;
      if ($maxAmount !== null && $amount > (float)$maxAmount) return false;
      return true;
    });
    $filteredRows = array_values($filteredRows);
  }

  json_response([
    'success' => true,
    'data' => array_map(function($r) {
      return [
        'id' => (int)$r['id'],
        'appeal' => $r['appeal_name'],
        'amount' => (float)$r['total_amount'] ?? 0,
        'fundList' => $r['fund_names'] ?? 'N/A',
        'category' => $r['category_name'] ?? 'N/A',
        'country' => $r['country'] ?? 'N/A',
        'donations' => (int)$r['donation_count']
      ];
    }, $filteredRows),
    'count' => count($filteredRows),
    'total_amount' => array_sum(array_column($filteredRows, 'total_amount')),
    'message' => 'Retrieved causes report'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching causes report', 500, ['message' => $e->getMessage()]);
}
