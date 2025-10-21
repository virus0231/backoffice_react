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

$username = isset($body['username']) ? trim((string)$body['username']) : '';
$password = isset($body['password']) ? (string)$body['password'] : '';

if ($username === '' || $password === '') {
  error_response('Username and password are required', 400);
  exit;
}

try {
  $pdo = get_pdo();

  $sql = "SELECT id, username, password_hash, role, status, full_name, email FROM pw_insights_user WHERE username = :u LIMIT 1";
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':u', $username, PDO::PARAM_STR);
  $stmt->execute();
  $user = $stmt->fetch();

  if (!$user || !in_array($user['status'], ['active', 1, '1'], true)) {
    error_response('Invalid credentials', 401);
    exit;
  }

  if (!password_verify($password, $user['password_hash'])) {
    error_response('Invalid credentials', 401);
    exit;
  }

  // Update last login timestamp (best effort)
  try {
    $upd = $pdo->prepare("UPDATE pw_insights_user SET last_login_at = NOW() WHERE id = :id");
    $upd->bindValue(':id', (int)$user['id'], PDO::PARAM_INT);
    $upd->execute();
  } catch (Throwable $e) {}

  // Create a signed token (HS256-like)
  $cfg = require __DIR__ . '/config.php';
  $secret = get_env_or($cfg, 'INSIGHTS_AUTH_SECRET', 'change-me');
  $ttl = (int)get_env_or($cfg, 'INSIGHTS_TOKEN_TTL', 86400); // seconds
  $exp = time() + max(60, $ttl);

  $header = ['alg' => 'HS256', 'typ' => 'JWT'];
  $payload = [
    'sub' => (int)$user['id'],
    'username' => $user['username'],
    'role' => $user['role'] ?: 'user',
    'exp' => $exp,
  ];

  $b64url = function (string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  };

  $headerSeg = $b64url(json_encode($header));
  $payloadSeg = $b64url(json_encode($payload));
  $sig = hash_hmac('sha256', $headerSeg . '.' . $payloadSeg, $secret, true);
  $sigSeg = $b64url($sig);
  $token = $headerSeg . '.' . $payloadSeg . '.' . $sigSeg;

  json_response([
    'success' => true,
    'data' => [
      'token' => $token,
      'expiresIn' => $exp - time(),
      'user' => [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'role' => $user['role'] ?: 'user',
        'fullName' => $user['full_name'] ?? null,
        'email' => $user['email'] ?? null,
      ]
    ]
  ]);
} catch (Throwable $e) {
  error_log('[login] error: ' . $e->getMessage());
  error_response('Login failed', 500);
}

