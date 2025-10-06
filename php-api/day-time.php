<?php
// Include bootstrap for DB connection and CORS
require_once __DIR__ . '/_bootstrap.php';

header('Content-Type: application/json');

try {
    // Get parameters
    $startDate = $_GET['startDate'] ?? null;
    $endDate = $_GET['endDate'] ?? null;
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

    // Use literal values for dates
    $startDateLiteral = $pdo->quote($startDate);
    $endDateLiteral = $pdo->quote($endDate);

    // Build filter clause for EXISTS subquery
    $filterClause = '';
    if (!empty($appealIdsArray)) {
        $sanitizedAppealIds = array_map('intval', $appealIdsArray);
        $filterClause .= " AND a.id IN (" . implode(',', $sanitizedAppealIds) . ")";
    }
    if (!empty($fundIdsArray)) {
        $sanitizedFundIds = array_map('intval', $fundIdsArray);
        $filterClause .= " AND f.id IN (" . implode(',', $sanitizedFundIds) . ")";
    }

    // Heatmap query: Group by day of week and hour
    $sql = "
    SELECT
      (DAYOFWEEK(t.date) + 5) % 7 AS day_of_week,
      HOUR(t.date) AS hour_of_day,
      COUNT(DISTINCT t.id) AS donation_count,
      SUM(t.totalamount) AS total_raised
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
    GROUP BY day_of_week, hour_of_day
    ORDER BY day_of_week, hour_of_day
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $heatmapData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'heatmapData' => $heatmapData
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Day Time API PDO Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Day Time API Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
