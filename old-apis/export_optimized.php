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

ini_set('memory_limit', '512M');
set_time_limit(300); // 5 minutes
include('config.php');
session_start();

// Export Summary Report - OPTIMIZED
if (isset($_POST["btnexport_summary"])) {
    $startDate = isset($_POST['startDate']) ? $_POST['startDate'] : '';
    $endDate = isset($_POST['endDate']) ? $_POST['endDate'] : '';
    $status = isset($_POST['status']) ? $_POST['status'] : '0';
    $paymentType = isset($_POST['paymentType']) ? $_POST['paymentType'] : '0';
    $frequency = isset($_POST['frequency']) ? $_POST['frequency'] : '';
    $txtsearch = isset($_POST['txtsearch']) ? $_POST['txtsearch'] : '';
    $orderid = isset($_POST['orderid']) ? $_POST['orderid'] : '';

    // Set CSV headers BEFORE executing query
    $dateString = date('Ymd');
    header("Content-Type: text/csv; charset=utf-8");
    header("Content-Disposition: attachment; filename=ForgottenWomen_DonationSummaryReport_" . $dateString . ".csv");
    header("Pragma: no-cache");
    header("Expires: 0");

    // Open output stream
    $output = fopen("php://output", "w");

    // Write CSV header
    fputcsv($output, ['SNO', 'Date', 'First Name', 'Last Name', 'Email', 'Phone', 'City', 'Country', 'State', 'Postal Code', 'Card Fee', 'Total Amount', 'Charge Amount', 'Transaction ID', 'Order ID', 'Status', 'Notes']);

    // Build query
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
    FROM pw_transactions
    INNER JOIN pw_donors ON pw_donors.id = pw_transactions.did
    INNER JOIN pw_transaction_details ON pw_transactions.id = pw_transaction_details.TID
    WHERE 1=1";

    $params = [];

    if (!empty($startDate) && !empty($endDate)) {
        $getReportData .= " AND DATE(pw_transactions.date) BETWEEN :startDate AND :endDate";
        $params[':startDate'] = $startDate;
        $params[':endDate'] = $endDate;
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
        $getReportData .= " AND (pw_donors.email LIKE :txtsearch OR pw_donors.firstname LIKE :txtsearch OR pw_donors.lastname LIKE :txtsearch OR pw_donors.phone LIKE :txtsearch)";
        $params[':txtsearch'] = "%$txtsearch%";
    }

    if (!empty($orderid)) {
        $getReportData .= " AND (pw_transactions.order_id LIKE :orderid OR pw_transactions.TID LIKE :orderid)";
        $params[':orderid'] = "%$orderid%";
    }

    // Execute query
    $stmt = $conn->prepare($getReportData);
    foreach ($params as $key => &$val) {
        $stmt->bindParam($key, $val);
    }
    $stmt->execute();

    // Stream rows directly - no memory storage
    $i = 1;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, [
            $i,
            $row['date'],
            $row['firstname'],
            $row['lastname'],
            $row['email'],
            $row['phone'],
            $row['city'],
            $row['country'],
            $row['add2'],
            $row['postcode'],
            $row['card_fee'],
            $row['totalamount'],
            $row['charge_amount'],
            $row['TID'],
            $row['order_id'],
            $row['status'],
            $row['notes']
        ]);
        $i++;

        // Flush every 50 rows
        if ($i % 50 == 0) {
            if (ob_get_level() > 0) ob_flush();
            flush();
        }
    }

    fclose($output);
    exit;
}

