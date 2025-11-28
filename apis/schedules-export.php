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

  // Build WHERE conditions
  $conditions = ['td.freq IN (1, 2, 3)'];
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

  $sql = "
    SELECT
      t.order_id,
      t.date as start_date,
      d.firstname,
      d.lastname,
      d.email,
      d.phone,
      t.totalamount as amount,
      CASE
        WHEN td.freq = 0 THEN 'One-Time'
        WHEN td.freq = 1 THEN 'Monthly'
        WHEN td.freq = 2 THEN 'Yearly'
        WHEN td.freq = 3 THEN 'Daily'
        ELSE 'Unknown'
      END as frequency,
      t.status,
      t.paymenttype as payment_method
    FROM `{$tables['transactions']}` t
    LEFT JOIN `{$tables['transaction_details']}` td ON t.id = td.TID
    LEFT JOIN `{$tables['donors']}` d ON d.id = t.did
    WHERE {$whereClause}
    ORDER BY t.date DESC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Set headers for CSV download
  header('Content-Type: text/csv');
  header('Content-Disposition: attachment; filename="schedules_' . date('Y-m-d_His') . '.csv"');
  header('Pragma: no-cache');
  header('Expires: 0');

  // Output CSV
  $output = fopen('php://output', 'w');

  // Headers
  fputcsv($output, ['Order ID', 'Start Date', 'First Name', 'Last Name', 'Email', 'Phone', 'Amount', 'Frequency', 'Status', 'Payment Method']);

  // Data rows
  foreach ($rows as $row) {
    fputcsv($output, [
      $row['order_id'],
      $row['start_date'],
      $row['firstname'] ?? '',
      $row['lastname'] ?? '',
      $row['email'] ?? '',
      $row['phone'] ?? '',
      $row['amount'],
      $row['frequency'],
      $row['status'],
      $row['payment_method'] ?? ''
    ]);
  }

  fclose($output);
  exit;

} catch (Throwable $e) {
  http_response_code(500);
  echo 'Error: ' . $e->getMessage();
}
