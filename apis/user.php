<?php
if(session_id() === "") session_start();
include('config.php');
include('functions.php');
if (!isset($_SESSION['company']) || empty($_SESSION['company'])) {
    $_SESSION['company'] = 'backoffice-secret';
}
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);

if(isset($_POST['action'])){
    if($_POST['action']=="list-users"){
        header('Content-Type: application/json');
        try {
            $users = get_all_users($conn);
            $normalized = array_map(function($u) {
                return array(
                    'id' => isset($u['ID']) ? intval($u['ID']) : null,
                    'username' => $u['user_login'] ?? '',
                    'display_name' => $u['display_name'] ?? '',
                    'email' => $u['user_email'] ?? '',
                    'role_id' => isset($u['user_role']) ? intval($u['user_role']) : null,
                    'role_name' => $u['role_name'] ?? ($u['user_role'] ?? ''),
                    'user_registered' => $u['user_registered'] ?? '',
                    'user_status' => isset($u['user_status']) ? intval($u['user_status']) : 0
                );
            }, $users ?: []);

            echo json_encode(array(
                'success' => true,
                'data' => $normalized
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'success' => false,
                'message' => 'Unable to fetch users',
                'error' => $e->getMessage()
            ));
        }
        exit();
    }
    if($_POST['action']=="add-new-user"){
        $userTable = find_first_existing_table($conn, ['pw_users', 'wp_yoc_users']);
        if (!$userTable) {
            http_response_code(500);
            echo 'user table not found';
            exit();
        }
        $username  = preg_replace('/[^A-Za-z0-9\w\ ]/', '', $_POST['username_val']);
        $display_name  = preg_replace('/[^A-Za-z0-9\w\ ]/', '', $_POST['display_name_val']);
        $email     = $_POST['email_val'];
        $password  = $_POST['password_val'];
        $user_role = $_POST['userrole_val'];
        
        $userdata=get_user_details($conn,$username,$email,$userTable);
        
        if(count($userdata)>0){
            echo 'user exist with this username and email.';
        }
        else {
            $expected_password=hash_hmac("sha256", $password,$_SESSION['company']);
            $date = date("Y-m-d h:i:s");
            
            $sql="INSERT INTO `$userTable` (`user_login`, `display_name`, `user_pass`, `user_role`, `user_email`, `user_registered`) VALUES ('$username', '$display_name', '$expected_password', '$user_role', '$email', '$date');";
            $res = $conn->query($sql);
            if($res)
            {
                echo 'user created successfully';
            }
        }
    }
    else if($_POST['action']=="change-user-status"){

        $userTable = find_first_existing_table($conn, ['pw_users', 'wp_yoc_users']);
        if (!$userTable) {
            http_response_code(500);
            echo 'user table not found';
            exit();
        }
        $user_id = $_POST['user_id'];
        $status  = $_POST['status'];
        
        $sql="UPDATE `$userTable` SET user_status = '$status' WHERE ID='$user_id';";
        $res = $conn->query($sql);
        if($res)
        {
            echo 'user updated successfully';
        }
    
    }
      else if($_POST['action']=="update-user"){

        $userTable = find_first_existing_table($conn, ['pw_users', 'wp_yoc_users']);
        if (!$userTable) {
            http_response_code(500);
            echo 'user table not found';
            exit();
        }

        $id           = $_POST['user_id'];
        $username     = preg_replace('/[^A-Za-z0-9\w\ ]/', '', $_POST['username_val']);
        $display_name = preg_replace('/[^A-Za-z0-9\w\ ]/', '', $_POST['display_name_val']);
        $email        = $_POST['email_val'];
        $user_role    = $_POST['userrole_val'];

        $sql="UPDATE `$userTable` SET `user_login`='$username', `display_name`='$display_name', `user_role`='$user_role', `user_email`='$email' ";

        if(isset($_POST['password_val']) && !empty($_POST['password_val']) ){
            $expected_password=hash_hmac("sha256", $_POST['password_val'] ,$_SESSION['company']);
            $sql .=" , `user_pass`='$expected_password'";
        }
        $sql .=" WHERE ID='$id'; ";

        $res = $conn->query($sql);
        if($res)
        {
            echo 'user updated successfully';
        }

    }
}

function get_user_details($conn,$username,$email,$tableName=null){
    $userTable = $tableName ?: find_first_existing_table($conn, ['pw_users', 'wp_yoc_users']);
    if (!$userTable) return [];

    $sql="SELECT * FROM `$userTable` WHERE `user_login`=:username AND `user_email`=:email LIMIT 1;";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? $row : [];
}
?>
