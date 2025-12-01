<?php
// CORS headers for React app
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('memory_limit', '4096M');
include('config.php');
session_start();
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);
// ------------------Qurbani Report--------------



if (isset($_POST['qurbaniReport'])) {
    $startDate = '2025-05-01';

    $txtsearch = $_POST['qurbani_txtsearch'];
    $orderid = $_POST['qurbani_orderid'];



    try {
        if (isset($_POST['qurbani_loadData'])) {
            $getReportArray = array();

            // Initialize the SQL query
            $getReportData = "SELECT t1.*, t2.*, t3.*
                FROM pw_transactions AS t1 
                INNER JOIN pw_transaction_details AS t2 ON t1.id = t2.TID 
                INNER JOIN pw_donors AS t3 ON t1.DID = t3.id 
                INNER JOIN pw_appeal ON t2.appeal_id = pw_appeal.id 
                WHERE pw_appeal.type = 'Qurbani' AND t1.date > :startDate";

            if (!empty($txtsearch)) {
                $getReportData .= " AND (t3.email LIKE :txtsearch OR t3.firstname LIKE :txtsearch OR t3.lastname LIKE :txtsearch OR t3.phone LIKE :txtsearch)";
            }
            if (!empty($orderid)) {
                $getReportData .= " AND (t1.order_id LIKE :orderid OR t1.TID LIKE :orderid)";
            }

            $getReportData .= " ORDER BY t2.TID DESC LIMIT 50 OFFSET :startRow";

            $stmt = $conn->prepare($getReportData);
            $stmt->bindValue(':startDate', $startDate . ' 00:00:00');
            if (!empty($txtsearch)) {
                $stmt->bindValue(':txtsearch', '%' . $txtsearch . '%');
            }
            if (!empty($orderid)) {
                $stmt->bindValue(':orderid', '%' . $orderid . '%');
            }
            $startRow = isset($_POST['qurbani_loadData']) ? intval($_POST['qurbani_loadData']) : 0;
            $stmt->bindValue(':startRow', $startRow, PDO::PARAM_INT);
            $stmt->execute();

            while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $getReportArray[] = $rows;
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            }

            $getReportJson = json_encode($getReportArray);
            header("Content-Type: application/json");
            echo $getReportJson;
            exit;
        } else {
            // Initialize the SQL query
            $getReportData = "SELECT COUNT(*)
                FROM pw_transactions AS t1 
                INNER JOIN pw_transaction_details AS t2 ON t1.id = t2.TID 
                INNER JOIN pw_donors AS t3 ON t1.DID = t3.id 
                INNER JOIN pw_appeal ON t2.appeal_id = pw_appeal.id 
                WHERE pw_appeal.type = 'Qurbani' AND t1.date > :startDate";

            if (!empty($txtsearch)) {
                $getReportData .= " AND (t3.email LIKE :txtsearch OR t3.firstname LIKE :txtsearch OR t3.lastname LIKE :txtsearch OR t3.phone LIKE :txtsearch)";
            }
            if (!empty($orderid)) {
                $getReportData .= " AND (t1.order_id LIKE :orderid OR t1.TID LIKE :orderid)";
            }

            $stmt = $conn->prepare($getReportData);
            $stmt->bindValue(':startDate', $startDate . ' 00:00:00');
            if (!empty($txtsearch)) {
                $stmt->bindValue(':txtsearch', '%' . $txtsearch . '%');
            }
            if (!empty($orderid)) {
                $stmt->bindValue(':orderid', '%' . $orderid . '%');
            }
            $stmt->execute();
            $count = $stmt->fetchColumn();

            echo $count;
            exit;
        }
    } catch (PDOException $e) {
        echo 'Connection failed: ' . $e->getMessage();
    }
}

if (isset($_POST["qurbaniDetail"])) {
    $startDate = '2025-05-01';

    $txtsearch = $_POST['txtsearch'];
    $orderid = $_POST['orderid'];

   
    try {
        

        $getReportArray = array();

        $getReportData = "SELECT
            pw_transactions.id,
            pw_transactions.date,
            pw_appeal.id as appeal_id,
            pw_appeal.name as appeal_name,
            pw_amount.name as amount_name,
            pw_transactions.order_id,
            pw_transaction_details.freq,
            pw_transactions.TID,
            pw_transaction_details.amount,
            pw_transaction_details.quantity,
            pw_transactions.totalamount,
            pw_transactions.card_fee,
            pw_donors.firstname,
            pw_donors.lastname,
            pw_donors.email,
            pw_donors.phone,
            pw_donors.add1,
            pw_donors.city,
            pw_donors.country,
            pw_donors.add2,
            pw_donors.postcode,
            pw_transactions.notes,
            pw_transactions.paymenttype,
            pw_transactions.status
            FROM
            pw_donors
            INNER JOIN
            pw_transactions ON pw_donors.id = pw_transactions.did
            INNER JOIN
            pw_transaction_details ON pw_transactions.id = pw_transaction_details.TID
            INNER JOIN
            pw_appeal ON pw_transaction_details.appeal_id = pw_appeal.id
            INNER JOIN
            pw_amount ON pw_transaction_details.amount_id = pw_amount.id
            WHERE pw_appeal.type = 'Qurbani' AND pw_transactions.date > :startDate";

        if (!empty($txtsearch)) {
            $getReportData .= " AND (pw_donors.email LIKE :txtsearch OR pw_donors.firstname LIKE :txtsearch OR pw_donors.lastname LIKE :txtsearch OR pw_donors.phone LIKE :txtsearch OR pw_donors.organization LIKE :txtsearch)";
        }
        if (!empty($orderid)) {
            $getReportData .= " AND (pw_transactions.order_id LIKE :orderid OR pw_transactions.TID LIKE :orderid)";
        }

        $stmt = $conn->prepare($getReportData);
        $stmt->bindValue(':startDate', $startDate . ' 00:00:00');
        if (!empty($txtsearch)) {
            $stmt->bindValue(':txtsearch', '%' . $txtsearch . '%');
        }
        if (!empty($orderid)) {
            $stmt->bindValue(':orderid', '%' . $orderid . '%');
        }
        $stmt->execute();

        $i = 1;
        while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $rows['id'] = $i;
            $rows['date'] = preg_replace('/\r\n/', ' ', $rows['date']);
            $rows['appeal_name'] = preg_replace('/\r\n/', ' ', $rows['appeal_name']);
            $rows['amount_name'] = preg_replace('/\r\n/', ' ', $rows['amount_name']);
            $rows['order_id'] = preg_replace('/\r\n/', ' ', $rows['order_id']);
            $rows['freq'] = preg_replace('/\r\n/', ' ', $rows['freq']);
            if ($rows['freq'] == 0) {
                $rows['freq'] = 'One-Off';
            } else if ($rows['freq'] == 1) {
                $rows['freq'] = 'Monthly';
            } else if ($rows['freq'] == 2) {
                $rows['freq'] = 'Yearly';
            } else if ($rows['freq'] == 3) {
                $rows['freq'] = 'Daily';
            }
            $rows['TID'] = preg_replace('/\r\n/', ' ', $rows['TID']);
            $rows['amount'] = preg_replace('/\r\n/', ' ', $rows['amount']);
            $rows['quantity'] = preg_replace('/\r\n/', ' ', $rows['quantity']);
            $rows['totalamount'] = preg_replace('/\r\n/', ' ', $rows['totalamount']);
            $rows['card_fee'] = preg_replace('/\r\n/', ' ', $rows['card_fee']);
            $rows['firstname'] = preg_replace('/\r\n/', ' ', $rows['firstname']);
            $rows['lastname'] = preg_replace('/\r\n/', ' ', $rows['lastname']);
            $rows['email'] = preg_replace('/\r\n/', ' ', $rows['email']);
            $rows['phone'] = preg_replace('/\r\n/', ' ', $rows['phone']);
            $rows['add1'] = preg_replace('/\r\n/', ' ', $rows['add1']);
            $rows['city'] = preg_replace('/\r\n/', ' ', $rows['city']);
            $rows['country'] = preg_replace('/\r\n/', ' ', $rows['country']);
            $rows['add2'] = preg_replace('/\r\n/', ' ', $rows['add2']);
            $rows['postcode'] = preg_replace('/\r\n/', ' ', $rows['postcode']);
            $rows['notes'] = preg_replace('/\r\n/', ' ', $rows['notes']);
            $rows['paymenttype'] = preg_replace('/\r\n/', ' ', $rows['paymenttype']);
            $rows['status'] = preg_replace('/\r\n/', ' ', $rows['status']);

            // Output the processed row
            $getReportArray[] = $rows;
            $i++;
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }

        if (count($getReportArray) > 0) {
            $csvFileHandle = fopen("php://output", "w");
            if ($csvFileHandle === false) {
                die('Unable to open/create the CSV file.');
            }
            header("Content-Type: text/csv");
            header("Content-Disposition: attachment;  filename=QurbaniDetail.csv");
            header("Pragma: no-cache");
            header("Expires: 0");
            fputcsv($csvFileHandle, array('SNO', 'Date', 'Donation Name', 'Amount Type', 'Order ID', 'Frequency', 'Transaction ID', 'Amount', 'Quantity', 'Total Amount', 'Card Fee', 'First Name', 'Last Name', 'Email', 'Phone Number', 'Address', 'City', 'Country', 'State', 'Postal Code', 'Notes', 'Payment Type', 'Status'));
            foreach ($getReportArray as $row) {
                unset($row['appeal_id']);
                fputcsv($csvFileHandle, $row);
            }
            fclose($csvFileHandle);
            exit;
        }
    } catch (PDOException $e) {
        echo 'Connection failed: ' . $e->getMessage();
    }
}


// ------------Update User----------
if (isset($_POST['update_user_name'])) {
    $name = $_POST['update_user_name'];
    $dname = $_POST['dname'];
    $email = $_POST['email'];
    $role = $_POST['role'];
    $uploadDir = '../assets/images/users/';
    $imageType = pathinfo($_FILES['user_profile']['name']);
    $image_name = "profile_img" . rand() . '.' . $imageType['extension'];
    $uploadFile = $uploadDir . $image_name;
    $user_id = $_SESSION['login_user_id'];

    if (isset($_FILES['user_profile']) && !empty($_FILES['user_profile'])) {
        if (move_uploaded_file($_FILES['user_profile']['tmp_name'], $uploadFile)) {
            $sql = "UPDATE `pw_users` SET `user_login` = :name, `display_name` = :dname, `user_email` = :email, `user_img_url` = :image_name WHERE ID = :user_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':dname', $dname);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':image_name', $image_name);
            $stmt->bindParam(':user_id', $user_id);

            if ($stmt->execute()) {
                $_SESSION['login_user_image'] = $image_name;
                $_SESSION['login_user_name'] = $dname;
                echo "updated";
            } else {
                echo "error while updating the data!";
            }
        } else {
            echo "Error uploading file. " . $_FILES['user_profile']['error'];
        }
    } else {
        $sql = "UPDATE `pw_users` SET `user_login` = :name, `display_name` = :dname, `user_email` = :email WHERE ID = :user_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':dname', $dname);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':user_id', $user_id);

        if ($stmt->execute()) {
            $_SESSION['login_user_name'] = $dname;
            echo "updated";
        } else {
            echo "error while updating the data!";
        }
    }
}


// ------------------Employee Report--------------

