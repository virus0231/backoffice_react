<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/functions.php';

try {
  $pdo = get_pdo();
  $conn = $pdo;
  
  // Support multiple table name variations for donors table
  $donorTable = find_first_existing_table($conn, ['pw_donors', 'wp_yoc_donors', 'donors']);
  
  if (!$donorTable) {
    error_response('Donors table not found', 500, ['message' => 'No donors table found']);
    exit;
  }
  
  // Handle POST requests (updates)
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON payload or form data
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
      $input = json_decode(file_get_contents('php://input'), true);
    } else {
      $input = $_POST;
    }
    
    $action = $input['action'] ?? '';
    
    if ($action === 'update-donor') {
      $donorId = isset($input['donor_id']) ? (int)$input['donor_id'] : 0;
      
      if ($donorId <= 0) {
        error_response('Invalid donor ID', 400, ['message' => 'Valid donor ID is required']);
        exit;
      }
      
      // Extract fields to update
      $organization = $input['organization'] ?? '';
      $street = $input['street'] ?? '';
      $city = $input['city'] ?? '';
      $state = $input['state'] ?? '';
      $postcode = $input['postcode'] ?? '';
      $country = $input['country'] ?? '';
      $phone = $input['phone'] ?? '';
      $firstName = $input['firstName'] ?? '';
      $lastName = $input['lastName'] ?? '';
      $email = $input['email'] ?? '';
      
      // Build update query with prepared statements
      $sql = "UPDATE `$donorTable` 
              SET organization = :organization,
                  add1 = :street,
                  add2 = :state,
                  city = :city,
                  country = :country,
                  postcode = :postcode,
                  phone = :phone";
      
      // Add optional fields if provided
      $params = [
        ':organization' => $organization,
        ':street' => $street,
        ':state' => $state,
        ':city' => $city,
        ':country' => $country,
        ':postcode' => $postcode,
        ':phone' => $phone,
        ':donor_id' => $donorId
      ];
      
      if (!empty($firstName)) {
        $sql .= ", firstname = :firstName";
        $params[':firstName'] = $firstName;
      }
      
      if (!empty($lastName)) {
        $sql .= ", lastname = :lastName";
        $params[':lastName'] = $lastName;
      }
      
      if (!empty($email)) {
        $sql .= ", email = :email";
        $params[':email'] = $email;
      }
      
      $sql .= " WHERE id = :donor_id";
      
      $stmt = $pdo->prepare($sql);
      
      foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_STR);
      }
      
      $result = $stmt->execute();
      
      if ($result) {
        json_response([
          'success' => true,
          'message' => 'Donor updated successfully'
        ]);
      } else {
        error_response('Failed to update donor', 500, ['message' => 'Database update failed']);
      }
    } else {
      error_response('Invalid action', 400, ['message' => 'Action not recognized']);
    }
  } else {
    error_response('Invalid request method', 405, ['message' => 'Only POST requests are allowed']);
  }
} catch (Throwable $e) {
  error_response('Database error updating donor', 500, ['message' => $e->getMessage()]);
}
