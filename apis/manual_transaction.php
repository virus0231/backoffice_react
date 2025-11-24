<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
ini_set('max_execution_time', 0);
ini_set('memory_limit', '512M');
set_time_limit(0);

$servername = "localhost";
$username = "afghanadmin";
$password = "Po&98McN#xj3";
$database = "afghanrelief";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $charge_id = $_POST['charge_id'] ?? '';
        $payment_intent = $_POST['payment_intent'] ?? '';
        $first_name = $_POST['first_name'] ?? '';
        $last_name = $_POST['last_name'] ?? '';
        $email = $_POST['email'] ?? '';
        $add1 = $_POST['add1'] ?? '';
        $add2 = $_POST['add2'] ?? '';
        $country = $_POST['country'] ?? '';
        $city = $_POST['city'] ?? '';
        $state = $_POST['state'] ?? '';
        $postcode = $_POST['zip'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $customer_id = $_POST['customer_id'] ?? '';
        $date = $_POST['date'] ?? '';
        $card_digits = $_POST['card_digits'] ?? '';
        $payment_type = $_POST['payment_type'] ?? '';
        
        $dateTime = new DateTime($date, new DateTimeZone('UTC'));
        $date = $dateTime->format('Y-m-d H:i:s');
        
        
        
        $status = "completed";
        
        $did = get_donor($conn, $customer_id, $first_name, $last_name, $email, $add1, $add2, $city, $country, $postcode, $phone, $card_digits, $date);
        if ($did == 0) {
            return;
        }
        
        $total_amount = 0;
        $transaction_details = [];
        
        foreach ($_POST as $key => $value) {
            if (preg_match('/amount_(\d+)/', $key, $matches)) {
                $index = $matches[1];
                $amount = $_POST['amount_' . $index] ?? 0;
                $appeal_id = $_POST['appeal_id_' . $index] ?? '';
                $amount_id = $_POST['amount_id_' . $index] ?? '';
                $quantity = $_POST['quantity_' . $index] ?? '';
                $freq = $_POST['freq_' . $index] ?? '';
                $plan_id = $_POST['plan_id_' . $index] ?? '';
                $sub_id = $_POST['sub_id_' . $index] ?? '';
                
                if (($freq === "monthly" || $freq === "yearly") && (empty($plan_id) || empty($sub_id))) {
                    echo json_encode(['success' => false, 'message' => "Plan ID and Sub ID are required for monthly or yearly subscriptions."]);
                    exit;
                }
                
                $total_amount += $amount * $quantity;
                $transaction_details[] = compact('appeal_id', 'amount_id', 'amount', 'quantity', 'freq', 'plan_id', 'sub_id');
            }
        }
        
        $data = insert_transaction($conn, $did, $payment_intent, $charge_id, $payment_type, $total_amount, $date, $status);
        
        $tid = $data["tid"];
        $tr_no = $data["tr_no"];
        $order_id = $data["order_id"];
        
        foreach ($transaction_details as $detail) {
            $td_id = insert_transaction_detail($conn, $tid, $detail, $date);
            if ($detail['freq'] !== "onetime") {
                insert_schedule($conn, $did, $tid, $td_id, $tr_no, $order_id, $total_amount, $detail, $date);
            }
        }
        
        echo json_encode(['success' => true, 'message' => "Transaction Inserted Successfully"]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => "Error processing transaction: " . $e->getMessage()]);
    }
}

