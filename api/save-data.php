<?php
// API endpoint for saving data - for Apache hosting
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

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['filename']) || !isset($input['data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing filename or data']);
    exit();
}

$filename = $input['filename'];
$fileData = $input['data'];

// Ensure data directory exists
$dataDir = __DIR__ . '/../data';
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
?>