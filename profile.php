<?php
$pageTitle = 'SnapSera - Profile';
$pageSpecificCSS = 'profile.css';
$pageSpecificJS = ['profile.js'];
$currentPage = 'profile';
$showSearch = false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include 'components/head.php'; ?>
</head>
<body>
    <?php include 'components/navbar.php'; ?>

    <!-- Profile Header -->
    <section class="profile-header">
        <div class="container">
            <div class="profile-card">
                <div class="profile-avatar" id="profile-avatar">
                    <img id="profile-picture" src="" alt="Profile Picture" style="display: none;" />
                    <i class="fas fa-user" id="default-avatar"></i>
                </div>
                <div class="profile-info">
                    <h1 id="profile-username">Username</h1>
                    <p id="profile-email">user@example.com</p>
                    <p id="profile-bio" class="profile-bio" style="margin-top: 10px; color: var(--text-muted); font-style: italic;"></p>
                    <div class="profile-actions">
                        <button class="edit-profile-btn" id="edit-profile-btn">
                            <i class="fas fa-edit"></i> Edit Profile
                        </button>
                        <button class="change-password-btn" id="change-password-btn">
                            <i class="fas fa-key"></i> Change Password
                        </button>
                        <button class="reset-password-btn" id="reset-password-btn">
                            <i class="fas fa-envelope-open-text"></i> Reset Password via Email
                        </button>
                    </div>
                </div>
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-number" id="posts-count">0</span>
                        <span class="stat-label">Posts</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="likes-count">0</span>
                        <span class="stat-label">Likes</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="comments-count">0</span>
                        <span class="stat-label">Comments</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="saves-count">0</span>
                        <span class="stat-label">Saved</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Profile Tabs -->
    <section class="profile-tabs">
        <div class="container">
            <div class="tabs-nav">
                <button class="tab-btn active" data-tab="liked">
                    <i class="fas fa-heart"></i> Liked Posts
                </button>
                <button class="tab-btn" data-tab="saved">
                    <i class="fas fa-bookmark"></i> Saved Posts
                </button>
                <button class="tab-btn" data-tab="comments">
                    <i class="fas fa-comment"></i> My Comments
                </button>
            </div>
            
            <div class="tab-content">
                <div class="tab-pane active" id="liked-tab">
                    <div class="posts-grid" id="liked-posts">
                        <!-- Liked posts will be loaded here -->
                    </div>
                </div>
                
                <div class="tab-pane" id="saved-tab">
                    <div class="posts-grid" id="saved-posts">
                        <!-- Saved posts will be loaded here -->
                    </div>
                </div>
                
                <div class="tab-pane" id="comments-tab">
                    <div class="comments-list" id="user-comments">
                        <!-- User comments will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Edit Profile Modal -->
    <div class="modal" id="edit-profile-modal">
        <div class="modal-content">
            <button class="modal-close-btn" id="edit-profile-close">
                <i class="fas fa-times"></i>
            </button>
            <h2>Edit Profile</h2>
            <form id="edit-profile-form">
                <div class="form-group">
                    <label for="edit-name">Full Name</label>
                    <input type="text" id="edit-name" required>
                </div>
                <div class="form-group">
                    <label for="edit-username">Username</label>
                    <input type="text" id="edit-username" required>
                </div>
                <div class="form-group">
                    <label for="edit-email">Email</label>
                    <input type="email" id="edit-email" required>
                </div>
                <div class="form-group">
                    <label for="edit-profile-pic">Profile Picture URL</label>
                    <input type="url" id="edit-profile-pic" placeholder="https://example.com/image.jpg">
                </div>
                <div class="form-group">
                    <label for="edit-bio">Bio</label>
                    <textarea id="edit-bio" rows="4" placeholder="Tell us about yourself..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancel-edit">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Change Password Modal -->
    <div class="modal" id="change-password-modal">
        <div class="modal-content">
            <button class="modal-close-btn" id="change-password-close">
                <i class="fas fa-times"></i>
            </button>
            <h2>Change Password</h2>
            <form id="change-password-form">
                <div class="form-group">
                    <label for="current-password">Current Password</label>
                    <input type="password" id="current-password" required>
                </div>
                <div class="form-group">
                    <label for="new-password">New Password</label>
                    <input type="password" id="new-password" required>
                </div>
                <div class="form-group">
                    <label for="confirm-password">Confirm New Password</label>
                    <input type="password" id="confirm-password" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancel-password">Cancel</button>
                    <button type="submit" class="btn-primary">Change Password</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Post Modal -->
    <div class="modal" id="post-modal">
        <div class="modal-content post-modal-content">
            <button class="modal-close-btn" id="post-close">
                <i class="fas fa-times"></i>
            </button>
            <div class="post-detail" id="post-detail">
                <!-- Post detail content will be loaded here -->
            </div>
        </div>
    </div>

    <?php include 'components/footer.php'; ?>

    <?php include 'components/scripts.php'; ?>
</body>
</html>
