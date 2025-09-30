<?php
require_once __DIR__ . '/_bootstrap.php';

// Params
$kind = isset($_GET['kind']) ? $_GET['kind'] : null; // 'total-raised' | 'first-installments' | 'one-time-donations'
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null; // yyyy-mm-dd
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null; // yyyy-mm-dd
$granularity = isset($_GET['granularity']) ? $_GET['granularity'] : 'daily'; // daily | weekly
// Handle comma-separated IDs for appeals and funds
$appealIdRaw = isset($_GET['appealId']) ? $_GET['appealId'] : null;
$fundIdRaw = isset($_GET['fundId']) ? $_GET['fundId'] : null;
$frequency = isset($_GET['frequency']) ? $_GET['frequency'] : 'all';

// Parse comma-separated IDs into arrays
$appealIds = null;
if ($appealIdRaw) {
  $appealIds = array_map('intval', array_filter(explode(',', $appealIdRaw)));
  if (empty($appealIds)) $appealIds = null;
}

$fundIds = null;
if ($fundIdRaw) {
  $fundIds = array_map('intval', array_filter(explode(',', $fundIdRaw)));
  if (empty($fundIds)) $fundIds = null;
}

if (!$kind || !$startDate || !$endDate) {
  error_response('Missing kind/startDate/endDate', 400);
  exit;
}

// Convert "one-time-donations" to internal mapping
function kind_frequency_condition(string $kind): string
{
  switch ($kind) {
    case 'one-time-donations':
      return ' AND d.freq = 0';
    case 'first-installments':
      return ' AND d.freq = 1 AND t.order_id NOT REGEXP "_"';
    case 'total-raised':
    default:
      return '';
  }
}

// Guard script runtime for slow DBs
set_time_limit(30);

error_log('[analytics] start, kind=' . $kind . ", freq=" . ($frequency ?: 'all'));

[$startBound, $endBound] = build_day_bounds($startDate, $endDate);
if (!$startBound || !$endBound) {
  error_response('Invalid startDate/endDate format (expected YYYY-MM-DD)', 400);
  exit;
}

