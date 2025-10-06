<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = Database::getInstance();
    
    switch ($method) {
        case 'GET':
            getUsers($db);
            break;
        case 'PUT':
            updateUser($db);
            break;
        case 'DELETE':
            deleteUser($db);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("Users API error: " . $e->getMessage());
}

function getUsers($db) {
    $users = $db->fetchAll(
        "SELECT id, name, username, email, role, created, bio, isVerified, profilePicture FROM users ORDER BY created DESC"
    );
    
    $result = array_map(function($row) {
        return [
            'id' => $row['id'],
            'name' => $row['name'] ?? '',
            'username' => $row['username'],
            'email' => $row['email'],
            'role' => $row['role'],
            'created' => $row['created'],
            'bio' => $row['bio'] ?? '',
            'isVerified' => (bool)$row['isVerified'],
            'profilePicture' => $row['profilePicture'] ?? ''
        ];
    }, $users);
    
    echo json_encode($result);
}

function updateUser($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? '';
    $name = $input['name'] ?? '';
    $username = $input['username'] ?? '';
    $email = $input['email'] ?? '';
    $bio = $input['bio'] ?? '';
    $profilePicture = $input['profilePicture'] ?? '';
    $role = $input['role'] ?? 'user';
    $isVerified = isset($input['isVerified']) ? ($input['isVerified'] ? 1 : 0) : 0;
    $password = $input['password'] ?? '';
    
    if (empty($id) || empty($username) || empty($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID, username, and email are required']);
        return;
    }
    
    if (!empty($password)) {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $db->execute(
            "UPDATE users SET name = ?, username = ?, email = ?, bio = ?, profilePicture = ?, role = ?, isVerified = ?, password = ? WHERE id = ?",
            [$name, $username, $email, $bio, $profilePicture, $role, $isVerified, $hashedPassword, $id]
        );
    } else {
        $db->execute(
            "UPDATE users SET name = ?, username = ?, email = ?, bio = ?, profilePicture = ?, role = ?, isVerified = ? WHERE id = ?",
            [$name, $username, $email, $bio, $profilePicture, $role, $isVerified, $id]
        );
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'User updated successfully'
    ]);
}

function deleteUser($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        return;
    }
    
    $user = $db->fetchOne("SELECT role FROM users WHERE id = ?", [$id]);
    
    if ($user && $user['role'] === 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Cannot delete admin users']);
        return;
    }
    
    $db->execute("DELETE FROM users WHERE id = ?", [$id]);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'User deleted successfully'
    ]);
}
?>
