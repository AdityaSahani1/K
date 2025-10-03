<?php
$pageTitle = 'Portfolio - Home';
$pageSpecificCSS = ['home.css', 'post-modal.css'];
$pageSpecificJS = ['post-modal.js', 'home.js'];
$currentPage = 'home';
$showSearch = false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include 'components/head.php'; ?>
</head>
<body>
    <?php include 'components/navbar.php'; ?>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <div class="hero-text">
                <h1 class="hero-title">Creative Portfolio</h1>
                <p class="hero-subtitle">Discover amazing artwork, photography, and design from talented creators worldwide</p>
                <div class="hero-buttons">
                    <a href="gallery.php" class="cta-btn">
                        <i class="fas fa-images"></i>
                        Explore Gallery
                    </a>
                    <button class="cta-btn cta-btn-secondary" onclick="showAuthModal()">
                        <i class="fas fa-user-plus"></i>
                        Join Community
                    </button>
                </div>
            </div>
            <div class="hero-visual">
                <div class="hero-image">
                    <div class="hero-decoration">
                        <div class="decoration-circle circle-1"></div>
                        <div class="decoration-circle circle-2"></div>
                        <div class="decoration-circle circle-3"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Categories -->
    <section class="categories">
        <div class="container">
            <h2 class="section-title">Browse Categories</h2>
            <div class="category-grid">
                <div class="category-item" data-category="art">
                    <i class="fas fa-palette"></i>
                    <span>Art</span>
                </div>
                <div class="category-item" data-category="photography">
                    <i class="fas fa-camera"></i>
                    <span>Photography</span>
                </div>
                <div class="category-item" data-category="design">
                    <i class="fas fa-pen-nib"></i>
                    <span>Design</span>
                </div>
                <div class="category-item" data-category="digital">
                    <i class="fas fa-laptop"></i>
                    <span>Digital</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Latest Posts -->
    <section class="latest-posts">
        <div class="container">
            <h2 class="section-title">Latest Work</h2>
            <div class="posts-grid" id="posts-grid">
                <!-- Posts will be loaded dynamically -->
            </div>
            <div class="view-all">
                <a href="gallery.php" class="view-all-btn">View All Posts</a>
            </div>
        </div>
    </section>

    <!-- Auth Modal -->
    <div class="modal" id="auth-modal">
        <div class="modal-content">
            <span class="close" id="auth-close">&times;</span>
            
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

    <!-- Post Modal - Reusable Component -->
    <?php include 'components/post-modal.php'; ?>

    <?php include 'components/footer.php'; ?>

    <?php include 'components/scripts.php'; ?>
</body>
</html>