if (isset($_POST['employeeReport'])) {
    
    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];
    $email = $_POST['email'];
    
    if (isset($_POST['loadData'])) {
        
        $getReportArray = array();
        
        // Initialize the SQL query
        $getReportData = "SELECT 
            pw_donors.id, 
            pw_donors.email, 
            pw_donors.lastname, 
            IFNULL(transactions.No_of_transaction, 0) AS 'No_of_transaction',
            IFNULL(transactions.Total_Amount, 0) AS 'Total_Amount',
            pw_matchemployer.name AS 'company_name',
            pw_matchemployer.email AS 'company_email'
        FROM 
            pw_donors
        INNER JOIN 
            pw_matchemployer ON pw_matchemployer.did = pw_donors.id
        INNER JOIN 
            pw_transactions ON pw_donors.id = pw_transactions.DID
        INNER JOIN (
            SELECT 
                pw_transactions.DID,
                SUM(IF(pw_transactions.status = 'Completed', 1, 0)) AS 'No_of_transaction',
                ROUND(SUM(IF(pw_transactions.status = 'Completed', pw_transactions.charge_amount, 0)), 2) AS 'Total_Amount'
            FROM 
                pw_transactions
            WHERE 
                pw_transactions.status = 'Completed' ";
        
        // Add other conditions based on the provided variables
        if (!empty($startDate) && !empty($endDate)) {
            if ($startDate == $endDate) {
                $getReportData .= " AND DATE(pw_transactions.date) = :endDate";
            } else {
                $getReportData .= " AND pw_transactions.date >= :startDate ";
                $getReportData .= " AND pw_transactions.date <= :endDate ";
            }
        }
        
        $getReportData .= " GROUP BY 
            pw_transactions.DID
        ) AS transactions ON transactions.DID = pw_donors.id ";
        
        // Add other conditions based on the provided variables
        if (!empty($startDate) && !empty($endDate)) {
            if ($startDate == $endDate) {
                $getReportData .= " AND DATE(pw_transactions.date) = :endDate";
            } else {
                $getReportData .= " AND pw_transactions.date >= :startDate ";
                $getReportData .= " AND pw_transactions.date <= :endDate ";
            }
        } else {
            $getReportData .= " WHERE 1=1 ";
        }
        
        if (!empty($email)) {
            $getReportData .= " AND pw_donors.email = :email";
        }
        
        $getReportData .= " GROUP BY 
            pw_donors.id, pw_matchemployer.name, pw_matchemployer.email
            ORDER BY pw_donors.id DESC
            LIMIT 50 OFFSET :startRow";
        
        $stmt = $conn->prepare($getReportData);
        
        // Bind parameters
        if (!empty($startDate) && !empty($endDate)) {
            $stmt->bindParam(':startDate', $startDate);
            $stmt->bindParam(':endDate', $endDate);
        }
        
        if (!empty($email)) {
            $stmt->bindParam(':email', $email);
        }
        
        $startRow = isset($_POST['loadData']) ? intval($_POST['loadData']) : 0;
        $stmt->bindParam(':startRow', $startRow, PDO::PARAM_INT);
        
        $stmt->execute();
        
        while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $getReportArray[] = $rows;
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }
        
        // Close the database connection
        $conn = null;
        
        $getReportJson = json_encode($getReportArray);
        header("Content-Type: application/json");
        echo $getReportJson;
        
        exit;  
        
    } else {
        
        $getReportArray = array();
        
        // Initialize the SQL query
        $getReportData = "SELECT COUNT(*) AS 'Count_of_rows'
        FROM (
            SELECT 
                pw_donors.id, 
                pw_donors.email, 
                pw_donors.lastname, 
                IFNULL(transactions.No_of_transaction, 0) AS 'No_of_transaction',
                IFNULL(transactions.Total_Amount, 0) AS 'Total_Amount',
                pw_matchemployer.name AS 'company_name',
                pw_matchemployer.email AS 'company_email'
            FROM 
                pw_donors
            INNER JOIN 
                pw_matchemployer ON pw_matchemployer.did = pw_donors.id
            INNER JOIN 
                pw_transactions ON pw_donors.id = pw_transactions.DID
            INNER JOIN (
                SELECT 
                    pw_transactions.DID,
                    SUM(IF(pw_transactions.status = 'Completed', 1, 0)) AS 'No_of_transaction',
                    ROUND(SUM(IF(pw_transactions.status = 'Completed', pw_transactions.charge_amount, 0)), 2) AS 'Total_Amount'
                FROM 
                    pw_transactions
                WHERE 
                    pw_transactions.status = 'Completed' ";
        
        // Add other conditions based on the provided variables
        if (!empty($startDate) && !empty($endDate)) {
            if ($startDate == $endDate) {
                $getReportData .= " AND DATE(pw_transactions.date) = :endDate";
            } else {
                $getReportData .= " AND pw_transactions.date >= :startDate ";
                $getReportData .= " AND pw_transactions.date <= :endDate ";
            }
        }
        
        if (!empty($email)) {
            $getReportData .= " AND pw_donors.email = :email";
        }
        
        $getReportData .= " GROUP BY 
            pw_transactions.DID
        ) AS transactions ON transactions.DID = pw_donors.id
        GROUP BY 
            pw_donors.id, pw_matchemployer.name, pw_matchemployer.email
        ORDER BY pw_donors.id DESC
        ) AS subquery";
        
        $stmt = $conn->prepare($getReportData);
        
        // Bind parameters
        if (!empty($startDate) && !empty($endDate)) {
            $stmt->bindParam(':startDate', $startDate);
            $stmt->bindParam(':endDate', $endDate);
        }
        
        if (!empty($email)) {
            $stmt->bindParam(':email', $email);
        }
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $count = $row['Count_of_rows'];
        
        // Close the database connection
        $conn = null;
        
        echo $count;
        
        exit;
    }
}

    
if(isset($_POST["employee_export_btn"])) {
    
    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];
    $email = $_POST['email'];

    $getReportArray = array();
    $getReportData = "SELECT 
        pw_donors.id, 
        pw_donors.email, 
        pw_donors.lastname, 
        IFNULL(transactions.No_of_transaction, 0) AS 'No_of_transaction',
        IFNULL(transactions.Total_Amount, 0) AS 'Total_Amount',
        pw_matchemployer.name AS 'company_name',
        pw_matchemployer.email AS 'company_email'
    FROM 
        pw_donors
    INNER JOIN 
        pw_matchemployer ON pw_matchemployer.did = pw_donors.id
    INNER JOIN 
        pw_transactions ON pw_donors.id = pw_transactions.DID
    INNER JOIN (
        SELECT 
            pw_transactions.DID,
            SUM(IF(pw_transactions.status = 'Completed', 1, 0)) AS 'No_of_transaction',
            ROUND(SUM(IF(pw_transactions.status = 'Completed', pw_transactions.charge_amount, 0)), 2) AS 'Total_Amount'
        FROM 
            pw_transactions
        WHERE 
            pw_transactions.status = 'Completed' AND 1=1 ";
        
    // Add other conditions based on the provided variables
    if (!empty($startDate) && !empty($endDate)) {
        if($startDate == $endDate){
            $getReportData .= " AND DATE(pw_transactions.date) = :endDate";
        } else {
            $getReportData .= " AND DATE(pw_transactions.date) BETWEEN :startDate AND :endDate";
        }
    }
    
    $getReportData .= " GROUP BY 
        pw_transactions.DID
    ) AS transactions ON transactions.DID = pw_donors.id";
    
    if (!empty($email)) {
        $getReportData .= " AND pw_donors.email = :email";
    }
    
    $getReportData .= " GROUP BY 
        pw_donors.id, pw_matchemployer.name, pw_matchemployer.email
        ORDER BY pw_donors.id DESC";
    
    $stmt = $conn->prepare($getReportData);

    // Bind parameters
    if (!empty($startDate) && !empty($endDate)) {
        if($startDate == $endDate){
            $stmt->bindParam(':endDate', $endDate);
        } else {
            $stmt->bindParam(':startDate', $startDate . " 00:00:00");
            $stmt->bindParam(':endDate', $endDate . " 23:59:59");
        }
    }
    
    if (!empty($email)) {
        $stmt->bindParam(':email', $email);
    }

    $stmt->execute();

    $chunkSize = 100;
    $i = 1;

    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows['id'] = $i;
        $getReportArray[] = $rows;
        $i++;
        
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }
    
    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }
        
        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=ExportDetail.csv");
        header("Pragma: no-cache");
        header("Expires: 0");
        
        fputcsv($csvFileHandle, array('id', 'Email', 'Last Name', 'No Of Transaction', 'Total Amount', 'Company Name', 'Company Email'));
        foreach ($getReportArray as $row) {
            fputcsv($csvFileHandle, $row);
        }
        fclose($csvFileHandle);
        exit;   
    }
}




// Daily Report By Saad (27/09/2023)
if (isset($_POST["btnexport_daily"])) {
    
    $from = $_POST["from"];
    $to = $_POST["to"];

    $getReportArray = array();
    $getReportData = "SELECT 
        DATE_FORMAT(pt.date, '%Y-%m-%d') AS date,
        COUNT(DISTINCT CASE WHEN pt.`status` IN ('Completed', 'pending') AND pt.order_id NOT REGEXP '_' THEN pt.order_id END) AS 'No_Of_Initial_Donations',
        SUM(CASE WHEN pt.`status` IN ('Completed', 'pending') AND pt.order_id NOT REGEXP '_' THEN pt.charge_amount ELSE 0 END) AS 'Initial_Donation_Amount',
        COUNT(DISTINCT CASE WHEN pt.`status` IN ('Completed', 'pending') AND pt.order_id REGEXP '_' THEN pt.order_id END) AS 'No_Of_Recurring_Donations',
        SUM(CASE WHEN pt.`status` IN ('Completed', 'pending') AND pt.order_id REGEXP '_' THEN pt.charge_amount ELSE 0 END) AS 'Recurring_Donation_Amount',
        COUNT(DISTINCT CASE WHEN pt.`status` IN ('Completed', 'pending') THEN pt.order_id END) AS 'No_Of_Donations',
        SUM(CASE WHEN pt.`status` IN ('Completed', 'pending') THEN pt.charge_amount ELSE 0 END) AS 'Donation_Amount'
    FROM `pw_transactions` AS pt
    WHERE pt.status IN ('Completed', 'pending')";

    if (strlen($from) > 0 && strlen($to) > 0) {
        $getReportData .= " AND DATE_FORMAT(pt.date, '%Y-%m-%d') BETWEEN :from AND :to";
    }

    $getReportData .= " GROUP BY DATE_FORMAT(pt.date, '%Y-%m-%d')
    ORDER BY MIN(pt.date);";

    // Prepare and execute the SQL query
    $stmt = $conn->prepare($getReportData);

    if (strlen($from) > 0 && strlen($to) > 0) {
        $stmt->bindParam(':from', $from);
        $stmt->bindParam(':to', $to);
    }

    $stmt->execute();

    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $getReportArray[] = $rows;

        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=DailyReport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, array('Date', 'No of Initial Donations', 'One-off Donation Amount', 'No Of Recurring Donations', 'Recurring Donations Amount', 'No Of Donations', 'Donations Amount'));
        foreach ($getReportArray as $row) {
            $formattedRow = array(
                $row['date'],
                number_format($row['No_Of_Initial_Donations']),
                number_format($row['Initial_Donation_Amount'], 2),
                number_format($row['No_Of_Recurring_Donations']),
                number_format($row['Recurring_Donation_Amount'], 2),
                number_format($row['No_Of_Donations']),
                number_format($row['Donation_Amount'], 2)
            );
            fputcsv($csvFileHandle, $formattedRow);
        }
        fclose($csvFileHandle);
        exit;
    }
}


// ------------------Daily  Report End --------------


if (isset($_POST["btnexportdaily"])) {
    
    $from = $_POST["from"];
    $to = $_POST["to"];

    $getReportArray = array();
    $getReportData = "SELECT 
    DATE_FORMAT(pt.date, '%Y-%m-%d') AS date, 
    pw_appeal.name AS appeal_name,
    COUNT(DISTINCT CASE WHEN pt.`status` IN ('Completed', 'pending') AND pt.order_id NOT REGEXP '_' THEN pt.order_id END) AS 'No_Of_Initial_Donations',
    SUM(CASE WHEN pt.`status` IN ('Completed', 'pending') AND pt.order_id NOT REGEXP '_' THEN pt.charge_amount ELSE 0 END) AS 'Initial_Donation_Amount',
    COUNT(DISTINCT CASE WHEN pt.`status` IN ('Completed', 'pending') AND pt.order_id REGEXP '_' THEN pt.order_id END) AS 'No_Of_Recurring_Donations',
    SUM(CASE WHEN pt.`status` IN ('Completed', 'pending') AND pt.order_id REGEXP '_' THEN pt.charge_amount ELSE 0 END) AS 'Recurring_Donation_Amount',
    COUNT(DISTINCT CASE WHEN pt.`status` IN ('Completed', 'pending') THEN pt.order_id END) AS 'No_Of_Donations',
    SUM(CASE WHEN pt.`status` IN ('Completed', 'pending') THEN pt.charge_amount ELSE 0 END) AS 'Donation_Amount'
FROM 
    `pw_transactions` AS pt
INNER JOIN
    pw_transaction_details ON pt.id = pw_transaction_details.TID
INNER JOIN
    pw_appeal ON pw_transaction_details.appeal_id = pw_appeal.id
WHERE 
    pt.status IN ('Completed', 'pending')  ";

    if (strlen($from) > 0 && strlen($to) > 0) {
        $getReportData .= " AND DATE_FORMAT(pt.date, '%Y-%m-%d') BETWEEN :from AND :to";
    }

    $getReportData .= " GROUP BY DATE_FORMAT(pt.date, '%Y-%m-%d'),pw_appeal.name
    ORDER BY MIN(pt.date);";

    // Prepare and execute the SQL query
    $stmt = $conn->prepare($getReportData);

    if (strlen($from) > 0 && strlen($to) > 0) {
        $stmt->bindParam(':from', $from);
        $stmt->bindParam(':to', $to);
    }

    $stmt->execute();

    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $getReportArray[] = $rows;

        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=DailyReport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, array('Date','Appeal Name', 'No of Initial Donations', 'One-off Donation Amount', 'No Of Recurring Donations', 'Recurring Donations Amount', 'No Of Donations', 'Donations Amount'));
        foreach ($getReportArray as $row) {
            $formattedRow = array(
                $row['date'],
                $row['appeal_name'],
                number_format($row['No_Of_Initial_Donations']),
                number_format($row['Initial_Donation_Amount'], 2),
                number_format($row['No_Of_Recurring_Donations']),
                number_format($row['Recurring_Donation_Amount'], 2),
                number_format($row['No_Of_Donations']),
                number_format($row['Donation_Amount'], 2)
            );
            fputcsv($csvFileHandle, $formattedRow);
        }
        fclose($csvFileHandle);
        exit;
    }
}

