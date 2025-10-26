<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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
            getPostImages($db);
            break;

        case 'POST':
            addPostImages($db);
            break;

        case 'DELETE':
            deletePostImage($db);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("Post Images API error: " . $e->getMessage());
}

function getPostImages($db) {
    $postId = $_GET['postId'] ?? null;

    if (!$postId) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID is required']);
        return;
    }

    $stmt = $db->prepare("SELECT * FROM post_images WHERE postId = ? ORDER BY displayOrder ASC");
    $stmt->execute([$postId]);
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($images);
}

function addPostImages($db) {
    $input = json_decode(file_get_contents('php://input'), true);

    $postId = $input['postId'] ?? '';
    $images = $input['images'] ?? [];

    if (empty($postId) || empty($images)) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID and images are required']);
        return;
    }

    $db->execute("DELETE FROM post_images WHERE postId = ?", [$postId]);

    foreach ($images as $index => $imageUrl) {
        $db->execute(
            "INSERT INTO post_images (postId, imageUrl, displayOrder) VALUES (?, ?, ?)",
            [$postId, $imageUrl, $index]
        );
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Images saved successfully'
    ]);
}

function deletePostImage($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? '';

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Image ID is required']);
        return;
    }

    $db->execute("DELETE FROM post_images WHERE id = ?", [$id]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Image deleted successfully'
    ]);
}
?>
