<?php
if(session_id() === "") session_start();
include('config.php');



if(isset($_POST['action'])){
    
      if($_POST['action']=="add_season"){
        $season_name=$_POST['season_name'];
        $fromDate=$_POST['fromDate'];
        $toDate=$_POST['toDate'];
        $season_type=$_POST['season_type'];
        
        $SQL="INSERT INTO `wp_yoc_season`(`season_name`, `start_date`,`end_date`,`type`) VALUES('$season_name','$fromDate','$toDate','$season_type')";
        $res = $conn->query($SQL);
        echo $SQL;
        if($res){
            echo "Inserted";
        }else{
            echo "Error";
        }
    }
    
    
      if($_POST['action']=="update_season"){
            $cat_name=$_POST['season_name'];
        $season_id=$_POST['season_id'];
        $start_date=$_POST['fromDate'];
           $end_date=$_POST['toDate'];
           $type=$_POST['season_type'];
        
        $SQL="UPDATE `wp_yoc_season` SET `season_name`='$cat_name',`start_date`='$start_date',`end_date`='$end_date',`type`='$type' WHERE `id`='$season_id'";
        $res = $conn->query($SQL);
        if($res){
            echo "Updated";
        }else{
            echo "Error";
        }
    }
    

 
 
    
}

?>