if (isset($_POST["toptendonation"])) {
    

    $getReportArray = array();
    $getReportData = "SELECT
    DATE_FORMAT(pw_transactions.date, '%Y-%m-%d') AS transaction_date,
    pw_appeal.name AS appeal_name,
    SUM(pw_transaction_details.amount) AS total_donation_amount,
    COUNT(pw_transactions.id) AS donation_count
FROM
    pw_transactions
INNER JOIN
    pw_transaction_details ON pw_transactions.id = pw_transaction_details.TID
INNER JOIN
    pw_appeal ON pw_transaction_details.appeal_id = pw_appeal.id
WHERE
    pw_transactions.status = 'Completed'
    AND DATE(pw_transactions.date) = CURDATE() - INTERVAL 1 DAY
GROUP BY
    transaction_date, 
    pw_appeal.name
ORDER BY
    total_donation_amount DESC
LIMIT 10";

    // Prepare and execute the SQL query
    $stmt = $conn->prepare($getReportData);


    $stmt->execute();

    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $getReportArray[] = $rows;

        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=DailyReport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, array('Date','Appeal Name',  'No Of Donations', 'Donations Amount'));
        foreach ($getReportArray as $row) {
            $formattedRow = array(
                $row['transaction_date'],
                $row['appeal_name'],

                number_format($row['donation_count']),
                number_format($row['total_donation_amount'], 2)
            );
            fputcsv($csvFileHandle, $formattedRow);
        }
        fclose($csvFileHandle);
        exit;
    }
}
if (isset($_POST["Averagedonation"])) {
    

    $getReportArray = array();
    $getReportData = "SELECT
    DATE_FORMAT(pw_transactions.date, '%Y-%m-%d') AS transaction_date,
    SUM(pw_transactions.totalamount) AS total_donation_value,
    COUNT(pw_transactions.id) AS number_of_donations,
    AVG(pw_transactions.totalamount) AS average_donation_value
FROM
    pw_transactions
WHERE
    pw_transactions.status = 'Completed'
    AND DATE(pw_transactions.date) = CURDATE() - INTERVAL 1 DAY
GROUP BY
    transaction_date";

    // Prepare and execute the SQL query
    $stmt = $conn->prepare($getReportData);


    $stmt->execute();

    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $getReportArray[] = $rows;

        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=DailyReport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, array('Date','Total Donation Amount',  'No Of Donations', 'Averege Donations Amount'));
        foreach ($getReportArray as $row) {
            $formattedRow = array(
                $row['transaction_date'],
                number_format($row['total_donation_value'], 2),
                number_format($row['number_of_donations']),
                number_format($row['average_donation_value'], 2)
            );
            fputcsv($csvFileHandle, $formattedRow);
        }
        fclose($csvFileHandle);
        exit;
    }
}

if (isset($_POST["customappealdonation"])) {
    
    $from = $_POST["from"];
    $to = $_POST["to"];

    $getReportArray = array();
    $getReportData = "SELECT
    DATE_FORMAT(pw_transactions.date, '%Y-%m-%d') AS transaction_date,
    pw_appeal.name AS appeal_name,
    SUM(pw_transaction_details.amount) AS total_donation_amount,
    COUNT(pw_transactions.id) AS donation_count
FROM
    pw_transactions
INNER JOIN
    pw_transaction_details ON pw_transactions.id = pw_transaction_details.TID
INNER JOIN
    pw_appeal ON pw_transaction_details.appeal_id = pw_appeal.id
WHERE
    pw_transactions.status = 'Completed'";

    if (strlen($from) > 0 && strlen($to) > 0) {
        $getReportData .= " AND DATE_FORMAT(pw_transactions.date, '%Y-%m-%d') BETWEEN :from AND :to";
    }

    $getReportData .= " GROUP BY
    transaction_date, 
    pw_appeal.name
ORDER BY
    total_donation_amount DESC
LIMIT 10";

    // Prepare and execute the SQL query
    $stmt = $conn->prepare($getReportData);

    if (strlen($from) > 0 && strlen($to) > 0) {
        $stmt->bindParam(':from', $from);
        $stmt->bindParam(':to', $to);
    }

    $stmt->execute();

    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $getReportArray[] = $rows;

        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=DailyReport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, array('Date','Appeal Name',  'No Of Donations', 'Donations Amount'));
        foreach ($getReportArray as $row) {
            $formattedRow = array(
                  $row['transaction_date'],
                $row['appeal_name'],

                number_format($row['donation_count']),
                number_format($row['total_donation_amount'], 2)
            );
            fputcsv($csvFileHandle, $formattedRow);
        }
        fclose($csvFileHandle);
        exit;
    }
}


//  PERmission work 
if(isset($_POST['permission'])) {
    $role_id = $_POST["role_id"];
    $permissions = $_POST["permissions"];
    
    // First, remove existing permissions for this role from the database
    $deleteQuery = "DELETE FROM pw_role_permissions WHERE role_id = :role_id";
    $stmt = $conn->prepare($deleteQuery);
    $stmt->execute([':role_id' => $role_id]);

    // Then, insert the new permissions into the database
    foreach ($permissions as $permission_id) {
        $insertQuery = "INSERT INTO pw_role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)";
        $stmt = $conn->prepare($insertQuery);
        $stmt->execute([':role_id' => $role_id, ':permission_id' => $permission_id]);
    }
    
    echo "Permissions Granted Successfully!";
    
    $role_id = $_SESSION['user_role'];
    $usernames = $_SESSION['user_login'];

    $query = "SELECT pw_permissions.permission_name 
              FROM pw_role_permissions 
              INNER JOIN pw_permissions ON pw_permissions.id = pw_role_permissions.permission_id
              INNER JOIN pw_users ON pw_users.user_role = pw_role_permissions.role_id 
              WHERE pw_users.user_role = :role_id AND pw_users.user_login = :usernames 
              ORDER BY permission_id ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([':role_id' => $role_id, ':usernames' => $usernames]);

    $_SESSION['permissions'] = [];
    if($stmt->rowCount() > 0) {
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $_SESSION['permissions'][] = $row['permission_name'];
        }
    } else {
        $_SESSION['permissions'] = '';
    }
}

if (isset($_POST["role_id"])) {
    $role_id = $_POST['role_id'];

    $sql = "SELECT pp.permission_name, pp.id
            FROM pw_user_role ur
            INNER JOIN pw_role_permissions rp ON ur.id = rp.role_id
            INNER JOIN pw_permissions pp ON rp.permission_id = pp.id
            WHERE ur.id = :role_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([':role_id' => $role_id]);
    $permissions = [];
    
    if ($stmt) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $permissions[] = $row['id'];
        }
        echo json_encode($permissions);
    } else {
        echo json_encode(['error' => 'Database query failed']);
    }
}


// ------------------Appeal Report--------------

if (isset($_POST["AppealReport"])) {

    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];
    $donationType = $_POST['appealName'];
    $getReportArray = array();

    try {
        // Initialize the SQL query
        $getReportData = "SELECT 
            pw_appeal.name AS 'campaign',
            COUNT(pw_transaction_details.appeal_id) AS 'no_of_donations',
            SUM(pw_transaction_details.amount * pw_transaction_details.quantity) AS 'donation_amount',
            COUNT(CASE WHEN pw_transactions.order_id NOT REGEXP '_' THEN 1 ELSE NULL END) AS 'no_of_initial',
            SUM(CASE WHEN pw_transactions.order_id NOT REGEXP '_' THEN pw_transaction_details.amount * pw_transaction_details.quantity ELSE 0 END) AS 'no_of_initial_amount',
            COUNT(CASE WHEN pw_transactions.order_id REGEXP '_' THEN 1 ELSE NULL END) AS 'no_of_renewal',
            SUM(CASE WHEN pw_transactions.order_id REGEXP '_' THEN pw_transaction_details.amount * pw_transaction_details.quantity ELSE 0 END) AS 'no_of_renewal_amount'
        FROM pw_transaction_details
        INNER JOIN pw_appeal ON pw_appeal.id = pw_transaction_details.appeal_id
        INNER JOIN pw_transactions ON pw_transactions.id = pw_transaction_details.TID
        WHERE pw_transactions.status = 'Completed'";

        if (!empty($startDate) && !empty($endDate)) {
            if ($startDate == $endDate) {
                $getReportData .= " AND DATE(pw_transactions.date) = :endDate";
            } else {
                $getReportData .= " AND pw_transactions.date >= :startDate AND pw_transactions.date <= :endDate";
            }
        }

        if ($donationType != "0") {
            $getReportData .= " AND pw_appeal.id = :donationType";
        }

        $getReportData .= " GROUP BY pw_appeal.name";

        // Prepare and execute the query using PDO
        $stmt = $conn->prepare($getReportData);

        if (!empty($startDate) && !empty($endDate)) {
            $stmt->bindParam(':startDate', $startDate);
            $stmt->bindParam(':endDate', $endDate);
        }

        if ($donationType != "0") {
            $stmt->bindParam(':donationType', $donationType, PDO::PARAM_INT);
        }

        $stmt->execute();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $getReportArray[] = $row;
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }

        if (count($getReportArray) > 0) {
            $csvFileHandle = fopen("php://output", "w");
            if ($csvFileHandle === false) {
                throw new Exception('Unable to open/create the CSV file.');
            }

            header("Content-Type: text/csv");
            header("Content-Disposition: attachment;  filename=AppealReport.csv");
            header("Pragma: no-cache");
            header("Expires: 0");

            // Write the header row
            fputcsv($csvFileHandle, array('Campaign', 'No Of Donations', 'Donations Amount', 'No Of Initial Donations', 'Initial Donations Amount', 'No of Renewals', 'Renewals Donation Amount'));

            // Write the data rows
            foreach ($getReportArray as $row) {
                fputcsv($csvFileHandle, $row);
            }

            // Close the CSV file
            fclose($csvFileHandle);
            exit;
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
    }
}


// ------------------Donor Detail Report--------------

if (isset($_POST["donorDetailReport"])) {

    $email = $_POST['email'];
    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];
    $country = $_POST['country'];

    $getReportArray = array();

    // Initialize the SQL query
    $getReportData = "
        SELECT 
            pw_donors.id,
            pw_donors.email,
            pw_donors.firstname,
            pw_donors.lastname,
            pw_donors.organization,
            pw_donors.add1,
            pw_donors.add2,
            pw_donors.city,
            pw_donors.country,
            pw_donors.postcode,
            pw_donors.phone,
            COUNT(CASE WHEN (pw_schedule.frequency = 'monthly' OR pw_schedule.frequency = 'yearly') THEN pw_transactions.order_id ELSE NULL END) AS no_of_transactions,
            SUM(CASE WHEN (pw_schedule.frequency = 'monthly' OR pw_schedule.frequency = 'yearly') THEN pw_transactions.totalamount ELSE 0 END) AS total_amount,
            SUM(CASE WHEN pw_schedule.frequency = 'monthly' AND pw_schedule.status = 'ACTIVE' THEN 1 ELSE 0 END) AS monthly_freq,
            SUM(CASE WHEN pw_schedule.frequency = 'yearly' AND pw_schedule.status = 'ACTIVE' THEN 1 ELSE 0 END) AS yearly_freq,
            pw_donors.Date_Added,
            MIN(pw_transactions.date) AS start_date,
            MAX(pw_transactions.date) AS end_date,
            SUM(CASE WHEN pw_schedule.frequency = 'monthly' AND pw_schedule.status != 'ACTIVE' THEN 1 ELSE 0 END) AS inactive_monthly_freq,
            SUM(CASE WHEN pw_schedule.frequency = 'yearly' AND pw_schedule.status != 'ACTIVE' THEN 1 ELSE 0 END) AS inactive_yearly_freq
        FROM pw_transactions
        INNER JOIN pw_donors ON pw_transactions.DID = pw_donors.id
        INNER JOIN pw_schedule ON pw_transactions.id = pw_schedule.tid
        WHERE 1=1
    ";

    $params = [];

    if (!empty($startDate) && !empty($endDate)) {
        if ($startDate == $endDate) {
            $getReportData .= " AND DATE(pw_donors.Date_Added) = ?";
            $params[] = $endDate;
        } else {
            $getReportData .= " AND DATE(pw_donors.Date_Added) BETWEEN ? AND ?";
            $params[] = $startDate;
            $params[] = $endDate;
        }
    }

    if (!empty($email)) {
        $getReportData .= " AND pw_donors.email LIKE ?";
        $params[] = '%' . $email . '%';
    }

    if (!empty($country) && $country != 'Country') {
        $getReportData .= " AND pw_donors.country = ?";
        $params[] = $country;
    }

    $getReportData .= "
        GROUP BY pw_donors.id, pw_donors.email, pw_donors.firstname, pw_donors.lastname
    ";

    try {
        $stmt = $conn->prepare($getReportData);
        $stmt->execute($params);

        $i = 1;
        while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $rows['id'] = $i;
            $getReportArray[] = $rows;
            $i++;
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }

        if (count($getReportArray) > 0) {
            $csvFileHandle = fopen("php://output", "w");
            if ($csvFileHandle === false) {
                throw new Exception('Unable to open/create the CSV file.');
            }

            header("Content-Type: text/csv");
            header("Content-Disposition: attachment; filename=DonorDetailReport.csv");
            header("Pragma: no-cache");
            header("Expires: 0");

            fputcsv($csvFileHandle, array('SNO', 'Email', 'First Name', 'Last Name', 'Organization', 'Address', 'State', 'City', 'Country', 'Postal Code', 'Phone', 'No Of Orders', 'Total Amount', 'No Of Monthly Subscription', 'No Yearly Subscription', 'Date Added', 'First Donation Date', 'Last Donation Date', 'No Of Monthly In-Active Subscription', 'No Yearly In-Active Subscription'));

            foreach ($getReportArray as $row) {
                fputcsv($csvFileHandle, $row);
            }

            fclose($csvFileHandle);
            exit;
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
    }
}


