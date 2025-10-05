<?php
// PHP SnapSera Server
// This file acts as a router for the PHP built-in web server

// Get the current directory
$webDir = __DIR__;
$dataDir = $webDir . '/data';

// Parse the request
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Remove query string from URI
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Function to send CORS and cache headers
function sendHeaders($contentType = 'text/html', $cacheable = false) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    if ($cacheable) {
        // Cache static assets for 1 hour in development, longer in production
        $maxAge = 3600; // 1 hour
        header("Cache-Control: public, max-age=$maxAge");
        header('Pragma: public');
        $expires = gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT';
        header("Expires: $expires");
    } else {
        // Don't cache HTML/PHP pages
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
    }
    
    if ($contentType) {
        header("Content-Type: $contentType");
    }
}

// Handle preflight OPTIONS requests
if ($method === 'OPTIONS') {
    sendHeaders();
    http_response_code(200);
    exit();
}

// Handle API requests
if (strpos($requestPath, '/api/') === 0) {
    // Check if it's a PHP file in the API directory
    $apiFile = ltrim($requestPath, '/');
    $apiFilePath = $webDir . '/' . $apiFile;
    
    // If the file exists with .php extension, use it
    if (file_exists($apiFilePath) && pathinfo($apiFilePath, PATHINFO_EXTENSION) === 'php') {
        // Let PHP built-in server handle the API PHP file
        return false;
    }
    
    // Try to find the file with .php extension if it doesn't exist
    if (!file_exists($apiFilePath)) {
        $phpFilePath = $apiFilePath . '.php';
        if (file_exists($phpFilePath)) {
            // Rewrite the request to the .php file
            $_SERVER['SCRIPT_FILENAME'] = $phpFilePath;
            $_SERVER['SCRIPT_NAME'] = $requestPath . '.php';
            require $phpFilePath;
            exit();
        }
    }
    
    // Handle special JSON API endpoints
    sendHeaders('application/json');
    
    if ($requestPath === '/api/save-data' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $filename = $input['filename'] ?? null;
        $fileData = $input['data'] ?? null;
        
        if (!$filename || $fileData === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing filename or data']);
            exit();
        }
        
        // Ensure data directory exists
        if (!file_exists($dataDir)) {
            mkdir($dataDir, 0755, true);
        }
        
        $filePath = $dataDir . '/' . $filename;
        
        // Write JSON data to file
        $jsonData = json_encode($fileData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if (file_put_contents($filePath, $jsonData) !== false) {
            echo json_encode(['status' => 'success', 'message' => "Saved $filename"]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => "Failed to save $filename"]);
        }
        exit();
    }
    
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not found']);
    exit();
}

// Handle static files
$file = ($requestPath === '/') ? 'index.php' : ltrim($requestPath, '/');
$filePath = $webDir . '/' . $file;

// Check if file exists
if (!file_exists($filePath)) {
    http_response_code(404);
    sendHeaders('text/html');
    echo "File not found: " . htmlspecialchars($file);
    exit();
}

// For PHP files, let the built-in server execute them
if (pathinfo($filePath, PATHINFO_EXTENSION) === 'php') {
    // Return false to let PHP built-in server handle the PHP file
    return false;
}

// Determine content type for static files
$ext = pathinfo($filePath, PATHINFO_EXTENSION);
$contentTypes = [
    'css' => 'text/css',
    'js' => 'application/javascript',
    'json' => 'application/json',
    'png' => 'image/png',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif' => 'image/gif',
    'ico' => 'image/x-icon',
    'svg' => 'image/svg+xml'
];

// Static assets can be cached (except JS/CSS during development)
$cacheableExtensions = ['png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'woff', 'woff2', 'ttf', 'eot'];
$isCacheable = in_array($ext, $cacheableExtensions);

$contentType = $contentTypes[$ext] ?? 'application/octet-stream';
sendHeaders($contentType, $isCacheable);
readfile($filePath);
exit();
?>
