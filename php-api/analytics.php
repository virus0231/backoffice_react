<?php
require_once __DIR__ . '/_bootstrap.php';

// Params
$kind = isset($_GET['kind']) ? $_GET['kind'] : null; // 'total-raised' | 'first-installments' | 'one-time-donations'
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null; // yyyy-mm-dd
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null; // yyyy-mm-dd
$granularity = isset($_GET['granularity']) ? $_GET['granularity'] : 'daily'; // daily | weekly
$appealId = isset($_GET['appealId']) ? (int)$_GET['appealId'] : null;
$fundId = isset($_GET['fundId']) ? (int)$_GET['fundId'] : null;
$frequency = isset($_GET['frequency']) ? $_GET['frequency'] : 'all';

if (!$kind || !$startDate || !$endDate) {
  error_response('Missing kind/startDate/endDate', 400);
  exit;
}

// Convert "one-time-donations" to internal mapping
function kind_frequency_condition(string $kind): string {
  switch ($kind) {
    case 'one-time-donations':
      return ' AND d.freq = 0';
    case 'first-installments':
      return ' AND d.freq = 1 AND t.order_id NOT REGEXP "_"';
    case 'total-raised':
    default:
      return ' AND (d.freq = 0 OR (d.freq = 1 AND t.order_id NOT REGEXP "_"))';
  }
}

[$startBound, $endBound] = build_day_bounds($startDate, $endDate);
if (!$startBound || !$endBound) {
  error_response('Invalid startDate/endDate format (expected YYYY-MM-DD)', 400);
  exit;
}

try {
  $pdo = get_pdo();

  // Build filter clause and bindings
  $filterClause = '';
  $bindings = [
    ':start_dt' => $startBound,
    ':end_dt_incl' => $endBound,
  ];

  if ($appealId) {
    $filterClause .= ' AND a.id = :appealId';
    $bindings[':appealId'] = $appealId;
  }
  if ($fundId) {
    $filterClause .= ' AND f.id = :fundId';
    $bindings[':fundId'] = $fundId;
  }

  // Frequency condition from kind, possibly overridden by explicit frequency param
  $freqCond = kind_frequency_condition($kind);
  if ($frequency && $frequency !== 'all') {
    $freqCond = frequency_condition($frequency);
  }

  $baseWhere = "WHERE t.status IN ('Completed','pending')\n                 AND t.date >= :start_dt\n                 AND t.date <= :end_dt_incl\n                 AND EXISTS (\n                   SELECT 1\n                   FROM pw_transaction_details d\n                   JOIN pw_appeal a   ON a.id = d.appeal_id\n                   JOIN pw_fundlist f ON f.id = d.fundlist_id\n                   WHERE d.TID = t.id\n                     {$filterClause}\n                     {$freqCond}\n                 )";

  // Aggregate query
  $sqlAgg = "SELECT\n               COALESCE(SUM(t.totalamount), 0) AS totalAmount,\n               COUNT(DISTINCT t.id) AS donationCount,\n               COALESCE(AVG(t.totalamount), 0) AS averageDonation\n             FROM pw_transactions t\n             {$baseWhere}";

  $stmtAgg = $pdo->prepare($sqlAgg);
  foreach ($bindings as $k => $v) $stmtAgg->bindValue($k, $v);
  $stmtAgg->execute();
  $agg = $stmtAgg->fetch() ?: [ 'totalAmount' => 0, 'donationCount' => 0, 'averageDonation' => 0 ];

  // Trend query
  if ($granularity === 'weekly') {
    $dateFormat = '%Y-%u';
    $groupBy = 'YEARWEEK(t.date, 3)'; // ISO week (Monday)
  } else {
    $dateFormat = '%Y-%m-%d';
    $groupBy = 'DATE(t.date)';
  }

  $sqlTrend = "SELECT\n                 DATE_FORMAT(t.date, '{$dateFormat}') AS period,\n                 MIN(DATE(t.date)) AS day,\n                 SUM(t.totalamount) AS amount,\n                 COUNT(DISTINCT t.id) AS count\n               FROM pw_transactions t\n               {$baseWhere}\n               GROUP BY {$groupBy}\n               ORDER BY day ASC";

  $stmtTrend = $pdo->prepare($sqlTrend);
  foreach ($bindings as $k => $v) $stmtTrend->bindValue($k, $v);
  $stmtTrend->execute();
  $trend = $stmtTrend->fetchAll();

  $trendData = array_map(function($r) {
    return [
      'period' => $r['period'],
      'amount' => (float)($r['amount'] ?? 0),
      'count' => (int)($r['count'] ?? 0),
    ];
  }, $trend);

  json_response([
    'success' => true,
    'data' => [
      'totalAmount' => (float)($agg['totalAmount'] ?? 0),
      'totalCount'  => (int)($agg['donationCount'] ?? 0),
      'trendData'   => $trendData,
    ],
    'meta' => [
      'kind' => $kind,
      'granularity' => $granularity,
      'filters' => [ 'appealId' => $appealId, 'fundId' => $fundId, 'frequency' => $frequency ],
      'start' => $startBound,
      'end' => $endBound,
    ]
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching analytics', 500, ['message' => $e->getMessage()]);
}
