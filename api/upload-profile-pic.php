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

// Get the input data
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['image']) || empty($input['image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No image provided']);
    exit;
}

try {
    // Check if it's a default avatar
    if (strpos($input['image'], 'avatar') === 0 && strlen($input['image']) < 20) {
        // It's a default avatar like "avatar1", "avatar2", etc.
        $avatarPath = '/assets/default-avatars/' . $input['image'] . '.svg';
        echo json_encode([
            'success' => true,
            'url' => $avatarPath
        ]);
        exit;
    }
    
    // It's an uploaded image - decode base64
    $imageData = base64_decode($input['image']);
    if ($imageData === false) {
        throw new Exception('Invalid image data');
    }
    
    // Get image info
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->buffer($imageData);
    
    // Validate image type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid image type. Allowed: JPG, PNG, GIF, WEBP');
    }
    
    // Check file size (max 5MB)
    if (strlen($imageData) > 5 * 1024 * 1024) {
        throw new Exception('Image size exceeds 5MB limit');
    }
    
    // Create image from string
    $image = imagecreatefromstring($imageData);
    if ($image === false) {
        throw new Exception('Failed to process image');
    }
    
    // Get original dimensions
    $originalWidth = imagesx($image);
    $originalHeight = imagesy($image);
    
    // Calculate new dimensions (max 400x400 while maintaining aspect ratio)
    $maxSize = 400;
    $ratio = min($maxSize / $originalWidth, $maxSize / $originalHeight);
    $newWidth = round($originalWidth * $ratio);
    $newHeight = round($originalHeight * $ratio);
    
    // Create a new image with the new dimensions
    $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
    
    // Preserve transparency for PNG and GIF
    if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);
        $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
        imagefilledrectangle($resizedImage, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    // Copy and resize
    imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);
    
    // Generate unique filename
    $userId = $_SESSION['user_id'];
    $extension = match($mimeType) {
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        default => 'jpg'
    };
    
    $filename = 'profile_' . $userId . '_' . time() . '.' . $extension;
    $uploadDir = '../uploads/profiles/';
    
    // Create directory if it doesn't exist
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Remove old profile pictures for this user
    $oldFiles = glob($uploadDir . 'profile_' . $userId . '_*.*');
    foreach ($oldFiles as $oldFile) {
        if (file_exists($oldFile)) {
            unlink($oldFile);
        }
    }
    
    $filepath = $uploadDir . $filename;
    
    // Save the resized image with compression
    $quality = 85; // Good balance between quality and file size
    $success = match($mimeType) {
        'image/jpeg' => imagejpeg($resizedImage, $filepath, $quality),
        'image/png' => imagepng($resizedImage, $filepath, round((100 - $quality) / 11.11)),
        'image/gif' => imagegif($resizedImage, $filepath),
        'image/webp' => imagewebp($resizedImage, $filepath, $quality),
        default => false
    };
    
    // Free up memory
    imagedestroy($image);
    imagedestroy($resizedImage);
    
    if (!$success) {
        throw new Exception('Failed to save image');
    }
    
    // Return the URL path
    $url = '/uploads/profiles/' . $filename;
    
    echo json_encode([
        'success' => true,
        'url' => $url
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