// ------------------Donor Report--------------

if (isset($_POST["donorReport"])) {

    $email = $_POST['email'];
    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];
    $country = $_POST['country'];

    $getReportArray = array();

    // Initialize the SQL query
    $getReportData = "
        SELECT 
            pw_donors.id,
            pw_donors.email,
            pw_donors.firstname,
            pw_donors.lastname,
            pw_donors.organization,
            pw_donors.add1,
            pw_donors.add2,
            pw_donors.city,
            pw_donors.country,
            pw_donors.postcode,
            pw_donors.phone,
            pw_donors.Date_Added
        FROM pw_donors 
        WHERE 1=1 
    ";

    $params = [];
    $types = '';

    // Add conditions based on the provided variables
    if (!empty($startDate) && !empty($endDate)) {
        if ($startDate == $endDate) {
            $getReportData .= " AND DATE(pw_donors.Date_Added) = ?";
            $params[] = $endDate;
            $types .= 's';
        } else {
            $getReportData .= " AND DATE(pw_donors.Date_Added) BETWEEN ? AND ?";
            $params[] = $startDate . ' 00:00:00';
            $params[] = $endDate . ' 23:59:59';
            $types .= 'ss';
        }
    }

    if (!empty($email)) {
        $getReportData .= " AND pw_donors.email LIKE ?";
        $params[] = '%' . $email . '%';
        $types .= 's';
    }

    if (!empty($country) && $country != 'Country') {
        $getReportData .= " AND pw_donors.country = ?";
        $params[] = $country;
        $types .= 's';
    }

    $chunkSize = 100;

   try {
        $stmt = $conn->prepare($getReportData);
        $stmt->execute($params);

        $i = 1;
        while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $rows['id'] = $i;
            $getReportArray[] = $rows;
            $i++;
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }

        if (count($getReportArray) > 0) {
            $csvFileHandle = fopen("php://output", "w");
            if ($csvFileHandle === false) {
                throw new Exception('Unable to open/create the CSV file.');
            }

            header("Content-Type: text/csv");
            header("Content-Disposition: attachment; filename=DonorReport.csv");
            header("Pragma: no-cache");
            header("Expires: 0");

            fputcsv($csvFileHandle, array('SNO', 'Email', 'First Name', 'Last Name', 'Organization', 'Address', 'State', 'City', 'Country', 'Postal Code', 'Phone', 'Date Added'));

            foreach ($getReportArray as $row) {
                fputcsv($csvFileHandle, $row);
            }

            fclose($csvFileHandle);
            exit;
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
    }
}


// ------------------Donation Report--------------

if (isset($_POST['GetReport'])) {
    $startDate = isset($_POST['startDate']) ? $_POST['startDate'] : '';
    $endDate = isset($_POST['endDate']) ? $_POST['endDate'] : '';
    $donationType = isset($_POST['donationType']) ? (is_array($_POST['donationType']) ? $_POST['donationType'] : []) : [];
    $status = isset($_POST['status']) ? $_POST['status'] : '0';
    $paymentType = isset($_POST['paymentType']) ? $_POST['paymentType'] : '0';
    $frequency = isset($_POST['frequency']) ? $_POST['frequency'] : '';
    $txtsearch = isset($_POST['txtsearch']) ? $_POST['txtsearch'] : '';
    $orderid = isset($_POST['orderid']) ? $_POST['orderid'] : '';

    if (isset($_POST['loadData'])) {
        $getReportArray = array();
        
        $getReportData = "SELECT DISTINCT t1.*, t3.*, t2.TID
                          FROM `pw_transactions` AS t1
                          INNER JOIN `pw_transaction_details` AS t2 ON t1.id = t2.TID 
                          INNER JOIN `pw_donors` AS t3 ON t1.DID = t3.id 
                          WHERE 1=1";
        
        $params = [];

        if (!empty($startDate) && !empty($endDate)) {
            if ($startDate == $endDate) {
                $getReportData .= " AND DATE(t1.date) = :endDate";
                $params[':endDate'] = $endDate;
            } else {
                $getReportData .= " AND DATE(t1.date) BETWEEN :startDate AND :endDate";
                $params[':startDate'] = "$startDate 00:00:00";
                $params[':endDate'] = "$endDate 23:59:59";
            }
        }
        
        if (!empty($donationType) && is_array($donationType)) {
        $donationPlaceholders = [];
        foreach ($donationType as $index => $donation) {
            $key = ":donationType" . $index;
            $donationPlaceholders[] = $key;
            $params[$key] = $donation;
        }
    
        $getReportData .= " AND t2.appeal_id IN (" . implode(',', $donationPlaceholders) . ")";
    }
        
        if ($status != "0") {
            $getReportData .= " AND t1.status = :status";
            $params[':status'] = $status;
        }
        
        if ($paymentType != "0") {
            if ($paymentType == 'PAYPAL') {
                $getReportData .= " AND (t1.paymenttype = 'PAYPAL' OR t1.paymenttype = 'paypal_ipn')";
            } else {
                $getReportData .= " AND t1.paymenttype = :paymentType";
                $params[':paymentType'] = $paymentType;
            }
        }
        
        if ($frequency == '0' || $frequency == '1' || $frequency == '2' || $frequency == '3') {
            $getReportData .= " AND t2.freq = :frequency";
            $params[':frequency'] = $frequency;
        }
        
        if (!empty($txtsearch)) {
            $getReportData .= " AND (t3.email LIKE :txtsearch OR t3.firstname LIKE :txtsearch OR t3.lastname LIKE :txtsearch OR t3.phone LIKE :txtsearch)";
            $params[':txtsearch'] = "%$txtsearch%";
        }
        
        if (!empty($orderid)) {
            $getReportData .= " AND (t1.order_id LIKE :orderid OR t1.TID LIKE :orderid)";
            $params[':orderid'] = "%$orderid%";
        }
        
        $getReportData .= " ORDER BY t2.TID DESC";

        // Handle chunked loading
        $startRow = isset($_POST['loadData']) ? intval($_POST['loadData']) : 0;
        $chunkSize = isset($_POST['chunkSize']) ? intval($_POST['chunkSize']) : 50;

        // Limit chunk size to prevent memory issues
        if ($chunkSize > 1000) {
            $chunkSize = 1000;
        }

        $getReportData .= " LIMIT $chunkSize OFFSET $startRow";

        try {
            $stmt = $conn->prepare($getReportData);
            $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            echo json_encode(['error' => 'Database error occurred']);
            exit;
        }
        
        while ($rows = $stmt->fetch()) {
            $getReportArray[] = $rows;
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }
        
        $conn = null; // Close the connection
        $getReportJson = json_encode($getReportArray);
        header("Content-Type: application/json");
        echo $getReportJson;
        
        exit;  
        
    } else {
        
        $getReportData = "SELECT COUNT(DISTINCT t1.id)
                          FROM `pw_transactions` AS t1
                          INNER JOIN `pw_transaction_details` AS t2 ON t1.id = t2.TID
                          INNER JOIN `pw_donors` AS t3 ON t1.DID = t3.id
                          WHERE 1=1";
        
        $params = [];
        
        if (!empty($startDate) && !empty($endDate)) {
            $getReportData .= " AND DATE(t1.date) BETWEEN :startDate AND :endDate";
            $params[':startDate'] = "$startDate 00:00:00";
            $params[':endDate'] = "$endDate 23:59:59";
        }
        
            if (!empty($donationType) && is_array($donationType)) {
        $donationPlaceholders = [];
        foreach ($donationType as $index => $donation) {
            $key = ":donationType" . $index;
            $donationPlaceholders[] = $key;
            $params[$key] = $donation;
        }
    
        $getReportData .= " AND t2.appeal_id IN (" . implode(',', $donationPlaceholders) . ")";
    }
        
        if ($status != "0") {
            $getReportData .= " AND t1.status = :status";
            $params[':status'] = $status;
        }
        
        if ($paymentType != "0") {
            $getReportData .= " AND t1.paymenttype = :paymentType";
            $params[':paymentType'] = $paymentType;
        }
        
        if ($frequency == '0' || $frequency == '1' || $frequency == '2' || $frequency == '3') {
            $getReportData .= " AND t2.freq = :frequency";
            $params[':frequency'] = $frequency;
        }
        
        if (!empty($txtsearch)) {
            $getReportData .= " AND (t3.email LIKE :txtsearch OR t3.firstname LIKE :txtsearch OR t3.lastname LIKE :txtsearch OR t3.phone LIKE :txtsearch)";
            $params[':txtsearch'] = "%$txtsearch%";
        }
        
        if (!empty($orderid)) {
            $getReportData .= " AND (t1.order_id LIKE :orderid OR t1.TID LIKE :orderid)";
            $params[':orderid'] = "%$orderid%";
        }
        
        $getReportData .= " ORDER BY t2.TID DESC";
        
        $stmt = $conn->prepare($getReportData);
        $stmt->execute($params);
        
        $row = $stmt->fetchColumn();
        $count = $row;
        
        $conn = null; // Close the connection
        
        echo $count;
        
        exit;
    }
}


    
if (isset($_POST["btnexport_summary"])) {
    // Retrieve POST variables
    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];
    $donationType = isset($_POST['donationType']) ? (is_array($_POST['donationType']) ? $_POST['donationType'] : []) : [];
    $status = $_POST['status'];
    $paymentType = $_POST['paymentType'];
    $frequency = $_POST['frequency'];
    $txtsearch = $_POST['txtsearch'];
    $orderid = $_POST['orderid'];
    $getReportArray = [];
    $params = []; // Ensure the params array is initialized

    // Initialize the SQL query
    $getReportData = "SELECT DISTINCT
        pw_transactions.id,
        pw_transactions.date,
        pw_donors.firstname,
        pw_donors.lastname,
        pw_donors.email,
        pw_donors.phone,
        pw_donors.city,
        pw_donors.country,
        pw_donors.add2,
        pw_donors.postcode,
        pw_transactions.card_fee,
        pw_transactions.totalamount,
        pw_transactions.charge_amount,
        pw_transactions.TID,
        pw_transactions.order_id,
        pw_transactions.status,
        pw_transactions.notes
    FROM
        pw_transactions
    INNER JOIN
        pw_donors ON pw_donors.id = pw_transactions.did
    INNER JOIN
        pw_transaction_details ON pw_transactions.id = pw_transaction_details.TID
    WHERE 1=1 ";

    // Add conditions based on the provided variables
    if (!empty($startDate) && !empty($endDate)) {
        if ($startDate == $endDate) {
            $getReportData .= " AND DATE(pw_transactions.date) = :startDate";
            $params[':startDate'] = $startDate;
        } else {
            $getReportData .= " AND DATE(pw_transactions.date) BETWEEN :startDate AND :endDate";
            $params[':startDate'] = $startDate;
            $params[':endDate'] = $endDate;
        }
    }

    if (!empty($donationType) && is_array($donationType)) {
        $donationPlaceholders = [];
        foreach ($donationType as $index => $donation) {
            $key = ":donationType" . $index;
            $donationPlaceholders[] = $key;
            $params[$key] = $donation;
        }
        $getReportData .= " AND pw_transaction_details.appeal_id IN (" . implode(',', $donationPlaceholders) . ")";
    }

    if ($status != "0") {
        $getReportData .= " AND pw_transactions.status = :status";
        $params[':status'] = $status;
    }

    if ($paymentType != "0") {
        $getReportData .= " AND pw_transactions.paymenttype = :paymentType";
        $params[':paymentType'] = $paymentType;
    }

    if (in_array($frequency, ['0', '1', '2', '3'])) {
        $getReportData .= " AND pw_transaction_details.freq = :frequency";
        $params[':frequency'] = $frequency;
    }

    if (!empty($txtsearch)) {
        $getReportData .= " AND (pw_donors.email LIKE :txtsearch OR pw_donors.firstname LIKE :txtsearch OR pw_donors.lastname LIKE :txtsearch OR pw_donors.phone LIKE :txtsearch OR pw_donors.organization LIKE :txtsearch)";
        $params[':txtsearch'] = "%$txtsearch%";
    }

    if (!empty($orderid)) {
        $getReportData .= " AND (pw_transactions.order_id LIKE :orderid OR pw_transactions.TID LIKE :orderid)";
        $params[':orderid'] = "%$orderid%";
    }

    // Execute the SQL query
    $stmt = $conn->prepare($getReportData);

    // Bind parameters dynamically
    foreach ($params as $key => &$val) {
        $stmt->bindParam($key, $val);
    }

    $stmt->execute();

    $chunkSize = 100;
    $i = 1;
    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows['id'] = $i;
        foreach ($rows as $key => $value) {
            $rows[$key] = preg_replace('/\r\n/', ' ', $value);
        }
        $getReportArray[] = $rows;
        $i++;
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=ExportSummary.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, array('SNO', 'Date', 'First Name', 'Last Name', 'Email', 'Phone Number', 'City', 'Country', 'State', 'Postal Code', 'Card Fee', 'Total Amount', 'Charge Amount', 'Transaction ID', 'Order ID', 'Status', 'Notes'));

        foreach ($getReportArray as $row) {
            fputcsv($csvFileHandle, $row);
        }

        fclose($csvFileHandle);
        exit;
    }
}


