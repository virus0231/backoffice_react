<?php
if(session_id() === "") session_start();
include('config.php');
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);

if(isset($_POST['action'])){
    if($_POST['action']=="update-donor"){
        
        $did          = $_POST['donor_id'];
        $organization = $_POST['organization'];
        $street       = $_POST['street'];
        $city         = $_POST['city'];
        $state        = $_POST['state'];
        $postcode     = $_POST['postcode'];
        $country      = $_POST['country'];
        $phone        = $_POST['phone'];
        
        $sql = "UPDATE `wp_yoc_donors` SET organization='$organization', add1='$street', add2='$state', city='$city', country='$country', postcode='$postcode', phone='$phone' WHERE id='$did';";

        $res = $conn->query($sql);
        if($res)
        {
            echo 'donor updated successfully';
        }
    }
}
?>