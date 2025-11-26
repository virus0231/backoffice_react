<?php
require_once __DIR__ . '/_bootstrap.php';

try {
  $pdo = get_pdo();
  $stmt = $pdo->query('SELECT id, name FROM ' . table('category') . ' ORDER BY name ASC');
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
