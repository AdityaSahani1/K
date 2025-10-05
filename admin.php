<?php
$pageTitle = 'SnapSera - Admin Panel';
$pageSpecificCSS = 'admin.css';
$pageSpecificJS = ['admin.js'];
$currentPage = 'admin';
$showSearch = false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include 'components/head.php'; ?>
</head>
<body>
    <?php include 'components/navbar.php'; ?>

    <!-- Admin Header -->
    <section class="admin-header">
        <div class="container">
            <h1>Admin Panel</h1>
            <p>Manage your SnapSera posts and content</p>
        </div>
    </section>

    <!-- Admin Actions -->
    <section class="admin-actions">
        <div class="container">
            <button class="action-btn primary" id="add-post-btn">
                <i class="fas fa-plus"></i>
                Add New Post
            </button>
            <button class="action-btn secondary" id="manage-users-btn">
                <i class="fas fa-users"></i>
                Manage Users
            </button>
            <button class="action-btn secondary" id="analytics-btn">
                <i class="fas fa-chart-bar"></i>
                Analytics
            </button>
        </div>
    </section>

    <!-- Posts Management -->
    <section class="posts-management">
        <div class="container">
            <div class="section-header">
                <h2>Manage Posts</h2>
                <div class="search-bar">
                    <input type="text" id="admin-search" placeholder="Search posts...">
                    <i class="fas fa-search"></i>
                </div>
            </div>
            
            <div class="posts-table">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Featured</th>
                            <th>Likes</th>
                            <th>Comments</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="admin-posts-table">
                        <!-- Posts will be loaded dynamically -->
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- Add/Edit Post Modal -->
    <div class="modal" id="post-form-modal">
        <div class="modal-content large">
            <button class="modal-close-btn" id="post-form-close">
                <i class="fas fa-times"></i>
            </button>
            <h2 id="post-form-title">Add New Post</h2>
            
            <form id="post-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="post-title">Title</label>
                        <input type="text" id="post-title" required>
                    </div>
                    <div class="form-group">
                        <label for="post-category">Category</label>
                        <select id="post-category" required>
                            <option value="">Select Category</option>
                            <option value="art">Art</option>
                            <option value="photography">Photography</option>
                            <option value="design">Design</option>
                            <option value="digital">Digital</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="post-image-url">Image URL</label>
                    <input type="url" id="post-image-url" placeholder="https://example.com/image.jpg" required>
                    <small>Enter the URL of the image you want to display</small>
                </div>
                
                <div class="form-group">
                    <label for="post-description">Description</label>
                    <textarea id="post-description" rows="4" placeholder="Describe your post..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="post-tags">Tags</label>
                    <input type="text" id="post-tags" placeholder="art, creative, design (comma separated)">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="post-download-url">Download URL (Optional)</label>
                        <input type="url" id="post-download-url" placeholder="https://example.com/download.zip">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="post-featured"> Featured Post
                        </label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" id="cancel-post">Cancel</button>
                    <button type="submit" id="save-post">Save Post</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Manage Users Modal -->
    <div class="modal" id="users-modal">
        <div class="modal-content large">
            <button class="modal-close-btn" id="users-close">
                <i class="fas fa-times"></i>
            </button>
            <h2>Manage Users</h2>
            
            <!-- Search and Sort -->
            <div class="section-header" style="margin-bottom: var(--spacing-lg);">
                <div class="search-bar">
                    <input type="text" id="user-search" placeholder="Search users...">
                    <i class="fas fa-search"></i>
                </div>
                <div class="sort-controls">
                    <label>Sort by:</label>
                    <select id="user-sort">
                        <option value="username">Username</option>
                        <option value="email">Email</option>
                        <option value="role">Role</option>
                        <option value="joined">Joined Date</option>
                    </select>
                </div>
            </div>
            
            <div class="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
                        <!-- Users will be loaded dynamically -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal" id="edit-user-modal">
        <div class="modal-content">
            <button class="modal-close-btn" id="edit-user-close">
                <i class="fas fa-times"></i>
            </button>
            <h2>Edit User</h2>
            <form id="edit-user-form">
                <div class="form-group">
                    <label for="edit-user-name">Full Name</label>
                    <input type="text" id="edit-user-name" required>
                </div>
                <div class="form-group">
                    <label for="edit-user-username">Username</label>
                    <input type="text" id="edit-user-username" required>
                </div>
                <div class="form-group">
                    <label for="edit-user-email">Email</label>
                    <input type="email" id="edit-user-email" required>
                </div>
                <div class="form-group">
                    <label for="edit-user-bio">Bio</label>
                    <textarea id="edit-user-bio" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="edit-user-profile-pic">Profile Picture URL</label>
                    <input type="url" id="edit-user-profile-pic">
                </div>
                <div class="form-group">
                    <label for="edit-user-role">Role</label>
                    <select id="edit-user-role" required>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-user-verified">
                        Email Verified
                    </label>
                </div>
                <div class="form-group">
                    <label for="edit-user-password">New Password (leave empty to keep current)</label>
                    <input type="password" id="edit-user-password" minlength="6">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancel-edit-user">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Analytics Modal -->
    <div class="modal" id="analytics-modal">
        <div class="modal-content large">
            <button class="modal-close-btn" id="analytics-close">
                <i class="fas fa-times"></i>
            </button>
            <h2>Analytics Dashboard</h2>
            
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div class="card-icon">
                        <i class="fas fa-eye"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-label">Total Views</div>
                        <div class="card-value" id="total-views">0</div>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="card-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-label">Total Likes</div>
                        <div class="card-value" id="total-likes">0</div>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="card-icon">
                        <i class="fas fa-comment"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-label">Total Comments</div>
                        <div class="card-value" id="total-comments">0</div>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="card-icon">
                        <i class="fas fa-bookmark"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-label">Total Saves</div>
                        <div class="card-value" id="total-saves">0</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <?php include 'components/footer.php'; ?>

    <?php include 'components/scripts.php'; ?>
</body>
</html>
