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
$action = $input['action'] ?? '';

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    switch ($action) {
        case 'like':
            handleLike($conn, $input);
            break;
        case 'save':
            handleSave($conn, $input);
            break;
        case 'view':
            handleView($conn, $input);
            break;
        case 'comment':
            handleComment($conn, $input);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("Post actions error: " . $e->getMessage());
}

function handleLike($conn, $input) {
    $postId = $input['postId'] ?? '';
    $userId = $input['userId'] ?? '';
    
    if (empty($postId) || empty($userId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID and User ID are required']);
        return;
    }
    
    // Check if already liked
    $stmt = $conn->prepare("SELECT id FROM likes WHERE postId = ? AND userId = ? LIMIT 1");
    $stmt->bind_param("ss", $postId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $exists = $result->fetch_assoc();
    $stmt->close();
    
    if ($exists) {
        // Unlike
        $stmt = $conn->prepare("DELETE FROM likes WHERE postId = ? AND userId = ?");
        $stmt->bind_param("ss", $postId, $userId);
        $stmt->execute();
        $stmt->close();
        
        $conn->query("UPDATE posts SET likes = likes - 1 WHERE id = '$postId'");
        
        echo json_encode(['status' => 'success', 'action' => 'unliked']);
    } else {
        // Like
        $created = date('Y-m-d H:i:s');
        $stmt = $conn->prepare("INSERT INTO likes (postId, userId, created) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $postId, $userId, $created);
        $stmt->execute();
        $stmt->close();
        
        $conn->query("UPDATE posts SET likes = likes + 1 WHERE id = '$postId'");
        
        echo json_encode(['status' => 'success', 'action' => 'liked']);
    }
}

function handleSave($conn, $input) {
    $postId = $input['postId'] ?? '';
    $userId = $input['userId'] ?? '';
    
    if (empty($postId) || empty($userId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID and User ID are required']);
        return;
    }
    
    // Check if already saved
    $stmt = $conn->prepare("SELECT id FROM saves WHERE postId = ? AND userId = ? LIMIT 1");
    $stmt->bind_param("ss", $postId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $exists = $result->fetch_assoc();
    $stmt->close();
    
    if ($exists) {
        // Unsave
        $stmt = $conn->prepare("DELETE FROM saves WHERE postId = ? AND userId = ?");
        $stmt->bind_param("ss", $postId, $userId);
        $stmt->execute();
        $stmt->close();
        
        echo json_encode(['status' => 'success', 'action' => 'unsaved']);
    } else {
        // Save
        $created = date('Y-m-d H:i:s');
        $stmt = $conn->prepare("INSERT INTO saves (postId, userId, created) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $postId, $userId, $created);
        $stmt->execute();
        $stmt->close();
        
        echo json_encode(['status' => 'success', 'action' => 'saved']);
    }
}

function handleView($conn, $input) {
    $postId = $input['postId'] ?? '';
    $userId = $input['userId'] ?? null;
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    
    if (empty($postId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID is required']);
        return;
    }
    
    $created = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("INSERT INTO views (postId, userId, ipAddress, created) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $postId, $userId, $ipAddress, $created);
    $stmt->execute();
    $stmt->close();
    
    $conn->query("UPDATE posts SET views = views + 1 WHERE id = '$postId'");
    
    echo json_encode(['status' => 'success']);
}

function handleComment($conn, $input) {
    $postId = $input['postId'] ?? '';
    $userId = $input['userId'] ?? '';
    $text = $input['text'] ?? '';
    
    if (empty($postId) || empty($userId) || empty($text)) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID, User ID and text are required']);
        return;
    }
    
    $id = uniqid('comment_');
    $created = date('Y-m-d H:i:s');
    
    $stmt = $conn->prepare("INSERT INTO comments (id, postId, userId, text, created) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $id, $postId, $userId, $text, $created);
    $stmt->execute();
    $stmt->close();
    
    $conn->query("UPDATE posts SET comments = comments + 1 WHERE id = '$postId'");
    
    echo json_encode(['status' => 'success', 'commentId' => $id]);
}
?>
