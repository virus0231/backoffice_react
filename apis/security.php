<?php
if (session_id() === "") {
    session_start();
}
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);

// Minimal, silent logger. Skips if table is missing.
function security($activity_note = '', $conn) {
    try {
        $user_ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $user_name = $_SESSION['login_user_name'] ?? '';
        $activity = $activity_note;

        // Find a log table; fallback to skip if none exists
        $tableCandidates = ['wp_yoc_security', 'wp_yoc_securiity'];
        $table = null;
        foreach ($tableCandidates as $t) {
            $stmt = $conn->prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :t LIMIT 1");
            $stmt->bindParam(':t', $t, PDO::PARAM_STR);
            $stmt->execute();
            if ($stmt->fetchColumn()) {
                $table = $t;
                break;
            }
        }
        if (!$table) {
            return;
        }

        $sql = "INSERT INTO `$table` (`IP_address`, `login_id_name`, `activity`) 
                VALUES (:user_ip, :user_name, :activity)";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':user_ip', $user_ip);
        $stmt->bindParam(':user_name', $user_name);
        $stmt->bindParam(':activity', $activity);
        $stmt->execute();
    } catch (Exception $e) {
        // Silence errors to avoid polluting API responses
        error_log("security log error: " . $e->getMessage());
    }
}
?>
