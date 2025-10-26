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
            getPostDownloads($db);
            break;

        case 'POST':
            addPostDownloads($db);
            break;

        case 'DELETE':
            deletePostDownload($db);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("Post Downloads API error: " . $e->getMessage());
}

function getPostDownloads($db) {
    $postId = $_GET['postId'] ?? null;

    if (!$postId) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID is required']);
        return;
    }

    $stmt = $db->prepare("SELECT * FROM post_downloads WHERE postId = ? ORDER BY displayOrder ASC");
    $stmt->execute([$postId]);
    $downloads = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($downloads);
}

function addPostDownloads($db) {
    $input = json_decode(file_get_contents('php://input'), true);

    $postId = $input['postId'] ?? '';
    $downloads = $input['downloads'] ?? [];

    if (empty($postId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID is required']);
        return;
    }

    $db->execute("DELETE FROM post_downloads WHERE postId = ?", [$postId]);

    foreach ($downloads as $index => $download) {
        $name = $download['name'] ?? '';
        $url = $download['url'] ?? '';

        if ($name && $url) {
            $db->execute(
                "INSERT INTO post_downloads (postId, name, downloadUrl, displayOrder) VALUES (?, ?, ?, ?)",
                [$postId, $name, $url, $index]
            );
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Downloads saved successfully'
    ]);
}

function deletePostDownload($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? '';

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Download ID is required']);
        return;
    }

    $db->execute("DELETE FROM post_downloads WHERE id = ?", [$id]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Download deleted successfully'
    ]);
}
?>
