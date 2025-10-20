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
                        <button class="request-post-btn" id="request-post-btn" style="display: none;">
                            <i class="fas fa-paper-plane"></i> Request Posting Permission
                        </button>
                    </div>
                </div>
                <div class="profile-stats">
                    <div class="stat-item">
                        <i class="fas fa-images stat-icon"></i>
                        <span class="stat-number" id="posts-count">0</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-heart stat-icon"></i>
                        <span class="stat-number" id="likes-count">0</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-comments stat-icon"></i>
                        <span class="stat-number" id="comments-count">0</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-bookmark stat-icon"></i>
                        <span class="stat-number" id="saves-count">0</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Profile Content -->
    <section class="profile-content">
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <div class="content-tabs" style="margin-bottom: 0; flex: 1;">
                <button class="content-tab" data-tab="myposts" id="myposts-tab-btn" style="display: none;">
                    <i class="fas fa-images"></i>
                    <span>My Posts</span>
                </button>
                <button class="content-tab active" data-tab="liked">
                    <i class="fas fa-heart"></i>
                    <span>Liked</span>
                </button>
                <button class="content-tab" data-tab="saved">
                    <i class="fas fa-bookmark"></i>
                    <span>Saved</span>
                </button>
                <button class="content-tab" data-tab="comments">
                    <i class="fas fa-comments"></i>
                    <span>Comments</span>
                </button>
            </div>
            <button id="add-post-btn" class="btn-primary" style="display: none;">
                <i class="fas fa-plus"></i> Create Post
            </button>
        </div>
            
            <div class="content-panels">
                <div class="content-panel" id="myposts-tab">
                    <div class="posts-grid" id="my-posts">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading posts...
                        </div>
                    </div>
                </div>
                
                <div class="content-panel active" id="liked-tab">
                    <div class="posts-grid" id="liked-posts">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading liked posts...
                        </div>
                    </div>
                </div>
                
                <div class="content-panel" id="saved-tab">
                    <div class="posts-grid" id="saved-posts">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading saved posts...
                        </div>
                    </div>
                </div>
                
                <div class="content-panel" id="comments-tab">
                    <div class="comments-list" id="user-comments">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading comments...
                        </div>
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
                    <label for="edit-bio">Bio</label>
                    <textarea id="edit-bio" rows="4" placeholder="Tell us about yourself..."></textarea>
                </div>
                <div class="form-group">
                    <label>Profile Picture</label>
                    <div class="profile-picture-options">
                        <div class="default-avatars">
                            <div class="avatar-option" data-avatar="avatar1">
                                <img src="/assets/default-avatars/avatar1.svg" alt="Avatar 1">
                            </div>
                            <div class="avatar-option" data-avatar="avatar2">
                                <img src="/assets/default-avatars/avatar2.svg" alt="Avatar 2">
                            </div>
                            <div class="avatar-option" data-avatar="avatar3">
                                <img src="/assets/default-avatars/avatar3.svg" alt="Avatar 3">
                            </div>
                            <div class="avatar-option" data-avatar="avatar4">
                                <img src="/assets/default-avatars/avatar4.svg" alt="Avatar 4">
                            </div>
                            <div class="avatar-option" data-avatar="avatar5">
                                <img src="/assets/default-avatars/avatar5.svg" alt="Avatar 5">
                            </div>
                            <div class="avatar-option" data-avatar="avatar6">
                                <img src="/assets/default-avatars/avatar6.svg" alt="Avatar 6">
                            </div>
                        </div>
                        <div class="upload-section">
                            <label for="profile-picture-upload" class="upload-btn">
                                <i class="fas fa-upload"></i> Upload Custom Photo
                            </label>
                            <input type="file" id="profile-picture-upload" accept="image/*" style="display: none;">
                            <p class="help-text">Max 5MB. JPG, PNG, GIF, or WEBP</p>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn-primary">Save Changes</button>
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
                <button type="submit" class="btn-primary">Change Password</button>
            </form>
        </div>
    </div>

    <!-- Create/Edit Post Modal -->
    <div class="modal" id="user-post-form-modal">
        <div class="modal-content">
            <button class="modal-close-btn" id="user-post-form-close">
                <i class="fas fa-times"></i>
            </button>
            <h2 id="user-post-form-title">Create New Post</h2>
            <form id="user-post-form">
                <input type="hidden" id="user-post-id" value="">
                <div class="form-group">
                    <label for="user-post-title">Title *</label>
                    <input type="text" id="user-post-title" required>
                </div>
                <div class="form-group">
                    <label for="user-post-description">Description</label>
                    <textarea id="user-post-description" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label for="user-post-image">Image URL *</label>
                    <input type="url" id="user-post-image" required placeholder="https://example.com/image.jpg">
                </div>
                <div class="form-group">
                    <label for="user-post-category">Category *</label>
                    <select id="user-post-category" required>
                        <option value="">Select a category</option>
                        <option value="nature">Nature</option>
                        <option value="urban">Urban</option>
                        <option value="portrait">Portrait</option>
                        <option value="abstract">Abstract</option>
                        <option value="wildlife">Wildlife</option>
                        <option value="landscape">Landscape</option>
                        <option value="architecture">Architecture</option>
                        <option value="street">Street Photography</option>
                        <option value="art">Art</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="user-post-tags">Tags (comma separated)</label>
                    <input type="text" id="user-post-tags" placeholder="nature, landscape, mountains">
                </div>
                <button type="submit" class="btn-primary">Save Post</button>
            </form>
        </div>
    </div>

    <?php include 'components/footer.php'; ?>
    <?php include 'components/post-modal.php'; ?>
    <?php include 'components/scripts.php'; ?>
</body>
</html>
