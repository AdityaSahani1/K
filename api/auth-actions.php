<?php
// Authentication actions (OTP, password reset, etc.)
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

require_once 'email-handler.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

switch ($action) {
    case 'send_otp':
        sendOTPForVerification($input);
        break;
        
    case 'verify_otp':
        verifyOTP($input);
        break;
        
    case 'resend_otp':
        resendOTP($input);
        break;
        
    case 'forgot_password':
        handleForgotPassword($input);
        break;
        
    case 'reset_password':
        handlePasswordReset($input);
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function sendOTPForVerification($data) {
    $email = $data['email'] ?? '';
    $name = $data['name'] ?? '';
    
    if (empty($email) || empty($name)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and name are required']);
        return;
    }
    
    // Generate 6-digit OTP
    $otp = sprintf('%06d', mt_rand(0, 999999));
    
    // Store OTP with expiration (10 minutes)
    $otpData = [
        'otp' => $otp,
        'email' => $email,
        'name' => $name,
        'expires' => time() + 600, // 10 minutes
        'created' => time()
    ];
    
    $otpFile = __DIR__ . '/../data/otp_' . md5($email) . '.json';
    file_put_contents($otpFile, json_encode($otpData));
    
    // Send email
    $emailHandler = new EmailHandler();
    $emailSent = $emailHandler->sendOTPEmail($email, $name, $otp);
    
    if ($emailSent) {
        echo json_encode(['status' => 'success', 'message' => 'OTP sent successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send OTP email']);
    }
}

function verifyOTP($data) {
    $email = $data['email'] ?? '';
    $otp = $data['otp'] ?? '';
    
    if (empty($email) || empty($otp)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and OTP are required']);
        return;
    }
    
    $otpFile = __DIR__ . '/../data/otp_' . md5($email) . '.json';
    
    if (!file_exists($otpFile)) {
        http_response_code(400);
        echo json_encode(['error' => 'OTP not found or expired']);
        return;
    }
    
    $otpData = json_decode(file_get_contents($otpFile), true);
    
    if ($otpData['expires'] < time()) {
        unlink($otpFile); // Remove expired OTP
        http_response_code(400);
        echo json_encode(['error' => 'OTP has expired']);
        return;
    }
    
    if ($otpData['otp'] !== $otp) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid OTP']);
        return;
    }
    
    // OTP verified successfully
    unlink($otpFile); // Remove used OTP
    
    echo json_encode([
        'status' => 'success', 
        'message' => 'Email verified successfully',
        'verified' => true
    ]);
}

function resendOTP($data) {
    $email = $data['email'] ?? '';
    $name = $data['name'] ?? '';
    
    if (empty($email) || empty($name)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and name are required']);
        return;
    }
    
    // Check if there's an existing OTP less than 1 minute old (rate limiting)
    $otpFile = __DIR__ . '/../data/otp_' . md5($email) . '.json';
    if (file_exists($otpFile)) {
        $otpData = json_decode(file_get_contents($otpFile), true);
        if ($otpData['created'] > (time() - 60)) {
            http_response_code(429);
            echo json_encode(['error' => 'Please wait at least 1 minute before requesting a new OTP']);
            return;
        }
    }
    
    // Send new OTP (reuse the sendOTPForVerification function)
    sendOTPForVerification($data);
}

function handleForgotPassword($data) {
    $email = $data['email'] ?? '';
    
    if (empty($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        return;
    }
    
    // Check if user exists
    $usersFile = __DIR__ . '/../data/users.json';
    if (!file_exists($usersFile)) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    $users = json_decode(file_get_contents($usersFile), true);
    $user = null;
    foreach ($users as $u) {
        if ($u['email'] === $email) {
            $user = $u;
            break;
        }
    }
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    
    // Store reset token with expiration (1 hour)
    $resetData = [
        'token' => $resetToken,
        'email' => $email,
        'user_id' => $user['id'],
        'expires' => time() + 3600, // 1 hour
        'created' => time()
    ];
    
    $resetFile = __DIR__ . '/../data/reset_' . md5($email) . '.json';
    file_put_contents($resetFile, json_encode($resetData));
    
    // Send password reset email
    $emailHandler = new EmailHandler();
    $emailSent = $emailHandler->sendPasswordResetEmail($email, $user['name'] ?? $user['username'], $resetToken);
    
    if ($emailSent) {
        echo json_encode(['status' => 'success', 'message' => 'Password reset link sent to your email']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send password reset email']);
    }
}

function handlePasswordReset($data) {
    $token = $data['token'] ?? '';
    $newPassword = $data['password'] ?? '';
    
    if (empty($token) || empty($newPassword)) {
        http_response_code(400);
        echo json_encode(['error' => 'Token and new password are required']);
        return;
    }
    
    // Find reset token file
    $dataDir = __DIR__ . '/../data';
    $resetFiles = glob($dataDir . '/reset_*.json');
    $resetData = null;
    $resetFile = null;
    
    foreach ($resetFiles as $file) {
        $data = json_decode(file_get_contents($file), true);
        if ($data['token'] === $token) {
            $resetData = $data;
            $resetFile = $file;
            break;
        }
    }
    
    if (!$resetData) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired reset token']);
        return;
    }
    
    if ($resetData['expires'] < time()) {
        unlink($resetFile); // Remove expired token
        http_response_code(400);
        echo json_encode(['error' => 'Reset token has expired']);
        return;
    }
    
    // Update user password
    $usersFile = __DIR__ . '/../data/users.json';
    if (!file_exists($usersFile)) {
        http_response_code(500);
        echo json_encode(['error' => 'Users file not found']);
        return;
    }
    
    $users = json_decode(file_get_contents($usersFile), true);
    
    // Hash the new password (using same method as registration)
    $hashedPassword = hashPassword($newPassword);
    
    for ($i = 0; $i < count($users); $i++) {
        if ($users[$i]['id'] === $resetData['user_id']) {
            $users[$i]['password'] = $hashedPassword;
            break;
        }
    }
    
    // Save updated users
    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    
    // Remove used reset token
    unlink($resetFile);
    
    echo json_encode(['status' => 'success', 'message' => 'Password reset successfully']);
}

function hashPassword($password) {
    // Use PHP's secure password hashing (bcrypt)
    return password_hash($password, PASSWORD_BCRYPT);
}
?>