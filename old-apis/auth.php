<?php
// CORS headers for React app
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_id() === "") session_start();
if (!isset($_SESSION['company']) || empty($_SESSION['company'])) {
    $_SESSION['company'] = 'backoffice-secret';
}

include('config.php');
include('functions.php');
// security.php may not exist in local copy; include silently
if (file_exists(__DIR__ . '/security.php')) {
    include('security.php');
}
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);

function json_response($payload, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit();
}

function get_user_details_dynamic($conn, $username){
    $userTable = find_first_existing_table($conn, ['pw_users', 'wp_yoc_users']);
    if (!$userTable) {
        return null;
    }
    $sql = "SELECT * FROM `$userTable` WHERE `user_login` = :username AND `user_status` = '0' LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function hydrate_permissions($conn, $role_id, $username) {
    $permTable = find_first_existing_table($conn, ['pw_permissions', 'wp_yoc_permissions']);
    $rolePermTable = find_first_existing_table($conn, ['pw_role_permissions', 'wp_yoc_role_permissions']);
    $userTable = find_first_existing_table($conn, ['pw_users', 'wp_yoc_users']);

    if (!$permTable || !$rolePermTable || !$userTable) {
        $_SESSION['permissions'] = [];
        return;
    }

    $sql = "SELECT $permTable.permission_name 
            FROM `$rolePermTable`
            INNER JOIN `$permTable` ON `$permTable`.id = `$rolePermTable`.permission_id
            INNER JOIN `$userTable` ON `$userTable`.user_role = `$rolePermTable`.role_id 
            WHERE `$userTable`.user_role = :role_id AND `$userTable`.user_login = :username 
            ORDER BY permission_id ASC";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':role_id', $role_id, PDO::PARAM_INT);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();

    $_SESSION['permissions'] = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $_SESSION['permissions'][] = $row['permission_name'];
    }
}

if(isset($_POST['action'])){
    $action = $_POST['action'];

    if($action === "Login"){
        $username = $_POST['username_val'] ?? '';
        $userpass = $_POST['password_val'] ?? '';

        $userdata = get_user_details_dynamic($conn, $username);
        if(!$userdata){
            json_response([
                'success' => false,
                'message' => 'Invalid username or password'
            ], 401);
        }

        $expected_password = hash_hmac("sha256", $userpass, $_SESSION['company']);
        $actual_password = $userdata['user_pass'];
        $_SESSION['login_user_image'] = $userdata['user_img_url'] ?? '';
        $_SESSION['login_user_name'] = $userdata['display_name'] ?? '';
        $_SESSION['login_user_id'] = $userdata['ID'] ?? '';

        if (hash_equals($expected_password, $actual_password)) {
            $_SESSION['user_details'] = $userdata;
            $_SESSION['user_role'] = $userdata['user_role'] ?? null;
            $_SESSION['user_login'] = $userdata['user_login'] ?? '';
        if (function_exists('security')) {
            try { security("Logged In", $conn); } catch (\Throwable $e) {}
        }
        hydrate_permissions($conn, $_SESSION['user_role'], $_SESSION['user_login']);
        json_response([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                    'username' => $userdata['user_login'] ?? '',
                    'display_name' => $userdata['display_name'] ?? '',
                    'role' => $userdata['user_role'] ?? '',
                    'email' => $userdata['user_email'] ?? ''
                ]
            ]);
        } else {
            json_response([
                'success' => false,
                'message' => 'Invalid username or password'
            ], 401);
        }
    }

    if($action === "Logout"){
        if (function_exists('security')) {
            try { security("Logged Out", $conn); } catch (\Throwable $e) {}
        }
        session_destroy();
        json_response([
            'success' => true,
            'message' => 'Logged out'
        ]);
    }

    if($action === "status"){
        if (isset($_SESSION['user_login']) && isset($_SESSION['user_role'])) {
            $username = $_SESSION['user_login'];
            $userdata = get_user_details_dynamic($conn, $username);
            if ($userdata) {
                json_response([
                    'success' => true,
                    'user' => [
                        'username' => $userdata['user_login'] ?? '',
                        'display_name' => $userdata['display_name'] ?? '',
                        'role' => $userdata['user_role'] ?? '',
                        'email' => $userdata['user_email'] ?? ''
                    ]
                ]);
            }
        }
        json_response([
            'success' => false,
            'message' => 'Not authenticated'
        ], 401);
    }
}

json_response([
    'success' => false,
    'message' => 'Invalid request'
], 400);
