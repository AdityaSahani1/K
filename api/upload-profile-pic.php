<?php
require_once '../config/database.php';

header('Content-Type: application/json');

// Get the input data
$input = json_decode(file_get_contents('php://input'), true);

// Check for userId in the request
if (!isset($input['userId']) || empty($input['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'User ID is required']);
    exit;
}

$userId = $input['userId'];

if (!isset($input['image']) || empty($input['image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No image provided']);
    exit;
}

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    // Check if it's a default avatar
    if (strpos($input['image'], 'avatar') === 0 && strlen($input['image']) < 20) {
        // It's a default avatar like "avatar1", "avatar2", etc.
        $avatarPath = '/assets/default-avatars/' . $input['image'] . '.jpg';
        
        // Update database with avatar path
        $stmt = $conn->prepare("UPDATE users SET profilePicture = ? WHERE id = ?");
        $stmt->execute([$avatarPath, $userId]);
        
        echo json_encode([
            'success' => true,
            'url' => $avatarPath
        ]);
        exit;
    }
    
    // It's an uploaded image - process and store as base64
    $imageData = $input['image'];
    
    // Remove data:image/xxx;base64, prefix if present for validation
    $base64Data = $imageData;
    if (strpos($imageData, 'data:image') === 0) {
        $base64Data = preg_replace('/^data:image\/\w+;base64,/', '', $imageData);
    } else {
        // If no prefix, add it for storage
        $imageData = 'data:image/jpeg;base64,' . $imageData;
    }
    
    $decodedData = base64_decode($base64Data);
    if ($decodedData === false) {
        throw new Exception('Invalid image data');
    }
    
    // Get image info using finfo
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->buffer($decodedData);
    
    // Validate image type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid image type. Allowed: JPG, PNG, GIF, WEBP');
    }
    
    // Check file size (max 2MB for base64 storage)
    if (strlen($decodedData) > 2 * 1024 * 1024) {
        throw new Exception('Image size exceeds 2MB limit');
    }
    
    // Create image from string for compression
    $image = imagecreatefromstring($decodedData);
    if ($image === false) {
        throw new Exception('Failed to process image');
    }
    
    // Get original dimensions
    $originalWidth = imagesx($image);
    $originalHeight = imagesy($image);
    
    // Calculate new dimensions (max 300x300, maintain aspect ratio)
    $maxSize = 300;
    if ($originalWidth > $maxSize || $originalHeight > $maxSize) {
        if ($originalWidth > $originalHeight) {
            $newWidth = $maxSize;
            $newHeight = (int)(($maxSize / $originalWidth) * $originalHeight);
        } else {
            $newHeight = $maxSize;
            $newWidth = (int)(($maxSize / $originalHeight) * $originalWidth);
        }
    } else {
        $newWidth = $originalWidth;
        $newHeight = $originalHeight;
    }
    
    // Create new image
    $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
    
    // Preserve transparency for PNG and GIF
    if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);
    }
    
    // Resize image
    imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);
    
    // Convert to base64
    ob_start();
    if ($mimeType === 'image/png') {
        imagepng($resizedImage, null, 8);
        $mimeTypeStr = 'image/png';
    } else if ($mimeType === 'image/gif') {
        imagegif($resizedImage);
        $mimeTypeStr = 'image/gif';
    } else if ($mimeType === 'image/webp') {
        imagewebp($resizedImage, null, 85);
        $mimeTypeStr = 'image/webp';
    } else {
        imagejpeg($resizedImage, null, 85);
        $mimeTypeStr = 'image/jpeg';
    }
    $imageContent = ob_get_clean();
    
    // Clean up memory
    imagedestroy($image);
    imagedestroy($resizedImage);
    
    if (empty($imageContent)) {
        throw new Exception('Failed to process image');
    }
    
    // Create base64 data URL
    $base64Image = 'data:' . $mimeTypeStr . ';base64,' . base64_encode($imageContent);
    
    // Save to database as base64
    $stmt = $conn->prepare("UPDATE users SET profilePicture = ? WHERE id = ?");
    $stmt->execute([$base64Image, $userId]);
    
    echo json_encode([
        'success' => true,
        'url' => $base64Image
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    error_log('Profile picture upload error: ' . $e->getMessage());
}
?>
