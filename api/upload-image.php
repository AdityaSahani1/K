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

try {
    // Load configuration
    $config = require __DIR__ . '/../config/config.php';
    $apiKey = $config['IMGBB_API_KEY'] ?? '';
    
    if (empty($apiKey)) {
        throw new Exception('ImgBB API key not configured');
    }
    
    // Get the image data from request
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['image'])) {
        throw new Exception('No image data provided');
    }
    
    $imageData = $input['image'];
    $expiration = $input['expiration'] ?? null; // Optional expiration in seconds
    
    // Prepare the API request
    $url = 'https://api.imgbb.com/1/upload';
    $postData = [
        'key' => $apiKey,
        'image' => $imageData
    ];
    
    if ($expiration !== null) {
        $postData['expiration'] = $expiration;
    }
    
    // Make the request to ImgBB API
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        throw new Exception('cURL error: ' . curl_error($ch));
    }
    
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('ImgBB API error: HTTP ' . $httpCode);
    }
    
    $result = json_decode($response, true);
    
    if (!$result || !isset($result['success']) || !$result['success']) {
        $errorMsg = $result['error']['message'] ?? 'Unknown error';
        throw new Exception('ImgBB upload failed: ' . $errorMsg);
    }
    
    // Return the image URL and other data
    echo json_encode([
        'success' => true,
        'data' => [
            'url' => $result['data']['url'],
            'display_url' => $result['data']['display_url'],
            'delete_url' => $result['data']['delete_url'] ?? null,
            'thumb_url' => $result['data']['thumb']['url'] ?? null,
            'medium_url' => $result['data']['medium']['url'] ?? null,
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    error_log("Image upload error: " . $e->getMessage());
}
?>