if (isset($_POST["btnexport"])) {
    // Retrieve POST variables
    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];
    $donationType = isset($_POST['donationType']) ? (is_array($_POST['donationType']) ? $_POST['donationType'] : []) : [];
    $status = $_POST['status'];
    $paymentType = $_POST['paymentType'];
    $frequency = $_POST['frequency'];
    $txtsearch = $_POST['txtsearch'];
    $orderid = $_POST['orderid'];
    $getReportArray = array();

    // Initialize the SQL query
    $getReportData = "SELECT
        pw_transactions.id,
        pw_transactions.date,
        pw_appeal.name as appeal_name,
        pw_amount.name as amount_name,
        pw_fundlist.name as fund_name,
        pw_transactions.order_id,
        pw_transaction_details.freq,
        pw_transactions.TID,
        pw_transaction_details.amount,
        pw_transaction_details.quantity,
        pw_transactions.totalamount,
        pw_transactions.card_fee,
        pw_donors.firstname,
        pw_donors.lastname,
        pw_donors.email,
        pw_donors.phone,
        pw_donors.add1,
        pw_donors.city,
        pw_donors.country,
        pw_donors.add2,
        pw_donors.postcode,
        pw_transactions.notes,
        pw_transactions.paymenttype,
        pw_transactions.status
    FROM
        pw_donors
    INNER JOIN
        pw_transactions ON pw_donors.id = pw_transactions.did
    INNER JOIN
        pw_transaction_details ON pw_transactions.id = pw_transaction_details.TID
    INNER JOIN
        pw_appeal ON pw_transaction_details.appeal_id = pw_appeal.id
    INNER JOIN
        pw_amount ON pw_transaction_details.amount_id = pw_amount.id
    INNER JOIN
        pw_fundlist ON pw_transaction_details.fundlist_id = pw_fundlist.id
    WHERE 1=1";

    // Add other conditions based on the provided variables
    $params = [];

    if (!empty($startDate) && !empty($endDate)) {
        $getReportData .= " AND DATE(pw_transactions.date) BETWEEN :startDate AND :endDate";
        $params[':startDate'] = $startDate . ' 00:00:00';
        $params[':endDate'] = $endDate . ' 23:59:59';
    }

     if (!empty($donationType) && is_array($donationType)) {
        $donationPlaceholders = [];
        foreach ($donationType as $index => $donation) {
            $key = ":donationType" . $index;
            $donationPlaceholders[] = $key;
            $params[$key] = $donation;
        }
    
        $getReportData .= " AND pw_transaction_details.appeal_id IN (" . implode(',', $donationPlaceholders) . ")";
    }

    if ($status != "0") {
        $getReportData .= " AND pw_transactions.status = :status";
        $params[':status'] = $status;
    }

    if ($paymentType != "0") {
        $getReportData .= " AND pw_transactions.paymenttype = :paymentType";
        $params[':paymentType'] = $paymentType;
    }

    if ($frequency == '0' || $frequency == '1' || $frequency == '2' || $frequency == '3') {
        $getReportData .= " AND pw_transaction_details.freq = :frequency";
        $params[':frequency'] = $frequency;
    }

    // Check if $txtsearch is provided for search filter
    if (!empty($txtsearch)) {
        $getReportData .= " AND (pw_donors.email LIKE :txtsearch OR pw_donors.firstname LIKE :txtsearch OR pw_donors.lastname LIKE :txtsearch OR pw_donors.phone LIKE :txtsearch OR pw_donors.organization LIKE :txtsearch)";
        $params[':txtsearch'] = '%' . $txtsearch . '%';
    }

    if (!empty($orderid)) {
        $getReportData .= " AND (pw_transactions.order_id LIKE :orderid OR pw_transactions.TID LIKE :orderid)";
        $params[':orderid'] = '%' . $orderid . '%';
    }

    // Prepare and execute the SQL query
    $stmt = $conn->prepare($getReportData);
    $stmt->execute($params);

    $chunkSize = 100;
    $i = 1;

    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows['id'] = $i;
        $rows['date'] = preg_replace('/\r\n/', ' ', $rows['date']);
        $rows['appeal_name'] = preg_replace('/\r\n/', ' ', $rows['appeal_name']);
        $rows['amount_name'] = preg_replace('/\r\n/', ' ', $rows['amount_name']);
        $rows['fund_name'] = preg_replace('/\r\n/', ' ', $rows['fund_name']);
        $rows['order_id'] = preg_replace('/\r\n/', ' ', $rows['order_id']);
        $rows['freq'] = preg_replace('/\r\n/', ' ', $rows['freq']);
        if ($rows['freq'] == 0) {
            $rows['freq'] = 'One-Off';
        } else if ($rows['freq'] == 1) {
            $rows['freq'] = 'Monthly';
        } else if ($rows['freq'] == 2) {
            $rows['freq'] = 'Yearly';
        } else if ($rows['freq'] == 3) {
            $rows['freq'] = 'Daily';
        }
        $rows['TID'] = preg_replace('/\r\n/', ' ', $rows['TID']);
        $rows['amount'] = preg_replace('/\r\n/', ' ', $rows['amount']);
        $rows['quantity'] = preg_replace('/\r\n/', ' ', $rows['quantity']);
         $rows['subamount'] = $rows['amount'] * $rows['quantity'];
        if ($rows['card_fee'] != 0) {
            $rows['card_fee'] = $rows['subamount'] * 0.03;
        }
        $rows['totalamount']=$rows['subamount']+$rows['card_fee'];
        $rows['firstname'] = preg_replace('/\r\n/', ' ', $rows['firstname']);
        $rows['lastname'] = preg_replace('/\r\n/', ' ', $rows['lastname']);
        $rows['email'] = preg_replace('/\r\n/', ' ', $rows['email']);
        $rows['phone'] = preg_replace('/\r\n/', ' ', $rows['phone']);
        $rows['add1'] = preg_replace('/\r\n/', ' ', $rows['add1']);
        $rows['city'] = preg_replace('/\r\n/', ' ', $rows['city']);
        $rows['country'] = preg_replace('/\r\n/', ' ', $rows['country']);
        $rows['add2'] = preg_replace('/\r\n/', ' ', $rows['add2']);
        $rows['postcode'] = preg_replace('/\r\n/', ' ', $rows['postcode']);
        //$rows['notes'] = preg_replace('/\r\n/', ' ', $rows['notes']);
        $rows['paymenttype'] = preg_replace('/\r\n/', ' ', $rows['paymenttype']);
        $rows['status'] = preg_replace('/\r\n/', ' ', $rows['status']);

        // Output the processed row
        $getReportArray[] = $rows;
        $i++;
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=ExportDetail.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, [
            'SNO', 'Date', 'Donation Name', 'Amount Type', 'Fund Type', 
             'Order ID', 'Frequency', 
            'Transaction ID', 'Amount', 'Quantity', 'Sub Total', 
            'Card Fee','Total Amount', 'First Name', 'Last Name', 'Email', 'Phone Number', 
            'Address', 'City', 'Country', 'State', 'Postal Code', 'Notes', 
            'Payment Type', 'Status'
        ]);

       foreach ($getReportArray as $row) {
            fputcsv($csvFileHandle, [
                $row['id'], $row['date'], $row['appeal_name'], $row['amount_name'], $row['fund_name'], 
                 $row['order_id'], $row['freq'], 
                $row['TID'], $row['amount'], $row['quantity'], $row['subamount'], 
                $row['card_fee'],$row['totalamount'], $row['firstname'], $row['lastname'], $row['email'], $row['phone'], 
                $row['add1'], $row['city'], $row['country'], $row['add2'], $row['postcode'], 
                $row['notes'], $row['paymenttype'], $row['status']
            ]);
        }

        fclose($csvFileHandle);
        exit;
    }
}

// ------------------Schedule Report--------------

if (isset($_POST['ScheduleReport'])) {
    $status = $_POST['status'];
    $search = $_POST['search'];
    $donationType = $_POST['donation'];
    $sstartDate = $_POST['startDate'];
    $sendDate = $_POST['endDate'];

    if (isset($_POST['loadDataSchedule'])) {
        $getReportArray = array();
        
        // Initialize the SQL query
        $getReportData = "SELECT 
            pw_schedule.id as sch_id,
            pw_appeal.name,
            pw_schedule.tid,
            pw_schedule.amount,
            pw_schedule.startdate,
            pw_schedule.frequency,
            pw_schedule.status,
            pw_donors.firstname,
            pw_donors.email,
            pw_schedule.order_id,
            pw_appeal.id 
        FROM 
            pw_schedule
        INNER JOIN pw_donors ON pw_schedule.did = pw_donors.id 
        INNER JOIN pw_transaction_details ON pw_transaction_details.id = pw_schedule.td_id 
        INNER JOIN pw_appeal ON pw_transaction_details.appeal_id = pw_appeal.id 
        WHERE 1=1";

        // Add conditions based on the provided variables
        $params = [];

        if ($status != "10") {
            $getReportData .= " AND pw_schedule.status = :status";
            $params[':status'] = $status;
        }
        if (!empty($search)) {
            $getReportData .= " AND (pw_donors.email LIKE :search OR pw_donors.firstname LIKE :search OR pw_donors.lastname LIKE :search OR pw_donors.phone LIKE :search OR pw_donors.organization LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        if ($donationType != "0" && !empty($donationType)) {
            $getReportData .= " AND pw_appeal.id = :donationType";
            $params[':donationType'] = $donationType;
        }
        if (!empty($sstartDate) && !empty($sendDate)) {
            if ($sstartDate == $sendDate) {
                $getReportData .= " AND DATE(pw_schedule.startdate) = :sendDate";
                $params[':sendDate'] = $sendDate;
            } else {
                $getReportData .= " AND DATE(pw_schedule.startdate) BETWEEN :sstartDate AND :sendDate";
                $params[':sstartDate'] = $sstartDate . ' 00:00:00';
                $params[':sendDate'] = $sendDate . ' 23:59:59';
            }
        }

        $chunkSize = 100;
        $startRow = isset($_POST['loadDataSchedule']) ? intval($_POST['loadDataSchedule']) : 0;
        $getReportData .= " ORDER BY pw_schedule.id DESC LIMIT 50 OFFSET $startRow";
        
        // Prepare and execute the SQL query
        $stmt = $conn->prepare($getReportData);
        $stmt->execute($params);

        while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $getReportArray[] = $rows;
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }

        // Close the database connection
        $conn = null;
        header("Content-Type: application/json");
        $getReportJson = json_encode($getReportArray);
        echo $getReportJson;
        exit;
    } else {
        // Initialize the SQL query for counting
        $getReportData = "SELECT COUNT(*)
            FROM pw_schedule
        INNER JOIN pw_donors ON pw_schedule.did = pw_donors.id 
        INNER JOIN pw_transaction_details ON pw_transaction_details.id = pw_schedule.td_id 
        INNER JOIN pw_appeal ON pw_transaction_details.appeal_id = pw_appeal.id 
        WHERE 1=1";

        // Add conditions based on the provided variables
        $params = [];

        if ($status != "10") {
            $getReportData .= " AND pw_schedule.status = :status";
            $params[':status'] = $status;
        }
        if (!empty($search)) {
            $getReportData .= " AND (pw_donors.email LIKE :search OR pw_donors.firstname LIKE :search OR pw_donors.lastname LIKE :search OR pw_donors.phone LIKE :search OR pw_donors.organization LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        if ($donationType != "0" && !empty($donationType)) {
            $getReportData .= " AND pw_appeal.id = :donationType";
            $params[':donationType'] = $donationType;
        }
        if (!empty($sstartDate) && !empty($sendDate)) {
            if ($sstartDate == $sendDate) {
                $getReportData .= " AND DATE(pw_schedule.startdate) = :sendDate";
                $params[':sendDate'] = $sendDate;
            } else {
                $getReportData .= " AND DATE(pw_schedule.startdate) BETWEEN :sstartDate AND :sendDate";
                $params[':sstartDate'] = $sstartDate . ' 00:00:00';
                $params[':sendDate'] = $sendDate . ' 23:59:59';
            }
        }

        // Prepare and execute the SQL query
        $stmt = $conn->prepare($getReportData);
        $stmt->execute($params);

        $row = $stmt->fetch(PDO::FETCH_NUM);
        $count = $row[0];

        // Close the database connection
        $conn = null;
        echo $count;
        exit;
    }
}