function get_donor($conn, $customer_id, $firstname, $lastname, $email, $add1, $add2, $city, $country, $postcode, $phone, $card_digits, $date)
{
    try {
        $check_sql = "SELECT id FROM wp_yoc_donors WHERE lastname = '$lastname' AND email = '$email'";
        $result = mysqli_query($conn, $check_sql);

        if (!$result) {
            throw new Exception("Error in donor check query: " . mysqli_error($conn));
        }

        $new_did = 0;

        if (mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            $new_did = $row['id'];
        } else {
            $insert_sql = "INSERT INTO wp_yoc_donors (fourdigit, stripe_id,  email, firstname, lastname, add1, add2, city, country, postcode, phone, Date_Added)
                          VALUES ('$card_digits', '$customer_id', '$email', '$firstname', '$lastname', '$add1', '$add2', '$city', '$country', '$postcode', '$phone', '" . $date . "')";

            if (mysqli_query($conn, $insert_sql)) {
                $new_did = mysqli_insert_id($conn);
            } else {
                throw new Exception("Error inserting donor: " . mysqli_error($conn));
            }
        }

        return $new_did;
    } catch (Exception $e) {
        echo "Error in get_donor: " . $e->getMessage();
    }
}

function insert_transaction($conn, $did, $payment_intent, $charge_id, $payment_type, $total_amount, $date, $status) {
    $invoiceid = uniqid("acc-");
    $order_id = date('mdYHis', time()) . rand(0, 1000);
    
    if ($payment_intent == "") {
        $payment_intent = $charge_id;
        $charge_id = "";
    }
    
    $insert_transaction = "INSERT INTO wp_yoc_transactions (DID, TID, order_id, paya_reference, charge_id, paymenttype, charge_amount, totalamount, refund, reason, status, date) 
                           VALUES ('$did', '$invoiceid', '$order_id', '$payment_intent', '$charge_id', '$payment_type', '$total_amount', '$total_amount', 'success', 'approved', '$status', '$date')";
    
    if (mysqli_query($conn, $insert_transaction)) {
        $tid = mysqli_insert_id($conn);
        return array("tid"=>$tid, "tr_no"=>$invoiceid, "order_id"=>$order_id);
    } else {
        throw new Exception("Error inserting transaction: " . mysqli_error($conn));
    }
}

function insert_transaction_detail($conn, $tid, $detail, $date) {
    $freq_n = ($detail['freq'] === "monthly") ? 1 : (($detail['freq'] === "yearly") ? 2 : 0);
    $interval = ($freq_n === 1) ? 60 : (($freq_n === 2) ? 1825 : 0);
    
    $insert_transaction_detail = "INSERT INTO wp_yoc_transaction_details (TID, appeal_id, amount_id, fundlist_id, amount, quantity, freq, startdate, totalcount, currency) 
                                  VALUES ('$tid', '{$detail['appeal_id']}', '{$detail['amount_id']}', '0', '{$detail['amount']}', '{$detail['quantity']}', '$freq_n', '$date', '$interval', 'USD')";
    
    if (!mysqli_query($conn, $insert_transaction_detail)) {
        throw new Exception("Error inserting transaction details: " . mysqli_error($conn));
    }
    
    echo "transaction inserted";
    
    $td_id = mysqli_insert_id($conn);
    return $td_id;
    
}

function insert_schedule($conn, $did, $tid, $td_id, $tr_no, $order_id, $total_amount, $detail, $date) {
    $interval = ($detail['freq'] === "monthly") ? 1 : 12;
    $total_count = ($detail['freq'] === "monthly") ? 60 : 5;
    $remaining_count = $total_count - 1;
    $next_run_date = ($detail['freq'] === "monthly") ? date('Y-m-d', strtotime('+1 month', strtotime($date))) : date('Y-m-d', strtotime('+12 month', strtotime($date)));

    $sql = "INSERT INTO wp_yoc_schedule (did, tid, tr_no, td_id, order_id, plan_id, sub_id, amount, quantity, frequency, startdate, r_interval, totalcount, remainingcount, nextrun_date, status) 
            VALUES ('$did', '$tid', '$tr_no', '$td_id', '$order_id', '{$detail['plan_id']}', '{$detail['sub_id']}', '{$detail['amount']}', '{$detail['quantity']}', '{$detail['freq']}', '$date', '$interval', '$total_count', '$remaining_count', '$next_run_date', 'active')";
    
    if(mysqli_query($conn, $sql)){
        echo "schedule inserted";
    }
}


?>