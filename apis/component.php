<?php
include("config.php");
session_start();

// Check if the table exists - support both table prefixes
include_once('functions.php');
$dmTable = find_first_existing_table($conn, ['pw_dm_services', 'wp_yoc_dm_services']);

if (!$dmTable) {
    header("Location: /backend/yoc/configuration.php");
    exit();
}

try{
    $sql = "SELECT * FROM `$dmTable` WHERE status = 1";
    $stmt = $conn->query( $sql);
    
    $site_name = '';
    $site_url = '';
    $_SESSION['site_logo'] = '';
    $_SESSION['site_loader'] = '';
    
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        if($row['name'] == "site_name"){
            $site_name = $row['account_key'];
        }
        else if($row['name'] == "site_url"){
            $site_url = $row['account_key'];
        }
        else if($row['name'] == "site_logo"){
            $_SESSION['site_logo'] = $row['account_key'];
        }
        else if($row['name'] == "site_loader"){
            $_SESSION['site_loader'] = $row['account_key'];
        }
    }
    
}catch(Exception $e){
     echo $e;
}



$_SESSION['company']= $site_name;
$domain= $site_url;
function get_yoc_header($resource){
    $pagemeta="BACK OFFICE";
   
    if(strtolower($resource)!="index"){
        $pagemeta=$resource;
        if(isset($_SESSION['user_details']) && count($_SESSION['user_details'])<=0){
            header("Location: ".$domain);
        }
    }else{
        if(isset($_SESSION['user_details']) && count($_SESSION['user_details'])>0){
            header("Location: ".$domain."/backend/pages/dashboard.php");
        }
    }
    
$actual_link = $_SERVER['REQUEST_URI'];

if($actual_link != '/backend/'){
    if(empty($_SESSION['permissions']) || $_SESSION['permissions'] == ''){
        echo '<script>window.location.assign("https:/backend/");</script>';
    }
}
$urls=array();
if (isset($_SESSION['permissions'])) {
    $urls = $_SESSION['permissions'];
}
$redirect = true;
foreach ($urls as $url) {
    $usersPart = rtrim(str_replace("/backend/pages", "", $url), '/');
    if (strpos($actual_link, $usersPart) !== false || strpos($actual_link, '/dashboard.php') !== false || strpos($actual_link, '/update_user_profile.php') !== false) {
        $redirect = false;
        break;
    }
}
if ($redirect && isset($_SESSION['user_role'])) {
    header('Location: https:/backend/pages/dashboard.php');
    exit;
}

    
    
echo '<!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="utf-8" />
        <title>'.$pagemeta.'</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta content="Your Online Conversation Admin panel" name="description" />
        <meta content="YOC" name="author" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />

        <!-- App favicon -->
        <link rel="shortcut icon" href="/backend/assets/images/favicon.png">';

    echo '<!-- App css -->
        <link href="/backend/assets/css/style.css" rel="stylesheet" type="text/css" />
        <link href="/backend/assets/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <link href="/backend/assets/css/jquery-ui.min.css" rel="stylesheet">
        <link href="/backend/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
        <link href="/backend/assets/css/metisMenu.min.css" rel="stylesheet" type="text/css" />
        <link href="/backend/assets/css/app.min.css" rel="stylesheet" type="text/css" />
         <link href="/backend/plugins/select2/select2.min.css" rel="stylesheet" type="text/css" />
        <!-- Sweet Alert -->
        <link href="/backend/plugins/sweet-alert2/sweetalert2.min.css" rel="stylesheet" type="text/css">
        <link href="/backend/plugins/animate/animate.css" rel="stylesheet" type="text/css">';
        
        if(strtolower($resource)=="appeals" || strtolower($resource)=="featured amount" || strtolower($resource)=="ips" ){
            echo '
            <!-- DataTables -->
            <link href="/backend/plugins/datatables/dataTables.bootstrap4.min.css" rel="stylesheet" type="text/css" />
            <link href="/backend/plugins/datatables/buttons.bootstrap4.min.css" rel="stylesheet" type="text/css" />
            <!-- Responsive datatable examples -->
            <link href="/backend/plugins/datatables/responsive.bootstrap4.min.css" rel="stylesheet" type="text/css" />
            ';
        }
        if(strtolower($resource)=="crm" || strtolower($resource)=="association"){
            echo ' <!-- Plugins css -->
        <link href="/backend/plugins/daterangepicker/daterangepicker.css" rel="stylesheet" />
       
        <link href="/backend/plugins/bootstrap-colorpicker/css/bootstrap-colorpicker.css" rel="stylesheet" type="text/css" />
        <link href="/backend/plugins/timepicker/bootstrap-material-datetimepicker.css" rel="stylesheet">
        <link href="/backend/plugins/bootstrap-touchspin/css/jquery.bootstrap-touchspin.min.css" rel="stylesheet" />';
        }
    if(strtolower($resource)!="index"){
        echo '</head><body>';
    }else{
        echo '</head><body class="account-body accountbg">';
    }
        
}




