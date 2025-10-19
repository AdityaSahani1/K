<?php
$pageTitle = 'SnapSera - About';
$pageSpecificCSS = 'about.css';
$currentPage = 'about';
$showSearch = false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include 'components/head.php'; ?>
</head>
<body>
    <?php include 'components/navbar.php'; ?>

    <!-- About Section -->
    <section class="about-hero">
        <div class="container">
            <div class="about-content">
                <div class="about-image">
                    <div class="profile-circle">
                        <i class="fas fa-user" style="font-size: 4rem; color: var(--accent-primary);"></i>
                    </div>
                </div>
                <div class="about-text">
                    <h1>About Me</h1>
                    <p class="lead">Creative professional passionate about visual storytelling and innovative design.</p>
                    <p>Welcome to my creative space where art, photography, and design come together. I believe in the power of visual communication to inspire, engage, and transform ideas into compelling experiences.</p>
                    <p>My work spans across multiple disciplines, always striving to push creative boundaries and explore new possibilities in digital and traditional media.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Skills Section -->
    <section class="skills">
        <div class="container">
            <h2 class="section-title">Skills & Expertise</h2>
            <div class="skills-grid">
                <div class="skill-item">
                    <div class="skill-icon">
                        <i class="fas fa-palette"></i>
                    </div>
                    <h3>Digital Art</h3>
                    <p>Creating stunning digital artwork using modern tools and techniques</p>
                </div>
                <div class="skill-item">
                    <div class="skill-icon">
                        <i class="fas fa-camera"></i>
                    </div>
                    <h3>Photography</h3>
                    <p>Capturing moments and stories through the lens with creative vision</p>
                </div>
                <div class="skill-item">
                    <div class="skill-icon">
                        <i class="fas fa-pen-nib"></i>
                    </div>
                    <h3>Design</h3>
                    <p>Crafting user-centered designs that balance aesthetics and functionality</p>
                </div>
                <div class="skill-item">
                    <div class="skill-icon">
                        <i class="fas fa-laptop"></i>
                    </div>
                    <h3>Digital Media</h3>
                    <p>Exploring new frontiers in digital expression and interactive media</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Social Connect -->
    <section class="social-connect">
        <div class="container">
            <div class="social-header">
                <h2 class="section-title">Let's Connect</h2>
                <p class="social-description">Follow my creative journey across different platforms</p>
            </div>
            
            <div class="social-network">
                <div class="social-center">
                    <div class="profile-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <span class="profile-name">@SnapSera</span>
                </div>
                
                <div class="social-connections">
                    <a href="#" class="social-node instagram" data-platform="instagram">
                        <div class="node-content">
                            <i class="fab fa-instagram"></i>
                            <span class="node-label">Instagram</span>
                            <span class="node-subtitle">Visual Stories</span>
                        </div>
                        <div class="connection-line"></div>
                    </a>
                    
                    <a href="#" class="social-node twitter" data-platform="twitter">
                        <div class="node-content">
                            <i class="fab fa-twitter"></i>
                            <span class="node-label">Twitter</span>
                            <span class="node-subtitle">Quick Updates</span>
                        </div>
                        <div class="connection-line"></div>
                    </a>
                    
                    <a href="#" class="social-node behance" data-platform="behance">
                        <div class="node-content">
                            <i class="fab fa-behance"></i>
                            <span class="node-label">Behance</span>
                            <span class="node-subtitle">SnapSera</span>
                        </div>
                        <div class="connection-line"></div>
                    </a>
                    
                    <a href="#" class="social-node dribbble" data-platform="dribbble">
                        <div class="node-content">
                            <i class="fab fa-dribbble"></i>
                            <span class="node-label">Dribbble</span>
                            <span class="node-subtitle">Design Shots</span>
                        </div>
                        <div class="connection-line"></div>
                    </a>
                    
                    <a href="#" class="social-node linkedin" data-platform="linkedin">
                        <div class="node-content">
                            <i class="fab fa-linkedin"></i>
                            <span class="node-label">LinkedIn</span>
                            <span class="node-subtitle">Professional</span>
                        </div>
                        <div class="connection-line"></div>
                    </a>
                    
                    <a href="#" class="social-node github" data-platform="github">
                        <div class="node-content">
                            <i class="fab fa-github"></i>
                            <span class="node-label">GitHub</span>
                            <span class="node-subtitle">Code Projects</span>
                        </div>
                        <div class="connection-line"></div>
                    </a>
                </div>
                
                <div class="network-animation">
                    <div class="pulse-ring"></div>
                    <div class="pulse-ring pulse-ring-delay-1"></div>
                    <div class="pulse-ring pulse-ring-delay-2"></div>
                </div>
            </div>
            
        </div>
    </section>

    <!-- Contact -->
    <section class="contact">
        <div class="container">
            <h2 class="section-title">Get In Touch</h2>
            <p class="contact-text">
                Interested in collaborating or have a project in mind? 
                I'd love to hear from you and discuss how we can bring your vision to life.
            </p>
            <a href="snapsera.team@gmail.com" class="contact-btn">
                <i class="fas fa-envelope"></i>
                Send a Message
            </a>
        </div>
    </section>


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
