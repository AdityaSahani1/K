<?php
// Server-side login endpoint with secure password verification
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

// Load users
$usersFile = __DIR__ . '/../data/users.json';
if (!file_exists($usersFile)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid username or password']);
    exit();
}

$users = json_decode(file_get_contents($usersFile), true) ?? [];

// Find user by username or email
$user = null;
foreach ($users as $u) {
    if ($u['username'] === $username || $u['email'] === $username) {
        $user = $u;
        break;
    }
}

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid username or password']);
    exit();
}

// Verify password
$passwordValid = false;
$needsUpgrade = false;

// Check if password is already hashed with password_hash (starts with $2y$ for bcrypt)
if (strpos($user['password'], '$2y$') === 0) {
    // New secure hash - use password_verify
    $passwordValid = password_verify($password, $user['password']);
} else {
    // Try legacy hash
    $legacyHash = hashPasswordLegacy($password);
    $passwordValid = ($user['password'] === $legacyHash);
    
    // If legacy hash didn't match, try plain text (for backward compatibility)
    if (!$passwordValid && $user['password'] === $password) {
        $passwordValid = true;
    }
    
    // If valid with legacy hash or plain text, upgrade to secure hash
    if ($passwordValid) {
        $needsUpgrade = true;
        $user['password'] = password_hash($password, PASSWORD_BCRYPT);
        // Update user in array
        for ($i = 0; $i < count($users); $i++) {
            if ($users[$i]['id'] === $user['id']) {
                $users[$i]['password'] = $user['password'];
                break;
            }
        }
        // Save updated users
        file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    }
}

if (!$passwordValid) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid username or password']);
    exit();
}

// Generate session token
$sessionToken = bin2hex(random_bytes(32));

// Update last login
$user['lastLogin'] = date('Y-m-d H:i:s');

// Return success response
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

// Legacy hash function for backward compatibility
function hashPasswordLegacy($password) {
    $hash = 0;
    for ($i = 0; $i < strlen($password); $i++) {
        $char = ord($password[$i]);
        $hash = (($hash << 5) - $hash) + $char;
        $hash = $hash & $hash;
    }
    return base_convert($hash, 10, 36);
}
?>
