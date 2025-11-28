<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $tables = get_table_names($pdo);

  // Get filter parameters
  $status = $_GET['status'] ?? null;
  $fromDate = $_GET['from_date'] ?? null;
  $toDate = $_GET['to_date'] ?? null;
  $search = $_GET['search'] ?? null;
  $frequency = $_GET['frequency'] ?? null;
  $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 500;

  // Build WHERE conditions
  $conditions = ['td.freq IN (1, 2, 3)']; // Only recurring (Monthly=1, Yearly=2, Daily=3)
  $params = [];

  if ($status) {
    $conditions[] = 't.status = ?';
    $params[] = $status;
  }

  if ($fromDate) {
    $conditions[] = 't.date >= ?';
    $params[] = $fromDate;
  }

  if ($toDate) {
    $conditions[] = 't.date <= ?';
    $params[] = $toDate;
  }

  if ($frequency) {
    $conditions[] = 'td.freq = ?';
    $params[] = (int)$frequency;
  }

  if ($search) {
    $searchTerm = '%' . $search . '%';
    $conditions[] = '(d.firstname LIKE ? OR d.lastname LIKE ? OR d.email LIKE ? OR d.phone LIKE ?)';
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
  }

  $whereClause = implode(' AND ', $conditions);

  // If offset is 0, get total count first
  $totalCount = 0;
  if ($offset === 0) {
    $countSql = "
      SELECT COUNT(DISTINCT t.id) as total
      FROM `{$tables['transactions']}` t
      LEFT JOIN `{$tables['transaction_details']}` td ON t.id = td.TID
      LEFT JOIN `{$tables['donors']}` d ON d.id = t.did
      WHERE {$whereClause}
    ";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $totalCount = (int)$countStmt->fetchColumn();
  }

  // Query to get recurring schedules/subscriptions
  $sql = "
    SELECT
      t.id,
      t.order_id,
      t.date as start_date,
      t.totalamount as amount,
      td.freq,
      t.status,
      t.paymenttype as donation_type,
      d.firstname,
      d.lastname,
      d.email,
      d.phone,
      CASE
        WHEN td.freq = 0 THEN 'One-Time'
        WHEN td.freq = 1 THEN 'Monthly'
        WHEN td.freq = 2 THEN 'Yearly'
        WHEN td.freq = 3 THEN 'Daily'
        ELSE 'Unknown'
      END as frequency_name
    FROM `{$tables['transactions']}` t
    LEFT JOIN `{$tables['transaction_details']}` td ON t.id = td.TID
    LEFT JOIN `{$tables['donors']}` d ON d.id = t.did
    WHERE {$whereClause}
    GROUP BY t.id, t.order_id, t.date, t.totalamount, td.freq, t.status, t.paymenttype, d.firstname, d.lastname, d.email, d.phone
    ORDER BY t.date DESC
    LIMIT ? OFFSET ?
  ";

  $stmt = $pdo->prepare($sql);
  $allParams = array_merge($params, [$limit, $offset]);
  $stmt->execute($allParams);
  $rows = $stmt->fetchAll();

  $response = [
    'success' => true,
    'data' => array_map(function($r) {
      return [
        'id' => (int)$r['id'],
        'order_id' => $r['order_id'],
        'donationType' => $r['donation_type'] ?? 'N/A',
        'startDate' => $r['start_date'],
        'name' => trim(($r['firstname'] ?? '') . ' ' . ($r['lastname'] ?? '')) ?: 'N/A',
        'email' => $r['email'] ?? 'N/A',
        'phone' => $r['phone'] ?? 'N/A',
        'amount' => (float)$r['amount'],
        'frequency' => $r['frequency_name'],
        'status' => $r['status']
      ];
    }, $rows),
    'count' => count($rows),
    'message' => 'Retrieved schedules'
  ];

  // Add total count only on first request (offset = 0)
  if ($offset === 0) {
    $response['totalCount'] = $totalCount;
  }

  json_response($response);
} catch (Throwable $e) {
  error_response('Database error fetching schedules', 500, ['message' => $e->getMessage()]);
}
