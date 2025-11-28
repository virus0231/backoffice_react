<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $tables = get_table_names($pdo);

  $currentYear = date('Y');
  $currentMonth = date('m');

  // Total Amount This Month
  $stmtThisMonth = $pdo->prepare("
    SELECT SUM(totalamount) as total
    FROM `{$tables['transactions']}`
    WHERE YEAR(date) = ? AND MONTH(date) = ?
      AND status IN ('Completed', 'pending')
  ");
  $stmtThisMonth->execute([$currentYear, $currentMonth]);
  $thisMonthTotal = (float)$stmtThisMonth->fetchColumn();

  // Total Amount Raised (all time)
  $stmtAllTime = $pdo->prepare("
    SELECT SUM(totalamount) as total
    FROM `{$tables['transactions']}`
    WHERE status IN ('Completed', 'pending')
  ");
  $stmtAllTime->execute();
  $allTimeTotal = (float)$stmtAllTime->fetchColumn();

  // Failed Donors Count
  $stmtFailed = $pdo->prepare("
    SELECT COUNT(DISTINCT email) as count
    FROM `{$tables['transactions']}`
    WHERE status = 'Failed'
  ");
  $stmtFailed->execute();
  $failedCount = (int)$stmtFailed->fetchColumn();

  // Last Failed Date
  $stmtLastFailed = $pdo->prepare("
    SELECT MAX(date) as last_failed
    FROM `{$tables['transactions']}`
    WHERE status = 'Failed'
  ");
  $stmtLastFailed->execute();
  $lastFailedDate = $stmtLastFailed->fetchColumn() ?? 'N/A';

  // Monthly Growth (last 12 months)
  $stmtMonthly = $pdo->prepare("
    SELECT
      DATE_FORMAT(date, '%Y-%m') as month,
      SUM(totalamount) as amount
    FROM `{$tables['transactions']}`
    WHERE date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      AND status IN ('Completed', 'pending')
    GROUP BY month
    ORDER BY month ASC
  ");
  $stmtMonthly->execute();
  $monthlyData = $stmtMonthly->fetchAll();

  // Active Monthly Donors (recurring donors who donated this month)
  $stmtActiveDonors = $pdo->prepare("
    SELECT
      d.firstname,
      d.lastname,
      d.email,
      d.phone,
      MAX(t.date) as last_donation
    FROM `{$tables['donors']}` d
    INNER JOIN `{$tables['transactions']}` t ON t.email = d.email
    WHERE t.freq IN (1, 2, 3)
      AND t.status IN ('Completed', 'pending')
      AND YEAR(t.date) = ?
      AND MONTH(t.date) = ?
    GROUP BY d.email
    ORDER BY last_donation DESC
    LIMIT 100
  ");
  $stmtActiveDonors->execute([$currentYear, $currentMonth]);
  $activeDonors = $stmtActiveDonors->fetchAll();

  json_response([
    'success' => true,
    'data' => [
      'stats' => [
        'thisMonth' => $thisMonthTotal,
        'allTime' => $allTimeTotal,
        'failedDonors' => $failedCount,
        'lastFailedDate' => $lastFailedDate
      ],
      'monthlyGrowth' => array_map(function($r) {
        return [
          'month' => date('M', strtotime($r['month'] . '-01')),
          'value' => (float)$r['amount']
        ];
      }, $monthlyData),
      'activeDonors' => array_map(function($r) {
        return [
          'name' => trim(($r['firstname'] ?? '') . ' ' . ($r['lastname'] ?? '')) ?: 'N/A',
          'email' => $r['email'] ?? 'N/A',
          'phone' => $r['phone'] ?? 'N/A',
          'lastDonation' => $r['last_donation'] ?? 'N/A'
        ];
      }, $activeDonors)
    ],
    'message' => 'Retrieved monthly report'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching monthly report', 500, ['message' => $e->getMessage()]);
}
