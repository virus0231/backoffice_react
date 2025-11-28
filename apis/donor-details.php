<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $conn = $pdo;
  
  // Get donor ID from query parameter
  $donorId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  
  if ($donorId <= 0) {
    error_response('Invalid donor ID', 400, ['message' => 'Donor ID is required and must be a positive integer']);
    exit;
  }
  
  // Support multiple table name variations for donors table
  $donorTable = find_first_existing_table($conn, ['pw_donors', 'wp_yoc_donors', 'donors']);
  
  if (!$donorTable) {
    error_response('Donors table not found', 500, ['message' => 'No donors table found']);
    exit;
  }
  
  // Get donor details
  $sql = "SELECT id, fourdigit, stripe_id, email, firstname, lastname, add1, add2, city, country, postcode, phone, Date_Added, organization
          FROM `$donorTable`
          WHERE id = :id";
  
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':id', $donorId, PDO::PARAM_INT);
  $stmt->execute();
  $donor = $stmt->fetch();
  
  if (!$donor) {
    error_response('Donor not found', 404, ['message' => 'No donor found with ID: ' . $donorId]);
    exit;
  }
  
  // Transform data to match frontend expectations
  $donorData = [
    'id' => (int)$donor['id'],
    'fourdigit' => $donor['fourdigit'] ?? '',
    'stripe_id' => $donor['stripe_id'] ?? '',
    'email' => $donor['email'] ?? '',
    'firstName' => $donor['firstname'] ?? '',
    'lastName' => $donor['lastname'] ?? '',
    'phone' => $donor['phone'] ?? '',
    'address1' => $donor['add1'] ?? '',
    'address2' => $donor['add2'] ?? '',
    'city' => $donor['city'] ?? '',
    'country' => $donor['country'] ?? '',
    'postcode' => $donor['postcode'] ?? '',
    'organization' => $donor['organization'] ?? '',
    'dateAdded' => $donor['Date_Added'] ?? '',
  ];
  
  json_response([
    'success' => true,
    'data' => $donorData,
    'message' => 'Retrieved donor details'
  ]);
} catch (Throwable $e) {
  error_response('Database error fetching donor details', 500, ['message' => $e->getMessage()]);
}
