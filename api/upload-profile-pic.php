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
        
        // Delete old profile picture if it's a local upload
        deleteOldProfilePicture($userId, $conn);
        
        // Update database
        $stmt = $conn->prepare("UPDATE users SET profilePicture = ? WHERE id = ?");
        $stmt->execute([$avatarPath, $userId]);
        
        echo json_encode([
            'success' => true,
            'url' => $avatarPath
        ]);
        exit;
    }
    
    // It's an uploaded image - decode base64
    $imageData = $input['image'];
    
    // Remove data:image/xxx;base64, prefix if present
    if (strpos($imageData, 'data:image') === 0) {
        $imageData = preg_replace('/^data:image\/\w+;base64,/', '', $imageData);
    }
    
    $imageData = base64_decode($imageData);
    if ($imageData === false) {
        throw new Exception('Invalid image data');
    }
    
    // Get image info using finfo
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
    
    // Create image from string for compression
    $image = imagecreatefromstring($imageData);
    if ($image === false) {
        throw new Exception('Failed to process image');
    }
    
    // Get original dimensions
    $originalWidth = imagesx($image);
    $originalHeight = imagesy($image);
    
    // Calculate new dimensions (max 400x400, maintain aspect ratio)
    $maxSize = 400;
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
    
    // Generate secure filename
    $extension = match($mimeType) {
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        default => 'jpg'
    };
    
    $filename = 'profile_' . $userId . '_' . uniqid() . '.' . $extension;
    $uploadDir = __DIR__ . '/../assets/profile_pics/';
    $tempPath = $uploadDir . 'temp_' . $filename;
    $finalPath = $uploadDir . $filename;
    
    // Ensure directory exists
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Save to temp file first
    $saved = match($mimeType) {
        'image/jpeg' => imagejpeg($resizedImage, $tempPath, 90),
        'image/png' => imagepng($resizedImage, $tempPath, 8),
        'image/gif' => imagegif($resizedImage, $tempPath),
        'image/webp' => imagewebp($resizedImage, $tempPath, 90),
        default => imagejpeg($resizedImage, $tempPath, 90)
    };
    
    // Clean up memory
    imagedestroy($image);
    imagedestroy($resizedImage);
    
    if (!$saved) {
        if (file_exists($tempPath)) {
            unlink($tempPath);
        }
        throw new Exception('Failed to save image');
    }
    
    // Set file permissions
    chmod($tempPath, 0640);
    
    // Delete old profile picture
    deleteOldProfilePicture($userId, $conn);
    
    // Atomic rename temp to final
    if (!rename($tempPath, $finalPath)) {
        unlink($tempPath);
        throw new Exception('Failed to finalize image');
    }
    
    // Save to database (relative path)
    $relativeUrl = '/assets/profile_pics/' . $filename;
    $stmt = $conn->prepare("UPDATE users SET profilePicture = ? WHERE id = ?");
    $stmt->execute([$relativeUrl, $userId]);
    
    echo json_encode([
        'success' => true,
        'url' => $relativeUrl
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    error_log('Profile picture upload error: ' . $e->getMessage());
}

function deleteOldProfilePicture($userId, $conn) {
    try {
        $stmt = $conn->prepare("SELECT profilePicture FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && $user['profilePicture']) {
            $oldPicture = $user['profilePicture'];
            
            // Only delete if it's in the uploads folder (not default avatars)
            if (strpos($oldPicture, '/assets/profile_pics/') === 0) {
                $filePath = __DIR__ . '/../' . $oldPicture;
                
                // Security: Ensure path is within allowed directory
                $realPath = realpath($filePath);
                $uploadDir = realpath(__DIR__ . '/../assets/profile_pics/');
                
                if ($realPath && $uploadDir && strpos($realPath, $uploadDir) === 0) {
                    if (file_exists($realPath)) {
                        unlink($realPath);
                    }
                }
            }
        }
    } catch (Exception $e) {
        error_log('Error deleting old profile picture: ' . $e->getMessage());
    }
}
?>
