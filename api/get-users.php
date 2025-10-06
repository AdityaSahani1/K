<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $db = Database::getInstance();
    
    $users = $db->fetchAll(
        "SELECT id, username, email, role, created, bio, isVerified FROM users ORDER BY created DESC"
    );
    
    $result = array_map(function($row) {
        return [
            'id' => $row['id'],
            'username' => $row['username'],
            'email' => $row['email'],
            'role' => $row['role'],
            'created' => $row['created'],
            'bio' => $row['bio'] ?? '',
            'isVerified' => (bool)$row['isVerified']
        ];
    }, $users);
    
    echo json_encode($result);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch users']);
    error_log("Get users error: " . $e->getMessage());
}
?>
