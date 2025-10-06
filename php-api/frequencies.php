<?php
// Include bootstrap for DB connection and CORS
require_once __DIR__ . '/_bootstrap.php';

header('Content-Type: application/json');

try {
    // Get parameters
    $startDate = $_GET['startDate'] ?? null;
    $endDate = $_GET['endDate'] ?? null;
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
        // Use literal values for dates to avoid parameter duplication in CTE
        $startDateLiteral = $pdo->quote($startDate);
        $endDateLiteral = $pdo->quote($endDate);

        // Chart data query (optimized: classify tx once, then aggregate)
        $sql = "
        WITH RECURSIVE dates AS (
          SELECT DATE({$startDateLiteral}) AS d
          UNION ALL
          SELECT d + INTERVAL 1 DAY
          FROM dates
          WHERE d + INTERVAL 1 DAY <= DATE({$endDateLiteral})
        ),
        filtered_tx AS (
          SELECT t.id, t.totalamount, DATE(t.date) AS d
          FROM pw_transactions t
          WHERE t.status IN ('Completed', 'pending')
            AND t.date >= {$startDateLiteral}
            AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)";

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

        $sql .= "
            AND EXISTS (
              SELECT 1
              FROM pw_transaction_details d
              JOIN pw_appeal a ON a.id = d.appeal_id
              JOIN pw_fundlist f ON f.id = d.fundlist_id
              WHERE d.TID = t.id
              {$filterClause}
            )";

        $sql .= "
        ),
        tx_freq AS (
          SELECT ft.d,
                 ft.totalamount,
                 MAX(td.freq) AS max_freq
          FROM filtered_tx ft
          JOIN pw_transaction_details td ON td.TID = ft.id
          GROUP BY ft.id, ft.d, ft.totalamount
        ),
        daily_agg AS (
          SELECT
            d,
            SUM(CASE WHEN max_freq = 1 THEN totalamount ELSE 0 END) AS monthly,
            SUM(CASE WHEN max_freq = 0 THEN totalamount ELSE 0 END) AS one_time,
            SUM(CASE WHEN max_freq = 2 THEN totalamount ELSE 0 END) AS yearly,
            SUM(CASE WHEN max_freq = 4 THEN totalamount ELSE 0 END) AS weekly,
            SUM(CASE WHEN max_freq = 3 THEN totalamount ELSE 0 END) AS daily
          FROM tx_freq
          GROUP BY d
        )
        SELECT
          d.d AS `date`,
          COALESCE(a.monthly, 0) AS monthly,
          COALESCE(a.one_time, 0) AS one_time,
          COALESCE(a.yearly, 0) AS yearly,
          COALESCE(a.weekly, 0) AS weekly,
          COALESCE(a.daily, 0) AS daily
        FROM dates d
        LEFT JOIN daily_agg a ON a.d = d.d
        ORDER BY d.d
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => [
                'metric' => 'chart',
                'chartData' => $data
            ]
        ]);

    } elseif ($metric === 'table') {
        // Use literal values for dates to avoid parameter issues
        $startDateLiteral = $pdo->quote($startDate);
        $endDateLiteral = $pdo->quote($endDate);

        // Aggregated table data by transaction-level frequency using DISTINCT transactions
        // Build filter clause for EXISTS (matches analytics.php)
        $filterClause = '';
        if (!empty($appealIdsArray)) {
            $sanitizedAppealIds = array_map('intval', $appealIdsArray);
            $filterClause .= " AND a.id IN (" . implode(',', $sanitizedAppealIds) . ")";
        }
        if (!empty($fundIdsArray)) {
            $sanitizedFundIds = array_map('intval', $fundIdsArray);
            $filterClause .= " AND f.id IN (" . implode(',', $sanitizedFundIds) . ")";
        }

        $sql = "
        WITH freq_map AS (
          SELECT 0 AS freq, 'One-time' AS freq_name
          UNION ALL SELECT 1, 'Monthly'
          UNION ALL SELECT 2, 'Yearly'
          UNION ALL SELECT 3, 'Daily'
          UNION ALL SELECT 4, 'Weekly'
        ),
        filtered_tx AS (
          SELECT t.id, t.totalamount
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
        ),
        tx_freq AS (
          SELECT
            ft.id AS tid,
            CASE MAX(td.freq)
              WHEN 0 THEN 'One-time'
              WHEN 1 THEN 'Monthly'
              WHEN 2 THEN 'Yearly'
              WHEN 3 THEN 'Daily'
              WHEN 4 THEN 'Weekly'
              ELSE 'One-time'
            END AS frequency,
            ft.totalamount AS totalamount
          FROM filtered_tx ft
          JOIN pw_transaction_details td ON td.TID = ft.id
          GROUP BY ft.id
        ),
        agg AS (
          SELECT frequency, COUNT(DISTINCT tid) AS donation_count, SUM(totalamount) AS total_raised
          FROM tx_freq
          GROUP BY frequency
        )
        SELECT
          fm.freq_name AS frequency,
          COALESCE(a.donation_count, 0) AS donations,
          COALESCE(a.total_raised, 0.00) AS totalRaised
        FROM freq_map fm
        LEFT JOIN agg a ON a.frequency = fm.freq_name
        ORDER BY fm.freq
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => [
                'metric' => 'table',
                'tableData' => $data
            ]
        ]);

    } else {
        throw new Exception('Invalid metric parameter. Use "chart" or "table"');
    }

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Frequencies API PDO Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Frequencies API Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
