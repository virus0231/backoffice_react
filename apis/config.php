<?php

$currency = [['$','USD'],['£', 'POUND']];

$host = 'localhost';
$name = 'mausa_yoc'; // FW_db
$user = 'fwdb';
$pass = '4g^_r84ec5J=';

$dsn = "mysql:host=$host;dbname=$name;charset=utf8mb4";
$conn = new PDO($dsn, $user, $pass, [
PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

?>
