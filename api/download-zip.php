<?php
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $postId = $input['postId'] ?? '';
    $type = $input['type'] ?? 'images';

    if (empty($postId)) {
        header('Content-Type: application/json');
        http_response_code(400);
        echo json_encode(['error' => 'Post ID is required']);
        exit();
    }

    $db = Database::getInstance();
    $conn = $db->getConnection();

    $postStmt = $conn->prepare("SELECT title FROM posts WHERE id = ?");
    $postStmt->execute([$postId]);
    $post = $postStmt->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['error' => 'Post not found']);
        exit();
    }

    $files = [];

    if ($type === 'images') {
        $stmt = $conn->prepare("SELECT imageUrl FROM post_images WHERE postId = ? ORDER BY displayOrder ASC");
        $stmt->execute([$postId]);
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($images as $index => $image) {
            $files[] = [
                'url' => $image['imageUrl'],
                'name' => sprintf('image_%d%s', $index + 1, getExtensionFromUrl($image['imageUrl']))
            ];
        }
    } else if ($type === 'downloads') {
        $stmt = $conn->prepare("SELECT name, downloadUrl FROM post_downloads WHERE postId = ? ORDER BY displayOrder ASC");
        $stmt->execute([$postId]);
        $downloads = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($downloads as $download) {
            $files[] = [
                'url' => $download['downloadUrl'],
                'name' => sanitizeFilename($download['name'])
            ];
        }
    }

    if (empty($files)) {
        header('Content-Type: application/json');
        http_response_code(400);
        echo json_encode(['error' => 'No files to download']);
        exit();
    }

    $zipFilename = sanitizeFilename($post['title']) . '_' . $type . '_' . time() . '.zip';
    $zipPath = sys_get_temp_dir() . '/' . $zipFilename;

    $zip = new ZipArchive();
    if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        throw new Exception('Failed to create ZIP file');
    }

    foreach ($files as $file) {
        $content = @file_get_contents($file['url']);
        if ($content !== false) {
            $zip->addFromString($file['name'], $content);
        }
    }

    $zip->close();

    if (!file_exists($zipPath)) {
        throw new Exception('ZIP file was not created');
    }

    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="' . $zipFilename . '"');
    header('Content-Length: ' . filesize($zipPath));
    header('Pragma: public');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');

    readfile($zipPath);
    unlink($zipPath);
    exit();

} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create ZIP: ' . $e->getMessage()]);
    error_log("Download ZIP error: " . $e->getMessage());
    exit();
}

function getExtensionFromUrl($url) {
    $path = parse_url($url, PHP_URL_PATH);
    $ext = pathinfo($path, PATHINFO_EXTENSION);
    return $ext ? '.' . $ext : '.jpg';
}

function sanitizeFilename($filename) {
    $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
    $filename = preg_replace('/_+/', '_', $filename);
    return trim($filename, '_');
}
?>
