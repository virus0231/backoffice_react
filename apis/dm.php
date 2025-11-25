<?php
if (session_id() === "") session_start();
include('config.php');
ini_set('display_errors', '1'); 
ini_set('display_startup_errors', '1'); 
error_reporting(E_ALL);

try {


    if (isset($_POST['action'])) {
        if ($_POST['action'] == "add-new-service") {
            $servicename = $_POST['service_name_key'];
            $accountkey = $_POST['accountkey'];
            $status = $_POST['service_status'];

            $stmt = $conn->prepare("INSERT INTO `wp_yoc_dm_services`(`name`, `account_key`, `status`) VALUES (:name, :account_key, :status)");
            $stmt->execute([
                ':name' => $servicename,
                ':account_key' => $accountkey,
                ':status' => $status
            ]);

            if ($stmt) {
                echo 'service created successfully';
            }
        } else if ($_POST['action'] == "change-service-status") {
            $id = $_POST['service_id'];
            $status = $_POST['status'];

            $stmt = $conn->prepare("UPDATE `wp_yoc_dm_services` SET status = :status WHERE id = :id");
            $stmt->execute([
                ':status' => $status,
                ':id' => $id
            ]);

            if ($stmt) {
                echo 'service updated successfully';
            }
        } else if ($_POST['action'] == "update-service") {
            $id = $_POST['service_id'];
            $servicename = $_POST['service_name_key'];
            $status = $_POST['service_status'];
            $accountkey = '';

            if (isset($_POST['accountkey'])) {
                $accountkey = $_POST['accountkey'];
            }
            if (isset($_FILES['siteimages'])) {
                $accountkey = $_FILES['siteimages']['name'];
                $image_path = "../assets/images/company/" . $accountkey;
                move_uploaded_file($_FILES['siteimages']['tmp_name'], $image_path);
            }

            $stmt = $conn->prepare("UPDATE `wp_yoc_dm_services` SET `name` = :name, `account_key` = :account_key, `status` = :status WHERE id = :id");
            $stmt->execute([
                ':name' => $servicename,
                ':account_key' => $accountkey,
                ':status' => $status,
                ':id' => $id
            ]);

            if ($stmt) {
                echo 'service updated successfully';
            }
        }
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
