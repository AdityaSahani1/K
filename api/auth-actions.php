<?php
require_once __DIR__ . '/../config/database.php';
require_once 'email-handler.php';

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
    case 'update_profile':
        handleUpdateProfile($input);
        break;
    case 'request_post_permission':
        handleRequestPostPermission($input);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function sendOTPForVerification($data) {
    try {
        $email = $data['email'] ?? '';
        $name = $data['name'] ?? '';
        
        if (empty($email) || empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and name are required']);
            return;
        }
        
        $otp = sprintf('%06d', mt_rand(0, 999999));
        $db = Database::getInstance();
        
        $user = $db->fetchOne("SELECT id FROM users WHERE email = ? LIMIT 1", [$email]);
        
        $otpExpires = date('Y-m-d H:i:s', time() + 600);
        $otpCreated = date('Y-m-d H:i:s');
        
        if ($user) {
            $db->execute(
                "UPDATE users SET otpToken = ?, otpExpires = ?, otpCreated = ? WHERE email = ?",
                [$otp, $otpExpires, $otpCreated, $email]
            );
        } else {
            $userData = $data['userData'] ?? null;
            if ($userData) {
                $db->execute(
                    "INSERT INTO users (id, name, username, email, password, role, created, bio, isVerified, otpToken, otpExpires, otpCreated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)",
                    [
                        $userData['id'],
                        $userData['name'],
                        $userData['username'],
                        $userData['email'],
                        $userData['password'],
                        $userData['role'],
                        $userData['created'],
                        $userData['bio'],
                        $otp,
                        $otpExpires,
                        $otpCreated
                    ]
                );
            }
        }
        
        $emailHandler = new EmailHandler();
        $emailSent = $emailHandler->sendOTPEmail($email, $name, $otp);
        
        if ($emailSent) {
            echo json_encode(['status' => 'success', 'message' => 'OTP sent successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send OTP email. Please check SMTP configuration.']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
        error_log("Send OTP error: " . $e->getMessage());
    }
}

function verifyOTP($data) {
    try {
        $email = $data['email'] ?? '';
        $otp = $data['otp'] ?? '';
        
        if (empty($email) || empty($otp)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and OTP are required']);
            return;
        }
        
        $db = Database::getInstance();
        $user = $db->fetchOne("SELECT * FROM users WHERE email = ? LIMIT 1", [$email]);
        
        if (!$user || !$user['otpToken']) {
            http_response_code(400);
            echo json_encode(['error' => 'OTP not found or expired']);
            return;
        }
        
        if (strtotime($user['otpExpires']) < time()) {
            http_response_code(400);
            echo json_encode(['error' => 'OTP has expired']);
            return;
        }
        
        if ($user['otpToken'] !== $otp) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid OTP']);
            return;
        }
        
        $db->execute(
            "UPDATE users SET otpToken = NULL, otpExpires = NULL, otpCreated = NULL, isVerified = 1 WHERE email = ?",
            [$email]
        );
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Email verified successfully',
            'verified' => true
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
        error_log("Verify OTP error: " . $e->getMessage());
    }
}

function resendOTP($data) {
    try {
        $email = $data['email'] ?? '';
        $name = $data['name'] ?? '';
        
        if (empty($email) || empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and name are required']);
            return;
        }
        
        $db = Database::getInstance();
        $user = $db->fetchOne("SELECT otpCreated FROM users WHERE email = ? LIMIT 1", [$email]);
        
        if ($user && $user['otpCreated']) {
            $otpAge = time() - strtotime($user['otpCreated']);
            if ($otpAge < 60) {
                http_response_code(429);
                echo json_encode(['error' => 'Please wait at least 1 minute before requesting a new OTP']);
                return;
            }
        }
        
        sendOTPForVerification($data);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
        error_log("Resend OTP error: " . $e->getMessage());
    }
}

function handleForgotPassword($data) {
    try {
        $email = $data['email'] ?? '';
        
        if (empty($email)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
            return;
        }
        
        $db = Database::getInstance();
        $user = $db->fetchOne("SELECT * FROM users WHERE email = ? LIMIT 1", [$email]);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        $resetToken = bin2hex(random_bytes(32));
        $resetExpires = date('Y-m-d H:i:s', time() + 3600);
        
        $db->execute(
            "UPDATE users SET passwordResetToken = ?, passwordResetExpires = ? WHERE email = ?",
            [$resetToken, $resetExpires, $email]
        );
        
        $emailHandler = new EmailHandler();
        $emailSent = $emailHandler->sendPasswordResetEmail($email, $user['name'] ?? $user['username'], $resetToken);
        
        if ($emailSent) {
            echo json_encode(['status' => 'success', 'message' => 'Password reset link sent to your email']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send password reset email. Please check SMTP configuration.']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
        error_log("Forgot password error: " . $e->getMessage());
    }
}

function handlePasswordReset($data) {
    try {
        $token = $data['token'] ?? '';
        $newPassword = $data['password'] ?? '';
        
        if (empty($token) || empty($newPassword)) {
            http_response_code(400);
            echo json_encode(['error' => 'Token and new password are required']);
            return;
        }
        
        $db = Database::getInstance();
        $user = $db->fetchOne("SELECT * FROM users WHERE passwordResetToken = ? LIMIT 1", [$token]);
        
        if (!$user) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or expired reset token']);
            return;
        }
        
        if (strtotime($user['passwordResetExpires']) < time()) {
            http_response_code(400);
            echo json_encode(['error' => 'Reset token has expired']);
            return;
        }
        
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        $db->execute(
            "UPDATE users SET password = ?, passwordResetToken = NULL, passwordResetExpires = NULL WHERE passwordResetToken = ?",
            [$hashedPassword, $token]
        );
        
        echo json_encode(['status' => 'success', 'message' => 'Password reset successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
        error_log("Password reset error: " . $e->getMessage());
    }
}

function handleChangePassword($data) {
    try {
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
        
        $db = Database::getInstance();
        $user = $db->fetchOne("SELECT password FROM users WHERE id = ? LIMIT 1", [$userId]);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        if (!password_verify($currentPassword, $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Current password is incorrect']);
            return;
        }
        
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        $db->execute("UPDATE users SET password = ? WHERE id = ?", [$hashedPassword, $userId]);
        
        echo json_encode(['status' => 'success', 'message' => 'Password changed successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
        error_log("Change password error: " . $e->getMessage());
    }
}

function handleUpdateProfile($data) {
    try {
        $userId = $data['userId'] ?? '';
        $name = $data['name'] ?? '';
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $bio = $data['bio'] ?? '';
        $profilePicture = $data['profilePicture'] ?? '';
        
        if (empty($userId) || empty($username) || empty($email)) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID, username, and email are required']);
            return;
        }
        
        $db = Database::getInstance();
        
        $existingUser = $db->fetchOne(
            "SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ? LIMIT 1",
            [$username, $email, $userId]
        );
        
        if ($existingUser) {
            http_response_code(409);
            echo json_encode(['error' => 'Username or email already exists']);
            return;
        }
        
        $db->execute(
            "UPDATE users SET name = ?, username = ?, email = ?, bio = ?, profilePicture = ? WHERE id = ?",
            [$name, $username, $email, $bio, $profilePicture, $userId]
        );
        
        echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
        error_log("Update profile error: " . $e->getMessage());
    }
}

function handleRequestPostPermission($data) {
    try {
        $userId = $data['userId'] ?? '';
        $userName = $data['userName'] ?? '';
        $userEmail = $data['userEmail'] ?? '';
        
        if (empty($userId) || empty($userName) || empty($userEmail)) {
            http_response_code(400);
            echo json_encode(['error' => 'User information is required']);
            return;
        }
        
        $db = Database::getInstance();
        
        // Get admin email
        $admin = $db->fetchOne("SELECT email, name FROM users WHERE role = 'admin' LIMIT 1");
        
        if (!$admin) {
            http_response_code(500);
            echo json_encode(['error' => 'Admin not found']);
            return;
        }
        
        $emailHandler = new EmailHandler();
        $emailSent = $emailHandler->sendPostPermissionRequestEmail(
            $admin['email'],
            $admin['name'] ?? 'Admin',
            $userName,
            $userEmail,
            $userId
        );
        
        if ($emailSent) {
            echo json_encode(['status' => 'success', 'message' => 'Request sent to admin successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send request email']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
        error_log("Request post permission error: " . $e->getMessage());
    }
}
?>
