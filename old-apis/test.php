<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Test 1: PHP is working
echo json_encode([
  'status' => 'ok',
  'message' => 'PHP is working',
  'timestamp' => date('Y-m-d H:i:s')
]);