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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$userId = $_GET['userId'] ?? '';
$type = $_GET['type'] ?? '';

if (empty($userId)) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID is required']);
    exit();
}

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    switch ($type) {
        case 'likes':
            getUserLikes($conn, $userId);
            break;
        case 'saves':
            getUserSaves($conn, $userId);
            break;
        case 'comments':
            getUserComments($conn, $userId);
            break;
        case 'all':
            getUserAllData($conn, $userId);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid type. Use: likes, saves, comments, or all']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("User data error: " . $e->getMessage());
}

function getUserLikes($conn, $userId) {
    $stmt = $conn->prepare("SELECT postId, created FROM likes WHERE userId = ? ORDER BY created DESC");
    $stmt->execute([$userId]);
    $likes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($likes);
}

function getUserSaves($conn, $userId) {
    $stmt = $conn->prepare("SELECT postId, created FROM saves WHERE userId = ? ORDER BY created DESC");
    $stmt->execute([$userId]);
    $saves = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($saves);
}

function getUserComments($conn, $userId) {
    $stmt = $conn->prepare("SELECT id, postId, text, created, likes, replyTo, replyToUsername FROM comments WHERE userId = ? ORDER BY created DESC");
    $stmt->execute([$userId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($comments);
}

function getUserAllData($conn, $userId) {
    $stmt = $conn->prepare("SELECT postId FROM likes WHERE userId = ? ORDER BY created DESC");
    $stmt->execute([$userId]);
    $likes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $conn->prepare("SELECT postId FROM saves WHERE userId = ? ORDER BY created DESC");
    $stmt->execute([$userId]);
    $saves = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $conn->prepare("SELECT id, postId, text, created, likes, replyTo, replyToUsername FROM comments WHERE userId = ? ORDER BY created DESC");
    $stmt->execute([$userId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'likes' => $likes,
        'saves' => $saves,
        'comments' => $comments
    ]);
}
?>
