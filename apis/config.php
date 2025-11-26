<?php
// Configuration for API endpoints
// IMPORTANT: Legacy code sets global $conn before returning config array

// Legacy variables for older files
$currency = [['$','USD'],['£', 'POUND']];

// Database credentials
$host = 'localhost';
$name = 'mausa_yoc';
$user = 'fwdb';
$pass = '4g^_r84ec5J=';

// Legacy PDO connection (for older files that still use global $conn)
$dsn = "mysql:host=$host;dbname=$name;charset=utf8mb4";
$conn = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

// Return config array for new _bootstrap.php style files
return [
    'DB_HOST' => $host,
    'DB_NAME' => $name,
    'DB_USER' => $user,
    'DB_PASSWORD' => $pass,
    'DB_PORT' => 3306,
    'currency' => $currency,
];
