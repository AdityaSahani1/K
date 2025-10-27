
<?php

$pageTitle = 'Changelog - SnapSera';
$pageSpecificCSS = ['changelog.css'];
$pageSpecificJS = ['changelog.js'];
$currentPage = 'changelog';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include 'components/head.php'; ?>
</head>
<body>
    <?php include 'components/navbar.php'; ?>

    <div class="changelog-container">
        <div class="changelog-header">
            <h1>Changelog</h1>
            <p class="subtitle">Track all updates and improvements to SnapSera</p>
        </div>

        <div id="changelog-content" class="changelog-timeline">
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading changelog...</p>
            </div>
        </div>
    </div>

    <?php include 'components/footer.php'; ?>

    <!-- Auth Modal -->
    <div class="modal" id="auth-modal">
        <div class="modal-content">
            <button class="modal-close-btn" id="auth-close">
                <i class="fas fa-times"></i>
            </button>
            <!-- Login Form -->
            <div class="auth-form" id="login-form">
                <h2>Login</h2>
                <form id="login-form-element">
                    <div class="form-group">
                        <input type="text" id="login-username" placeholder="Username or Email" autocomplete="username" required>
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="form-group">
                        <input type="password" id="login-password" placeholder="Password" autocomplete="current-password" required>
                        <i class="fas fa-lock"></i>
                    </div>
                    <button type="submit" class="auth-btn">Login</button>
                </form>
                <p class="auth-switch">
                    Don't have an account?
                    <a href="#" id="show-register">Sign up</a>
                    <br>
                    <a href="#" id="forgot-password" style="font-size: 0.9em; color: var(--accent-primary); margin-top: 10px; display: inline-block;">Forgot Password?</a>
                </p>
            </div>
            <!-- Register Form -->
            <div class="auth-form hidden" id="register-form">
                <h2>Sign Up</h2>
                <form id="register-form-element">
                    <div class="form-group">
                        <input type="text" id="register-name" placeholder="Full Name" autocomplete="name" required>
                        <i class="fas fa-id-card"></i>
                    </div>
                    <div class="form-group">
                        <input type="text" id="register-username" placeholder="Username" autocomplete="username" required>
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="form-group">
                        <input type="email" id="register-email" placeholder="Email" autocomplete="email" required>
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="form-group">
                        <input type="password" id="register-password" placeholder="Password" autocomplete="new-password" required>
                        <i class="fas fa-lock"></i>
                    </div>
                    <button type="submit" class="auth-btn" id="register-btn">Sign Up</button>
                </form>
                <p class="auth-switch">
                    Already have an account?
                    <a href="#" id="show-login">Login</a>
                </p>
            </div>
            <!-- Forgot Password Form -->
            <div class="auth-form hidden" id="forgot-password-form">
                <h2>Forgot Password</h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.9em;">Enter your email address and we'll send you a link to reset your password.</p>
                <form id="forgot-password-form-element">
                    <div class="form-group">
                        <input type="email" id="forgot-email" placeholder="Email Address" autocomplete="email" required>
                        <i class="fas fa-envelope"></i>
                    </div>
                    <button type="submit" class="auth-btn">Send Reset Link</button>
                </form>
                <p class="auth-switch">
                    Remember your password?
                    <a href="#" id="back-to-login">Back to Login</a>
                </p>
            </div>
            <!-- OTP Verification Form -->
            <div class="auth-form hidden" id="otp-form">
                <h2>Verify Email</h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.9em;">We've sent a 6-digit OTP to your email address. Please enter it below to verify your account.</p>
                <form id="otp-form-element">
                    <div class="form-group">
                        <input type="text" id="otp-input" placeholder="Enter 6-digit OTP" maxlength="6" pattern="[0-9]{6}" required>
                        <i class="fas fa-key"></i>
                    </div>
                    <button type="submit" class="auth-btn">Verify OTP</button>
                </form>
                <p class="auth-switch">
                    Didn't receive the code?
                    <a href="#" id="resend-otp">Resend OTP</a>
                    <br>
                    <a href="#" id="back-to-register">Back to Registration</a>
                </p>
            </div>
        </div>
    </div>

    <?php include 'components/scripts.php'; ?>
</body>
</html>