if (isset($_POST["export_schedule"])) {
    $status = $_POST['status'];
    $search = $_POST['search'];
    $donationType = $_POST['donation'];
    $sstartDate = $_POST['startDate'];
    $sendDate = $_POST['endDate'];
    
    $getReportArray = array();

    // Initialize the SQL query
    $getReportData = "SELECT 
        pw_schedule.id as sch_id,
        pw_appeal.name,
        pw_schedule.order_id,
        pw_schedule.amount,
        pw_schedule.startdate,
        pw_schedule.frequency,
        pw_schedule.status,
        pw_donors.firstname,
        pw_donors.email
    FROM 
        pw_schedule
    INNER JOIN pw_donors ON pw_schedule.did = pw_donors.id 
    INNER JOIN pw_transaction_details ON pw_transaction_details.id = pw_schedule.td_id 
    INNER JOIN pw_appeal ON pw_transaction_details.appeal_id = pw_appeal.id 
    WHERE 1=1";

    // Add conditions based on the provided variables
    $params = [];

    if ($status != "10") {
        $getReportData .= " AND pw_schedule.status = :status";
        $params[':status'] = $status;
    }
    if (!empty($search)) {
        $getReportData .= " AND (pw_donors.email LIKE :search OR pw_donors.firstname LIKE :search OR pw_donors.lastname LIKE :search OR pw_donors.phone LIKE :search OR pw_donors.organization LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }
    if ($donationType != "0" && !empty($donationType)) {
        $getReportData .= " AND pw_appeal.id = :donationType";
        $params[':donationType'] = $donationType;
    }
    if (!empty($sstartDate) && !empty($sendDate)) {
        if ($sstartDate == $sendDate) {
            $getReportData .= " AND DATE(pw_schedule.startdate) = :sendDate";
            $params[':sendDate'] = $sendDate;
        } else {
            $getReportData .= " AND DATE(pw_schedule.startdate) BETWEEN :sstartDate AND :sendDate";
            $params[':sstartDate'] = $sstartDate . ' 00:00:00';
            $params[':sendDate'] = $sendDate . ' 23:59:59';
        }
    }

    // Prepare and execute the SQL query
    $stmt = $conn->prepare($getReportData);
    $stmt->execute($params);

    // Fetch data from your source (e.g., database) for the current page
    $i = 1;
    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows['id'] = $i;
        $getReportArray[] = $rows;
        $i++;
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=ScheduleReport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, array('SNO', 'Donation Type', 'Order ID', 'Amount', 'Start Date', 'Frequency', 'Status', 'First Name', 'Email'));

        foreach ($getReportArray as $row) {
            unset($row['id']);
            fputcsv($csvFileHandle, $row);
        }

        fclose($csvFileHandle);
        exit;
    }
}

// --------------------G4 Data Start-------------


if (isset($_POST['ipndata'])) {
    
    $orderid = $_POST['searchipn'];
    $startDate = $_POST['g4_startDate'];
    $endDate = $_POST['g4_endDate'];
   
    if (isset($_POST['loadDataipn'])) {
        
        $getReportArray = array();
        
        // Initialize the SQL query
        $getReportData = "SELECT * FROM pw_g4_request_check WHERE 1=1";
        
        $params = [];
        
        if (!empty($orderid)) {
            $getReportData .= " AND pw_g4_request_check.order_id LIKE :orderid";
            $params[':orderid'] = '%' . $orderid . '%';
        }
        if (!empty($startDate) && !empty($endDate)) {
            if ($startDate == $endDate) {
                $getReportData .= " AND DATE(pw_g4_request_check.date) = :startDate";
                $params[':startDate'] = $startDate;
            } else {
                $getReportData .= " AND DATE(pw_g4_request_check.date) BETWEEN :startDate AND :endDate";
                $params[':startDate'] = $startDate . ' 00:00:00';
                $params[':endDate'] = $endDate . ' 23:59:59';
            }
        }
        
        $startRow = isset($_POST['loadDataipn']) ? intval($_POST['loadDataipn']) : 0;
        $getReportData .= " ORDER BY pw_g4_request_check.order_id DESC LIMIT 50 OFFSET $startRow";
        
        // Prepare and execute the SQL query
        $stmt = $conn->prepare($getReportData);
        $stmt->execute($params);
        
        header("Content-Type: application/json");
        while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $getReportArray[] = $rows;
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }
        
        // Close the database connection
        $conn = null;
       
        echo json_encode($getReportArray);
        
        exit;  
    
    } else {
        
        // Initialize the SQL query
        $getReportData = "SELECT COUNT(*) FROM pw_g4_request_check WHERE 1=1";
        
        $params = [];
        
        if (!empty($orderid)) {
            $getReportData .= " AND pw_g4_request_check.order_id LIKE :orderid";
            $params[':orderid'] = '%' . $orderid . '%';
        }
        if (!empty($startDate) && !empty($endDate)) {
            if ($startDate == $endDate) {
                $getReportData .= " AND DATE(pw_g4_request_check.date) = :startDate";
                $params[':startDate'] = $startDate;
            } else {
                $getReportData .= " AND DATE(pw_g4_request_check.date) BETWEEN :startDate AND :endDate";
                $params[':startDate'] = $startDate . ' 00:00:00';
                $params[':endDate'] = $endDate . ' 23:59:59';
            }
        }
        
        // Prepare and execute the SQL query
        $stmt = $conn->prepare($getReportData);
        $stmt->execute($params);
        
        $row = $stmt->fetch(PDO::FETCH_NUM);
        $count = $row[0];
        
        // Close the database connection
        $conn = null;
        
        echo $count;
        
        exit;
    }
}




if (isset($_POST["g4export"])) {
    try {
        $startDate = $_POST['g4_startdate'];
        $endDate = $_POST['g4_enddate'];
        $orderid = $_POST['g4_orderid'];

        $getReportArray = [];

        $getReportData = "SELECT id, order_id, response, date FROM pw_g4_request_check WHERE 1=1";
        $whereClauses = [];
        $params = [];

        if (!empty($orderid)) {
            $getReportData .= " AND order_id LIKE :orderid";
            $params[':orderid'] = '%' . $orderid . '%';
        }

        if (!empty($startDate) && !empty($endDate)) {
            if ($startDate == $endDate) {
                $getReportData .= " AND DATE(date) = :startDate";
                $params[':startDate'] = $startDate;
            } else {
                $getReportData .= " AND DATE(date) BETWEEN :startDate AND :endDate";
                $params[':startDate'] = $startDate;
                $params[':endDate'] = $endDate;
            }
        }

        // Prepare and execute
        $stmt = $conn->prepare($getReportData);
        $stmt->execute($params);

        // Collect results
        $i = 1;
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['id'] = $i;
            $getReportArray[] = $row;
            $i++;
        }

        if (count($getReportArray) > 0) {
            // Clean output buffer
            if (ob_get_level()) {
                ob_end_clean();
            }

            // Send headers before output
            header("Content-Type: text/csv");
            header("Content-Disposition: attachment; filename=G4Report.csv");
            header("Pragma: no-cache");
            header("Expires: 0");

            // Output CSV
            $csvFileHandle = fopen("php://output", "w");
            fputcsv($csvFileHandle, ["SNO", "Order ID", "Response", "Date"]);

            foreach ($getReportArray as $row) {
                fputcsv($csvFileHandle, [
                    $row['id'],
                    $row['order_id'],
                    $row['response'],
                    $row['date']
                ]);
            }

            fclose($csvFileHandle);
            exit;
        } else {
            echo "No records found for the given filters.";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
    }
}







// --------------------G4 Data End-------------


// --------------------capi Data Start-------------

if (isset($_POST["capi_export"])) {
    $startDate = $_POST['capi_startdate'] ?? '';
    $endDate = $_POST['capi_enddate'] ?? '';
    $orderid = $_POST['capi_orderid'] ?? '';

    // 1) Base query
    $sql = "
                SELECT
                c.order_id,
                c.date,
                c.response,
                c.json_object,
                d.email
                FROM pw_capi_response AS c
                LEFT JOIN pw_transactions AS t ON t.order_id = c.order_id
                LEFT JOIN pw_donors AS d ON d.id = t.did
                WHERE 1=1
                ";
    $params = [];

    // 2) Order ID filter
    if ($orderid !== '') {
        $sql .= " AND c.order_id LIKE :orderid";
        $params['orderid'] = "%{$orderid}%";
    }

    // 3) Date filter
    if ($startDate !== '' && $endDate !== '') {
        if ($startDate === $endDate) {
            // filter by pure DATE
            $sql .= " AND DATE(c.date) = :startDate";
            $params['startDate'] = $startDate;
        } else {
            // filter by full datetime bounds
            $sql .= " AND c.date BETWEEN :startDateTime AND :endDateTime";
            $params['startDateTime'] = $startDate . " 00:00:00";
            $params['endDateTime'] = $endDate . " 23:59:59";
        }
    }

    // 4) Prepare & execute
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($rows)) {
        die("No records found for those filters.");
    }

    // 5) Streaming CSV output
    header("Content-Type: text/csv");
    header("Content-Disposition: attachment; filename=capiReport.csv");
    header("Pragma: no-cache");
    header("Expires: 0");

    $out = fopen("php://output", "w");
    fputcsv($out, ["SNO", "Order ID", "Email", "Value", "DB Time (Server Time)", "Event Time (UTC)", "Status"]);

    $sno = 1;
    foreach ($rows as $r) {
        // decode the JSON payload to extract `value` & `event_time`
        $clean = preg_replace('/,\s*([\]}])/m', '$1', $r['json_object']);
        $j = json_decode($clean, true);
        $value = $j['data'][0]['custom_data']['value'] ?? '';
        $evtTs = isset($j['data'][0]['event_time'])
            ? gmdate("Y-m-d H:i:s", $j['data'][0]['event_time'])
            : '';

        // decode the response object to check events_received
        $resp = @json_decode($r['response'], true);
        $status = (isset($resp['events_received']) && $resp['events_received'] == 1)
            ? 'Success'
            : 'Failed';

        // db timestamp
        $dbtime = $r['date'];

        fputcsv($out, [
            $sno++,
            $r['order_id'],
            $r['email'],
            $value,
            $dbtime,
            $evtTs,
            $status
        ]);
    }

    fclose($out);
    exit;
}

// --------------------capi Data End-------------


if (isset($_POST["muharram"])) {
    // Start output buffering to avoid header issues
    ob_start();

    // Get year filter
    $currentYear = date('Y');

    // Retrieve POST variables safely
    $txtsearch = isset($_POST['email']) ? $_POST['email'] : '';
    $orderid = isset($_POST['orderid']) ? $_POST['orderid'] : '';
    $getReportArray = [];

    // Initialize the SQL query
    $getReportData = "SELECT
        pw_transactions.id,
        pw_transactions.date,
        pw_appeal.name AS appeal_name,
        pw_amount.name AS amount_name,
        pw_fundlist.name AS fund_name,
        pw_transactions.order_id,
        pw_transaction_details.freq,
        pw_transactions.TID,
        pw_transaction_details.amount,
        pw_transaction_details.quantity,
        pw_transactions.totalamount,
        pw_transactions.card_fee,
        pw_donors.firstname,
        pw_donors.lastname,
        pw_donors.email,
        pw_donors.phone,
        pw_donors.add1,
        pw_donors.city,
        pw_donors.country,
        pw_donors.add2,
        pw_donors.postcode,
        pw_transactions.notes,
        pw_transactions.paymenttype,
        pw_transactions.status
    FROM
        pw_donors
    INNER JOIN pw_transactions ON pw_donors.id = pw_transactions.did
    INNER JOIN pw_transaction_details ON pw_transactions.id = pw_transaction_details.TID
    INNER JOIN pw_appeal ON pw_transaction_details.appeal_id = pw_appeal.id
    INNER JOIN pw_amount ON pw_transaction_details.amount_id = pw_amount.id
    INNER JOIN pw_fundlist ON pw_transaction_details.fundlist_id = pw_fundlist.id
    WHERE pw_appeal.id = 29 AND YEAR(pw_transactions.date) = :currentYear";

    $params = [':currentYear' => $currentYear];

    // Add search filter if available
    if (!empty($txtsearch)) {
        $getReportData .= " AND (
            pw_donors.email LIKE :txtsearch OR 
            pw_donors.firstname LIKE :txtsearch OR 
            pw_donors.lastname LIKE :txtsearch OR 
            pw_donors.phone LIKE :txtsearch OR 
            pw_donors.organization LIKE :txtsearch
        )";
        $params[':txtsearch'] = '%' . $txtsearch . '%';
    }

    if (!empty($orderid)) {
        $getReportData .= " AND (
            pw_transactions.order_id LIKE :orderid OR 
            pw_transactions.TID LIKE :orderid
        )";
        $params[':orderid'] = '%' . $orderid . '%';
    }

    // Prepare and execute query
    $stmt = $conn->prepare($getReportData);
    $stmt->execute($params);

    $i = 1;
    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows['id'] = $i;

        // Clean/format data
        foreach ($rows as $key => $value) {
            $rows[$key] = trim($value);
        }

        

        // Calculate subamount and card_fee
        $rows['subamount'] = $rows['amount'] * $rows['quantity'];
        $rows['card_fee'] = $rows['subamount'] * 0.03;
        $rows['totalamount'] = $rows['subamount'] + $rows['card_fee'];

        $getReportArray[] = $rows;
        $i++;

        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        // Send CSV headers
        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=ExportDetail.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        // CSV Header Row
        fputcsv($csvFileHandle, [
            'SNO', 'Date', 'Donation Name', 'Amount Type', 'Fund Type',
            'Order ID', 'Frequency',
            'Transaction ID', 'Amount', 'Quantity', 'Sub Total',
            'Card Fee', 'Total Amount', 'First Name', 'Last Name', 'Email', 'Phone Number',
            'Address', 'City', 'Country', 'State', 'Postal Code', 'Notes',
            'Payment Type', 'Status'
        ]);

        // Write data rows
        foreach ($getReportArray as $row) {
            fputcsv($csvFileHandle, [
                $row['id'], $row['date'], $row['appeal_name'], $row['amount_name'], $row['fund_name'],
                $row['order_id'], 'One-time',
                $row['TID'], $row['amount'], $row['quantity'], $row['subamount'],
                $row['card_fee'], $row['totalamount'], $row['firstname'], $row['lastname'], $row['email'], $row['phone'],
                $row['add1'], $row['city'], $row['country'], $row['add2'], $row['postcode'],
                $row['notes'], $row['paymenttype'], $row['status']
            ]);
        }

        fclose($csvFileHandle);
        exit;
    }
}