try {
  error_log('[analytics] acquiring PDO');
  $pdo = get_pdo();
  error_log('[analytics] PDO ready');

  // Build filter clause and bindings
  $filterClause = '';
  $bindings = [
    ':start_dt' => $startBound,
    ':end_dt_incl' => $endBound,
  ];

  if ($appealIds && !empty($appealIds)) {
    $cnt = count($appealIds);
    if ($cnt === 1) {
      $bindings[':appealId_0'] = (int)$appealIds[0];
      $filterClause .= ' AND a.id = :appealId_0';
    } else {
      $placeholders = [];
      foreach ($appealIds as $idx => $id) {
        $key = ":appealId_{$idx}";
        $placeholders[] = $key;
        $bindings[$key] = (int)$id;
      }
      if (!empty($placeholders)) {
        $filterClause .= ' AND a.id IN (' . implode(',', $placeholders) . ')';
      }
    }
  }

  if ($fundIds && !empty($fundIds)) {
    $cnt = count($fundIds);
    if ($cnt === 1) {
      $bindings[':fundId_0'] = (int)$fundIds[0];
      $filterClause .= ' AND f.id = :fundId_0';
    } else {
      $placeholders = [];
      foreach ($fundIds as $idx => $id) {
        $key = ":fundId_{$idx}";
        $placeholders[] = $key;
        $bindings[$key] = (int)$id;
      }
      if (!empty($placeholders)) {
        $filterClause .= ' AND f.id IN (' . implode(',', $placeholders) . ')';
      }
    }
  }

  // Frequency condition from kind, possibly overridden by explicit frequency param
  $freqCond = kind_frequency_condition($kind);
  if ($frequency && $frequency !== 'all') {
    $freqCond = frequency_condition($frequency);
  }

  // Split frequency condition: d.freq goes in subquery, t.order_id REGEXP goes in main WHERE
  $freqCondSubquery = '';
  $freqCondMain = '';

  if ($frequency === 'recurring-first' || $kind === 'first-installments') {
    $freqCondSubquery = ' AND d.freq = 1';
    $freqCondMain = " AND t.order_id NOT REGEXP '_'";
  } elseif ($frequency === 'recurring-next') {
    $freqCondSubquery = ' AND d.freq = 1';
    $freqCondMain = " AND t.order_id REGEXP '_'";
  } elseif ($frequency === 'one-time') {
    $freqCondSubquery = ' AND d.freq = 0';
  } elseif ($frequency === 'recurring') {
    $freqCondSubquery = ' AND d.freq = 1';
  } elseif ($kind === 'one-time-donations') {
    $freqCondSubquery = ' AND d.freq = 0';
  }

  // Debug current filters
  error_log('[analytics] filters: appeals=' . (is_array($appealIds) ? count($appealIds) : 0) . ', funds=' . (is_array($fundIds) ? count($fundIds) : 0));
  error_log('[analytics] filterClause: ' . $filterClause);

  $baseWhere = "WHERE t.status IN ('Completed','pending')\n                 AND t.date >= :start_dt\n                 AND t.date <= :end_dt_incl\n                 {$freqCondMain}\n                 AND EXISTS (\n                   SELECT 1\n                   FROM pw_transaction_details d\n                   JOIN pw_appeal a   ON a.id = d.appeal_id\n                   JOIN pw_fundlist f ON f.id = d.fundlist_id\n                   WHERE d.TID = t.id\n                     {$filterClause}\n                     {$freqCondSubquery}\n                 )";

  // Aggregate query
  $sqlAgg = "SELECT\n               COALESCE(SUM(t.totalamount), 0) AS totalAmount,\n               COUNT(DISTINCT t.id) AS donationCount,\n               COALESCE(AVG(t.totalamount), 0) AS averageDonation\n             FROM pw_transactions t\n             {$baseWhere}";

  // Log query for debugging
  error_log("SQL Aggregate: " . $sqlAgg);
  error_log("Bindings: " . json_encode($bindings));

  error_log('[analytics] preparing agg');
  $stmtAgg = $pdo->prepare($sqlAgg);
  foreach ($bindings as $k => $v) $stmtAgg->bindValue($k, $v);
  error_log('[analytics] executing agg');
  $stmtAgg->execute();
  error_log('[analytics] agg done');
  $agg = $stmtAgg->fetch() ?: ['totalAmount' => 0, 'donationCount' => 0, 'averageDonation' => 0];

  // Trend query - use derived table to satisfy ONLY_FULL_GROUP_BY
  if ($granularity === 'weekly') {
    $sqlTrend = "SELECT\n                  DATE_FORMAT(MIN(day_date), '%Y-%u') AS period,\n                  MIN(day_date) AS day,\n                  SUM(amount) AS amount,\n                  SUM(cnt) AS count\n                FROM (\n                  SELECT\n                    YEARWEEK(t.date, 3) AS week_num,\n                    DATE(t.date) AS day_date,\n                    t.totalamount AS amount,\n                    1 AS cnt\n                  FROM pw_transactions t\n                  {$baseWhere}\n                ) AS daily_data\n                GROUP BY week_num\n                ORDER BY day ASC";
  } else {
    $sqlTrend = "SELECT\n                  DATE_FORMAT(day_date, '%Y-%m-%d') AS period,\n                  day_date AS day,\n                  SUM(amount) AS amount,\n                  SUM(cnt) AS count\n                FROM (\n                  SELECT\n                    DATE(t.date) AS day_date,\n                    t.totalamount AS amount,\n                    1 AS cnt\n                  FROM pw_transactions t\n                  {$baseWhere}\n                ) AS daily_data\n                GROUP BY day_date\n                ORDER BY day ASC";
  }

  error_log('[analytics] preparing trend');
  $stmtTrend = $pdo->prepare($sqlTrend);
  foreach ($bindings as $k => $v) $stmtTrend->bindValue($k, $v);
  error_log('[analytics] executing trend');
  $stmtTrend->execute();
  error_log('[analytics] trend done');
  $trend = $stmtTrend->fetchAll();

  // Convert to associative array keyed by period for easy lookup
  $trendMap = [];
  foreach ($trend as $r) {
    $trendMap[$r['period']] = [
      'period' => $r['period'],
      'amount' => (float)($r['amount'] ?? 0),
      'count' => (int)($r['count'] ?? 0),
    ];
  }

  // Fill in missing dates with zero values
  $trendData = [];
  if ($granularity === 'weekly') {
    // For weekly, iterate through weeks
    $current = parse_date_ymd($startDate);
    $end = parse_date_ymd($endDate);
    while ($current <= $end) {
      $weekNum = $current->format('Y-W');
      if (!isset($trendMap[$weekNum])) {
        $trendData[] = [
          'period' => $weekNum,
          'amount' => 0.0,
          'count' => 0,
        ];
      } else {
        $trendData[] = $trendMap[$weekNum];
      }
      $current->modify('+1 week');
    }
  } else {
    // For daily, iterate through each day
    $current = parse_date_ymd($startDate);
    $end = parse_date_ymd($endDate);
    while ($current <= $end) {
      $dateStr = $current->format('Y-m-d');
      if (!isset($trendMap[$dateStr])) {
        $trendData[] = [
          'period' => $dateStr,
          'amount' => 0.0,
          'count' => 0,
        ];
      } else {
        $trendData[] = $trendMap[$dateStr];
      }
      $current->modify('+1 day');
    }
  }

  error_log('[analytics] sending response');
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
      'filters' => ['appealIds' => $appealIds, 'fundIds' => $fundIds, 'frequency' => $frequency],
      'start' => $startBound,
      'end' => $endBound,
    ]
  ]);
} catch (Throwable $e) {
  error_log('[analytics] error: ' . $e->getMessage());
  error_response('Database error fetching analytics', 500, ['message' => $e->getMessage()]);
}
