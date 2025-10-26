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
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password are required']);
    exit();
}

try {
    $db = Database::getInstance();

    $user = $db->fetchOne(
        "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
        [$username, $username]
    );

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password']);
        exit();
    }

    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password']);
        exit();
    }

    if (!$user['isVerified']) {
        http_response_code(403);
        echo json_encode([
            'error' => 'Email not verified',
            'needsVerification' => true,
            'email' => $user['email'],
            'userId' => $user['id']
        ]);
        exit();
    }

    $sessionToken = bin2hex(random_bytes(32));
    $lastLogin = date('Y-m-d H:i:s');

    $db->execute(
        "UPDATE users SET lastLogin = ? WHERE id = ?",
        [$lastLogin, $user['id']]
    );

    echo json_encode([
        'status' => 'success',
        'message' => 'Login successful',
        'sessionToken' => $sessionToken,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'name' => $user['name'] ?? $user['username'],
            'role' => $user['role'] ?? 'user',
            'bio' => $user['bio'] ?? '',
            'profilePicture' => $user['profilePicture'] ?? ''
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("Login error: " . $e->getMessage());
}
?>