//_____________  Update Donor ______________



if(isset($_POST['update_donor']) && isset($_POST['email']) && isset($_POST['d_id'])) {
    Update_Donor_Details($_POST['d_id'], $_POST['email'],$_POST['street'],$_POST['city'],$_POST['state'],$_POST['postal_code'],$_POST['country'],$_POST['phone'],$_POST['organization'], $conn);
}


function Update_Donor_Details($did, $email, $street, $city, $state, $postal_code, $country, $phone, $organization, $conn) {
    $q = "UPDATE `pw_donors` SET `organization` = :organization, `add1` = :street, `add2` = :state, `city` = :city, `country` = :country, `postcode` = :postal_code, `phone` = :phone WHERE `id` = :did AND `email` = :email";
    
    $stmt = $conn->prepare($q);
    
    $stmt->bindParam(':organization', $organization);
    $stmt->bindParam(':street', $street);
    $stmt->bindParam(':state', $state);
    $stmt->bindParam(':city', $city);
    $stmt->bindParam(':country', $country);
    $stmt->bindParam(':postal_code', $postal_code);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':did', $did);
    $stmt->bindParam(':email', $email);
    
    if ($stmt->execute()) {
        echo 'donor_updated';
    } else {
        echo 'update_failed';
    }
}


// ------------MTN Report Start------------


if (isset($_POST['btnMTNcountexport'])) {
    
    $getReportData  = "SELECT DATE(startdate) as sch_date, COUNT(DISTINCT(`order_no`)) as COUNTS, sum(amount*quantity) as Total, AVG(amount*quantity) as Average FROM pw_myTenNight WHERE `status` = 'Completed' OR `status` = 'Charged' GROUP BY DATE(startdate)";
    $getReportArray = array(); 

    // Prepare and execute the SQL query
    $stmt = $conn->prepare($getReportData);
    $stmt->execute();

    $i = 1;
    $tdays = 0;
    $tavg = 0;
    $tamount = 0;

    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows['row_number'] = $i;
        $getReportArray[] = $rows;
        $i++;
        
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }
    
    if (count($getReportArray) > 0) {
        // Open a CSV file for writing
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }
    
        header("Content-Type: text/csv");
        header("Content-Disposition: attachment;  filename=MTNCountReport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");
    
        fputcsv($csvFileHandle, array('Sno', 'Date', 'Ramadan Day', 'Number of Transactions', 'Donation Amount', 'Avg Donation'));

        foreach ($getReportArray as $row) {
            $rd = "";
            if (date('Y-m-23') == $row['sch_date']) {
                $rd = "01";
            } else if (date('Y-03-24') == $row['sch_date']) {
                $rd = "02";
            } else if (date('Y-03-25') == $row['sch_date']) {
                $rd = "03";
            } else if (date('Y-03-26') == $row['sch_date']) {
                $rd = "04";
            } else if (date('Y-03-27') == $row['sch_date']) {
                $rd = "05";
            } else if (date('Y-03-28') == $row['sch_date']) {
                $rd = "06";
            } else if (date('Y-03-29') == $row['sch_date']) {
                $rd = "07";
            } else if (date('Y-03-30') == $row['sch_date']) {
                $rd = "08";
            } else if (date('Y-03-31') == $row['sch_date']) {
                $rd = "09";
            } else if (date('Y-04-01') == $row['sch_date']) {
                $rd = "10";
            } else if (date('Y-04-02') == $row['sch_date']) {
                $rd = "11";
            } else if (date('Y-04-03') == $row['sch_date']) {
                $rd = "12";
            } else if (date('Y-04-04') == $row['sch_date']) {
                $rd = "13";
            } else if (date('Y-04-05') == $row['sch_date']) {
                $rd = "14";
            } else if (date('Y-04-06') == $row['sch_date']) {
                $rd = "15";
            } else if (date('Y-04-07') == $row['sch_date']) {
                $rd = "16";
            } else if (date('Y-04-08') == $row['sch_date']) {
                $rd = "17";
            } else if (date('Y-04-09') == $row['sch_date']) {
                $rd = "18";
            } else if (date('Y-04-10') == $row['sch_date']) {
                $rd = "19";
            } else if (date('Y-04-11') == $row['sch_date']) {
                $rd = "20";
            } else if (date('Y-04-12') == $row['sch_date']) {
                $rd = "21";
            } else if (date('Y-04-13') == $row['sch_date']) {
                $rd = "22";
            } else if (date('Y-04-14') == $row['sch_date']) {
                $rd = "23";
            } else if (date('Y-04-15') == $row['sch_date']) {
                $rd = "24";
            } else if (date('Y-04-16') == $row['sch_date']) {
                $rd = "25";
            } else if (date('Y-04-17') == $row['sch_date']) {
                $rd = "26";
            } else if (date('Y-04-18') == $row['sch_date']) {
                $rd = "27";
            } else if (date('Y-04-19') == $row['sch_date']) {
                $rd = "28";
            } else if (date('Y-04-20') == $row['sch_date']) {
                $rd = "29";
            } else if (date('Y-04-21') == $row['sch_date']) {
                $rd = "30";
            }

            $formattedRow = array(
                $row['row_number'],
                $row['sch_date'],
                $rd,
                $row['COUNTS'],
                $row['Total'],
                number_format($row['Average'], 2)
            );

            $tdays += $row['COUNTS'];
            $tamount += $row['Total'];

            fputcsv($csvFileHandle, $formattedRow);
        }

        $tavg = $tamount / $tdays;
        fputcsv($csvFileHandle, array("", '', 'TOTAL', $tdays, $tamount, number_format($tavg, 2)));

        fclose($csvFileHandle);
        exit;
    }
}


if (isset($_POST['btnMTNnightexport'])) {
    
    $getReportData  = "SELECT `appeal_id`, sum(amount*quantity) as total, (sum(amount*quantity)/(SELECT sum(amount*quantity) from pw_myTenNight WHERE `status`='Completed' or `status`='Charged')) * 100 as Per FROM pw_myTenNight WHERE `status`='Completed' or `status`='Charged' group by `appeal_id`";
    $getReportArray = array(); 

    // Prepare and execute the SQL query
    $stmt = $conn->prepare($getReportData);
    $stmt->execute();

    $i = 1;
    $tamount = 0;
    $tper = 0;

    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows['row_number'] = $i;
        $getReportArray[] = $rows;
        $i++;
        
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }
    
    if (count($getReportArray) > 0) {
        // Open a CSV file for writing
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment;  filename=MTNNightExport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");
        
        // Write the header row
        fputcsv($csvFileHandle, array('Sno', 'Day', 'Amount', 'Percentage'));

        foreach ($getReportArray as $row) {
            $night = "";
            switch ($row['appeal_id']) {
                case "28":
                    $night = "21st Night";
                    break;
                case "29":
                    $night = "22nd Night";
                    break;
                case "30":
                    $night = "23rd Night";
                    break;
                case "31":
                    $night = "24th Night";
                    break;
                case "32":
                    $night = "25th Night";
                    break;
                case "33":
                    $night = "26th Night";
                    break;
                case "34":
                    $night = "27th Night";
                    break;
                case "35":
                    $night = "28th Night";
                    break;
                case "36":
                    $night = "29th Night";
                    break;
                case "37":
                    $night = "30th Night";
                    break;
                default:
                    $night = "Unknown Night";
                    break;
            }

            $formattedRow = array(
                $row['row_number'],
                $night,
                $row['total'],
                number_format($row['Per'], 2)
            );

            $tamount += $row['total'];
            $tper += $row['Per'];

            fputcsv($csvFileHandle, $formattedRow);
        }

        fputcsv($csvFileHandle, array("", 'Grand TOTAL', $tamount, number_format($tper, 2)));
        fclose($csvFileHandle);
        exit;
    }
}


if (isset($_POST['btnMTNdetails'])) {

    $search = trim($_POST["txtsearch"]);
    $status = trim($_POST["status"]);
    $getReportData = "SELECT *, `pw_myTenNight`.`id` as `sch_id`, `pw_appeal`.`name` as `app_name`, `pw_fundlist`.`name` as `fund_name` 
                      FROM `pw_myTenNight`
                      INNER JOIN `pw_donors` ON `pw_myTenNight`.`did` = `pw_donors`.`id`
                      INNER JOIN `pw_appeal` ON `pw_appeal`.`id` = `pw_myTenNight`.`appeal_id`
                      INNER JOIN `pw_fundlist` ON `pw_fundlist`.`id` = `pw_myTenNight`.`fundlist_id`";
    
    $params = [];
    if (!empty($search) || !empty($status)) {
        $getReportData .= " WHERE 1=1";
        
        if ($status != "10") {
            $getReportData .= " AND pw_myTenNight.status = :status";
            $params[':status'] = $status;
        }
        
        if (!empty($search)) {
            $getReportData .= " AND (pw_donors.email LIKE :search OR pw_donors.firstname LIKE :search OR pw_donors.lastname LIKE :search OR pw_donors.phone LIKE :search OR pw_donors.organization LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
    }
    
    // Prepare and execute the SQL query
    $stmt = $conn->prepare($getReportData);
    $stmt->execute($params);
    
    $getReportArray = [];
    $i = 0;
    while ($rows = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows['name'] = $rows['firstname'] . " " . $rows['lastname'];
        $rows['card'] = ($rows['card_fee'] == 1) ? "YES" : "NO";
        $rows['totalamount'] = $rows['amount'] * $rows['quantity'];
        $i++;
        $rows['row_number'] = $i;
        $getReportArray[] = $rows;
        
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=MTNDetailReport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, ['Sno', 'Schedule ID', 'Plan ID', 'Date', 'Name', 'Email', 'Amount', 'Quantity', 'Total', 'Card Fee', 'Appeal Name', 'Fundlist Name', 'Order #', 'Status']);

        foreach ($getReportArray as $row) {
            $night = "";
            switch ($row['appeal_id']) {
                case "28":
                    $night = "21st Night";
                    break;
                case "29":
                    $night = "22nd Night";
                    break;
                case "30":
                    $night = "23rd Night";
                    break;
                case "31":
                    $night = "24th Night";
                    break;
                case "32":
                    $night = "25th Night";
                    break;
                case "33":
                    $night = "26th Night";
                    break;
                case "34":
                    $night = "27th Night";
                    break;
                case "35":
                    $night = "28th Night";
                    break;
                case "36":
                    $night = "29th Night";
                    break;
                case "37":
                    $night = "30th Night";
                    break;
            }

            $formattedRow = [
                $row['row_number'],
                $row['sch_id'],
                $row['plan_id'],
                $row['date'],
                $row['name'],
                $row['email'],
                $row['amount'],
                $row['quantity'],
                $row['totalamount'],
                $row['card'],
                $night,
                $row['fund_name'],
                $row['order_no'],
                $row['status']
            ];
            fputcsv($csvFileHandle, $formattedRow);
        }
        fclose($csvFileHandle);
        exit;
    }
}

    
// ------------MTN Report End------------

// ------------MTD Report Start------------

if(isset($_POST['btnMTDcountexport'])){
    // Assuming $conn is your PDO connection object

    $getReportData = "SELECT DATE(startdate) as sch_date, COUNT(DISTINCT(order_no)) as COUNTS, SUM(amount*quantity) as Total, AVG(amount*quantity) as Average FROM pw_myTenDays WHERE status = 'Completed' OR status = 'Charged' GROUP BY DATE(startdate)";
    
    $stmt = $conn->prepare($getReportData);
    $stmt->execute();
    $getReportArray = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if(count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment;  filename=MTDCountExport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, array('Sno', 'Date', 'Number of Transactions', 'Donation Amount', 'Avg Donation'));

        $tdays = 0;
        $tamount = 0;

        foreach ($getReportArray as $i => $row) {
            $row_number = $i + 1; // Incremental row number starting from 1

            $formattedRow = array(
                $row_number,
                $row['sch_date'],
                $row['COUNTS'],
                $row['Total'],
                number_format($row['Average'], 2)
            );

            fputcsv($csvFileHandle, $formattedRow);

            $tdays += $row['COUNTS'];
            $tamount += $row['Total'];
        }

        $tavg = ($tdays > 0) ? $tamount / $tdays : 0;

        fputcsv($csvFileHandle, array("", 'TOTAL', $tdays, $tamount, number_format($tavg, 2)));

        fclose($csvFileHandle);
        exit;
    }
}


