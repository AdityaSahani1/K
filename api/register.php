<?php
// Server-side registration endpoint with secure password hashing
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

// Validation
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

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters long']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit();
}

// Load existing users
$usersFile = __DIR__ . '/../data/users.json';
$users = [];
if (file_exists($usersFile)) {
    $users = json_decode(file_get_contents($usersFile), true) ?? [];
}

// Check for duplicates
foreach ($users as $user) {
    if ($user['username'] === $username) {
        http_response_code(400);
        echo json_encode(['error' => 'Username already exists']);
        exit();
    }
    if ($user['email'] === $email) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already registered']);
        exit();
    }
}

// Create new user with secure password hash
$newUser = [
    'id' => uniqid('user_'),
    'name' => $name,
    'username' => $username,
    'email' => $email,
    'password' => password_hash($password, PASSWORD_BCRYPT),
    'role' => 'user',
    'created' => date('Y-m-d H:i:s'),
    'bio' => '',
    'isVerified' => false
];

// Return user data for OTP verification (don't save yet)
echo json_encode([
    'status' => 'success',
    'message' => 'User created, pending email verification',
    'user' => $newUser
]);
?>
