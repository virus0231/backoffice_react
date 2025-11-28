<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $tables = get_table_names($pdo);

  $appealId = $_GET['appeal_id'] ?? null;

  if (!$appealId) {
    error_response('appeal_id is required', 400);
  }

  // Get amounts for this appeal
  $stmtAmounts = $pdo->prepare("
    SELECT id, name, amount
    FROM `{$tables['amount']}`
    WHERE appeal_id = ?
    ORDER BY sort ASC, name ASC
  ");
  $stmtAmounts->execute([(int)$appealId]);
  $amounts = $stmtAmounts->fetchAll();

  // Get funds for this appeal
  $stmtFunds = $pdo->prepare("
    SELECT id, name
    FROM `{$tables['fundlist']}`
    WHERE appeal_id = ?
    ORDER BY sort ASC, name ASC
  ");
  $stmtFunds->execute([(int)$appealId]);
  $funds = $stmtFunds->fetchAll();

  // Get existing associations
  $stmtAssoc = $pdo->prepare("
    SELECT amountid, fundlistid
    FROM `{$tables['fund_amount_combo']}`
    WHERE appealid = ?
  ");
  $stmtAssoc->execute([(int)$appealId]);
  $associations = $stmtAssoc->fetchAll();

  json_response([
    'success' => true,
    'data' => [
      'amounts' => array_map(function($r) {
        return [
          'id' => (int)$r['id'],
          'name' => $r['name'],
          'amount' => (float)$r['amount']
        ];
      }, $amounts),
      'funds' => array_map(function($r) {
        return [
          'id' => (int)$r['id'],
          'name' => $r['name']
        ];
      }, $funds),
      'associations' => array_map(function($r) {
        return [
          'amountId' => (int)$r['amountid'],
          'fundId' => (int)$r['fundlistid']
        ];
      }, $associations)
    ],
    'message' => 'Retrieved fund-amount associations'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching associations', 500, ['message' => $e->getMessage()]);
}
