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

function loadUsers() {
    $usersFile = __DIR__ . '/../data/users.json';
    if (!file_exists($usersFile)) {
        return [];
    }
    return json_decode(file_get_contents($usersFile), true) ?? [];
}

function saveUsers($users) {
    $usersFile = __DIR__ . '/../data/users.json';
    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
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
    
    // Store OTP in user data (create temporary user entry if registering)
    $users = loadUsers();
    $userIndex = -1;
    
    foreach ($users as $index => $user) {
        if ($user['email'] === $email) {
            $userIndex = $index;
            break;
        }
    }
    
    if ($userIndex !== -1) {
        // User exists, update OTP data
        $users[$userIndex]['otpToken'] = $otp;
        $users[$userIndex]['otpExpires'] = time() + 600; // 10 minutes
        $users[$userIndex]['otpCreated'] = time();
    } else {
        // New registration, store OTP in temporary user data
        $tempUser = [
            'email' => $email,
            'name' => $name,
            'otpToken' => $otp,
            'otpExpires' => time() + 600,
            'otpCreated' => time(),
            'isTemporary' => true
        ];
        $users[] = $tempUser;
    }
    
    saveUsers($users);
    
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
    
    $users = loadUsers();
    $userIndex = -1;
    
    foreach ($users as $index => $user) {
        if ($user['email'] === $email) {
            $userIndex = $index;
            break;
        }
    }
    
    if ($userIndex === -1 || !isset($users[$userIndex]['otpToken'])) {
        http_response_code(400);
        echo json_encode(['error' => 'OTP not found or expired']);
        return;
    }
    
    $user = $users[$userIndex];
    
    if ($user['otpExpires'] < time()) {
        // Clear expired OTP
        $users[$userIndex]['otpToken'] = null;
        $users[$userIndex]['otpExpires'] = null;
        $users[$userIndex]['otpCreated'] = null;
        saveUsers($users);
        
        http_response_code(400);
        echo json_encode(['error' => 'OTP has expired']);
        return;
    }
    
    if ($user['otpToken'] !== $otp) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid OTP']);
        return;
    }
    
    // OTP verified successfully - clear OTP data
    $users[$userIndex]['otpToken'] = null;
    $users[$userIndex]['otpExpires'] = null;
    $users[$userIndex]['otpCreated'] = null;
    saveUsers($users);
    
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
    $users = loadUsers();
    foreach ($users as $user) {
        if ($user['email'] === $email && isset($user['otpCreated'])) {
            if ($user['otpCreated'] > (time() - 60)) {
                http_response_code(429);
                echo json_encode(['error' => 'Please wait at least 1 minute before requesting a new OTP']);
                return;
            }
        }
    }
    
    // Send new OTP
    sendOTPForVerification($data);
}

function handleForgotPassword($data) {
    $email = $data['email'] ?? '';
    
    if (empty($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        return;
    }
    
    $users = loadUsers();
    $userIndex = -1;
    
    foreach ($users as $index => $user) {
        if ($user['email'] === $email) {
            $userIndex = $index;
            break;
        }
    }
    
    if ($userIndex === -1) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    $user = $users[$userIndex];
    
    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    
    // Store reset token in user data
    $users[$userIndex]['passwordResetToken'] = $resetToken;
    $users[$userIndex]['passwordResetExpires'] = time() + 3600; // 1 hour
    
    saveUsers($users);
    
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
    
    $users = loadUsers();
    $userIndex = -1;
    
    // Find user with matching reset token
    foreach ($users as $index => $user) {
        if (isset($user['passwordResetToken']) && $user['passwordResetToken'] === $token) {
            $userIndex = $index;
            break;
        }
    }
    
    if ($userIndex === -1) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired reset token']);
        return;
    }
    
    $user = $users[$userIndex];
    
    if ($user['passwordResetExpires'] < time()) {
        // Clear expired token
        $users[$userIndex]['passwordResetToken'] = null;
        $users[$userIndex]['passwordResetExpires'] = null;
        saveUsers($users);
        
        http_response_code(400);
        echo json_encode(['error' => 'Reset token has expired']);
        return;
    }
    
    // Update user password
    $users[$userIndex]['password'] = password_hash($newPassword, PASSWORD_BCRYPT);
    $users[$userIndex]['passwordResetToken'] = null;
    $users[$userIndex]['passwordResetExpires'] = null;
    
    saveUsers($users);
    
    echo json_encode(['status' => 'success', 'message' => 'Password reset successfully']);
}
?>
