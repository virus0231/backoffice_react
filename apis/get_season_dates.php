<?php
// Include database connection
include('config.php');
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);
header("Content-Type: application/json"); // Return JSON response

if (isset($_POST['seasonID'])) {
    $seasonID = intval($_POST['seasonID']); // Sanitize input

    if ($seasonID > 0) {
        // Fetch season start and end dates
        $query = "SELECT start_date, end_date FROM wp_yoc_season WHERE id = :seasonID";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':seasonID', $seasonID, PDO::PARAM_INT);
        $stmt->execute();
        $season = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($season) {
            echo json_encode([
                'success' => true,
                'start_date' => $season['start_date'],
                'end_date' => $season['end_date']
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Season not found']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid season ID']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No season ID provided']);
}
?>
