<?php
header('Content-Type: application/json');
require_once '../config/database.php';

// Check if user is logged in
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

try {
    $userId = $_SESSION['user_id'];
    $uploadDir = '../uploads/profiles/';
    
    // Delete all profile pictures for this user
    $oldFiles = glob($uploadDir . 'profile_' . $userId . '_*.*');
    $deletedCount = 0;
    
    foreach ($oldFiles as $oldFile) {
        if (file_exists($oldFile) && is_file($oldFile)) {
            if (unlink($oldFile)) {
                $deletedCount++;
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Profile pictures deleted',
        'deletedCount' => $deletedCount
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