if(isset($_POST['btnMTDnightexport'])){
    // Assuming $conn is your PDO connection object

    $getReportData = "SELECT `appeal_id`, SUM(amount*quantity) as total, (SUM(amount*quantity)/(SELECT SUM(amount*quantity) FROM pw_myTenDays WHERE `status`='Completed' OR `status`='Charged')) * 100 as Per FROM pw_myTenDays WHERE `status`='Completed' OR `status`='Charged' GROUP BY `appeal_id`";
    
    $stmt = $conn->prepare($getReportData);
    $stmt->execute();
    $getReportArray = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if(count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=MTDNightExport.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        fputcsv($csvFileHandle, array('Sno', 'Day', 'Amount', 'Percentage'));

        $tamount = 0;
        $tper = 0;

        foreach ($getReportArray as $i => $row) {
            $row_number = $i + 1; // Incremental row number starting from 1

            $night = "";
            switch ($row['appeal_id']) {
                case "47":
                    $night = "1st Dhul Hijjah";
                    break;
                case "48":
                    $night = "2nd Dhul Hijjah";
                    break;
                case "49":
                    $night = "3rd Dhul Hijjah";
                    break;
                case "50":
                    $night = "4th Dhul Hijjah";
                    break;
                case "51":
                    $night = "5th Dhul Hijjah";
                    break;
                case "52":
                    $night = "6th Dhul Hijjah";
                    break;
                case "53":
                    $night = "7th Dhul Hijjah";
                    break;
                case "54":
                    $night = "8th Dhul Hijjah";
                    break;
                case "55":
                    $night = "9th Dhul Hijjah (Day of Arafah)";
                    break;
                case "56":
                    $night = "10th Dhul Hijjah";
                    break;
                default:
                    $night = "Unknown";
                    break;
            }

            $formattedRow = array(
                $row_number,
                $night,
                $row['total'],
                number_format($row['Per'], 2)
            );

            $tamount += $row['total'];
            $tper += $row['Per'];

            fputcsv($csvFileHandle, $formattedRow);
        }

        fputcsv($csvFileHandle, array("", 'Grand TOTAL', $tamount, $tper));

        fclose($csvFileHandle);
        exit;
    }
}


if(isset($_POST['btnMTDdetails'])) {
    $search = trim($_POST["txtsearch"]);
    $status = trim($_POST["status"]);
    
    $getReportData = "SELECT *, pw_myTenDays.id as sch_id, pw_appeal.name as app_name, pw_fundlist.name as fund_name 
                     FROM pw_myTenDays 
                     INNER JOIN pw_donors ON pw_myTenDays.did = pw_donors.id 
                     INNER JOIN pw_appeal ON pw_appeal.id = pw_myTenDays.appeal_id
                     INNER JOIN pw_fundlist ON pw_fundlist.id = pw_myTenDays.fundlist_id 
                     WHERE 1=1";

    $getReportArray = array(); 
    $params = array();
    
    if (!empty($search) || !empty($status)) {
        if ($status != "10") {
            $getReportData .= " AND pw_myTenDays.status = :status";
            $params[':status'] = $status;
        }
        if (!empty($search)) {
            $getReportData .= " AND (pw_donors.email LIKE :search 
                                OR pw_donors.firstname LIKE :search 
                                OR pw_donors.lastname LIKE :search 
                                OR pw_donors.phone LIKE :search 
                                OR pw_donors.organization LIKE :search)";
            $params[':search'] = "%$search%";
        }
    }

    $stmt = $conn->prepare($getReportData);
    $stmt->execute($params);
    $getReportArray = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($getReportArray) > 0) {
        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        header("Content-Type: text/csv");
        header("Content-Disposition: attachment;  filename=MTDDetail.csv");
        header("Pragma: no-cache");
        header("Expires: 0");
        fputcsv($csvFileHandle, array('Sno','Schedule ID','Plan ID','Date','Name','Email','Amount','Quantity','Total','Card Fee','Appeal Name','Fundlist Name','Order #','Status'));

        $i = 1;
        foreach ($getReportArray as $row) {
            $night = "";
            switch ($row['appeal_id']) {
                case "47":
                    $night = "1st Dhul Hijjah";
                    break;
                case "48":
                    $night = "2nd Dhul Hijjah";
                    break;
                case "49":
                    $night = "3rd Dhul Hijjah";
                    break;
                case "50":
                    $night = "4th Dhul Hijjah";
                    break;
                case "51":
                    $night = "5th Dhul Hijjah";
                    break;
                case "52":
                    $night = "6th Dhul Hijjah";
                    break;
                case "53":
                    $night = "7th Dhul Hijjah";
                    break;
                case "54":
                    $night = "8th Dhul Hijjah";
                    break;
                case "55":
                    $night = "9th Dhul Hijjah (Day of Arafah)";
                    break;
                case "56":
                    $night = "10th Dhul Hijjah";
                    break;
                default:
                    $night = "";
                    break;
            }

            $card = ($row['card_fee'] == 1) ? "YES" : "NO";
            $totalamount = $row['amount'] * $row['quantity'];
            $formattedRow = array(
                $i,
                $row['sch_id'],
                $row['plan_id'],
                $row['date'],
                $row['firstname'] . " " . $row['lastname'],
                $row['email'],
                $row['amount'],
                $row['quantity'],
                $totalamount,
                $card,
                $night,
                $row['fund_name'],
                $row['order_no'],
                $row['status']
            );

            fputcsv($csvFileHandle, $formattedRow);
            $i++;
        }

        fclose($csvFileHandle);
        exit;
    }
}



if (isset($_POST["recordappeals"])) {
    $getReportArray = array();

    // Optimized SQL with JOINs to fetch all necessary fields in one query
    $getReportData = "
        SELECT 
            r.*, 
            a.name AS appeal_name, 
            am.name AS amount_name, 
            f.name AS fund_name, 
            s.name AS salesforce_name
        FROM pw_sf_relation r
        LEFT JOIN pw_appeal a ON r.ap_id = a.id
        LEFT JOIN pw_amount am ON r.amount_id = am.id
        LEFT JOIN pw_fundlist f ON r.findlist_id = f.id
        LEFT JOIN pw_sfdata s ON r.sf_id = s.sf_id
    ";

    $stmt = $conn->prepare($getReportData);
    $stmt->execute();

    $i = 1;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $getReportArray[] = array(
            'Id' => $i,
            'appeal_name' => $row['appeal_name'],
            'Amount name' => $row['amount_name'],
            'Fund name' => $row['fund_name'],
            'sf_id' => $row['sf_id'],
            'name' => $row['salesforce_name']
        );

        $i++;

        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }

    if (count($getReportArray) > 0) {
        // Set headers for CSV download
        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=recordappeal.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        $csvFileHandle = fopen("php://output", "w");
        if ($csvFileHandle === false) {
            die('Unable to open/create the CSV file.');
        }

        // Write the CSV header
        fputcsv($csvFileHandle, array("id", "appeal name", "amount name", "fund name", "salesforce id", "salesforce fund"));

        // Write the data rows
        foreach ($getReportArray as $row) {
            fputcsv($csvFileHandle, $row);
        }

        fclose($csvFileHandle);
        exit;
    }
}
if (isset($_POST["missing_combinations"])) {
    $getReportArray = array();

    $query = "
        SELECT 
            a.id AS appeal_id,
            a.name AS appeal_name,
            am.id AS amount_id,
            am.name AS amount_name,
            f.id AS fund_id,
            f.name AS fund_name
        FROM pw_appeal a
        JOIN pw_amount am ON am.appeal_id = a.id
        LEFT JOIN pw_fundlist f ON f.appeal_id = a.id
        WHERE   NOT EXISTS (
            SELECT 1 FROM pw_sf_relation r
            WHERE r.ap_id = a.id
              AND r.amount_id = am.id
        )
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $i = 1;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $getReportArray[] = array(
            'ID' => $i,
            'Appeal Name' => $row['appeal_name'],
            'Amount Name' => $row['amount_name'],
            'Fund Name' => $row['fund_name'] ?? ''
        );
        $i++;
    }

    if (count($getReportArray) > 0) {
        header("Content-Type: text/csv");
        header("Content-Disposition: attachment; filename=missing_combinations.csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        $csvFileHandle = fopen("php://output", "w");
        fputcsv($csvFileHandle, array(
            "ID",  "Appeal Name",
             "Amount Name",
             "Fund Name"
        ));

        foreach ($getReportArray as $row) {
            fputcsv($csvFileHandle, $row);
        }

        fclose($csvFileHandle);
        exit;
    }
}


// ------------MTD Report End------------ 
    
if(isset($_POST["makestriperefund"])) {

      $file_name='/home/afghanyoc/public_html/wp-content/themes/afghanrelief/template-parts/stripe/backofficefunction.php';
    include( $file_name );
    
    $newamount = $_POST["newamount"];
    $order_id = $_POST["order_number"];
    $reference_number=$_POST['reference_number'];
    $tid=$_POST['tid'];
    $totalamount=$_POST['totalamount'];
    $refundreason=$_POST['refundreason'];
    $did=$_POST['DID'];
    $balancetx_id='';
    $txtrefunded =  number_format(floatval(trim(getTotalRefundAmount($conn,$reference_number))), 2, '.', '');
    
   if(($newamount+$txtrefunded)==$totalamount)
   {
        $status="Refunded";
        $balancetx_id=0;
   }
    if(($newamount+$txtrefunded)>$totalamount){
        echo "Refund Amount can not be greater than total Amount!!";
        exit();
    }  
    if(($newamount+$txtrefunded)!=$totalamount)
   {
        $status="partial";
        $balancetx_id=$totalamount-($newamount+$txtrefunded);
   }
    
    if($newamount+$txtrefunded<=$totalamount){
        $status=refundAmount($reference_number,$newamount,$refundreason,$order_id);
        if($status == "succeeded"){
        echo "refundsucceeded";
        }else{
            echo "Something Went Wrong.";
        }
    }
    
   }
   
if(isset($_POST["cancelschedule"])) {

    $file_name='/home/afghanyoc/public_html/wp-content/themes/afghanrelief/template-parts/stripe/backofficefunction.php';
    include( $file_name );
    
    $sch_id=$_POST['sch_id'];
    if($sch_id!=""){
        $status=cancelSubscription($sch_id);
        if($status == "cancelled"){
        echo "cancelled";
        }else{
            echo "Something Went Wrong.";
        }
    }
    
   }


function getTotalRefundAmount($conn, $stripe_id){
    $amount = 0;
    $stmt = $conn->prepare("SELECT SUM(`refund_amount`) AS `amount` FROM `pw_refund` WHERE stripe_id = :stripe_id");
    $stmt->bindParam(':stripe_id', $stripe_id, PDO::PARAM_STR);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if($row !== false && isset($row['amount'])){
        $amount = $row['amount'];
    }

    return $amount;
}

 if(isset($_POST['action'])) {
    if($_POST['action'] == 'show_payment_btn') {
        $dtCount = 0;
        $showpaypal='no';
        if(isset($_SESSION['arr_donationtype'])){
            $unique_donationtype = array_unique($_SESSION['arr_donationtype']);
            $dtCount = count($unique_donationtype);
            if($dtCount == 1 && in_array("single", $unique_donationtype)  || $dtCount == 1 && in_array("SINGLE", $unique_donationtype)){ 
                $showpaypal = 'yes';
            }
        }
        echo $showpaypal;
    }
}

// initially_unsuccessful_transactions
if (isset($_POST["initially_unsuccessful_transactions"])) {
    $initial_status = $_POST["initial_status"] ?? 'declined';
    $start_date = $_POST["start_date"] ?? date("Y-m-01");
    $end_date   = $_POST["end_date"] ?? date("Y-m-t");


    $sql = "
        SELECT 
            t1.id AS transaction_id,
            t1.status AS initial_transaction_status, 
            t2.status AS schedule_status, 
            t2.plan_id AS plan_id, 
            t2.sub_id AS schedule_id, 
            t2.amount AS amount, 
            t2.order_id AS order_id, 
            t2.date AS created_at, 
            t2.frequency AS frequency, 
            t2.startdate AS startdate, 
            t3.firstname AS firstname,
            t3.lastname AS lastname,
            t3.email AS email
        FROM pw_transactions AS t1
        INNER JOIN pw_schedule AS t2 ON t2.tid = t1.id
        INNER JOIN pw_donors AS t3 ON t3.id = t1.did
        WHERE t1.status = :initial_status
           AND DATE(t2.date) BETWEEN :start_date AND :end_date
        ORDER BY t2.date DESC
    ";

    try {
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':initial_status', $initial_status, PDO::PARAM_STR);
        $stmt->bindValue(':start_date', $start_date, PDO::PARAM_STR);
        $stmt->bindValue(':end_date', $end_date, PDO::PARAM_STR);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $rows
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
    }   
}


?>