function get_yoc_loader()
{
    echo '<div id="divload" class="row modaldx" style="display: none;">
            <div class="center">
                <h3 style="color: #fff;">Please Don\'t Refresh Or Close The Browser</h3>
                <img class="imgdx" alt="loader" src="/assets/images/company/' . $_SESSION['site_loader'] . '">
                <h4 style="color: #fff;">Its Processing</h4>
            </div>
        </div>';
}

function get_yoc_footer($resource){
    
    echo '
    <!-- jQuery  -->
        <script src="/backend/assets/js/jquery.min.js"></script>
        <script src="/backend/assets/js/jquery-ui.min.js"></script>
        <script src="/backend/assets/js/bootstrap.bundle.min.js"></script>
        <script src="/backend/assets/js/metismenu.min.js"></script>
        <script src="/backend/assets/js/waves.js"></script>
        <script src="/backend/assets/js/feather.min.js"></script>
        <script src="/backend/assets/js/jquery.slimscroll.min.js"></script>        
        
        <!-- Sweet-Alert  -->
        <script src="/backend/plugins/sweet-alert2/sweetalert2.min.js"></script>
        <script src="/backend/assets/pages/jquery.sweet-alert.init.js"></script>
            <script src="/backend/plugins/select2/select2.min.js"></script>
        <!-- App js -->
        <script src="/backend/assets/js/app.js"></script>
        <script src="/backend/assets/js/yoc.js?v='.time().'"></script>
        ';
        if(strtolower($resource)=="dashboard"){
            echo '<!-- dashboard -->
            <script src="/backend/assets/js/dashboard.js"></script>
            <script src="/backend/plugins/moment/moment.js"></script>
          
            <script src="/backend/plugins/jvectormap/jquery-jvectormap-2.0.2.min.js"></script>
            <script src="/backend/plugins/jvectormap/jquery-jvectormap-world-mill-en.js"></script>
            <script src="/backend/plugins/chartjs/chart.min.js"></script>
            <script src="/backend/plugins/chartjs/roundedBar.min.js"></script>
            <script src="/backend/plugins/lightpick/lightpick.js"></script>
            <script src="/backend/assets/pages/jquery.sales_dashboard.init.js"></script>';
        }
        if(strtolower($resource)=="appeals" || strtolower($resource)=="featured amount" || strtolower($resource)=="ips" ){
            echo '
            <!-- Required datatable js -->
            <script src="/backend/plugins/datatables/jquery.dataTables.min.js"></script>
            <script src="/backend/plugins/datatables/dataTables.bootstrap4.min.js"></script>
            <!-- Buttons examples -->
            <script src="/backend/plugins/datatables/dataTables.buttons.min.js"></script>
            <script src="/backend/plugins/datatables/buttons.bootstrap4.min.js"></script>
            <script src="/backend/plugins/datatables/jszip.min.js"></script>
            <script src="/backend/plugins/datatables/pdfmake.min.js"></script>
            <script src="/backend/plugins/datatables/vfs_fonts.js"></script>
            <script src="/backend/plugins/datatables/buttons.html5.min.js"></script>
            <script src="/backend/plugins/datatables/buttons.print.min.js"></script>
            <script src="/backend/plugins/datatables/buttons.colVis.min.js"></script>
            <!-- Responsive examples -->
            <script src="/backend/plugins/datatables/dataTables.responsive.min.js"></script>
            <script src="/backend/plugins/datatables/responsive.bootstrap4.min.js"></script>
            <script src="/backend/assets/pages/jquery.datatable.init.js"></script>
            ';
        }
        if(strtolower($resource)=="crm" || strtolower($resource)=="association"){
            echo '    <!-- Plugins js -->
        <script src="/backend/plugins/moment/moment.js"></script>
        <script src="/backend/plugins/daterangepicker/daterangepicker.js"></script>
    
        <script src="/backend/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.min.js"></script>
        <script src="/backend/plugins/timepicker/bootstrap-material-datetimepicker.js"></script>
        <script src="/backend/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js"></script>
        <script src="/backend/plugins/bootstrap-touchspin/js/jquery.bootstrap-touchspin.min.js"></script>


        <script src="/backend/assets/pages/jquery.forms-advanced.js"></script>';
        }
        
    echo '
    
    <script>
            $(document).ready(function() {
                $(\'#appealdd\').select2();
            });
        </script>
        <script>
            $(".imgdx").attr("src", "/backend/assets/images/company/'.$_SESSION['site_loader'].'");
        </script>
    </body>

</html>';

}
function get_yoc_topbar(){
    
    $profile_url = "";
    if(!empty($_SESSION['login_user_image'])){
        $profile_url = "/backend/assets/images/users/" . $_SESSION['login_user_image']; 
    }else{
        $profile_url = "/backend/assets/images/users/alt_user.png";
    }

    
    echo "<div id='loadingGif' style='";
    echo 'pointer-events: none; display: none; height: 100px; width: 100px; position: absolute; top: 50%; left: 50%; background-image: url("https://i.gifer.com/ZKZg.gif");';
    echo "background-size: cover; background-position: center; background-repeat: no-repeat; z-index: 999;'></div>";
    echo '<!-- Top Bar Start -->
         <div class="topbar">

            <!-- LOGO -->
            <div class="topbar-left">
                <a href="/backend/pages/dashboard.php" class="logo">
                    <span>
                        <img src="/backend/assets/images/company/'. $_SESSION['site_logo'].'" alt="logo-small" class="img-fluid" height="90px" width="115px">
                    </span>
                    
                </a>
            </div>
            <!--end logo-->
            <!-- Navbar -->
            <nav class="navbar-custom">    
                <ul class="list-unstyled topbar-nav float-right mb-0"> 
                    <li class="dropdown">
                        <a class="nav-link dropdown-toggle waves-effect waves-light nav-user" data-toggle="dropdown" href="#" role="button"
                            aria-haspopup="false" aria-expanded="false">
                            <img src="'.$profile_url.'" alt="user profile" class="rounded-circle" />


                            <span class="ml-1 nav-user-name hidden-sm"> '.$_SESSION['login_user_name'].' <i class="mdi mdi-chevron-down"></i> </span>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right">
                            <a class="dropdown-item" href="/backend/pages/users/update_user_profile.php"><i class="ti-user text-muted mr-2"></i> Profile</a>
                            <div class="dropdown-divider mb-0"></div>
                            <a class="dropdown-item" onclick="logout()" style="cursor: pointer;"><i class="ti-power-off text-muted mr-2"></i> Logout</a>
                        </div>
                    </li>
                </ul><!--end topbar-nav-->
    
                <ul class="list-unstyled topbar-nav mb-0">                        
                    <li>
                        <button class="nav-link button-menu-mobile waves-effect waves-light">
                            <i class="ti-menu nav-icon"></i>
                        </button>
                    </li>
                   
                </ul>
            </nav>
            <!-- end navbar-->
        </div>
        <!-- Top Bar End -->';
}


function get_yoc_sidebar(){
    echo '<!-- Left Sidenav -->
        <div class="left-sidenav">
        <ul class="metismenu left-sidenav-menu">';
         foreach ($_SESSION['permissions'] as $permission) {
                if( $permission=="/backend/pages/users/")
                {
                    echo '<li>
                    <a href="/backend/pages/users/user-list.php"><i class="ti-bar-chart"></i><span>Users</span></a>
                </li>';
                }
                elseif($permission=="/backend/pages/permission/"){
                 echo'<li>
                    <a href="/backend/pages/permission/prevelages.php"><i class="ti-lock"></i><span>Permissions</span></a>
                </li>';
                }
                elseif($permission=="/backend/pages/causes/")
                {
                    echo '<li>
                    <a href="javascript: void(0);"><i class="ti-server"></i><span>Causes</span><span class="menu-arrow"><i class="mdi mdi-chevron-right"></i></span></a>
                    <ul class="nav-second-level" aria-expanded="false">
                        <li class="nav-item"><a class="nav-link" href="/backend/pages/causes/appeal.php"><i class="ti-control-record"></i>Appeal</a></li>
                        <li class="nav-item"><a class="nav-link" href="/backend/pages/causes/amount.php"><i class="ti-control-record"></i>Amount</a></li>
                        <li class="nav-item"><a class="nav-link" href="/backend/pages/causes/fund.php"><i class="ti-control-record"></i>Fund List</a></li>
                        <li class="nav-item"><a class="nav-link" href="/backend/pages/causes/featured_amount.php"><i class="ti-control-record"></i>Featured Amount</a></li>
                        <li class="nav-item"><a class="nav-link" href="/backend/pages/causes/upsales.php"><i class="ti-control-record"></i>Upsales</a></li>
                        <li class="nav-item"><a class="nav-link" href="/backend/pages/causes/appeal_id_mapping.php"><i class="ti-control-record"></i>Appeal Ids Matching</a></li>
                        <li class="nav-item"><a class="nav-link" href="/backend/pages/causes/catagory.php"><i class="ti-control-record"></i>Catagory</a></li>
                        <li class="nav-item"><a class="nav-link" href="/backend/pages/causes/country.php"><i class="ti-control-record"></i>Country</a></li>';
                        if (in_array("/backend/pages/causes/amount_fund_association.php", $_SESSION['permissions']))
                        {
                            echo '
                            <li class="nav-item">
                                <a class="nav-link" href="/backend/pages/causes/amount_fund_association.php">
                                    <i class="ti-control-record"></i>Fund-Amount
                                </a>
                            </li>';
                        }
                        
                    echo '</ul>
                </li>';
                }
                
                elseif($permission=="/backend/pages/donor/")
                {
                    echo '
                <li>
                    <a href="/backend/pages/donor/donors-list.php"><i class="ti-crown"></i><span>Donors</span></a>
                </li>';
                }
                elseif($permission=="/backend/pages/crm/")
                {
                    echo'
                    <li>
                    <a href="/backend/pages/crm/salesforce-relation.php"><i class="ti-layers-alt"></i><span>CRM</span></a>
                    </li>';
                }
                elseif($permission=="/backend/pages/donation/")
                {
                    echo '
                    <li>
                    <a href="/backend/pages/donation/donation.php"><i class="ti-layers-alt"></i><span>Donation</span></a>
                    </li>';
                }
                //  elseif($permission=="/backend/pages/qurbani/")
                // {
                //     echo '
                //     <li>
                //     <a href="/backend/pages/qurbani/qurbani-reports.php"><i class="ti-layers-alt"></i><span>Qurbani</span></a>
                //     </li>';
                // }
              
                
                  elseif($permission=="/backend/pages/schedules/")
                {
                   
                              echo '    <li>
                        <a href="javascript: void(0);"><i class="ti-server"></i><span>Schedule</span><span class="menu-arrow"><i class="mdi mdi-chevron-right"></i></span></a>
                        <ul class="nav-second-level" aria-expanded="false">
                            <li class="nav-item"><a class="nav-link" href="/backend/pages/schedules/schedule.php"><i class="ti-control-record"></i>Schedule</a></li>';
                            // if($_SESSION['user_role']== 1  ||  $_SESSION['user_role']== 2)
                            // {
                            //     echo '
                            // <li class="nav-item"><a class="nav-link" href="/backend/pages/schedules/add_subscription.php"><i class="ti-control-record"></i>Add Subcription</a></li>
                            //  <li class="nav-item"><a class="nav-link" href="/backend/pages/schedules/ius.php"><i class="ti-control-record"></i>IUS Subcription</a></li>';
                            // }
                            echo '
                        </ul>
                    </li>';      
                    
               
                }
                
                
                //  elseif($permission=="/backend/pages/employee/")
                // {
                //     echo '
                //     <li>
                //     <a href="/backend/pages/employee/employee.php"><i class="ti-layers-alt"></i><span>Employee</span></a>
                //     </li>';
                // }
                
                 
                 else if ($permission == "/backend/pages/dm/") 
                {
                    echo '
                     <li>
                    <a href="/backend/pages/dm/service.php"><i class="ti-layers-alt"></i><span>Configuration</span></a>
                    </li>';
                }
               else if ($permission == "/backend/pages/seasons/") 
                {
                    echo '
                     <li>
                    <a href="/backend/pages/seasons/seasons.php"><i class="ti-layers-alt"></i><span>Season</span></a>
                    </li>';
                }
                
                 else if ($permission == "/backend/pages/ManualTransaction/") 
                {
                    echo '
                     <li>
                    <a href="/backend/pages/ManualTransaction/manualtransaction.php"><i class="ti-layers-alt"></i><span>ManualTransaction</span></a>
                    </li>';
                }
                
                 else if($permission=="/backend/pages/report/")
                 {
                     echo ' <li>
                    <a href="javascript: void(0);"><i class="ti-server"></i><span>Reports</span><span class="menu-arrow"><i class="mdi mdi-chevron-right"></i></span></a>
                    <ul class="nav-second-level" aria-expanded="false">
                         <li> <a href="/backend/pages/report/donation-report.php"><i class="ti-control-record"></i>Donation Report</a></li>  
                         <li> <a href="/backend/pages/report/donor-detail-report.php"><i class="ti-control-record"></i>Donor Detail Report</a></li>
                             <li> <a href="/backend/pages/report/donar-report.php"><i class="ti-control-record"></i>Donor Report</a></li>  
                         <li> <a href="/backend/pages/report/appeal-report.php"><i class="ti-control-record"></i>Appeal Report</a></li>  
                         <li> <a href="/backend/pages/report/monthly_report.php"><i class="ti-control-record"></i>Monthly Report</a></li>  
                         <li> <a href="/backend/pages/report/daily_report.php"><i class="ti-control-record"></i>Daily Report</a></li>
                         <li> <a href="/backend/pages/report/schedules.php"><i class="ti-control-record"></i>Schedule Report</a></li>  
                    </ul>
                </li> ';
                 }
        }

    echo '
           </ul>
         
</div>';

}




?>