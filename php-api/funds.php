<?php
// Include bootstrap for DB connection and CORS
require_once __DIR__ . '/_bootstrap.php';

header('Content-Type: application/json');

try {
    // Get parameters
    $startDate = $_GET['startDate'] ?? null;
    $endDate = $_GET['endDate'] ?? null;
    $granularity = $_GET['granularity'] ?? 'daily'; // 'daily' or 'weekly'
    $metric = $_GET['metric'] ?? 'chart'; // 'chart' or 'table'
    $appealIds = $_GET['appealId'] ?? null;

    // Validate required parameters
    if (!$startDate || !$endDate) {
        throw new Exception('startDate and endDate are required');
    }

    // Get database connection
    $pdo = get_pdo();

    // Convert appeal IDs to array
    $appealIdsArray = $appealIds ? explode(',', $appealIds) : [];

    if ($metric === 'chart') {
        // Use literal values for dates
        $startDateLiteral = $pdo->quote($startDate);
        $endDateLiteral = $pdo->quote($endDate);

        if ($granularity === 'daily') {
            // Build appeal filter
            $appealFilterActive = '';
            if (!empty($appealIdsArray)) {
                $sanitizedAppealIds = array_map('intval', $appealIdsArray);
                $appealFilterActive = " AND td.appeal_id IN (" . implode(',', $sanitizedAppealIds) . ")";
            }

            // Build active funds CTE with optional appeal filter - use EXISTS
            $activeFundsSql = "
            active_funds AS (
              SELECT DISTINCT
                fl.id AS fund_id,
                fl.name AS fund_name,
                fl.appeal_id,
                ap.name AS appeal_name
              FROM pw_fundlist fl
              LEFT JOIN pw_appeal ap ON ap.id = fl.appeal_id
              WHERE fl.disable = 0
                AND EXISTS (
                  SELECT 1
                  FROM pw_transaction_details td
                  JOIN pw_transactions t ON t.id = td.TID
                  WHERE td.fundlist_id = fl.id
                    AND t.status IN ('Completed', 'pending')
                    AND t.date >= {$startDateLiteral}
                    AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
                    {$appealFilterActive}
                )
            )";

            // Build appeal filter for EXISTS (MATCH analytics.php pattern)
            $appealFilter = '';
            if (!empty($appealIdsArray)) {
                $sanitizedAppealIds = array_map('intval', $appealIdsArray);
                $appealFilter = " AND a.id IN (" . implode(',', $sanitizedAppealIds) . ")";
            }

            // Build daily aggregation - simplified without PARTITION BY (faster)
            $dailyAggSql = "
            daily_agg AS (
              SELECT
                DATE(t.date) AS d,
                td.fundlist_id,
                SUM(t.totalamount) AS amount
              FROM pw_transactions t
              JOIN pw_transaction_details td ON td.TID = t.id
              WHERE t.status IN ('Completed', 'pending')
                AND t.date >= {$startDateLiteral}
                AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
                AND EXISTS (
                  SELECT 1
                  FROM pw_transaction_details d
                  JOIN pw_appeal a ON a.id = d.appeal_id
                  JOIN pw_fundlist f ON f.id = d.fundlist_id
                  WHERE d.TID = t.id
                  {$appealFilter}
                )
              GROUP BY DATE(t.date), td.fundlist_id
            )";

            // Daily chart data query
            $sql = "
            WITH RECURSIVE dates AS (
              SELECT DATE({$startDateLiteral}) AS d
              UNION ALL
              SELECT d + INTERVAL 1 DAY
              FROM dates
              WHERE d + INTERVAL 1 DAY <= DATE({$endDateLiteral})
            ),
            {$activeFundsSql},
            {$dailyAggSql}
            SELECT
              d.d AS `date`,
              af.fund_id,
              af.fund_name,
              af.appeal_id,
              af.appeal_name,
              COALESCE(a.amount, 0) AS amount
            FROM dates d
            CROSS JOIN active_funds af
            LEFT JOIN daily_agg a ON a.d = d.d AND a.fundlist_id = af.fund_id
            ORDER BY d.d, af.appeal_name, af.fund_name
            ";

        } else {
            // Build appeal filter
            $appealFilterActive = '';
            if (!empty($appealIdsArray)) {
                $sanitizedAppealIds = array_map('intval', $appealIdsArray);
                $appealFilterActive = " AND td.appeal_id IN (" . implode(',', $sanitizedAppealIds) . ")";
            }

            // Build active funds CTE with optional appeal filter - use EXISTS
            $activeFundsSql = "
            active_funds AS (
              SELECT DISTINCT
                fl.id AS fund_id,
                fl.name AS fund_name,
                fl.appeal_id,
                ap.name AS appeal_name
              FROM pw_fundlist fl
              LEFT JOIN pw_appeal ap ON ap.id = fl.appeal_id
              WHERE fl.disable = 0
                AND EXISTS (
                  SELECT 1
                  FROM pw_transaction_details td
                  JOIN pw_transactions t ON t.id = td.TID
                  WHERE td.fundlist_id = fl.id
                    AND t.status IN ('Completed', 'pending')
                    AND t.date >= {$startDateLiteral}
                    AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
                    {$appealFilterActive}
                )
            )";

            // Build appeal filter for EXISTS (MATCH analytics.php pattern)
            $appealFilter = '';
            if (!empty($appealIdsArray)) {
                $sanitizedAppealIds = array_map('intval', $appealIdsArray);
                $appealFilter = " AND a.id IN (" . implode(',', $sanitizedAppealIds) . ")";
            }

            // Build weekly aggregation - simplified without PARTITION BY (faster)
            $weeklyAggSql = "
            weekly_agg AS (
              SELECT
                YEARWEEK(t.date, 1) AS week_number,
                td.fundlist_id,
                SUM(t.totalamount) AS amount
              FROM pw_transactions t
              JOIN pw_transaction_details td ON td.TID = t.id
              WHERE t.status IN ('Completed', 'pending')
                AND t.date >= {$startDateLiteral}
                AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
                AND EXISTS (
                  SELECT 1
                  FROM pw_transaction_details d
                  JOIN pw_appeal a ON a.id = d.appeal_id
                  JOIN pw_fundlist f ON f.id = d.fundlist_id
                  WHERE d.TID = t.id
                  {$appealFilter}
                )
              GROUP BY YEARWEEK(t.date, 1), td.fundlist_id
            )";

            // Weekly chart data query
            $sql = "
            WITH weeks AS (
              SELECT DISTINCT
                YEARWEEK(date, 1) AS week_number,
                DATE(DATE_SUB(date, INTERVAL WEEKDAY(date) DAY)) AS week_start
              FROM pw_transactions
              WHERE date >= {$startDateLiteral}
                AND date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
            ),
            {$activeFundsSql},
            {$weeklyAggSql}
            SELECT
              w.week_number,
              w.week_start AS `date`,
              af.fund_id,
              af.fund_name,
              af.appeal_id,
              af.appeal_name,
              COALESCE(a.amount, 0) AS amount
            FROM weeks w
            CROSS JOIN active_funds af
            LEFT JOIN weekly_agg a ON a.week_number = w.week_number AND a.fundlist_id = af.fund_id
            ORDER BY w.week_number, af.appeal_name, af.fund_name
            ";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => [
                'metric' => 'chart',
                'granularity' => $granularity,
                'chartData' => $data
            ]
        ]);

    } elseif ($metric === 'table') {
        // Use literal values for dates
        $startDateLiteral = $pdo->quote($startDate);
        $endDateLiteral = $pdo->quote($endDate);

        // Build appeal filter for EXISTS (MATCH analytics.php pattern)
        $appealFilter = '';
        if (!empty($appealIdsArray)) {
            $sanitizedAppealIds = array_map('intval', $appealIdsArray);
            $appealFilter = " AND a.id IN (" . implode(',', $sanitizedAppealIds) . ")";
        }

        // Aggregated table data per fund - simplified for speed
        $sql = "
        SELECT
          fl.id AS fund_id,
          fl.name AS fund_name,
          fl.appeal_id,
          ap.name AS appeal_name,
          COUNT(DISTINCT t.id) AS donation_count,
          SUM(t.totalamount) AS total_raised
        FROM pw_transactions t
        JOIN pw_transaction_details td ON td.TID = t.id
        JOIN pw_fundlist fl ON fl.id = td.fundlist_id AND fl.disable = 0
        LEFT JOIN pw_appeal ap ON ap.id = fl.appeal_id
        WHERE t.status IN ('Completed', 'pending')
          AND t.date >= {$startDateLiteral}
          AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
          AND EXISTS (
            SELECT 1
            FROM pw_transaction_details d
            JOIN pw_appeal a ON a.id = d.appeal_id
            JOIN pw_fundlist f ON f.id = d.fundlist_id
            WHERE d.TID = t.id
            {$appealFilter}
          )
        GROUP BY fl.id, fl.name, fl.appeal_id, ap.name
        ORDER BY total_raised DESC, ap.name, fl.name";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        $rawData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => [
                'metric' => 'table',
                'tableData' => $rawData
            ]
        ]);

    } else {
        throw new Exception('Invalid metric parameter. Use "chart" or "table"');
    }

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Funds API PDO Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Funds API Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
