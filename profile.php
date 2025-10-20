<?php
$pageTitle = 'SnapSera - Profile';
$pageSpecificCSS = ['profile.css', 'post-modal.css'];
$pageSpecificJS = ['post-modal.js', 'profile.js'];
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
            <div class="content-tabs">
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
            
            <button id="add-post-btn" class="btn-primary add-post-below-tabs" style="display: none;">
                <i class="fas fa-plus"></i> Create Post
            </button>
            
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
                    <label for="edit-username">Username</label>
                    <input type="text" id="edit-username" readonly style="background-color: var(--bg-secondary); cursor: not-allowed;">
                    <small style="color: var(--text-muted); font-size: 0.85rem;">Username cannot be changed</small>
                </div>
                
                <div class="form-group">
                    <label for="edit-email">Email</label>
                    <input type="email" id="edit-email" readonly style="background-color: var(--bg-secondary); cursor: not-allowed;">
                    <small style="color: var(--text-muted); font-size: 0.85rem;">Email cannot be changed</small>
                </div>
                
                <div class="form-group">
                    <label for="edit-bio">Bio</label>
                    <textarea id="edit-bio" rows="3" placeholder="Tell us about yourself..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-profile-pic-upload">Upload Profile Picture</label>
                    <input type="file" id="edit-profile-pic-upload" accept="image/*" style="margin-bottom: 10px;">
                    <div id="profile-pic-preview" style="display: none; margin-bottom: 10px;">
                        <img id="profile-preview-img" src="" alt="Preview" style="max-width: 150px; max-height: 150px; border-radius: 50%; object-fit: cover;">
                        <button type="button" id="remove-profile-upload" style="display: block; margin-top: 5px; padding: 5px 10px; background: var(--accent-danger); color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
                    </div>
                    <small>📸 Upload an image or enter a URL below</small>
                </div>
                
                <div class="form-group">
                    <label for="edit-profile-pic">Or Enter Profile Picture URL</label>
                    <input type="url" id="edit-profile-pic" placeholder="https://example.com/image.jpg">
                </div>
                
                <div class="form-group">
                    <label>Or Choose a Default Avatar</label>
                    <div class="avatar-grid">
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
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancel-edit">Cancel</button>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
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
                <button type="submit" class="btn-primary">Change Password</button>
            </form>
        </div>
    </div>

    <!-- Create/Edit Post Modal -->
    <div class="modal" id="user-post-form-modal">
        <div class="modal-content large">
            <button class="modal-close-btn" id="user-post-form-close">
                <i class="fas fa-times"></i>
            </button>
            <h2 id="user-post-form-title">Create New Post</h2>
            <form id="user-post-form">
                <input type="hidden" id="user-post-id" value="">
                <input type="hidden" id="user-post-image" value="">
                <div class="form-row">
                    <div class="form-group">
                        <label for="user-post-title">Title</label>
                        <input type="text" id="user-post-title" required>
                    </div>
                    <div class="form-group">
                        <label for="user-post-category">Category</label>
                        <select id="user-post-category" required>
                            <option value="">Select Category</option>
                            <option value="art">Art</option>
                            <option value="photography">Photography</option>
                            <option value="design">Design</option>
                            <option value="digital">Digital</option>
                            <option value="nature">Nature</option>
                            <option value="urban">Urban</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="user-post-image-upload">Upload Image <span id="image-upload-optional">(Optional when editing)</span></label>
                    <input type="file" id="user-post-image-upload" accept="image/*" style="margin-bottom: 10px;">
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">Upload a new image or keep the existing one when editing</p>
                    <div id="user-image-upload-preview" style="display: none; margin-bottom: 10px;">
                        <img id="user-preview-img" src="" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                        <button type="button" id="user-remove-upload" style="display: block; margin-top: 5px; padding: 5px 10px; background: var(--accent-danger); color: white; border: none; border-radius: 4px; cursor: pointer;">Clear Preview</button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="user-post-description">Description</label>
                    <textarea id="user-post-description" rows="4" placeholder="Describe your post..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="user-post-tags">Tags</label>
                    <input type="text" id="user-post-tags" placeholder="art, creative, design (comma separated)">
                </div>
                
                <div class="form-group">
                    <label for="user-post-download-url">Download URL (Optional)</label>
                    <input type="url" id="user-post-download-url" placeholder="https://example.com/download.zip">
                </div>
                
                <div class="form-actions">
                    <button type="button" id="user-cancel-post">Cancel</button>
                    <button type="submit" id="user-save-post">Save Post</button>
                </div>
            </form>
        </div>
    </div>

    <?php include 'components/footer.php'; ?>
    <?php include 'components/post-modal.php'; ?>
    <?php include 'components/scripts.php'; ?>
</body>
</html>
