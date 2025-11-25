<?php
if(session_id() === "") session_start();
include('config.php');
include('functions.php');
if (!isset($_SESSION['company']) || empty($_SESSION['company'])) {
    $_SESSION['company'] = 'backoffice-secret';
}
ini_set('display_errors', '1'); ini_set('display_startup_errors', '1'); error_reporting(E_ALL);

if(isset($_POST['action'])){
    // Get all roles
    if($_POST['action'] == "get-roles"){
        header('Content-Type: application/json');
        try {
            $roleTable = find_first_existing_table($conn, ['pw_user_role', 'wp_yoc_user_role']);
            if (!$roleTable) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Role table not found'
                ]);
                exit();
            }

            $sql = "SELECT * FROM `$roleTable` WHERE id != 1 ORDER BY id ASC";
            $stmt = $conn->query($sql);
            $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $roles
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Unable to fetch roles',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    // Get all available permissions/modules
    if($_POST['action'] == "get-permissions"){
        header('Content-Type: application/json');
        try {
            $permTable = find_first_existing_table($conn, ['pw_permissions', 'wp_yoc_permissions']);
            if (!$permTable) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Permissions table not found'
                ]);
                exit();
            }

            $sql = "SELECT * FROM `$permTable` ORDER BY id ASC";
            $stmt = $conn->query($sql);
            $permissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $permissions
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Unable to fetch permissions',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    // Get permissions for a specific role
    if($_POST['action'] == "get-role-permissions"){
        header('Content-Type: application/json');
        try {
            $roleId = $_POST['role_id'];

            $rolePermTable = find_first_existing_table($conn, ['pw_role_permissions', 'wp_yoc_role_permissions']);
            $permTable = find_first_existing_table($conn, ['pw_permissions', 'wp_yoc_permissions']);

            if (!$rolePermTable || !$permTable) {
                echo json_encode([
                    'success' => true,
                    'permissions' => []
                ]);
                exit();
            }

            $sql = "SELECT pp.id
                    FROM `$rolePermTable` rp
                    INNER JOIN `$permTable` pp ON rp.permission_id = pp.id
                    WHERE rp.role_id = :role_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':role_id', $roleId, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $permissions = array_map(function($row) {
                return intval($row['id']);
            }, $rows);

            echo json_encode([
                'success' => true,
                'permissions' => $permissions
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Unable to fetch permissions',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    // Update permissions for a role
    if($_POST['action'] == "update-role-permissions"){
        header('Content-Type: application/json');
        try {
            $roleId = $_POST['role_id'];
            $permissions = isset($_POST['permissions']) ? json_decode($_POST['permissions'], true) : [];

            $rolePermTable = find_first_existing_table($conn, ['pw_role_permissions', 'wp_yoc_role_permissions']);

            if (!$rolePermTable) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Role permissions table not found'
                ]);
                exit();
            }

            // Start transaction
            $conn->beginTransaction();

            // Delete existing permissions for this role
            $deleteSql = "DELETE FROM `$rolePermTable` WHERE role_id = :role_id";
            $deleteStmt = $conn->prepare($deleteSql);
            $deleteStmt->bindParam(':role_id', $roleId, PDO::PARAM_INT);
            $deleteStmt->execute();

            // Insert new permissions
            if (!empty($permissions)) {
                $insertSql = "INSERT INTO `$rolePermTable` (role_id, permission_id) VALUES (:role_id, :permission_id)";
                $insertStmt = $conn->prepare($insertSql);

                foreach ($permissions as $permission_id) {
                    $insertStmt->bindParam(':role_id', $roleId, PDO::PARAM_INT);
                    $insertStmt->bindParam(':permission_id', $permission_id, PDO::PARAM_INT);
                    $insertStmt->execute();
                }
            }

            // Commit transaction
            $conn->commit();

            // Update session if current user's role was modified
            if (isset($_SESSION['user_role']) && $_SESSION['user_role'] == $roleId && isset($_SESSION['user_login'])) {
                $permTable = find_first_existing_table($conn, ['pw_permissions', 'wp_yoc_permissions']);
                $userTable = find_first_existing_table($conn, ['pw_users', 'wp_yoc_users']);

                $query = "SELECT pp.permission_name
                          FROM `$rolePermTable` rp
                          INNER JOIN `$permTable` pp ON pp.id = rp.permission_id
                          INNER JOIN `$userTable` u ON u.user_role = rp.role_id
                          WHERE u.user_role = :role_id AND u.user_login = :username
                          ORDER BY rp.permission_id ASC";

                $stmt = $conn->prepare($query);
                $stmt->execute([':role_id' => $roleId, ':username' => $_SESSION['user_login']]);

                $_SESSION['permissions'] = [];
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $_SESSION['permissions'][] = $row['permission_name'];
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'Permissions updated successfully'
            ]);
        } catch (Exception $e) {
            // Rollback on error
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }

            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Unable to update permissions',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }
}
?>
