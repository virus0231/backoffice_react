<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

try {
  $pdo = get_pdo();
  $tables = get_table_names($pdo);

  $input = json_decode(file_get_contents('php://input'), true);
  $amountId = $input['amount_id'] ?? null;
  $newStatus = $input['status'] ?? null;

  if ($amountId === null || $newStatus === null) {
    error_response('amount_id and status are required', 400);
  }

  // Update status (0 = enabled, 1 = disabled)
  $statusValue = $newStatus ? 0 : 1;

  $stmt = $pdo->prepare("UPDATE `{$tables['amount']}` SET disable = ? WHERE id = ?");
  $stmt->execute([$statusValue, (int)$amountId]);

  json_response([
    'success' => true,
    'message' => 'Status updated successfully'
  ]);
} catch (Throwable $e) {
  error_response('Database error updating status', 500, ['message' => $e->getMessage()]);
}
