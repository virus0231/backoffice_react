<?php
if(session_id() === "") session_start();
include('config.php');
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);

if(isset($_POST['action'])){
    if($_POST['action']=="add-new-user"){
        $username  = preg_replace('/[^A-Za-z0-9\w\ ]/', '', $_POST['username_val']);
        $display_name  = preg_replace('/[^A-Za-z0-9\w\ ]/', '', $_POST['display_name_val']);
        $email     = $_POST['email_val'];
        $password  = $_POST['password_val'];
        $user_role = $_POST['userrole_val'];
        
        $userdata=get_user_details($conn,$username,$email);
        
        if(count($userdata)>0){
            echo 'user exist with this username and email.';
        }
        else {
            $expected_password=hash_hmac("sha256", $password,$_SESSION['company']);
            $date = date("Y-m-d h:i:s");
            
            $sql="INSERT INTO `wp_yoc_users` (`user_login`, `display_name`, `user_pass`, `user_role`, `user_email`, `user_registered`) VALUES ('$username', '$display_name', '$expected_password', '$user_role', '$email', '$date');";
            $res = $conn->query($sql);
            if($res)
            {
                echo 'user created successfully';
            }
        }
    }
    else if($_POST['action']=="change-user-status"){

        $user_id = $_POST['user_id'];
        $status  = $_POST['status'];
        
        $sql="UPDATE `wp_yoc_users` SET user_status = '$status' WHERE ID='$user_id';";
        $res = $conn->query($sql);
        if($res)
        {
            echo 'user updated successfully';
        }
    
    }
      else if($_POST['action']=="update-user"){

        $id           = $_POST['user_id'];
        $username     = preg_replace('/[^A-Za-z0-9\w\ ]/', '', $_POST['username_val']);
        $display_name = preg_replace('/[^A-Za-z0-9\w\ ]/', '', $_POST['display_name_val']);
        $email        = $_POST['email_val'];
        $user_role    = $_POST['userrole_val'];

        $sql="UPDATE `wp_yoc_users` SET `user_login`='$username', `display_name`='$display_name', `user_role`='$user_role', `user_email`='$email' ";

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

function get_user_details($conn,$username,$email){
    $sql="SELECT * FROM `wp_yoc_users` WHERE `user_login`='$username' AND `user_email`='$email';";
    $res = $conn->query($sql);
    $count = $res->num_rows;
    $return=array();
    if($count > 0)
    {
        while($row=$res->fetch_array())
        {
            $return = $row;
        } 
    }
    return $return;
}
?>