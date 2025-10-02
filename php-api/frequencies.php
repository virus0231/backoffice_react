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

        // Chart data query
        $sql = "
        WITH RECURSIVE dates AS (
          SELECT DATE({$startDateLiteral}) AS d
          UNION ALL
          SELECT d + INTERVAL 1 DAY
          FROM dates
          WHERE d + INTERVAL 1 DAY <= DATE({$endDateLiteral})
        ),
        daily_agg AS (
          SELECT
            DATE(t.date) AS d,
            SUM(CASE WHEN td.freq = 1 THEN td.amount * td.quantity ELSE 0 END) AS monthly,
            SUM(CASE WHEN td.freq = 0 THEN td.amount * td.quantity ELSE 0 END) AS one_time,
            SUM(CASE WHEN td.freq = 2 THEN td.amount * td.quantity ELSE 0 END) AS yearly,
            SUM(CASE WHEN td.freq = 4 THEN td.amount * td.quantity ELSE 0 END) AS weekly,
            SUM(CASE WHEN td.freq = 3 THEN td.amount * td.quantity ELSE 0 END) AS daily
          FROM pw_transactions t
          JOIN pw_transaction_details td ON td.TID = t.id
          WHERE t.status IN ('Completed', 'pending')
            AND t.date >= {$startDateLiteral}
            AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
        ";

        // Add appeal filter if provided
        if (!empty($appealIdsArray)) {
            $sanitizedAppealIds = array_map('intval', $appealIdsArray);
            $sql .= " AND td.appeal_id IN (" . implode(',', $sanitizedAppealIds) . ")";
        }

        // Add fund filter if provided
        if (!empty($fundIdsArray)) {
            $sanitizedFundIds = array_map('intval', $fundIdsArray);
            $sql .= " AND td.fundlist_id IN (" . implode(',', $sanitizedFundIds) . ")";
        }

        $sql .= "
          GROUP BY DATE(t.date)
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

        // Table data query
        $appealsJson = !empty($appealIdsArray) ? json_encode(array_map('intval', $appealIdsArray)) : '[]';
        $fundsJson = !empty($fundIdsArray) ? json_encode(array_map('intval', $fundIdsArray)) : '[]';

        $sql = "
        WITH
        freq_map AS (
          SELECT 0 AS freq, 'One-time' AS freq_name
          UNION ALL SELECT 1, 'Monthly'
          UNION ALL SELECT 2, 'Yearly'
          UNION ALL SELECT 3, 'Daily'
          UNION ALL SELECT 4, 'Weekly'
        ),
        params AS (
          SELECT CAST(:appeals_json AS JSON) AS appeals,
                 CAST(:funds_json AS JSON) AS funds
        ),
        base AS (
          SELECT
            td.freq,
            (td.amount * td.quantity) AS donation_amount
          FROM pw_transactions t
          JOIN pw_transaction_details td ON td.TID = t.id
          CROSS JOIN params p
          LEFT JOIN JSON_TABLE(p.appeals, '\$[*]' COLUMNS(val INT PATH '\$')) a
                 ON a.val = td.appeal_id
          LEFT JOIN JSON_TABLE(p.funds, '\$[*]' COLUMNS(val INT PATH '\$')) f
                 ON f.val = td.fundlist_id
          WHERE t.status IN ('Completed', 'pending')
            AND t.date >= {$startDateLiteral}
            AND t.date < DATE_ADD({$endDateLiteral}, INTERVAL 1 DAY)
            AND (JSON_LENGTH(p.appeals) = 0 OR a.val IS NOT NULL)
            AND (JSON_LENGTH(p.funds) = 0 OR f.val IS NOT NULL)
        ),
        stats AS (
          SELECT
            b.freq,
            COUNT(*) AS donations,
            ROUND(AVG(b.donation_amount), 2) AS averageAmount,
            ROUND(SUM(b.donation_amount), 2) AS totalRaised
          FROM base b
          GROUP BY b.freq
        ),
        ranked AS (
          SELECT
            b.freq,
            b.donation_amount,
            ROW_NUMBER() OVER (PARTITION BY b.freq ORDER BY b.donation_amount) AS rn,
            COUNT(*) OVER (PARTITION BY b.freq) AS cnt
          FROM base b
        ),
        med AS (
          SELECT
            r.freq,
            ROUND(AVG(r.donation_amount), 2) AS medianAmount
          FROM ranked r
          WHERE r.rn IN (FLOOR((r.cnt + 1)/2), CEIL((r.cnt + 1)/2))
          GROUP BY r.freq
        )
        SELECT
          fm.freq_name AS frequency,
          COALESCE(s.donations, 0) AS donations,
          COALESCE(s.averageAmount, 0.00) AS averageAmount,
          COALESCE(m.medianAmount, 0.00) AS medianAmount,
          COALESCE(s.totalRaised, 0.00) AS totalRaised
        FROM freq_map fm
        LEFT JOIN stats s ON s.freq = fm.freq
        LEFT JOIN med m ON m.freq = fm.freq
        ORDER BY fm.freq
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'appeals_json' => $appealsJson,
            'funds_json' => $fundsJson
        ]);

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
