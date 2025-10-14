<?php
// Include bootstrap for DB connection and CORS
require_once __DIR__ . '/_bootstrap.php';

header('Content-Type: application/json');

try {
    // Get optional filters
    $appealIds = $_GET['appealId'] ?? null;
    $fundIds = $_GET['fundId'] ?? null;

    $pdo = get_pdo();

    // Convert appeal and fund IDs to arrays
    $appealIdsArray = $appealIds ? explode(',', $appealIds) : [];
    $fundIdsArray = $fundIds ? explode(',', $fundIds) : [];

    // Build EXISTS filter clause (matches pattern used across endpoints)
    $filterClause = '';
    if (!empty($appealIdsArray)) {
        $sanitizedAppealIds = array_map('intval', $appealIdsArray);
        $filterClause .= ' AND a.id IN (' . implode(',', $sanitizedAppealIds) . ')';
    }
    if (!empty($fundIdsArray)) {
        $sanitizedFundIds = array_map('intval', $fundIdsArray);
        $filterClause .= ' AND f.id IN (' . implode(',', $sanitizedFundIds) . ')';
    }

    // Determine anchor date for relative windows (default CURDATE, overridable via asOf=YYYY-MM)
    $asOf = $_GET['asOf'] ?? null;
    $anchorExpr = 'CURDATE()';
    if (is_string($asOf) && preg_match('/^\d{4}-\d{2}$/', $asOf)) {
        // Use first day of selected month as anchor
        $anchorDate = $asOf . '-01';
        $asOfLiteral = $pdo->quote($anchorDate);
        $anchorExpr = "DATE($asOfLiteral)";
    }

    // Updated retention query (baseline M0 = 100, Completed transactions only)
    // Filters (if provided) are applied to the transactions set via EXISTS
    $sql = "WITH schedule_cohort AS (
        -- Get all schedules and their cohort month
        SELECT
            DATE_FORMAT(COALESCE(s.startdate, DATE(s.date)), '%Y-%m') as cohort_month,
            DATE_FORMAT(COALESCE(s.startdate, DATE(s.date)), '%b %Y') as cohort,
            COALESCE(s.startdate, DATE(s.date)) as cohort_date,
            s.id as schedule_id,
            s.order_id as base_order_id
        FROM pw_schedule s
        WHERE COALESCE(s.startdate, DATE(s.date)) >= DATE_SUB($anchorExpr, INTERVAL 12 MONTH)
          AND COALESCE(s.startdate, DATE(s.date)) < DATE_ADD($anchorExpr, INTERVAL 1 MONTH)
    ),

    transactions AS (
        -- Get all transactions with base order_id
        SELECT
            CASE
                WHEN t.order_id REGEXP '_[0-9]+$' THEN SUBSTRING_INDEX(t.order_id, '_', 1)
                ELSE t.order_id
            END as base_order_id,
            t.status,
            DATE(t.date) as txn_date,
            DATE_FORMAT(t.date, '%Y-%m') as txn_month
        FROM pw_transactions t
        WHERE t.date >= DATE_SUB($anchorExpr, INTERVAL 24 MONTH)
          AND t.date < DATE_ADD($anchorExpr, INTERVAL 1 MONTH)
          AND t.status IN ('Completed','pending')" .
          (!empty($filterClause) ? "\n          AND EXISTS (\n            SELECT 1\n            FROM pw_transaction_details d\n            JOIN pw_appeal a ON a.id = d.appeal_id\n            JOIN pw_fundlist f ON f.id = d.fundlist_id\n            WHERE d.TID = t.id\n            {$filterClause}\n          )" : '') .
        "
    ),

    -- Calculate which exact month since cohort for each transaction
    schedule_transactions AS (
        SELECT
            sc.cohort_month,
            sc.cohort,
            sc.schedule_id,
            sc.base_order_id,
            t.txn_date,
            t.txn_month,
            -- Calculate exact month difference from cohort start
            PERIOD_DIFF(
                DATE_FORMAT(t.txn_date, '%Y%m'),
                DATE_FORMAT(sc.cohort_date, '%Y%m')
            ) as months_since_cohort
        FROM schedule_cohort sc
        LEFT JOIN transactions t ON sc.base_order_id = t.base_order_id
    ),

    -- Check if each schedule was retained in each specific month
    retention_matrix AS (
        SELECT
            cohort_month,
            cohort,
            schedule_id,
            -- Baseline shifted: start counting from month +1 (next month after start)
            MAX(CASE WHEN months_since_cohort = 1 THEN 1 ELSE 0 END) as retained_m1,
            MAX(CASE WHEN months_since_cohort = 2 THEN 1 ELSE 0 END) as retained_m2,
            MAX(CASE WHEN months_since_cohort = 3 THEN 1 ELSE 0 END) as retained_m3,
            MAX(CASE WHEN months_since_cohort = 4 THEN 1 ELSE 0 END) as retained_m4,
            MAX(CASE WHEN months_since_cohort = 5 THEN 1 ELSE 0 END) as retained_m5,
            MAX(CASE WHEN months_since_cohort = 6 THEN 1 ELSE 0 END) as retained_m6,
            MAX(CASE WHEN months_since_cohort = 7 THEN 1 ELSE 0 END) as retained_m7,
            MAX(CASE WHEN months_since_cohort = 8 THEN 1 ELSE 0 END) as retained_m8,
            MAX(CASE WHEN months_since_cohort = 9 THEN 1 ELSE 0 END) as retained_m9,
            MAX(CASE WHEN months_since_cohort = 10 THEN 1 ELSE 0 END) as retained_m10,
            MAX(CASE WHEN months_since_cohort = 11 THEN 1 ELSE 0 END) as retained_m11
        FROM schedule_transactions
        GROUP BY cohort_month, cohort, schedule_id
    )

    -- Calculate retention percentage for each cohort
    SELECT
        cohort,
        COUNT(DISTINCT schedule_id) as count,
        -- retention_0 = 100 (baseline = cohort size; first billing cycle after start)
        100 as retention_0,
        ROUND(100.0 * SUM(retained_m1) / COUNT(DISTINCT schedule_id), 0) as retention_1,
        ROUND(100.0 * SUM(retained_m2) / COUNT(DISTINCT schedule_id), 0) as retention_2,
        ROUND(100.0 * SUM(retained_m3) / COUNT(DISTINCT schedule_id), 0) as retention_3,
        ROUND(100.0 * SUM(retained_m4) / COUNT(DISTINCT schedule_id), 0) as retention_4,
        ROUND(100.0 * SUM(retained_m5) / COUNT(DISTINCT schedule_id), 0) as retention_5,
        ROUND(100.0 * SUM(retained_m6) / COUNT(DISTINCT schedule_id), 0) as retention_6,
        ROUND(100.0 * SUM(retained_m7) / COUNT(DISTINCT schedule_id), 0) as retention_7,
        ROUND(100.0 * SUM(retained_m8) / COUNT(DISTINCT schedule_id), 0) as retention_8,
        ROUND(100.0 * SUM(retained_m9) / COUNT(DISTINCT schedule_id), 0) as retention_9,
        ROUND(100.0 * SUM(retained_m10) / COUNT(DISTINCT schedule_id), 0) as retention_10,
        ROUND(100.0 * SUM(retained_m11) / COUNT(DISTINCT schedule_id), 0) as retention_11
    FROM retention_matrix
    GROUP BY cohort_month, cohort
    ORDER BY cohort_month ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Transform result to frontend format
    $formatted = array_map(function ($r) {
        return [
            'cohort' => $r['cohort'],
            'count' => (int)($r['count'] ?? 0),
            'retention' => [
                (int)($r['retention_0'] ?? 0),
                (int)($r['retention_1'] ?? 0),
                (int)($r['retention_2'] ?? 0),
                (int)($r['retention_3'] ?? 0),
                (int)($r['retention_4'] ?? 0),
                (int)($r['retention_5'] ?? 0),
                (int)($r['retention_6'] ?? 0),
                (int)($r['retention_7'] ?? 0),
                (int)($r['retention_8'] ?? 0),
                (int)($r['retention_9'] ?? 0),
                (int)($r['retention_10'] ?? 0),
                (int)($r['retention_11'] ?? 0)
            ]
        ];
    }, $rows);

    echo json_encode([
        'success' => true,
        'data' => [ 'retentionData' => $formatted ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log('Retention API PDO Error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    error_log('Retention API Error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
