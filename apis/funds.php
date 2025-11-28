<?php
// Include bootstrap for DB connection and CORS
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

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
    $tables = get_table_names($pdo);

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

            // Build active appeals/campaigns CTE with optional appeal filter - use EXISTS
            $activeAppealsSql = "
            active_appeals AS (
              SELECT DISTINCT
                ap.id AS appeal_id,
                ap.name AS appeal_name
              FROM `{$tables['appeal']}` ap
              WHERE EXISTS (
                SELECT 1
                FROM `{$tables['transaction_details']}` td
                JOIN `{$tables['transactions']}` t ON t.id = td.TID
                WHERE td.appeal_id = ap.id
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

            // Build daily aggregation - group by appeal_id instead of fundlist_id
            $dailyAggSql = "
            daily_agg AS (
              SELECT
                DATE(t.date) AS d,
                td.appeal_id,
                SUM(t.totalamount) AS amount
              FROM `{$tables['transactions']}` t
              JOIN `{$tables['transaction_details']}` td ON td.TID = t.id
              WHERE t.status IN ('Completed', 'pending')
                AND t.date >= {$startDateLiteral}
                AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
                AND EXISTS (
                  SELECT 1
                  FROM `{$tables['transaction_details']}` d
                  JOIN `{$tables['appeal']}` a ON a.id = d.appeal_id
                  JOIN `{$tables['fundlist']}` f ON f.id = d.fundlist_id
                  WHERE d.TID = t.id
                  {$appealFilter}
                )
              GROUP BY DATE(t.date), td.appeal_id
            )";

            // Daily chart data query - grouped by appeal
            $sql = "
            WITH RECURSIVE dates AS (
              SELECT DATE({$startDateLiteral}) AS d
              UNION ALL
              SELECT d + INTERVAL 1 DAY
              FROM dates
              WHERE d + INTERVAL 1 DAY <= DATE({$endDateLiteral})
            ),
            {$activeAppealsSql},
            {$dailyAggSql}
            SELECT
              d.d AS `date`,
              aa.appeal_id,
              aa.appeal_name,
              COALESCE(a.amount, 0) AS amount
            FROM dates d
            CROSS JOIN active_appeals aa
            LEFT JOIN daily_agg a ON a.d = d.d AND a.appeal_id = aa.appeal_id
            ORDER BY d.d, aa.appeal_name
            ";

        } else {
            // Build appeal filter
            $appealFilterActive = '';
            if (!empty($appealIdsArray)) {
                $sanitizedAppealIds = array_map('intval', $appealIdsArray);
                $appealFilterActive = " AND td.appeal_id IN (" . implode(',', $sanitizedAppealIds) . ")";
            }

            // Build active appeals/campaigns CTE with optional appeal filter - use EXISTS
            $activeAppealsSql = "
            active_appeals AS (
              SELECT DISTINCT
                ap.id AS appeal_id,
                ap.name AS appeal_name
              FROM `{$tables['appeal']}` ap
              WHERE EXISTS (
                SELECT 1
                FROM `{$tables['transaction_details']}` td
                JOIN `{$tables['transactions']}` t ON t.id = td.TID
                WHERE td.appeal_id = ap.id
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

            // Build weekly aggregation - group by appeal_id instead of fundlist_id
            $weeklyAggSql = "
            weekly_agg AS (
              SELECT
                YEARWEEK(t.date, 1) AS week_number,
                td.appeal_id,
                SUM(t.totalamount) AS amount
              FROM `{$tables['transactions']}` t
              JOIN `{$tables['transaction_details']}` td ON td.TID = t.id
              WHERE t.status IN ('Completed', 'pending')
                AND t.date >= {$startDateLiteral}
                AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
                AND EXISTS (
                  SELECT 1
                  FROM `{$tables['transaction_details']}` d
                  JOIN `{$tables['appeal']}` a ON a.id = d.appeal_id
                  JOIN `{$tables['fundlist']}` f ON f.id = d.fundlist_id
                  WHERE d.TID = t.id
                  {$appealFilter}
                )
              GROUP BY YEARWEEK(t.date, 1), td.appeal_id
            )";

            // Weekly chart data query - grouped by appeal
            $sql = "
            WITH weeks AS (
              SELECT DISTINCT
                YEARWEEK(date, 1) AS week_number,
                DATE(DATE_SUB(date, INTERVAL WEEKDAY(date) DAY)) AS week_start
              FROM `{$tables['transactions']}`
              WHERE date >= {$startDateLiteral}
                AND date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
            ),
            {$activeAppealsSql},
            {$weeklyAggSql}
            SELECT
              w.week_number,
              w.week_start AS `date`,
              aa.appeal_id,
              aa.appeal_name,
              COALESCE(a.amount, 0) AS amount
            FROM weeks w
            CROSS JOIN active_appeals aa
            LEFT JOIN weekly_agg a ON a.week_number = w.week_number AND a.appeal_id = aa.appeal_id
            ORDER BY w.week_number, aa.appeal_name
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

        // Aggregated table data per appeal/campaign - simplified for speed
        $sql = "
        SELECT
          ap.id AS appeal_id,
          ap.name AS appeal_name,
          COUNT(DISTINCT t.id) AS donation_count,
          SUM(t.totalamount) AS total_raised
        FROM `{$tables['transactions']}` t
        JOIN `{$tables['transaction_details']}` td ON td.TID = t.id
        JOIN `{$tables['appeal']}` ap ON ap.id = td.appeal_id
        WHERE t.status IN ('Completed', 'pending')
          AND t.date >= {$startDateLiteral}
          AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
          AND EXISTS (
            SELECT 1
            FROM `{$tables['transaction_details']}` d
            JOIN `{$tables['appeal']}` a ON a.id = d.appeal_id
            JOIN `{$tables['fundlist']}` f ON f.id = d.fundlist_id
            WHERE d.TID = t.id
            {$appealFilter}
          )
        GROUP BY ap.id, ap.name
        ORDER BY total_raised DESC, ap.name";

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
