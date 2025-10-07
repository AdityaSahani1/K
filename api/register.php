<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$name = trim($input['name'] ?? '');
$username = trim($input['username'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($name) || empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit();
}

if (strlen($username) < 3) {
    http_response_code(400);
    echo json_encode(['error' => 'Username must be at least 3 characters long']);
    exit();
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 8 characters long']);
    exit();
}

if (!preg_match('/[A-Z]/', $password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must contain at least one uppercase letter']);
    exit();
}

if (!preg_match('/[a-z]/', $password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must contain at least one lowercase letter']);
    exit();
}

if (!preg_match('/[0-9]/', $password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must contain at least one number']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit();
}

try {
    $db = Database::getInstance();
    
    $existing = $db->fetchOne(
        "SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1",
        [$username, $email]
    );
    
    if ($existing) {
        http_response_code(400);
        echo json_encode(['error' => 'Username or email already exists']);
        exit();
    }
    
    $userId = uniqid('user_');
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $created = date('Y-m-d H:i:s');
    
    $db->execute(
        "INSERT INTO users (id, name, username, email, password, role, created, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [$userId, $name, $username, $email, $hashedPassword, 'user', $created, 0]
    );
    
    echo json_encode([
        'status' => 'success',
        'message' => 'User created successfully',
        'user' => [
            'id' => $userId,
            'name' => $name,
            'username' => $username,
            'email' => $email,
            'role' => 'user'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("Register error: " . $e->getMessage());
}
?>
