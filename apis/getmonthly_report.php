<?php
include('config.php');



session_start();
    ini_set('memory_limit', '4096M');
    $chunkSize = 4096;
    ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


if(isset($_POST["btnexport_monthly_report"])) {
    
    $from_date = $_POST['from'];
$to_date = $_POST['to'];
$finalarray=array();
    $lineData=array();
   while (strtotime($from_date) <= strtotime($to_date)) {
    // Calculate the start and end date of the current month
    $txtfrom = date('Y-m-01', strtotime($from_date));
    $txtto = date('Y-m-t', strtotime($from_date));

      $query_ini = "SELECT COUNT(DISTINCT pt.order_id) AS 'No_Of_Donations', SUM(pt.charge_amount) AS 'Donation_Amount' FROM `wp_yoc_transactions` AS pt WHERE pt.`status` IN ('Completed','pending')";
    $query_recc = "SELECT COUNT(DISTINCT pt.order_id) AS 'No_Of_Donations', SUM(pt.charge_amount) AS 'Donation_Amount' FROM `wp_yoc_transactions` AS pt WHERE pt.`status` IN ('Completed','pending')";
    $query_tot = "SELECT COUNT(DISTINCT pt.order_id) AS 'No_Of_Donations', SUM(pt.charge_amount) AS 'Donation_Amount' FROM `wp_yoc_transactions` AS pt WHERE pt.`status` IN ('Completed','pending')";
    
    $query_monthly_sch1 = "SELECT COUNT(wp_yoc_transactions.order_id) AS 'No_Of_Monthly_Donations', Sum(wp_yoc_transaction_details.amount*wp_yoc_transaction_details.quantity) as 'Total_Of_Monthly_Donations' FROM wp_yoc_transactions INNER JOIN wp_yoc_transaction_details ON wp_yoc_transaction_details.TID=wp_yoc_transactions.id where wp_yoc_transactions.order_id NOT REGEXP '_' AND wp_yoc_transactions.`status` IN ('Completed','pending') AND wp_yoc_transaction_details.freq='1'";
    $query_yearly_sch1  = "SELECT COUNT(wp_yoc_transactions.order_id) AS 'No_Of_Yearly_Donations',  Sum(wp_yoc_transaction_details.amount*wp_yoc_transaction_details.quantity) as 'Total_Of_Yearly_Donations'  FROM wp_yoc_transactions INNER JOIN wp_yoc_transaction_details ON wp_yoc_transaction_details.TID=wp_yoc_transactions.id where wp_yoc_transactions.order_id NOT REGEXP '_' AND wp_yoc_transactions.`status` IN ('Completed','pending') AND wp_yoc_transaction_details.freq='2'";

    
    if(strlen($txtfrom) > 0 && strlen($txtto) > 0) {
        $xfrom = date("Y-m-d", strtotime($txtfrom));
        $xto = date("Y-m-d", strtotime($txtto));
        
        $query_ini  .= " AND pt.date BETWEEN '".$xfrom." 00:00:00.000000' AND '".$xto." 23:59:59.000000'";
        $query_recc .= " AND pt.date BETWEEN '".$xfrom." 00:00:00.000000' AND '".$xto." 23:59:59.000000'";
        $query_tot  .= " AND pt.date BETWEEN '".$xfrom." 00:00:00.000000' AND '".$xto." 23:59:59.000000'";
        
        $query_monthly_sch1  .=  " AND wp_yoc_transactions.date BETWEEN '".$xfrom." 00:00:00.000000' AND '".$xto." 23:59:59.000000'";
        $query_yearly_sch1  .=  " AND wp_yoc_transactions.date BETWEEN '".$xfrom." 00:00:00.000000' AND '".$xto." 23:59:59.000000'";

    }
    
    $query_ini  .= " AND pt.order_id NOT REGEXP '_' GROUP BY YEAR(pt.date), MONTH(pt.date);";
    $query_recc .= " AND pt.order_id REGEXP '_' GROUP BY YEAR(pt.date), MONTH(pt.date);";
    $query_tot  .= " GROUP BY YEAR(pt.date), MONTH(pt.date);";
    $query_monthly_sch1  .= " GROUP BY YEAR(wp_yoc_transactions.date), MONTH(wp_yoc_transactions.date);";
    $query_yearly_sch1   .= " GROUP BY YEAR(wp_yoc_transactions.date), MONTH(wp_yoc_transactions.date);";
    
    $_SESSION['query_ini'] = $query_ini;
    $_SESSION['query_recc'] = $query_recc;
    $_SESSION['query_tot'] = $query_tot;
    $_SESSION['schedule_monthly_query'] = $query_monthly_sch1;
    $_SESSION['schedule_yearly_query'] = $query_yearly_sch1;
    

    if(isset($_SESSION['query_ini']) || isset($_SESSION['query_recc']) || isset($_SESSION['query_tot']) || isset($_SESSION['schedule_monthly_query']) || isset($_SESSION['schedule_yearly_query']) ) 
    {
        
          $stmt_ini = $conn->query($_SESSION['query_ini']);
        $stmt_recc = $conn->query($_SESSION['query_recc']);
        $stmt_tot = $conn->query($_SESSION['query_tot']);
        $stmt_monthly = $conn->query($_SESSION['schedule_monthly_query']);
        $stmt_yearly = $conn->query($_SESSION['schedule_yearly_query']);
        
        $date = date('M Y', strtotime($txtfrom));
        $no_of_inital_donation = 0;
        $inital_donation_amount = 0;
        $no_of_renewals_donation = 0;
        $no_of_renewals_donations_amount = 0;
        $no_of_all_donation = 0;
        $no_of_all_donations_amount = 0;
        $new_monthly_donation = 0;
        $new_monthly_donation_amount = 0;
        $new_yearly_donation = 0;
        $new_yearly_donation_amount = 0;

        $rowcount_ini = $stmt_ini->rowCount();
        $rowcount_recc = $stmt_recc->rowCount();
        $rowcount_tot = $stmt_tot->rowCount();
        $rowcount_monthly = $stmt_monthly->rowCount();
        $rowcount_yearly = $stmt_yearly->rowCount();

        if ($rowcount_ini > 0) {
            while ($row = $stmt_ini->fetch(PDO::FETCH_ASSOC)) {
                $no_of_inital_donation = $row['No_Of_Donations'];
                $inital_donation_amount = $row['Donation_Amount'];
            }
        }

        if ($rowcount_recc > 0) {
            while ($row = $stmt_recc->fetch(PDO::FETCH_ASSOC)) {
                $no_of_renewals_donation = $row['No_Of_Donations'];
                $no_of_renewals_donations_amount = $row['Donation_Amount'];
            }
        }

        if ($rowcount_tot > 0) {
            while ($row = $stmt_tot->fetch(PDO::FETCH_ASSOC)) {
                $no_of_all_donation = $row['No_Of_Donations'];
                $no_of_all_donations_amount = $row['Donation_Amount'];
            }
        }

        if ($rowcount_monthly > 0) {
            while ($row = $stmt_monthly->fetch(PDO::FETCH_ASSOC)) {
                $new_monthly_donation = $row['No_Of_Monthly_Donations'];
                $new_monthly_donation_amount = $row['Total_Of_Monthly_Donations'];
            }
        }

        if ($rowcount_yearly > 0) {
            while ($row = $stmt_yearly->fetch(PDO::FETCH_ASSOC)) {
                $new_yearly_donation = $row['No_Of_Yearly_Donations'];
                $new_yearly_donation_amount = $row['Total_Of_Yearly_Donations'];
            }
        }

        
      $no_of_inital_donation=round($no_of_inital_donation,1);
        $inital_donation_amount=round($inital_donation_amount,2);
        $no_of_renewals_donation=round($no_of_renewals_donation,1);
        $no_of_renewals_donations_amount=round($no_of_renewals_donations_amount,2);
        $no_of_all_donation=round($no_of_all_donation,1);
        $no_of_all_donations_amount=round($no_of_all_donations_amount,2);
        $new_monthly_donation=round($new_monthly_donation,1);
        $new_monthly_donation_amount=round($new_monthly_donation_amount,2);
        $new_yearly_donation=round($new_yearly_donation,1);
        $new_yearly_donation_amount=round($new_yearly_donation_amount,2);
        
        $lineData = array($date,$no_of_inital_donation, $inital_donation_amount, $no_of_renewals_donation,$no_of_renewals_donations_amount, $no_of_all_donation, $no_of_all_donations_amount,$new_monthly_donation,$new_monthly_donation_amount,$new_yearly_donation,$new_yearly_donation_amount);
        array_push($finalarray,$lineData);
         
        }
            $from_date = date("Y-m-d", strtotime($from_date . '+1 months'));
   }

     if(count($finalarray) > 0){
        
  header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="monthly_report_' . date('d_m_Y_h_i_s') . '.csv"');


$output = fopen('php://output', 'w');

// Output CSV column headers
fputcsv($output, array('Month/Year','No of Initial Donations', 'Initial Donation Amount', 'No Of Recurring Donations','Recurring Donations Amount','No Of Donations','Donations Amount','New Monthly Subscription Count', 'New Monthly Subscription Amount', 'New Yearly Subscription Count', 'New Yearly Subscription Amount'));

// Output data rows
foreach ($finalarray as $row) {
    fputcsv($output, $row);
}

// Close the output file
fclose($output);

exit();

     }



        
    }


?>