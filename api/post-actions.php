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
    
    $userId = $input['userId'] ?? null;
    if ($userId && in_array($action, ['like', 'save', 'comment', 'comment_like', 'comment_reply', 'delete_comment'])) {
        $stmt = $conn->prepare("SELECT id, role FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $userExists = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$userExists) {
            http_response_code(401);
            echo json_encode(['error' => 'User session invalid. Please login again.']);
            exit();
        }
    }
    
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
        case 'comment_like':
            handleCommentLike($conn, $input);
            break;
        case 'comment_reply':
            handleCommentReply($conn, $input);
            break;
        case 'delete_comment':
            handleCommentDelete($conn, $input);
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
    
    // Check if already liked (PDO)
    $stmt = $conn->prepare("SELECT id FROM likes WHERE postId = ? AND userId = ? LIMIT 1");
    $stmt->execute([$postId, $userId]);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($exists) {
        // Unlike
        $stmt = $conn->prepare("DELETE FROM likes WHERE postId = ? AND userId = ?");
        $stmt->execute([$postId, $userId]);
        
        $stmt = $conn->prepare("UPDATE posts SET likes = likes - 1 WHERE id = ?");
        $stmt->execute([$postId]);
        
        // Get updated count
        $stmt = $conn->prepare("SELECT likes FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'action' => 'unliked', 'likes' => (int)$post['likes']]);
    } else {
        // Like
        $created = date('Y-m-d H:i:s');
        $stmt = $conn->prepare("INSERT INTO likes (postId, userId, created) VALUES (?, ?, ?)");
        $stmt->execute([$postId, $userId, $created]);
        
        $stmt = $conn->prepare("UPDATE posts SET likes = likes + 1 WHERE id = ?");
        $stmt->execute([$postId]);
        
        // Get updated count
        $stmt = $conn->prepare("SELECT likes FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'action' => 'liked', 'likes' => (int)$post['likes']]);
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
    
    // Check if already saved (PDO)
    $stmt = $conn->prepare("SELECT id FROM saves WHERE postId = ? AND userId = ? LIMIT 1");
    $stmt->execute([$postId, $userId]);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($exists) {
        // Unsave
        $stmt = $conn->prepare("DELETE FROM saves WHERE postId = ? AND userId = ?");
        $stmt->execute([$postId, $userId]);
        
        echo json_encode(['status' => 'success', 'action' => 'unsaved']);
    } else {
        // Save
        $created = date('Y-m-d H:i:s');
        $stmt = $conn->prepare("INSERT INTO saves (postId, userId, created) VALUES (?, ?, ?)");
        $stmt->execute([$postId, $userId, $created]);
        
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
    
    if ($userId) {
        $stmt = $conn->prepare("SELECT id FROM views WHERE postId = ? AND userId = ? LIMIT 1");
        $stmt->execute([$postId, $userId]);
        $existingView = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingView) {
            echo json_encode(['status' => 'success', 'message' => 'Already viewed']);
            return;
        }
    }
    
    $created = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("INSERT INTO views (postId, userId, ipAddress, created) VALUES (?, ?, ?, ?)");
    $stmt->execute([$postId, $userId, $ipAddress, $created]);
    
    $stmt = $conn->prepare("UPDATE posts SET views = views + 1 WHERE id = ?");
    $stmt->execute([$postId]);
    
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
    $stmt->execute([$id, $postId, $userId, $text, $created]);
    
    $stmt = $conn->prepare("UPDATE posts SET comments = comments + 1 WHERE id = ?");
    $stmt->execute([$postId]);
    
    // Get post author to create notification
    $stmt = $conn->prepare("SELECT p.author, u.id as authorId, u.username FROM posts p JOIN users u ON p.author = u.username WHERE p.id = ?");
    $stmt->execute([$postId]);
    $postData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Create notification for post author (if not commenting on own post)
    if ($postData && $postData['authorId'] !== $userId) {
        $stmt = $conn->prepare("SELECT username FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $commenter = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $notifId = uniqid('notif_');
        $message = $commenter['username'] . ' commented on your post';
        $stmt = $conn->prepare("INSERT INTO notifications (id, userId, actorId, type, message, relatedId, created) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$notifId, $postData['authorId'], $userId, 'comment', $message, $postId, $created]);
    }
    
    // Get updated count
    $stmt = $conn->prepare("SELECT comments FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'success', 'commentId' => $id, 'comments' => (int)$post['comments']]);
}

function handleCommentLike($conn, $input) {
    $commentId = $input['commentId'] ?? '';
    $userId = $input['userId'] ?? '';
    
    if (empty($commentId) || empty($userId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Comment ID and User ID are required']);
        return;
    }
    
    // Check if already liked
    $stmt = $conn->prepare("SELECT id FROM comment_likes WHERE commentId = ? AND userId = ? LIMIT 1");
    $stmt->execute([$commentId, $userId]);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($exists) {
        // Unlike
        $stmt = $conn->prepare("DELETE FROM comment_likes WHERE commentId = ? AND userId = ?");
        $stmt->execute([$commentId, $userId]);
        
        $stmt = $conn->prepare("UPDATE comments SET likes = CASE WHEN likes > 0 THEN likes - 1 ELSE 0 END WHERE id = ?");
        $stmt->execute([$commentId]);
        
        // Get updated count
        $stmt = $conn->prepare("SELECT likes FROM comments WHERE id = ?");
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'action' => 'unliked', 'likes' => (int)$comment['likes']]);
    } else {
        // Like
        $created = date('Y-m-d H:i:s');
        $stmt = $conn->prepare("INSERT INTO comment_likes (commentId, userId, created) VALUES (?, ?, ?)");
        $stmt->execute([$commentId, $userId, $created]);
        
        $stmt = $conn->prepare("UPDATE comments SET likes = likes + 1 WHERE id = ?");
        $stmt->execute([$commentId]);
        
        // Get updated count
        $stmt = $conn->prepare("SELECT likes FROM comments WHERE id = ?");
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'action' => 'liked', 'likes' => (int)$comment['likes']]);
    }
}

function handleCommentReply($conn, $input) {
    $postId = $input['postId'] ?? '';
    $userId = $input['userId'] ?? '';
    $text = $input['text'] ?? '';
    $replyTo = $input['replyTo'] ?? '';
    $replyToUsername = $input['replyToUsername'] ?? '';
    
    if (empty($postId) || empty($userId) || empty($text) || empty($replyTo)) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID, User ID, text, and replyTo are required']);
        return;
    }
    
    $id = uniqid('comment_');
    $created = date('Y-m-d H:i:s');
    
    $stmt = $conn->prepare("INSERT INTO comments (id, postId, userId, text, created, replyTo, replyToUsername) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $postId, $userId, $text, $created, $replyTo, $replyToUsername]);
    
    $stmt = $conn->prepare("UPDATE posts SET comments = comments + 1 WHERE id = ?");
    $stmt->execute([$postId]);
    
    // Get the user being replied to
    $stmt = $conn->prepare("SELECT c.userId FROM comments c WHERE c.id = ?");
    $stmt->execute([$replyTo]);
    $parentComment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Create notification for the user being replied to (if not replying to self)
    if ($parentComment && $parentComment['userId'] !== $userId) {
        $stmt = $conn->prepare("SELECT username FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $replier = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $notifId = uniqid('notif_');
        $message = $replier['username'] . ' replied to your comment: "' . substr($text, 0, 50) . (strlen($text) > 50 ? '...' : '') . '"';
        $stmt = $conn->prepare("INSERT INTO notifications (id, userId, actorId, type, message, relatedId, created) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$notifId, $parentComment['userId'], $userId, 'reply', $message, $postId, $created]);
    }
    
    // Check for @mentions in the text
    if (preg_match_all('/@(\w+)/', $text, $matches)) {
        $mentionedUsernames = array_unique($matches[1]);
        foreach ($mentionedUsernames as $mentionedUsername) {
            // Get mentioned user's ID
            $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$mentionedUsername]);
            $mentionedUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Create notification if user exists and not mentioning self
            if ($mentionedUser && $mentionedUser['id'] !== $userId) {
                $stmt = $conn->prepare("SELECT username FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $mentioner = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $notifId = uniqid('notif_');
                $message = $mentioner['username'] . ' mentioned you in a comment';
                $stmt = $conn->prepare("INSERT INTO notifications (id, userId, actorId, type, message, relatedId, created) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$notifId, $mentionedUser['id'], $userId, 'mention', $message, $postId, $created]);
            }
        }
    }
    
    // Get updated count
    $stmt = $conn->prepare("SELECT comments FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'success', 'commentId' => $id, 'comments' => (int)$post['comments']]);
}

function handleCommentDelete($conn, $input) {
    $commentId = $input['commentId'] ?? '';
    $userId = $input['userId'] ?? '';
    
    if (empty($commentId) || empty($userId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Comment ID and User ID are required']);
        return;
    }
    
    // Get comment and check ownership
    $stmt = $conn->prepare("SELECT c.postId, c.userId, u.role FROM comments c JOIN users u ON u.id = ? WHERE c.id = ? LIMIT 1");
    $stmt->execute([$userId, $commentId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        http_response_code(404);
        echo json_encode(['error' => 'Comment not found']);
        return;
    }
    
    $postId = $result['postId'];
    $commentOwnerId = $result['userId'];
    $userRole = $result['role'];
    
    // Check if user is comment owner OR admin
    if ($userId !== $commentOwnerId && $userRole !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'You do not have permission to delete this comment']);
        return;
    }
    
    // Delete the comment
    $stmt = $conn->prepare("DELETE FROM comments WHERE id = ?");
    $stmt->execute([$commentId]);
    
    // Update post comment count
    $stmt = $conn->prepare("UPDATE posts SET comments = comments - 1 WHERE id = ?");
    $stmt->execute([$postId]);
    
    // Get updated count
    $stmt = $conn->prepare("SELECT comments FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'success', 'comments' => (int)$post['comments']]);
}
?>
