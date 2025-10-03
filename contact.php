<?php
$pageTitle = 'Contact - Portfolio';
$pageSpecificCSS = 'contact.css';
$pageSpecificJS = ['contact.js'];
$currentPage = 'contact';
$showSearch = false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include 'components/head.php'; ?>
</head>
<body>
    <?php include 'components/navbar.php'; ?>

    <!-- Contact Header -->
    <section class="contact-header">
        <div class="container">
            <h1>Get In Touch</h1>
            <p>Have a question or want to work together? I'd love to hear from you!</p>
        </div>
    </section>

    <!-- Contact Content -->
    <section class="contact-content">
        <div class="container">
            <div class="contact-grid">
                <!-- Contact Info -->
                <div class="contact-info">
                    <h2>Let's Connect</h2>
                    <p>Whether you have a project in mind, need creative consultation, or just want to say hello, don't hesitate to reach out.</p>
                    
                    <div class="contact-methods">
                        <div class="contact-item">
                            <div class="contact-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="contact-details">
                                <h3>Email</h3>
                                <p>adityamsahani9819@gmail.com</p>
                            </div>
                        </div>
                        
                        <div class="contact-item">
                            <div class="contact-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="contact-details">
                                <h3>Response Time</h3>
                                <p>Usually within 24 hours</p>
                            </div>
                        </div>
                        
                        <div class="contact-item">
                            <div class="contact-icon">
                                <i class="fas fa-palette"></i>
                            </div>
                            <div class="contact-details">
                                <h3>Services</h3>
                                <p>Design • Photography • Digital Art</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="social-links">
                        <h3>Follow My Work</h3>
                        <div class="social-icons">
                            <a href="#" class="social-link">
                                <i class="fab fa-instagram"></i>
                            </a>
                            <a href="#" class="social-link">
                                <i class="fab fa-behance"></i>
                            </a>
                            <a href="#" class="social-link">
                                <i class="fab fa-dribbble"></i>
                            </a>
                            <a href="#" class="social-link">
                                <i class="fab fa-linkedin"></i>
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Contact Form -->
                <div class="contact-form-container">
                    <form class="contact-form" id="contact-form">
                        <h2>Send a Message</h2>
                        
                        <div class="form-group">
                            <label for="contact-name">Name *</label>
                            <input type="text" id="contact-name" name="name" required maxlength="100" placeholder="Your full name">
                        </div>
                        
                        <div class="form-group">
                            <label for="contact-email">Email *</label>
                            <input type="email" id="contact-email" name="email" required placeholder="your@email.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="contact-subject">Subject *</label>
                            <input type="text" id="contact-subject" name="subject" required maxlength="200" placeholder="What's this about?">
                        </div>
                        
                        <div class="form-group">
                            <label for="contact-message">Message *</label>
                            <textarea id="contact-message" name="message" required maxlength="2000" placeholder="Tell me more about your project or inquiry..." rows="6"></textarea>
                            <small class="char-counter">0/2000 characters</small>
                        </div>
                        
                        <button type="submit" class="submit-btn" id="submit-btn">
                            <i class="fas fa-paper-plane"></i>
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
        <div class="container">
            <h2>Frequently Asked Questions</h2>
            <div class="faq-grid">
                <div class="faq-item">
                    <h3>What's your typical response time?</h3>
                    <p>I usually respond to messages within 24 hours. For urgent projects, feel free to mention it in your message subject.</p>
                </div>
                
                <div class="faq-item">
                    <h3>Do you work with clients internationally?</h3>
                    <p>Yes! I work with clients from all around the world. Digital communication makes collaboration seamless regardless of location.</p>
                </div>
                
                <div class="faq-item">
                    <h3>What information should I include in my message?</h3>
                    <p>Please include details about your project, timeline, budget range, and any specific requirements or inspiration you have in mind.</p>
                </div>
                
                <div class="faq-item">
                    <h3>Can I see more of your work?</h3>
                    <p>Absolutely! Check out my <a href="gallery.php">gallery</a> for a comprehensive view of my portfolio across different categories.</p>
                </div>
            </div>
        </div>
    </section>

    <?php include 'components/footer.php'; ?>

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

    <?php include 'components/footer.php'; ?>

    <?php include 'components/scripts.php'; ?>
</body>
</html>