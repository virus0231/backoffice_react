<?php
require_once __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  error_response('Method not allowed', 405);
  exit;
}

try {
  $raw = file_get_contents('php://input');
  $body = json_decode($raw ?: '[]', true);
} catch (Throwable $e) {
  $body = [];
}

$cfg = require __DIR__ . '/config.php';
$adminKey = isset($body['admin_key']) ? (string)$body['admin_key'] : '';
$expectedKey = get_env_or($cfg, 'INSIGHTS_ADMIN_KEY', null);
if (!$expectedKey || $adminKey !== $expectedKey) {
  error_response('Forbidden', 403);
  exit;
}

$username = isset($body['username']) ? trim((string)$body['username']) : '';
$password = isset($body['password']) ? (string)$body['password'] : '';
$fullName = isset($body['full_name']) ? trim((string)$body['full_name']) : null;
$email = isset($body['email']) ? trim((string)$body['email']) : null;
$role = isset($body['role']) ? trim((string)$body['role']) : 'user';

if ($username === '' || $password === '') {
  error_response('Username and password are required', 400);
  exit;
}

if (!preg_match('/^[A-Za-z0-9_\-.]{3,64}$/', $username)) {
  error_response('Invalid username format', 400);
  exit;
}

if (strlen($password) < 8) {
  error_response('Password must be at least 8 characters', 400);
  exit;
}

if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  error_response('Invalid email', 400);
  exit;
}

if (!in_array($role, ['user', 'admin'], true)) {
  $role = 'user';
}

try {
  $pdo = get_pdo();

  // Check duplicates
  $dupSql = "SELECT id FROM pw_insights_user WHERE username = :u OR (email IS NOT NULL AND email = :e) LIMIT 1";
  $dup = $pdo->prepare($dupSql);
  $dup->bindValue(':u', $username, PDO::PARAM_STR);
  $dup->bindValue(':e', $email, PDO::PARAM_STR);
  $dup->execute();
  $existing = $dup->fetch();
  if ($existing) {
    error_response('Username or email already exists', 409);
    exit;
  }

  $hash = password_hash($password, PASSWORD_BCRYPT);
  $ins = $pdo->prepare("INSERT INTO pw_insights_user (username, password_hash, full_name, email, role, status, created_at, updated_at) VALUES (:u, :h, :fn, :em, :r, 'active', NOW(), NOW())");
  $ins->bindValue(':u', $username, PDO::PARAM_STR);
  $ins->bindValue(':h', $hash, PDO::PARAM_STR);
  $ins->bindValue(':fn', $fullName, $fullName === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
  $ins->bindValue(':em', $email, $email === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
  $ins->bindValue(':r', $role, PDO::PARAM_STR);
  $ins->execute();

  $id = (int)$pdo->lastInsertId();
  json_response([
    'success' => true,
    'data' => [ 'id' => $id, 'username' => $username, 'role' => $role ]
  ], 201);
} catch (Throwable $e) {
  error_log('[add_user] error: ' . $e->getMessage());
  error_response('Failed to create user', 500);
}

