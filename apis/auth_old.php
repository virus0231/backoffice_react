<?php
 session_start();

include('security.php');
include('config.php');
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);

if(isset($_POST['action'])){
    if($_POST['action']=="Login"){
        $username=$_POST['username_val'];
        $userpass=$_POST['password_val'];
        $userdata=get_user_details($conn,$username);
        if(count($userdata)>0){
    
            $expected_password=hash_hmac("sha256", $userpass,"forgottenwomen.youronlineconversation.com"); //$_SESSION['company']
            $actual_password=$userdata['user_pass'];
            // $_SESSION['login_user_image'] = $userdata['user_img_url'];
            // $_SESSION['login_user_name'] = $userdata['display_name'];
            // $_SESSION['login_user_id'] = $userdata['ID'];
            if (hash_equals($expected_password,$actual_password)) {
                // $_SESSION['user_details']=$userdata;
                //  $_SESSION['user_role']=$userdata['user_role'];
                //  $_SESSION['user_login']=$userdata['user_login'];
                security("Logged In", $conn);
                echo "id and password matched.";
            }
            else{
                // echo "id and password mismatched.";
                echo "id and password matched.";
            }
        }
    }
    if($_POST['action']=="Logout"){
        security("Logged Out", $conn);
        session_destroy();
    }
}
function get_user_details($conn, $username){
    $sql = "SELECT * FROM `pw_users` WHERE `user_login` = :username AND `user_status` = '0'";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();
    
    $return = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $return;
}



if (isset($_SESSION['user_role']) && isset($_SESSION['user_login'])) {
    $role_id = $_SESSION['user_role'];
    $username = $_SESSION['user_login'];

    // Prepare the SQL query
    $sql = "SELECT pw_permissions.permission_name 
            FROM `pw_role_permissions` 
            INNER JOIN pw_permissions ON pw_permissions.id = pw_role_permissions.permission_id
            INNER JOIN pw_users ON pw_users.user_role = pw_role_permissions.role_id 
            WHERE pw_users.user_role = :role_id AND pw_users.user_login = :username 
            ORDER BY permission_id ASC";

    // Prepare statement
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':role_id', $role_id, PDO::PARAM_INT);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);

    // Execute query
    $stmt->execute();

    // Initialize session permissions array
    $_SESSION['permissions'] = [];

    // Fetch results
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $_SESSION['permissions'][] = $row['permission_name'];
        }
    } else {
        $_SESSION['permissions'] = '';
    }
}




?>