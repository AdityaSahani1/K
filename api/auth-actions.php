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
        
    case 'change_password':
        handleChangePassword($input);
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
        // New registration, store complete user data with OTP
        $userData = $data['userData'] ?? null;
        
        if ($userData) {
            // Complete user data provided (from registration)
            $tempUser = $userData;
            $tempUser['otpToken'] = $otp;
            $tempUser['otpExpires'] = time() + 600;
            $tempUser['otpCreated'] = time();
            $tempUser['isTemporary'] = true;
        } else {
            // Just email/name provided (for resend or other purposes)
            $tempUser = [
                'email' => $email,
                'name' => $name,
                'otpToken' => $otp,
                'otpExpires' => time() + 600,
                'otpCreated' => time(),
                'isTemporary' => true
            ];
        }
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
        unset($users[$userIndex]['otpToken']);
        unset($users[$userIndex]['otpExpires']);
        unset($users[$userIndex]['otpCreated']);
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
    
    // OTP verified successfully - complete registration if temporary
    unset($users[$userIndex]['otpToken']);
    unset($users[$userIndex]['otpExpires']);
    unset($users[$userIndex]['otpCreated']);
    
    if (isset($users[$userIndex]['isTemporary']) && $users[$userIndex]['isTemporary']) {
        // This is a new registration, finalize it
        unset($users[$userIndex]['isTemporary']);
        $users[$userIndex]['isVerified'] = true;
    } else {
        // Existing user verifying email
        $users[$userIndex]['isVerified'] = true;
    }
    
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

function handleChangePassword($data) {
    $userId = $data['userId'] ?? '';
    $currentPassword = $data['currentPassword'] ?? '';
    $newPassword = $data['newPassword'] ?? '';
    
    if (empty($userId) || empty($currentPassword) || empty($newPassword)) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required']);
        return;
    }
    
    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'New password must be at least 6 characters long']);
        return;
    }
    
    $users = loadUsers();
    $userIndex = -1;
    
    foreach ($users as $index => $user) {
        if ($user['id'] === $userId) {
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
    
    // Verify current password
    $passwordValid = false;
    
    if (strpos($user['password'], '$2y$') === 0) {
        // Password is hashed with bcrypt
        $passwordValid = password_verify($currentPassword, $user['password']);
    } else {
        // Legacy password - try legacy hash first
        $legacyHash = hashPasswordLegacy($currentPassword);
        $passwordValid = ($user['password'] === $legacyHash);
        
        if (!$passwordValid && $user['password'] === $currentPassword) {
            $passwordValid = true;
        }
    }
    
    if (!$passwordValid) {
        http_response_code(401);
        echo json_encode(['error' => 'Current password is incorrect']);
        return;
    }
    
    // Update password with new secure hash
    $users[$userIndex]['password'] = password_hash($newPassword, PASSWORD_BCRYPT);
    
    saveUsers($users);
    
    echo json_encode(['status' => 'success', 'message' => 'Password changed successfully']);
}

function hashPasswordLegacy($password) {
    $hash = 0;
    for ($i = 0; $i < strlen($password); $i++) {
        $char = ord($password[$i]);
        $hash = (($hash << 5) - $hash) + $char;
        $hash = $hash & $hash;
    }
    return base_convert($hash, 10, 36);
}
?>
