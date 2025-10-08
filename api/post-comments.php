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

$postId = $_GET['postId'] ?? '';
$userId = $_GET['userId'] ?? null;

if (empty($postId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Post ID is required']);
    exit();
}

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("
        SELECT c.id, c.postId, c.userId, c.text, c.created, c.likes,
               c.replyTo, c.replyToUsername,
               u.username, u.name, u.profilePicture
        FROM comments c
        JOIN users u ON c.userId = u.id
        WHERE c.postId = ?
        ORDER BY c.created ASC
    ");
    $stmt->execute([$postId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Add isLiked flag for each comment if userId is provided
    if ($userId) {
        foreach ($comments as &$comment) {
            $stmt = $conn->prepare("SELECT id FROM comment_likes WHERE commentId = ? AND userId = ? LIMIT 1");
            $stmt->execute([$comment['id'], $userId]);
            $comment['isLiked'] = $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
        }
    }
    
    echo json_encode($comments);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("Get comments error: " . $e->getMessage());
}
?>
