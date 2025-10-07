<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = Database::getInstance();
    
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                getPost($_GET['id'], $db);
            } else {
                getAllPosts($db);
            }
            break;
            
        case 'POST':
            createPost($db);
            break;
            
        case 'PUT':
            updatePost($db);
            break;
            
        case 'DELETE':
            deletePost($db);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("Posts API error: " . $e->getMessage());
}

function getAllPosts($db) {
    $conn = $db->getConnection();
    $stmt = $conn->prepare("
        SELECT p.*, u.username, u.name as authorName, u.profilePicture as authorProfile
        FROM posts p
        LEFT JOIN users u ON p.author = u.username OR p.author = u.id
        ORDER BY p.created DESC
    ");
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(array_map('formatPost', $posts));
}

function getPost($id, $db) {
    $conn = $db->getConnection();
    $stmt = $conn->prepare("
        SELECT p.*, u.username, u.name as authorName, u.profilePicture as authorProfile
        FROM posts p
        LEFT JOIN users u ON p.author = u.username OR p.author = u.id
        WHERE p.id = ?
        LIMIT 1
    ");
    $stmt->execute([$id]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($post) {
        echo json_encode(formatPost($post));
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Post not found']);
    }
}

function createPost($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? uniqid('post_');
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $imageUrl = $input['imageUrl'] ?? '';
    $category = $input['category'] ?? '';
    $tags = json_encode($input['tags'] ?? []);
    $author = $input['author'] ?? 'admin';
    $created = date('Y-m-d H:i:s');
    $featured = $input['featured'] ?? 0;
    $downloadUrl = $input['downloadUrl'] ?? null;
    
    $db->execute(
        "INSERT INTO posts (id, title, description, imageUrl, category, tags, author, created, featured, downloadUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [$id, $title, $description, $imageUrl, $category, $tags, $author, $created, $featured, $downloadUrl]
    );
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Post created successfully',
        'id' => $id
    ]);
}

function updatePost($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? '';
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $imageUrl = $input['imageUrl'] ?? '';
    $category = $input['category'] ?? '';
    $tags = json_encode($input['tags'] ?? []);
    $featured = $input['featured'] ?? 0;
    $downloadUrl = $input['downloadUrl'] ?? null;
    
    $db->execute(
        "UPDATE posts SET title = ?, description = ?, imageUrl = ?, category = ?, tags = ?, featured = ?, downloadUrl = ? WHERE id = ?",
        [$title, $description, $imageUrl, $category, $tags, $featured, $downloadUrl, $id]
    );
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Post updated successfully'
    ]);
}

function deletePost($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID is required']);
        return;
    }
    
    $db->execute("DELETE FROM posts WHERE id = ?", [$id]);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Post deleted successfully'
    ]);
}

function formatPost($row) {
    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'description' => $row['description'],
        'imageUrl' => $row['imageUrl'],
        'category' => $row['category'],
        'tags' => json_decode($row['tags'] ?? '[]', true),
        'author' => $row['username'] ?? $row['author'],
        'authorName' => $row['authorName'] ?? $row['username'] ?? $row['author'],
        'authorProfile' => $row['authorProfile'] ?? '',
        'created' => $row['created'],
        'likes' => (int)$row['likes'],
        'comments' => (int)$row['comments'],
        'views' => (int)$row['views'],
        'featured' => (bool)$row['featured'],
        'downloadUrl' => $row['downloadUrl']
    ];
}
?>
