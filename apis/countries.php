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
    $fundIds = $_GET['fundId'] ?? null;

    // Validate required parameters
    if (!$startDate || !$endDate) {
        throw new Exception('startDate and endDate are required');
    }

    // Get database connection
    $pdo = get_pdo();

    // Convert appeal and fund IDs to arrays
    $appealIdsArray = $appealIds ? explode(',', $appealIds) : [];
    $fundIdsArray = $fundIds ? explode(',', $fundIds) : [];

    if ($metric === 'chart') {
        // Use literal values for dates
        $startDateLiteral = $pdo->quote($startDate);
        $endDateLiteral = $pdo->quote($endDate);

        if ($granularity === 'daily') {
            // Build filter clause for EXISTS subquery (MATCH analytics.php pattern)
            $filterClause = '';
            if (!empty($appealIdsArray)) {
                $sanitizedAppealIds = array_map('intval', $appealIdsArray);
                $filterClause .= " AND a.id IN (" . implode(',', $sanitizedAppealIds) . ")";
            }
            if (!empty($fundIdsArray)) {
                $sanitizedFundIds = array_map('intval', $fundIdsArray);
                $filterClause .= " AND f.id IN (" . implode(',', $sanitizedFundIds) . ")";
            }

            // Build active countries CTE with optional filters - MATCH analytics.php EXISTS pattern
            $activeCountriesSql = "
            active_countries AS (
              SELECT DISTINCT
                COALESCE(NULLIF(don.country, ''), 'Unknown') AS country_code
              FROM pw_transactions t
              JOIN pw_donors don ON don.id = t.DID
              WHERE t.status IN ('Completed', 'pending')
                AND t.date >= {$startDateLiteral}
                AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
                AND EXISTS (
                  SELECT 1
                  FROM pw_transaction_details d
                  JOIN pw_appeal a ON a.id = d.appeal_id
                  JOIN pw_fundlist f ON f.id = d.fundlist_id
                  WHERE d.TID = t.id
                  {$filterClause}
                )
            )";

            // Build daily aggregation with optional filters - MATCH analytics.php pattern
            $dailyAggSql = "
            daily_agg AS (
              SELECT
                DATE(t.date) AS d,
                COALESCE(NULLIF(don.country, ''), 'Unknown') AS country_code,
                SUM(t.totalamount) AS amount
              FROM pw_transactions t
              JOIN pw_donors don ON don.id = t.DID
              WHERE t.status IN ('Completed', 'pending')
                AND t.date >= {$startDateLiteral}
                AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
                AND EXISTS (
                  SELECT 1
                  FROM pw_transaction_details d
                  JOIN pw_appeal a ON a.id = d.appeal_id
                  JOIN pw_fundlist f ON f.id = d.fundlist_id
                  WHERE d.TID = t.id
                  {$filterClause}
                )
              GROUP BY DATE(t.date), COALESCE(NULLIF(don.country, ''), 'Unknown')
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
            {$activeCountriesSql},
            {$dailyAggSql}
            SELECT
              dt.d AS `date`,
              ac.country_code,
              COALESCE(da.amount, 0) AS amount
            FROM dates dt
            CROSS JOIN active_countries ac
            LEFT JOIN daily_agg da ON da.d = dt.d AND da.country_code = ac.country_code
            ORDER BY dt.d, ac.country_code
            ";

        } else {
            // Build filter clause for EXISTS subquery (MATCH analytics.php pattern)
            $filterClause = '';
            if (!empty($appealIdsArray)) {
                $sanitizedAppealIds = array_map('intval', $appealIdsArray);
                $filterClause .= " AND a.id IN (" . implode(',', $sanitizedAppealIds) . ")";
            }
            if (!empty($fundIdsArray)) {
                $sanitizedFundIds = array_map('intval', $fundIdsArray);
                $filterClause .= " AND f.id IN (" . implode(',', $sanitizedFundIds) . ")";
            }

            // Build active countries CTE with optional filters - MATCH analytics.php EXISTS pattern
            $activeCountriesSql = "
            active_countries AS (
              SELECT DISTINCT
                COALESCE(NULLIF(don.country, ''), 'Unknown') AS country_code
              FROM pw_transactions t
              JOIN pw_donors don ON don.id = t.DID
              WHERE t.status IN ('Completed', 'pending')
                AND t.date >= {$startDateLiteral}
                AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
                AND EXISTS (
                  SELECT 1
                  FROM pw_transaction_details d
                  JOIN pw_appeal a ON a.id = d.appeal_id
                  JOIN pw_fundlist f ON f.id = d.fundlist_id
                  WHERE d.TID = t.id
                  {$filterClause}
                )
            )";

            // Build weekly aggregation with optional filters - MATCH analytics.php pattern
            $weeklyAggSql = "
            weekly_agg AS (
              SELECT
                YEARWEEK(t.date, 1) AS week_number,
                COALESCE(NULLIF(don.country, ''), 'Unknown') AS country_code,
                SUM(t.totalamount) AS amount
              FROM pw_transactions t
              JOIN pw_donors don ON don.id = t.DID
              WHERE t.status IN ('Completed', 'pending')
                AND t.date >= {$startDateLiteral}
                AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
                AND EXISTS (
                  SELECT 1
                  FROM pw_transaction_details d
                  JOIN pw_appeal a ON a.id = d.appeal_id
                  JOIN pw_fundlist f ON f.id = d.fundlist_id
                  WHERE d.TID = t.id
                  {$filterClause}
                )
              GROUP BY YEARWEEK(t.date, 1), COALESCE(NULLIF(don.country, ''), 'Unknown')
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
            {$activeCountriesSql},
            {$weeklyAggSql}
            SELECT
              w.week_number,
              w.week_start AS `date`,
              ac.country_code,
              COALESCE(wa.amount, 0) AS amount
            FROM weeks w
            CROSS JOIN active_countries ac
            LEFT JOIN weekly_agg wa ON wa.week_number = w.week_number AND wa.country_code = ac.country_code
            ORDER BY w.week_number, ac.country_code
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

        // Build filter clause for EXISTS subquery (MATCH analytics.php pattern)
        $filterClause = '';
        if (!empty($appealIdsArray)) {
            $sanitizedAppealIds = array_map('intval', $appealIdsArray);
            $filterClause .= " AND a.id IN (" . implode(',', $sanitizedAppealIds) . ")";
        }
        if (!empty($fundIdsArray)) {
            $sanitizedFundIds = array_map('intval', $fundIdsArray);
            $filterClause .= " AND f.id IN (" . implode(',', $sanitizedFundIds) . ")";
        }

        // Aggregated table data per country using DISTINCT transactions
        $sql = "
        WITH filtered_tx AS (
          SELECT t.id, t.DID, t.totalamount
          FROM pw_transactions t
          WHERE t.status IN ('Completed', 'pending')
            AND t.date >= {$startDateLiteral}
            AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
            AND EXISTS (
              SELECT 1
              FROM pw_transaction_details d
              JOIN pw_appeal a ON a.id = d.appeal_id
              JOIN pw_fundlist f ON f.id = d.fundlist_id
              WHERE d.TID = t.id
              {$filterClause}
            )
        )
        SELECT
          COALESCE(NULLIF(d.country, ''), 'Unknown') AS country_code,
          COUNT(DISTINCT tx.id) AS donation_count,
          SUM(tx.totalamount) AS total_raised
        FROM filtered_tx tx
        JOIN pw_donors d ON d.id = tx.DID
        WHERE d.country IS NOT NULL AND d.country != ''
        GROUP BY COALESCE(NULLIF(d.country, ''), 'Unknown')
        ORDER BY country_code";

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
    error_log("Countries API PDO Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Countries API Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
