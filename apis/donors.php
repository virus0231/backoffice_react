<?php
require_once __DIR__ . '/_bootstrap.php';

try {
  $pdo = get_pdo();

  // Get optional email search parameter
  $emailSearch = isset($_GET['email']) ? trim($_GET['email']) : '';

  // Build the SQL query
  $sql = 'SELECT id, fourdigit, stripe_id, email, firstname, lastname, add1, add2, city, country, postcode, phone, Date_Added, organization
          FROM ' . table('donors');

  // Add email filter if provided
  if (!empty($emailSearch)) {
    $sql .= ' WHERE email LIKE :email';
  }

  $sql .= ' ORDER BY id DESC';

  $stmt = $pdo->prepare($sql);

  // Bind email parameter if search is provided
  if (!empty($emailSearch)) {
    $emailPattern = '%' . $emailSearch . '%';
    $stmt->bindValue(':email', $emailPattern, PDO::PARAM_STR);
  }

  $stmt->execute();
  $rows = $stmt->fetchAll();

  // Transform data to match frontend expectations
  $data = array_map(function($r) {
    return [
      'id' => (int)$r['id'],
      'fourdigit' => $r['fourdigit'] ?? '',
      'stripe_id' => $r['stripe_id'] ?? '',
      'email' => $r['email'] ?? '',
      'firstName' => $r['firstname'] ?? '',
      'lastName' => $r['lastname'] ?? '',
      'phone' => $r['phone'] ?? '',
      'address1' => $r['add1'] ?? '',
      'address2' => $r['add2'] ?? '',
      'city' => $r['city'] ?? '',
      'country' => $r['country'] ?? '',
      'postcode' => $r['postcode'] ?? '',
      'organization' => $r['organization'] ?? '',
      'dateAdded' => $r['Date_Added'] ?? '',
    ];
  }, $rows);

  json_response([
    'success' => true,
    'data' => $data,
    'count' => count($data),
    'message' => !empty($emailSearch)
      ? 'Retrieved donors matching "' . $emailSearch . '"'
      : 'Retrieved all donors'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching donors', 500, ['message' => $e->getMessage()]);
}
