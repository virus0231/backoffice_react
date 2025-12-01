<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  
  // Support multiple table name variations for country table
  $conn = $pdo; // For find_first_existing_table compatibility
  $countryTable = find_first_existing_table($conn, ['pw_country', 'wp_yoc_country', 'country']);
  
  if (!$countryTable) {
    error_response('Country table not found', 500, ['message' => 'No country table found with names: pw_country, wp_yoc_country, or country']);
    exit;
  }
  
  $stmt = $pdo->query("SELECT id, name FROM `$countryTable` ORDER BY name ASC");
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
    'message' => 'Retrieved countries'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching countries', 500, ['message' => $e->getMessage()]);
}
