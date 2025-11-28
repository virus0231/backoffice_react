<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  
  // Support multiple table name variations for category table
  $conn = $pdo; // For find_first_existing_table compatibility
  $categoryTable = find_first_existing_table($conn, ['pw_category', 'wp_yoc_category', 'category']);
  
  if (!$categoryTable) {
    error_response('Category table not found', 500, ['message' => 'No category table found with names: pw_category, wp_yoc_category, or category']);
    exit;
  }
  
  $stmt = $pdo->query("SELECT id, name FROM `$categoryTable` ORDER BY name ASC");
  $rows = $stmt->fetchAll();

  json_response([
    'success' => true,
    'data' => array_map(function($r) {
      return [
        'id' => (int)$r['id'],
        'name' => $r['name']
      ];
    }, $rows),
    'count' => count($rows),
    'message' => 'Retrieved categories'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching categories', 500, ['message' => $e->getMessage()]);
}
