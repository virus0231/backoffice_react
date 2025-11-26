<?php
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);
session_start();
include('config.php');
include_once('functions.php');

include_once '../mail/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;

$userTable = find_first_existing_table($conn, ['pw_users', 'wp_yoc_users']);
$otpTable = find_first_existing_table($conn, ['pw_otp', 'wp_yoc_otp']);

try {

    if (isset($_POST['generate_otp'])) {
        $email = $_POST["email"];

        $query = "SELECT * FROM `$userTable` WHERE user_email = :email";
        $stmt = $conn->prepare($query);
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $userId = $user['ID'];
            $emails = $user['user_email'];
            $otp = rand(100000, 999999);

            $insertTokenQuery = "INSERT INTO `$otpTable` (did, email, otp) VALUES (:userId, :email, :otp)";
            $insertStmt = $conn->prepare($insertTokenQuery);
            $insertStmt->execute([
                'userId' => $userId,
                'email' => $email,
                'otp' => $otp
            ]);

            $body = "
            <body>
                <p>Your OTP is: $otp</p>
            </body>";

            $mail = new PHPMailer;
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Port = 587;
            $mail->Username = 'no-reply@afghan-relief.org';
            $mail->Password = 'Kxnt76330**';    
            $mail->SMTPSecure = 'tls';
            $mail->From = 'no-reply@afghan-relief.org';
            $mail->FromName = 'Afghan Relief';
            $mail->addAddress($email);
            $mail->WordWrap = 50;
            $mail->isHTML(true);
            $mail->Subject = 'One Time Password(otp)';
            $mail->Body = $body;

            if ($mail->send()) {
                echo json_encode(["status" => "success", "userId" => $userId, "email" => $email]);
            } else {
                echo json_encode(["status" => "error"]);
            }
        } else {
            echo json_encode(["status" => "error"]);
        }
    }

    if (isset($_POST['otp'])) {
        $id = $_POST['id'];
        $otp = $_POST['otp'];

        $query = "SELECT otp FROM `$otpTable` WHERE did = :id ORDER BY id DESC LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->execute(['id' => $id]);
        $checkotp = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($checkotp) {
            $verify_otp = $checkotp['otp'];
            if ($verify_otp == $otp) {
                echo json_encode(["status" => "success", "userId" => $id]);
            } else {
                echo json_encode(["status" => "failed", "message" => "Incorrect OTP. Please try again."]);
            }
        } else {
            echo json_encode(["status" => "failed"]);
        }
    }

    if (isset($_POST['new_password'])) {
        $company = $_SESSION['company'];
        $id = $_POST['id'];
        $password = $_POST['password'];    
        $expected_password = hash_hmac("sha256", $password, $company);

        $query = "UPDATE `$userTable` SET user_pass = :password WHERE ID = :id";
        $stmt = $conn->prepare($query);
        $stmt->execute(['password' => $expected_password, 'id' => $id]);

        if ($stmt->rowCount() > 0) {
            echo "password updated";
        } else {
            echo "something went wrong";
        }
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
