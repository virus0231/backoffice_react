<?php
if(session_id() === "") session_start();
include('config.php');
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);

if(isset($_POST['action'])){
    if($_POST['action']=="Appeal_status"){
        $palce=$_POST['place'];
        $id=$_POST['id'];
        $value=$_POST['status'];
        $field=$_POST['field'];
        $updatedata=update_status($conn,$palce,$id,$value,$field);
        if($updatedata){
            echo "Updated";
        }else{
            echo "Error";
        }
    }
}
function update_status($conn,$palce,$id,$value,$field){
    if($palce=="appeal"){
        if($field=="home"){
            $sql="UPDATE `wp_yoc_appeal` SET `ishome_v` = '$value' WHERE `wp_yoc_appeal`.`id` = '$id'";
        }
        else if($field=="donate"){
            $sql="UPDATE `wp_yoc_appeal` SET `isdonate_v` = '$value' WHERE `wp_yoc_appeal`.`id` = '$id'";
        }
        else{
            $sql="UPDATE `wp_yoc_appeal` SET `disable` = '$value' WHERE `wp_yoc_appeal`.`id` = '$id'";
        }
        
    }
     if($palce=="amount"){
        if($field=="feature"){
            $sql="UPDATE `wp_yoc_amount` SET `featured` = '$value' WHERE `wp_yoc_amount`.`id` = '$id'";
        }
     }
    
    $res = $conn->query($sql);
    return $res;
}

?>