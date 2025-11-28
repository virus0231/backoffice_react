<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();

  // Support multiple table name variations for donors table
  $conn = $pdo; // For find_first_existing_table compatibility
  $donorTable = find_first_existing_table($conn, ['pw_donors', 'wp_yoc_donors', 'donors']);

  if (!$donorTable) {
    error_response('Donors table not found', 500, ['message' => 'No donors table found with names: pw_donors, wp_yoc_donors, or donors']);
    exit;
  }

  // Log which table we're using for debugging
  error_log('[donors.php] Using table: ' . $donorTable);

  // Get optional parameters
  $emailSearch = isset($_GET['email']) ? trim($_GET['email']) : '';
  $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
  $limit = isset($_GET['limit']) ? min(100, max(10, (int)$_GET['limit'])) : 50;
  $offset = ($page - 1) * $limit;

  // Build the base WHERE clause
  $whereClause = '';
  $params = [];

  if (!empty($emailSearch)) {
    $whereClause = ' WHERE email LIKE :email OR firstname LIKE :email OR lastname LIKE :email';
    $params[':email'] = '%' . $emailSearch . '%';
  }

  // Get total count
  $countSql = "SELECT COUNT(*) FROM `$donorTable`" . $whereClause;
  $countStmt = $pdo->prepare($countSql);
  foreach ($params as $key => $val) {
    $countStmt->bindValue($key, $val, PDO::PARAM_STR);
  }
  $countStmt->execute();
  $totalCount = (int)$countStmt->fetchColumn();

  // Build the paginated query
  $sql = "SELECT id, fourdigit, stripe_id, email, firstname, lastname, add1, add2, city, country, postcode, phone, Date_Added, organization
          FROM `$donorTable`" . $whereClause . "
          ORDER BY id DESC
          LIMIT :limit OFFSET :offset";

  $stmt = $pdo->prepare($sql);

  // Bind search parameters
  foreach ($params as $key => $val) {
    $stmt->bindValue($key, $val, PDO::PARAM_STR);
  }

  // Bind pagination parameters
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

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

  $totalPages = ceil($totalCount / $limit);

  json_response([
    'success' => true,
    'data' => $data,
    'pagination' => [
      'currentPage' => $page,
      'totalPages' => $totalPages,
      'totalCount' => $totalCount,
      'perPage' => $limit,
      'hasNext' => $page < $totalPages,
      'hasPrev' => $page > 1
    ],
    'count' => count($data),
    'message' => !empty($emailSearch)
      ? 'Retrieved donors matching "' . $emailSearch . '"'
      : 'Retrieved paginated donors'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching donors', 500, ['message' => $e->getMessage()]);
}
