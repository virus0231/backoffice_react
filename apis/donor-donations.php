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
  $transactionsTable = find_first_existing_table($conn, ['pw_transactions', 'wp_yoc_transactions']);
  $transactionDetailsTable = find_first_existing_table($conn, ['pw_transaction_details', 'wp_yoc_transaction_details']);
  $appealTable = find_first_existing_table($conn, ['pw_appeal', 'wp_yoc_appeal']);
  $amountTable = find_first_existing_table($conn, ['pw_amount', 'wp_yoc_amount']);
  $fundlistTable = find_first_existing_table($conn, ['pw_fundlist', 'wp_yoc_fundlist']);
  
  if (!$transactionsTable || !$transactionDetailsTable) {
    error_response('Required tables not found', 500, ['message' => 'Transaction tables not found']);
    exit;
  }
  
  // Get all transactions for this donor
  $sql = "SELECT 
            t.id,
            t.order_id,
            t.totalamount,
            t.paymenttype,
            t.status,
            t.date,
            t.currency
          FROM `$transactionsTable` t
          WHERE t.DID = :donor_id
          ORDER BY t.date DESC";
  
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':donor_id', $donorId, PDO::PARAM_INT);
  $stmt->execute();
  $transactions = $stmt->fetchAll();
  
  // For each transaction, get the details
  $donations = [];
  foreach ($transactions as $transaction) {
    $transactionId = $transaction['id'];
    
    // Get transaction details with appeal, amount, and fund information
    if ($appealTable && $amountTable && $fundlistTable) {
      $detailsSql = "SELECT 
                      td.appeal_id,
                      td.amount_id,
                      td.fundlist_id,
                      td.amount,
                      td.quantity,
                      td.freq,
                      a.name AS appeal_name,
                      am.name AS amount_name,
                      f.name AS fund_name
                    FROM `$transactionDetailsTable` td
                    LEFT JOIN `$appealTable` a ON td.appeal_id = a.id
                    LEFT JOIN `$amountTable` am ON td.amount_id = am.id
                    LEFT JOIN `$fundlistTable` f ON td.fundlist_id = f.id
                    WHERE td.TID = :transaction_id";
    } else {
      // Fallback without joins if tables don't exist
      $detailsSql = "SELECT 
                      td.appeal_id,
                      td.amount_id,
                      td.fundlist_id,
                      td.amount,
                      td.quantity,
                      td.freq
                    FROM `$transactionDetailsTable` td
                    WHERE td.TID = :transaction_id";
    }
    
    $detailsStmt = $pdo->prepare($detailsSql);
    $detailsStmt->bindValue(':transaction_id', $transactionId, PDO::PARAM_INT);
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
    $transactionDetails = array_map(function($detail) use ($frequencyMap) {
      return [
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
    
    $donations[] = [
      'id' => (int)$transaction['id'],
      'orderId' => $transaction['order_id'] ?? '',
      'totalAmount' => (float)$transaction['totalamount'],
      'paymentType' => $transaction['paymenttype'] ?? '',
      'status' => $transaction['status'] ?? '',
      'date' => $transaction['date'] ?? '',
      'currency' => $transaction['currency'] ?? 'USD',
      'details' => $transactionDetails
    ];
  }
  
  json_response([
    'success' => true,
    'data' => $donations,
    'count' => count($donations),
    'message' => 'Retrieved donor donations'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching donor donations', 500, ['message' => $e->getMessage()]);
}
