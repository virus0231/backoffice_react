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
            // Daily chart data query
            $sql = "
            WITH RECURSIVE dates AS (
              SELECT DATE({$startDateLiteral}) AS d
              UNION ALL
              SELECT d + INTERVAL 1 DAY
              FROM dates
              WHERE d + INTERVAL 1 DAY <= DATE({$endDateLiteral})
            ),
            payment_types AS (
              SELECT DISTINCT paymenttype FROM pw_transactions
            ),
            daily_agg AS (
              SELECT
                DATE(t.date) AS d,
                t.paymenttype,
                SUM(t.totalamount) AS amount
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
                )
              GROUP BY DATE(t.date), t.paymenttype
            )
            SELECT
              d.d AS `date`,
              pt.paymenttype,
              COALESCE(a.amount, 0) AS amount
            FROM dates d
            CROSS JOIN payment_types pt
            LEFT JOIN daily_agg a ON a.d = d.d AND a.paymenttype = pt.paymenttype
            ORDER BY d.d, pt.paymenttype
            ";

        } else {
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
            payment_types AS (
              SELECT DISTINCT paymenttype FROM pw_transactions
            ),
            weekly_agg AS (
              SELECT
                YEARWEEK(t.date, 1) AS week_number,
                t.paymenttype,
                SUM(t.totalamount) AS amount
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
                )
              GROUP BY YEARWEEK(t.date, 1), t.paymenttype
            )
            SELECT
              w.week_number,
              w.week_start AS `date`,
              pt.paymenttype,
              COALESCE(a.amount, 0) AS amount
            FROM weeks w
            CROSS JOIN payment_types pt
            LEFT JOIN weekly_agg a ON a.week_number = w.week_number AND a.paymenttype = pt.paymenttype
            ORDER BY w.week_number, pt.paymenttype
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

        // Aggregated table data per payment method using DISTINCT transactions
        $sql = "
        WITH filtered_tx AS (
          SELECT t.id, t.paymenttype, t.totalamount
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
        payment_types AS (
          SELECT DISTINCT paymenttype FROM pw_transactions
        ),
        agg AS (
          SELECT paymenttype, COUNT(DISTINCT id) AS donation_count, SUM(totalamount) AS total_raised
          FROM filtered_tx
          GROUP BY paymenttype
        )
        SELECT
          pt.paymenttype AS payment_method,
          COALESCE(a.donation_count, 0) AS donation_count,
          COALESCE(a.total_raised, 0) AS total_raised
        FROM payment_types pt
        LEFT JOIN agg a ON a.paymenttype = pt.paymenttype
        ORDER BY pt.paymenttype";

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
    error_log("Payment Methods API PDO Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Payment Methods API Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
