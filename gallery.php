<?php
$pageTitle = 'SnapSera - Gallery';
$pageSpecificCSS = ['gallery.css', 'post-modal.css'];
$pageSpecificJS = ['post-modal.js', 'gallery.js'];
$currentPage = 'gallery';
$showSearch = true;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include 'components/head.php'; ?>
</head>
<body>
    <?php include 'components/navbar.php'; ?>

    <!-- Gallery Header with Search -->
    <section class="gallery-header">
        <div class="container">
            <h1 class="gallery-title">Creative Gallery</h1>
            <p class="gallery-subtitle">Explore our collection of stunning artwork, photography, and design</p>
            
            <!-- Search and Filters -->
            <div class="gallery-search-section">
                <div class="search-bar-wrapper">
                    <i class="fas fa-search search-icon-left"></i>
                    <input 
                        type="text" 
                        id="gallery-search-input" 
                        class="gallery-search-input"
                        placeholder="Search by title, description, tags..."
                        autocomplete="off"
                    >
                    <button class="search-clear-btn" id="gallery-search-clear" style="display: none;">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="filters-icon-btn" id="filters-toggle-btn" title="Toggle Filters">
                        <i class="fas fa-sliders-h"></i>
                    </button>
                </div>
            </div>
            
            <!-- Filters Panel (hidden by default) -->
            <div class="filters-panel" id="filters-panel" style="display: none;">
                <div class="filters-content">
                    <div class="filter-section">
                        <h3 class="filter-title">Category</h3>
                        <div class="category-filters">
                            <button class="filter-chip active" data-category="">All</button>
                            <button class="filter-chip" data-category="art">Art</button>
                            <button class="filter-chip" data-category="photography">Photography</button>
                            <button class="filter-chip" data-category="design">Design</button>
                            <button class="filter-chip" data-category="digital">Digital</button>
                            <button class="filter-chip" data-category="nature">Nature</button>
                        </div>
                    </div>
                    
                    <div class="filter-section">
                        <h3 class="filter-title">Sort By</h3>
                        <div class="sort-filters">
                            <button class="filter-chip active" data-sort="newest">Newest</button>
                            <button class="filter-chip" data-sort="oldest">Oldest</button>
                            <button class="filter-chip" data-sort="popular">Most Popular</button>
                            <button class="filter-chip" data-sort="liked">Most Liked</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Search Popup Modal - Modern Redesign -->
    <div class="modal search-modal" id="search-modal">
        <div class="modal-content search-modal-content">
            <button class="search-modal-close" id="search-close">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="search-modal-header">
                <h2><i class="fas fa-search"></i> Search & Discover</h2>
                <p>Find the perfect creative work</p>
            </div>

            <div class="search-modal-body">
                <!-- Search Input with Icon -->
                <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                        type="text" 
                        id="search-input-popup" 
                        class="search-input-modern"
                        placeholder="Search by title, description, tags..."
                        autocomplete="off"
                    >
                    <button class="search-clear" id="search-clear-btn" style="display: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Quick Search Suggestions -->
                <div class="search-suggestions" id="search-suggestions" style="display: none;">
                    <div class="suggestions-header">Quick searches</div>
                    <div class="suggestions-list"></div>
                </div>

                <!-- Categories Grid -->
                <div class="search-section">
                    <h3 class="section-title">
                        <i class="fas fa-th-large"></i>
                        Categories
                    </h3>
                    <div class="category-grid">
                        <button class="category-card active" data-category="">
                            <div class="category-icon">
                                <i class="fas fa-globe"></i>
                            </div>
                            <div class="category-info">
                                <span class="category-name">All</span>
                                <span class="category-count" id="count-all">0</span>
                            </div>
                        </button>
                        <button class="category-card" data-category="art">
                            <div class="category-icon art-icon">
                                <i class="fas fa-palette"></i>
                            </div>
                            <div class="category-info">
                                <span class="category-name">Art</span>
                                <span class="category-count" id="count-art">0</span>
                            </div>
                        </button>
                        <button class="category-card" data-category="photography">
                            <div class="category-icon photography-icon">
                                <i class="fas fa-camera"></i>
                            </div>
                            <div class="category-info">
                                <span class="category-name">Photography</span>
                                <span class="category-count" id="count-photography">0</span>
                            </div>
                        </button>
                        <button class="category-card" data-category="design">
                            <div class="category-icon design-icon">
                                <i class="fas fa-pen-nib"></i>
                            </div>
                            <div class="category-info">
                                <span class="category-name">Design</span>
                                <span class="category-count" id="count-design">0</span>
                            </div>
                        </button>
                        <button class="category-card" data-category="digital">
                            <div class="category-icon digital-icon">
                                <i class="fas fa-laptop"></i>
                            </div>
                            <div class="category-info">
                                <span class="category-name">Digital</span>
                                <span class="category-count" id="count-digital">0</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Sort Options -->
                <div class="search-section">
                    <h3 class="section-title">
                        <i class="fas fa-sort-amount-down"></i>
                        Sort By
                    </h3>
                    <div class="sort-grid">
                        <button class="sort-card active" data-sort="newest">
                            <i class="fas fa-clock"></i>
                            <span>Newest First</span>
                        </button>
                        <button class="sort-card" data-sort="oldest">
                            <i class="fas fa-history"></i>
                            <span>Oldest First</span>
                        </button>
                        <button class="sort-card" data-sort="popular">
                            <i class="fas fa-fire"></i>
                            <span>Most Popular</span>
                        </button>
                        <button class="sort-card" data-sort="liked">
                            <i class="fas fa-heart"></i>
                            <span>Most Liked</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Action Footer -->
            <div class="search-modal-footer">
                <button class="modal-btn modal-btn-secondary" id="clear-filters">
                    <i class="fas fa-undo"></i>
                    Reset Filters
                </button>
                <button class="modal-btn modal-btn-primary" id="apply-filters">
                    <i class="fas fa-check"></i>
                    Apply & Search
                </button>
            </div>
        </div>
    </div>



    <!-- Gallery Grid -->
    <section class="gallery">
        <div class="container">
            <div class="gallery-grid" id="gallery-grid">
                <!-- Posts will be loaded dynamically -->
            </div>
            
            <div class="load-more-container">
                <button class="load-more-btn" id="load-more-btn">Load More</button>
            </div>
        </div>
    </section>

    <!-- Post Modal - Reusable Component -->
    <?php include 'components/post-modal.php'; ?>

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

    <?php include 'components/footer.php'; ?>

    <?php include 'components/scripts.php'; ?>
</body>
</html>