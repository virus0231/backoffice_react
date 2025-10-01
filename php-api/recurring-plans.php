<?php
require_once __DIR__ . '/_bootstrap.php';

// Parameters
$metric = isset($_GET['metric']) ? $_GET['metric'] : null; // 'active-plans' | 'new-plans' | 'canceled-plans'
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null; // yyyy-mm-dd
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null; // yyyy-mm-dd
$granularity = isset($_GET['granularity']) ? $_GET['granularity'] : 'daily'; // daily | weekly

// Handle comma-separated IDs for appeals and funds
$appealIdRaw = isset($_GET['appealId']) ? $_GET['appealId'] : null;
$fundIdRaw = isset($_GET['fundId']) ? $_GET['fundId'] : null;

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

if (!$metric || !$startDate || !$endDate) {
  error_response('Missing metric/startDate/endDate', 400);
  exit;
}

set_time_limit(30);
error_log('[recurring-plans] start, metric=' . $metric);

[$startBound, $endBound] = build_day_bounds($startDate, $endDate);
if (!$startBound || !$endBound) {
  error_response('Invalid startDate/endDate format (expected YYYY-MM-DD)', 400);
  exit;
}

try {
  error_log('[recurring-plans] acquiring PDO');
  $pdo = get_pdo();
  error_log('[recurring-plans] PDO ready');

  $trendData = [];

  if ($metric === 'active-plans') {
    // Build filter clause for appeals and funds
    $filterClause = '';
    $bindings = [
      ':start_date' => $startDate,
      ':end_date' => $endDate,
    ];

    if ($appealIds && !empty($appealIds)) {
      $placeholders = [];
      foreach ($appealIds as $idx => $id) {
        $key = ":appealId_{$idx}";
        $placeholders[] = $key;
        $bindings[$key] = (int)$id;
      }
      $filterClause .= ' AND td.appeal_id IN (' . implode(',', $placeholders) . ')';
    }

    if ($fundIds && !empty($fundIds)) {
      $placeholders = [];
      foreach ($fundIds as $idx => $id) {
        $key = ":fundId_{$idx}";
        $placeholders[] = $key;
        $bindings[$key] = (int)$id;
      }
      $filterClause .= ' AND td.fundlist_id IN (' . implode(',', $placeholders) . ')';
    }

    $sql = "
      WITH RECURSIVE date_series AS (
        SELECT DATE(:start_date) AS d
        UNION ALL
        SELECT d + INTERVAL 1 DAY
        FROM date_series
        WHERE d < :end_date
      ),
      all_schedules AS (
        SELECT s.startdate, s.nextrun_date, s.remainingcount, s.status
        FROM pw_schedule s
        LEFT JOIN pw_transaction_details td ON s.td_id = td.id
        WHERE s.status = 'ACTIVE'
          AND (s.plan_id IS NOT NULL AND s.sub_id IS NOT NULL)
          {$filterClause}
      )
      SELECT
        ds.d AS date,
        COUNT(s.startdate) AS value
      FROM date_series ds
      LEFT JOIN all_schedules s ON s.startdate <= ds.d
      GROUP BY ds.d
      ORDER BY ds.d
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($bindings);
    $trendData = $stmt->fetchAll(PDO::FETCH_ASSOC);

  } elseif ($metric === 'new-plans') {
    // Build filter clause for appeals and funds
    $filterClause = '';
    $bindings = [
      ':start_date' => $startDate,
      ':end_date' => $endDate,
    ];

    if ($appealIds && !empty($appealIds)) {
      $placeholders = [];
      foreach ($appealIds as $idx => $id) {
        $key = ":appealId_{$idx}";
        $placeholders[] = $key;
        $bindings[$key] = (int)$id;
      }
      $filterClause .= ' AND td.appeal_id IN (' . implode(',', $placeholders) . ')';
    }

    if ($fundIds && !empty($fundIds)) {
      $placeholders = [];
      foreach ($fundIds as $idx => $id) {
        $key = ":fundId_{$idx}";
        $placeholders[] = $key;
        $bindings[$key] = (int)$id;
      }
      $filterClause .= ' AND td.fundlist_id IN (' . implode(',', $placeholders) . ')';
    }

    $sql = "
      WITH RECURSIVE date_series AS (
        SELECT DATE(:start_date) AS d
        UNION ALL
        SELECT d + INTERVAL 1 DAY FROM date_series WHERE d < :end_date
      ),
      filtered AS (
        SELECT DATE(s.startdate) AS d, s.id
        FROM pw_schedule s
        JOIN pw_transaction_details td ON td.id = s.td_id
        WHERE s.status = 'ACTIVE'
          {$filterClause}
      )
      SELECT ds.d AS date, COALESCE(COUNT(f.id), 0) AS value
      FROM date_series ds
      LEFT JOIN filtered f ON f.d = ds.d
      GROUP BY ds.d
      ORDER BY ds.d
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($bindings);
    $trendData = $stmt->fetchAll(PDO::FETCH_ASSOC);

  } elseif ($metric === 'canceled-plans') {
    // Canceled plans - only date filter (no appeal/fund filters per requirements)
    $bindings = [
      ':start_date' => $startDate,
      ':end_date' => $endDate,
      ':end_date_incl' => $endDate, // For the WHERE clause
    ];

    $sql = "
      WITH RECURSIVE dates AS (
        SELECT DATE(:start_date) AS d
        UNION ALL
        SELECT d + INTERVAL 1 DAY
        FROM dates
        WHERE d + INTERVAL 1 DAY <= :end_date
      ),
      agg AS (
        SELECT DATE(`date`) AS d, COUNT(*) AS cancellations
        FROM pw_stripewebhooks
        WHERE event IN ('subscription_schedule.canceled')
          AND `date` >= :start_date
          AND `date` < DATE_ADD(:end_date_incl, INTERVAL 1 DAY)
        GROUP BY DATE(`date`)
      )
      SELECT
        dates.d AS `date`,
        COALESCE(agg.cancellations, 0) AS value
      FROM dates
      LEFT JOIN agg ON agg.d = dates.d
      ORDER BY dates.d
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($bindings);
    $trendData = $stmt->fetchAll(PDO::FETCH_ASSOC);

  } else {
    error_response('Invalid metric. Must be active-plans, new-plans, or canceled-plans', 400);
    exit;
  }

  // Aggregate to weekly if requested
  if ($granularity === 'weekly' && !empty($trendData)) {
    $trendData = aggregate_to_weekly($trendData);
  }

  json_response([
    'success' => true,
    'data' => [
      'metric' => $metric,
      'trendData' => $trendData
    ]
  ]);

} catch (PDOException $e) {
  error_log('[recurring-plans] PDOException: ' . $e->getMessage());
  error_response('Database error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
  error_log('[recurring-plans] Exception: ' . $e->getMessage());
  error_response('Server error: ' . $e->getMessage(), 500);
}

/**
 * Aggregate daily data to weekly
 */
function aggregate_to_weekly(array $dailyData): array {
  if (empty($dailyData)) return [];

  $weeklyMap = [];

  foreach ($dailyData as $row) {
    $date = new DateTime($row['date']);
    // Get Monday of the week
    $weekStart = clone $date;
    $dayOfWeek = (int)$date->format('N'); // 1 (Monday) to 7 (Sunday)
    $weekStart->modify('-' . ($dayOfWeek - 1) . ' days');
    $weekKey = $weekStart->format('Y-m-d');

    if (!isset($weeklyMap[$weekKey])) {
      $weeklyMap[$weekKey] = [
        'date' => $weekKey,
        'value' => 0
      ];
    }

    $weeklyMap[$weekKey]['value'] += (int)$row['value'];
  }

  // Sort by date
  ksort($weeklyMap);

  return array_values($weeklyMap);
}
