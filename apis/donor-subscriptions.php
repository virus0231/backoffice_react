<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $conn = $pdo;
  
  // Get donor ID from query parameter
  $donorId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  
  if ($donorId <= 0) {
    error_response('Invalid donor ID', 400, ['message' => 'Donor ID is required and must be a positive integer']);
    exit;
  }
  
  // Support multiple table name variations
  $scheduleTable = find_first_existing_table($conn, ['pw_schedule', 'wp_yoc_schedule']);
  $transactionsTable = find_first_existing_table($conn, ['pw_transactions', 'wp_yoc_transactions']);
  $transactionDetailsTable = find_first_existing_table($conn, ['pw_transaction_details', 'wp_yoc_transaction_details']);
  $appealTable = find_first_existing_table($conn, ['pw_appeal', 'wp_yoc_appeal']);
  $amountTable = find_first_existing_table($conn, ['pw_amount', 'wp_yoc_amount']);
  $fundlistTable = find_first_existing_table($conn, ['pw_fundlist', 'wp_yoc_fundlist']);
  
  if (!$scheduleTable) {
    error_response('Schedule table not found', 500, ['message' => 'Schedule table not found']);
    exit;
  }
  
  // Get all subscriptions for this donor
  // Use * to get all available columns and handle missing ones in PHP
  $sql = "SELECT *
          FROM `$scheduleTable`
          WHERE did = :donor_id
          ORDER BY id DESC";
  
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':donor_id', $donorId, PDO::PARAM_INT);
  $stmt->execute();
  $schedules = $stmt->fetchAll();
  
  // For each subscription, get the related transaction details
  $subscriptions = [];
  foreach ($schedules as $schedule) {
    $subId = $schedule['sub_id'] ?? '';
    
    $subscriptionDetails = [];
    
    // If we have transaction tables, get the details
    if ($transactionsTable && $transactionDetailsTable && $subId) {
      if ($appealTable && $amountTable && $fundlistTable) {
        $detailsSql = "SELECT 
                        t.id AS transaction_id,
                        t.order_id,
                        t.totalamount,
                        t.date,
                        td.appeal_id,
                        td.amount_id,
                        td.fundlist_id,
                        td.amount,
                        td.quantity,
                        td.freq,
                        a.name AS appeal_name,
                        am.name AS amount_name,
                        f.name AS fund_name
                      FROM `$transactionsTable` t
                      LEFT JOIN `$transactionDetailsTable` td ON t.id = td.TID
                      LEFT JOIN `$appealTable` a ON td.appeal_id = a.id
                      LEFT JOIN `$amountTable` am ON td.amount_id = am.id
                      LEFT JOIN `$fundlistTable` f ON td.fundlist_id = f.id
                      WHERE t.order_id LIKE :order_id
                      ORDER BY t.date DESC
                      LIMIT 1";
      } else {
        $detailsSql = "SELECT 
                        t.id AS transaction_id,
                        t.order_id,
                        t.totalamount,
                        t.date,
                        td.appeal_id,
                        td.amount_id,
                        td.fundlist_id,
                        td.amount,
                        td.quantity,
                        td.freq
                      FROM `$transactionsTable` t
                      LEFT JOIN `$transactionDetailsTable` td ON t.id = td.TID
                      WHERE t.order_id LIKE :order_id
                      ORDER BY t.date DESC
                      LIMIT 1";
      }
      
      $detailsStmt = $pdo->prepare($detailsSql);
      $detailsStmt->bindValue(':order_id', '%' . $subId . '%', PDO::PARAM_STR);
      $detailsStmt->execute();
      $details = $detailsStmt->fetchAll();
      
      // Map frequency codes to labels
      $frequencyMap = [
        '0' => 'Single',
        '1' => 'Monthly',
        '2' => 'Yearly',
        '3' => 'Daily'
      ];
      
      // Transform details
      $subscriptionDetails = array_map(function($detail) use ($frequencyMap) {
        return [
          'transactionId' => (int)($detail['transaction_id'] ?? 0),
          'orderId' => $detail['order_id'] ?? '',
          'totalAmount' => (float)($detail['totalamount'] ?? 0),
          'date' => $detail['date'] ?? '',
          'appealId' => (int)($detail['appeal_id'] ?? 0),
          'appealName' => $detail['appeal_name'] ?? '',
          'amountId' => (int)($detail['amount_id'] ?? 0),
          'amountName' => $detail['amount_name'] ?? '',
          'fundId' => (int)($detail['fundlist_id'] ?? 0),
          'fundName' => $detail['fund_name'] ?? '',
          'amount' => (float)($detail['amount'] ?? 0),
          'quantity' => (int)($detail['quantity'] ?? 1),
          'frequency' => $frequencyMap[$detail['freq'] ?? '0'] ?? 'Single',
          'frequencyCode' => $detail['freq'] ?? '0'
        ];
      }, $details);
    }
    
    $subscriptions[] = [
      'id' => (int)$schedule['id'],
      'stripeId' => $schedule['sub_id'] ?? '',
      'subscriptionId' => $schedule['order_id'] ?? '',
      'status' => $schedule['status'] ?? '',
      'nextBillingDate' => $schedule['nextrun_date'] ?? '',
      'createdAt' => $schedule['startdate'] ?? $schedule['date'] ?? '',
      'updatedAt' => $schedule['date'] ?? '',
      'amount' => $schedule['amount'] ?? '',
      'quantity' => $schedule['quantity'] ?? '',
      'frequency' => $schedule['frequency'] ?? '',
      'remainingCount' => $schedule['remainingcount'] ?? '',
      'totalCount' => $schedule['totalcount'] ?? '',
      'details' => $subscriptionDetails
    ];
  }
  
  json_response([
    'success' => true,
    'data' => $subscriptions,
    'count' => count($subscriptions),
    'message' => 'Retrieved donor subscriptions'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching donor subscriptions', 500, ['message' => $e->getMessage()]);
}