// Export Detail Report - OPTIMIZED
if (isset($_POST["btnexport"])) {
    $startDate = isset($_POST['startDate']) ? $_POST['startDate'] : '';
    $endDate = isset($_POST['endDate']) ? $_POST['endDate'] : '';
    $status = isset($_POST['status']) ? $_POST['status'] : '0';
    $paymentType = isset($_POST['paymentType']) ? $_POST['paymentType'] : '0';
    $frequency = isset($_POST['frequency']) ? $_POST['frequency'] : '';
    $txtsearch = isset($_POST['txtsearch']) ? $_POST['txtsearch'] : '';
    $orderid = isset($_POST['orderid']) ? $_POST['orderid'] : '';

    // Set CSV headers BEFORE executing query
    $dateString = date('Ymd');
    header("Content-Type: text/csv; charset=utf-8");
    header("Content-Disposition: attachment; filename=ForgottenWomen_DonationDetailReport_" . $dateString . ".csv");
    header("Pragma: no-cache");
    header("Expires: 0");

    // Open output stream
    $output = fopen("php://output", "w");

    // Write CSV header
    fputcsv($output, ['SNO', 'Date', 'Donation Name', 'Amount Type', 'Fund Type', 'Order ID', 'Frequency', 'Transaction ID', 'Amount', 'Quantity', 'Sub Amount', 'Card Fee', 'Total Amount', 'First Name', 'Last Name', 'Email', 'Phone', 'Address', 'City', 'Country', 'State', 'Postal Code', 'Notes', 'Payment Type', 'Status']);

    // Build query
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
    FROM pw_donors
    INNER JOIN pw_transactions ON pw_donors.id = pw_transactions.did
    INNER JOIN pw_transaction_details ON pw_transactions.id = pw_transaction_details.TID
    INNER JOIN pw_appeal ON pw_transaction_details.appeal_id = pw_appeal.id
    INNER JOIN pw_amount ON pw_transaction_details.amount_id = pw_amount.id
    INNER JOIN pw_fundlist ON pw_transaction_details.fundlist_id = pw_fundlist.id
    WHERE 1=1";

    $params = [];

    if (!empty($startDate) && !empty($endDate)) {
        $getReportData .= " AND DATE(pw_transactions.date) BETWEEN :startDate AND :endDate";
        $params[':startDate'] = $startDate . ' 00:00:00';
        $params[':endDate'] = $endDate . ' 23:59:59';
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
        $getReportData .= " AND (pw_donors.email LIKE :txtsearch OR pw_donors.firstname LIKE :txtsearch OR pw_donors.lastname LIKE :txtsearch OR pw_donors.phone LIKE :txtsearch)";
        $params[':txtsearch'] = '%' . $txtsearch . '%';
    }

    if (!empty($orderid)) {
        $getReportData .= " AND (pw_transactions.order_id LIKE :orderid OR pw_transactions.TID LIKE :orderid)";
        $params[':orderid'] = '%' . $orderid . '%';
    }

    // Execute query
    $stmt = $conn->prepare($getReportData);
    $stmt->execute($params);

    // Stream rows directly - no memory storage
    $i = 1;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Calculate values
        $freq = $row['freq'];
        if ($freq == 0) $freq = 'One-Off';
        else if ($freq == 1) $freq = 'Monthly';
        else if ($freq == 2) $freq = 'Yearly';
        else if ($freq == 3) $freq = 'Daily';

        $subamount = $row['amount'] * $row['quantity'];
        $card_fee = ($row['card_fee'] != 0) ? ($subamount * 0.03) : 0;
        $totalamount = $subamount + $card_fee;

        fputcsv($output, [
            $i,
            $row['date'],
            $row['appeal_name'],
            $row['amount_name'],
            $row['fund_name'],
            $row['order_id'],
            $freq,
            $row['TID'],
            $row['amount'],
            $row['quantity'],
            $subamount,
            $card_fee,
            $totalamount,
            $row['firstname'],
            $row['lastname'],
            $row['email'],
            $row['phone'],
            $row['add1'],
            $row['city'],
            $row['country'],
            $row['add2'],
            $row['postcode'],
            $row['notes'],
            $row['paymenttype'],
            $row['status']
        ]);
        $i++;

        // Flush every 50 rows
        if ($i % 50 == 0) {
            if (ob_get_level() > 0) ob_flush();
            flush();
        }
    }

    fclose($output);
    exit;
}
?>
