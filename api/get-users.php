<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataDir = dirname(__DIR__) . '/data';
$usersFile = $dataDir . '/users.json';

if (!file_exists($usersFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'Users data not found']);
    exit();
}

$users = json_decode(file_get_contents($usersFile), true);

if ($users === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to parse users data']);
    exit();
}

$sanitizedUsers = array_map(function($user) {
    return [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'] ?? 'user',
        'created' => $user['created'] ?? null,
        'bio' => $user['bio'] ?? '',
        'isVerified' => $user['isVerified'] ?? false
    ];
}, $users);

echo json_encode($sanitizedUsers);
?>
