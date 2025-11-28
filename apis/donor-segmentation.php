<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $tables = get_table_names($pdo);

  $currentYear = date('Y');
  $lastYear = date('Y', strtotime('-1 year'));

  // LYBUNT: Last Year But Not This (donated last year but not this year)
  $stmtLYBUNT = $pdo->prepare("
    SELECT DISTINCT
      d.firstname,
      d.lastname,
      d.email,
      d.phone,
      MAX(t.date) as last_donation
    FROM `{$tables['donors']}` d
    INNER JOIN `{$tables['transactions']}` t ON t.email = d.email
    WHERE YEAR(t.date) = ?
      AND t.status IN ('Completed', 'pending')
      AND d.email NOT IN (
        SELECT DISTINCT email
        FROM `{$tables['transactions']}`
        WHERE YEAR(date) = ? AND status IN ('Completed', 'pending')
      )
    GROUP BY d.email
    ORDER BY last_donation DESC
  ");
  $stmtLYBUNT->execute([$lastYear, $currentYear]);
  $lybuntDonors = $stmtLYBUNT->fetchAll();

  // SYBUNT: Some Years But Unfortunately Not This (donated in past but not this year, excluding LYBUNT)
  $stmtSYBUNT = $pdo->prepare("
    SELECT DISTINCT
      d.firstname,
      d.lastname,
      d.email,
      d.phone,
      MAX(t.date) as last_donation
    FROM `{$tables['donors']}` d
    INNER JOIN `{$tables['transactions']}` t ON t.email = d.email
    WHERE YEAR(t.date) < ?
      AND t.status IN ('Completed', 'pending')
      AND d.email NOT IN (
        SELECT DISTINCT email
        FROM `{$tables['transactions']}`
        WHERE YEAR(date) >= ? AND status IN ('Completed', 'pending')
      )
    GROUP BY d.email
    ORDER BY last_donation DESC
    LIMIT 1000
  ");
  $stmtSYBUNT->execute([$currentYear, $lastYear]);
  $sybuntDonors = $stmtSYBUNT->fetchAll();

  // Top Level Donors: $1,000 or more
  $stmtTop = $pdo->prepare("
    SELECT
      d.firstname,
      d.lastname,
      d.email,
      d.phone,
      SUM(t.totalamount) as total_donated
    FROM `{$tables['donors']}` d
    INNER JOIN `{$tables['transactions']}` t ON t.email = d.email
    WHERE t.status IN ('Completed', 'pending')
    GROUP BY d.email
    HAVING total_donated >= 1000
    ORDER BY total_donated DESC
  ");
  $stmtTop->execute();
  $topLevelDonors = $stmtTop->fetchAll();

  // Mid Level Donors: $100 - $999
  $stmtMid = $pdo->prepare("
    SELECT
      d.firstname,
      d.lastname,
      d.email,
      d.phone,
      SUM(t.totalamount) as total_donated
    FROM `{$tables['donors']}` d
    INNER JOIN `{$tables['transactions']}` t ON t.email = d.email
    WHERE t.status IN ('Completed', 'pending')
    GROUP BY d.email
    HAVING total_donated >= 100 AND total_donated < 1000
    ORDER BY total_donated DESC
  ");
  $stmtMid->execute();
  $midLevelDonors = $stmtMid->fetchAll();

  // Low Level Donors: $1 - $99
  $stmtLow = $pdo->prepare("
    SELECT
      d.firstname,
      d.lastname,
      d.email,
      d.phone,
      SUM(t.totalamount) as total_donated
    FROM `{$tables['donors']}` d
    INNER JOIN `{$tables['transactions']}` t ON t.email = d.email
    WHERE t.status IN ('Completed', 'pending')
    GROUP BY d.email
    HAVING total_donated < 100
    ORDER BY total_donated DESC
  ");
  $stmtLow->execute();
  $lowLevelDonors = $stmtLow->fetchAll();

  json_response([
    'success' => true,
    'data' => [
      'lybunt' => array_map(function($r) {
        return [
          'name' => trim(($r['firstname'] ?? '') . ' ' . ($r['lastname'] ?? '')) ?: 'N/A',
          'email' => $r['email'] ?? 'N/A',
          'phone' => $r['phone'] ?? 'N/A',
          'lastDonation' => $r['last_donation'] ?? 'N/A'
        ];
      }, $lybuntDonors),
      'sybunt' => array_map(function($r) {
        return [
          'name' => trim(($r['firstname'] ?? '') . ' ' . ($r['lastname'] ?? '')) ?: 'N/A',
          'email' => $r['email'] ?? 'N/A',
          'phone' => $r['phone'] ?? 'N/A',
          'lastDonation' => $r['last_donation'] ?? 'N/A'
        ];
      }, $sybuntDonors),
      'topLevel' => array_map(function($r) {
        return [
          'name' => trim(($r['firstname'] ?? '') . ' ' . ($r['lastname'] ?? '')) ?: 'N/A',
          'email' => $r['email'] ?? 'N/A',
          'phone' => $r['phone'] ?? 'N/A',
          'totalDonated' => (float)$r['total_donated']
        ];
      }, $topLevelDonors),
      'midLevel' => array_map(function($r) {
        return [
          'name' => trim(($r['firstname'] ?? '') . ' ' . ($r['lastname'] ?? '')) ?: 'N/A',
          'email' => $r['email'] ?? 'N/A',
          'phone' => $r['phone'] ?? 'N/A',
          'totalDonated' => (float)$r['total_donated']
        ];
      }, $midLevelDonors),
      'lowLevel' => array_map(function($r) {
        return [
          'name' => trim(($r['firstname'] ?? '') . ' ' . ($r['lastname'] ?? '')) ?: 'N/A',
          'email' => $r['email'] ?? 'N/A',
          'phone' => $r['phone'] ?? 'N/A',
          'totalDonated' => (float)$r['total_donated']
        ];
      }, $lowLevelDonors)
    ],
    'message' => 'Retrieved donor segmentation'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching donor segmentation', 500, ['message' => $e->getMessage()]);
}
