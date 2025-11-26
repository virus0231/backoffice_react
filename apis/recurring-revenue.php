<?php
require_once __DIR__ . '/_bootstrap.php';

// Parameters
$metric = isset($_GET['metric']) ? $_GET['metric'] : null; // 'mrr' | 'donation-amounts' | 'share-of-revenue'
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
error_log('[recurring-revenue] start, metric=' . $metric);

[$startBound, $endBound] = build_day_bounds($startDate, $endDate);
if (!$startBound || !$endBound) {
  error_response('Invalid startDate/endDate format (expected YYYY-MM-DD)', 400);
  exit;
}

try {
  error_log('[recurring-revenue] acquiring PDO');
  $pdo = get_pdo();
  error_log('[recurring-revenue] PDO ready');

  $trendData = [];

  if ($metric === 'mrr') {
    // Build filter clause for appeals and funds
    $appealFilter = '';
    $fundFilter = '';
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
      $appealFilter = 'AND td.appeal_id IN (' . implode(',', $placeholders) . ')';
    }

    if ($fundIds && !empty($fundIds)) {
      $placeholders = [];
      foreach ($fundIds as $idx => $id) {
        $key = ":fundId_{$idx}";
        $placeholders[] = $key;
        $bindings[$key] = (int)$id;
      }
      $fundFilter = 'AND td.fundlist_id IN (' . implode(',', $placeholders) . ')';
    }

    $sql = "
      WITH RECURSIVE date_series AS (
        SELECT DATE(:start_date) AS d
        UNION ALL
        SELECT d + INTERVAL 1 DAY
        FROM date_series
        WHERE d < :end_date
      ),
      active_plans AS (
        SELECT
          s.id,
          s.startdate,
          s.status,
          s.amount,
          s.frequency,
          td.appeal_id,
          td.fundlist_id
        FROM pw_schedule s
        JOIN pw_transaction_details td ON s.td_id = td.id
        WHERE s.status = 'ACTIVE'
          AND (s.plan_id IS NOT NULL AND s.sub_id IS NOT NULL)
          {$appealFilter}
          {$fundFilter}
      )
      SELECT
        ds.d AS `date`,
        ROUND(SUM(
          CASE
            WHEN ap.frequency = 'MONTHLY' THEN ap.amount
            WHEN ap.frequency = 'WEEKLY' THEN ap.amount * 4.33
            WHEN ap.frequency = 'DAILY' THEN ap.amount * 30.42
            WHEN ap.frequency = 'YEARLY' THEN ap.amount / 12
            ELSE 0
          END
        ), 2) AS mrr
      FROM date_series ds
      LEFT JOIN active_plans ap
        ON ap.startdate <= ds.d
      GROUP BY ds.d
      ORDER BY ds.d
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($bindings);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert mrr to value for consistency
    $trendData = array_map(function($row) {
      return ['date' => $row['date'], 'value' => (float)$row['mrr']];
    }, $rows);

  } elseif ($metric === 'share-of-revenue') {
    // Share of recurring revenue: (Daily Recurring Revenue / Daily Total Revenue) * 100
    $appealFilter = '';
    $fundFilter = '';
    $bindings = [];

    // Use literal values to avoid parameter binding issues with CTEs
    $startDateLiteral = $pdo->quote($startDate);
    $endDateLiteral = $pdo->quote($endDate);

    // Build filters using literal values instead of placeholders
    if ($appealIds && !empty($appealIds)) {
      $sanitizedIds = array_map('intval', $appealIds);
      $appealFilter = 'AND a.id IN (' . implode(',', $sanitizedIds) . ')';
    }

    if ($fundIds && !empty($fundIds)) {
      $sanitizedIds = array_map('intval', $fundIds);
      $fundFilter = 'AND f.id IN (' . implode(',', $sanitizedIds) . ')';
    }

    $sql = "
      WITH RECURSIVE dates AS (
        SELECT DATE({$startDateLiteral}) AS d
        UNION ALL
        SELECT d + INTERVAL 1 DAY
        FROM dates
        WHERE d + INTERVAL 1 DAY <= DATE({$endDateLiteral})
      ),
      daily_totals AS (
        SELECT
          DATE(t.date) AS d,
          SUM(t.totalamount) AS total
        FROM pw_transactions t
        WHERE t.status IN ('Completed','pending')
          AND t.date >= {$startDateLiteral}
          AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
          AND EXISTS (
            SELECT 1
            FROM pw_transaction_details td2
            JOIN pw_appeal a ON a.id = td2.appeal_id
            JOIN pw_fundlist f ON f.id = td2.fundlist_id
            WHERE td2.TID = t.id
            {$appealFilter}
            {$fundFilter}
          )
        GROUP BY DATE(t.date)
      ),
      daily_recurring AS (
        SELECT
          DATE(t.date) AS d,
          SUM(t.totalamount) AS recurring
        FROM pw_transactions t
        WHERE t.status IN ('Completed','pending')
          AND t.date >= {$startDateLiteral}
          AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
          AND EXISTS (
            SELECT 1
            FROM pw_transaction_details td2
            JOIN pw_appeal a ON a.id = td2.appeal_id
            JOIN pw_fundlist f ON f.id = td2.fundlist_id
            WHERE td2.TID = t.id
              AND td2.freq >= 1
            {$appealFilter}
            {$fundFilter}
          )
        GROUP BY DATE(t.date)
      )
      SELECT
        d.d AS `date`,
        ROUND(
          CASE
            WHEN COALESCE(dt.total, 0) > 0
              THEN (COALESCE(dr.recurring, 0) / dt.total) * 100
            ELSE 0
          END, 1
        ) AS value
      FROM dates d
      LEFT JOIN daily_totals dt ON dt.d = d.d
      LEFT JOIN daily_recurring dr ON dr.d = d.d
      ORDER BY d.d
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($bindings);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert to value format for consistency
    $trendData = array_map(function($row) {
      return [
        'date' => $row['date'],
        'value' => (float)$row['value']
      ];
    }, $rows);

  } elseif ($metric === 'donation-amounts') {
    // Donation amounts distribution - snapshot at end date
    $appealFilter = '';
    $fundFilter = '';
    $bindings = [
      ':snapshot_date' => $endDate,
    ];

    if ($appealIds && !empty($appealIds)) {
      $placeholders = [];
      foreach ($appealIds as $idx => $id) {
        $key = ":appealId_{$idx}";
        $placeholders[] = $key;
        $bindings[$key] = (int)$id;
      }
      $appealFilter = 'AND td.appeal_id IN (' . implode(',', $placeholders) . ')';
    }

    if ($fundIds && !empty($fundIds)) {
      $placeholders = [];
      foreach ($fundIds as $idx => $id) {
        $key = ":fundId_{$idx}";
        $placeholders[] = $key;
        $bindings[$key] = (int)$id;
      }
      $fundFilter = 'AND td.fundlist_id IN (' . implode(',', $placeholders) . ')';
    }

    $sql = "
      WITH active_plans AS (
        SELECT
          s.amount,
          s.frequency
        FROM pw_schedule s
        JOIN pw_transaction_details td ON s.td_id = td.id
        WHERE s.status = 'ACTIVE'
          AND (s.plan_id IS NOT NULL AND s.sub_id IS NOT NULL)
          AND s.startdate <= :snapshot_date
          {$appealFilter}
          {$fundFilter}
      ),
      monthly_amounts AS (
        SELECT
          CASE
            WHEN frequency = 'MONTHLY' THEN amount
            WHEN frequency = 'WEEKLY' THEN amount * 4.33
            WHEN frequency = 'DAILY' THEN amount * 30.42
            WHEN frequency = 'YEARLY' THEN amount / 12
            ELSE 0
          END AS monthly_amount
        FROM active_plans
      )
      SELECT
        CASE
          WHEN monthly_amount >= 0 AND monthly_amount < 5 THEN '\$0 - \$5'
          WHEN monthly_amount >= 5 AND monthly_amount < 11 THEN '\$5 - \$11'
          WHEN monthly_amount >= 11 AND monthly_amount < 21 THEN '\$11 - \$21'
          WHEN monthly_amount >= 21 AND monthly_amount < 50 THEN '\$21 - \$50'
          ELSE '\$50 and more'
        END AS amount_range,
        COUNT(*) AS plan_count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM monthly_amounts)), 0) AS percentage
      FROM monthly_amounts
      GROUP BY amount_range
      ORDER BY
        CASE amount_range
          WHEN '\$0 - \$5' THEN 1
          WHEN '\$5 - \$11' THEN 2
          WHEN '\$11 - \$21' THEN 3
          WHEN '\$21 - \$50' THEN 4
          WHEN '\$50 and more' THEN 5
        END
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($bindings);
    $trendData = $stmt->fetchAll(PDO::FETCH_ASSOC);

  } else {
    error_response('Invalid metric. Must be mrr, donation-amounts, or share-of-revenue', 400);
    exit;
  }

  // Aggregate to weekly if requested (for MRR and share-of-revenue)
  if ($granularity === 'weekly' && in_array($metric, ['mrr', 'share-of-revenue']) && !empty($trendData)) {
    $trendData = aggregate_to_weekly_last($trendData);
  }

  json_response([
    'success' => true,
    'data' => [
      'metric' => $metric,
      'trendData' => $trendData
    ]
  ]);

} catch (PDOException $e) {
  error_log('[recurring-revenue] PDOException: ' . $e->getMessage());
  error_response('Database error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
  error_log('[recurring-revenue] Exception: ' . $e->getMessage());
  error_response('Server error: ' . $e->getMessage(), 500);
}

/**
 * Aggregate daily MRR data to weekly by taking last value
 * (MRR is a snapshot metric, not a sum)
 */
function aggregate_to_weekly_last(array $dailyData): array {
  if (empty($dailyData)) return [];

  $weeklyMap = [];

  foreach ($dailyData as $row) {
    $date = new DateTime($row['date']);
    // Get Monday of the week
    $dayOfWeek = (int)$date->format('N'); // 1 (Monday) to 7 (Sunday)
    $weekStart = clone $date;
    $weekStart->modify('-' . ($dayOfWeek - 1) . ' days');
    $weekKey = $weekStart->format('Y-m-d');

    if (!isset($weeklyMap[$weekKey])) {
      $weeklyMap[$weekKey] = [];
    }

    $weeklyMap[$weekKey][] = $row;
  }

  // Take the last value of each week
  $result = [];
  foreach ($weeklyMap as $weekKey => $rows) {
    $lastRow = end($rows);
    $result[] = [
      'date' => $weekKey,
      'value' => $lastRow['value']
    ];
  }

  // Sort by date
  usort($result, function($a, $b) {
    return strcmp($a['date'], $b['date']);
  });

  return $result;
}
