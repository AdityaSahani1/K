// Profile page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for main.js to load currentUser from localStorage
    setTimeout(initProfilePage, 50);
});

function initProfilePage() {
    // Check localStorage directly to avoid race condition
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        // Redirect to home if not logged in
        window.location.href = 'index.php';
        return;
    }
    
    // Ensure currentUser is set
    if (!currentUser) {
        currentUser = JSON.parse(userData);
    }
    
    loadUserProfile();
    initProfileTabs();
    initEditProfileModal();
    initChangePasswordModal();
    initResetPasswordButton();
    initPostPermissions();
    loadUserContent();
}

function initResetPasswordButton() {
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', handleResetPasswordRequest);
    }
}

async function handleResetPasswordRequest() {
    const resetBtn = document.getElementById('reset-password-btn');
    const originalText = resetBtn.innerHTML;
    
    // Show confirmation dialog
    if (!confirm('Are you sure you want to reset your password? A reset link will be sent to your email.')) {
        return;
    }
    
    resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    resetBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth-actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'forgot_password',
                email: currentUser.email
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Password reset link has been sent to your email!', 'success');
        } else {
            showNotification(data.error || 'Failed to send reset email', 'error');
        }
    } catch (error) {
        console.error('Reset password error:', error);
        showNotification('Failed to send reset email. Please try again.', 'error');
    } finally {
        resetBtn.innerHTML = originalText;
        resetBtn.disabled = false;
    }
}

async function loadUserProfile() {
    try {
        // Update profile information from current user data
        document.getElementById('profile-username').textContent = currentUser.name || currentUser.username;
        document.getElementById('profile-email').textContent = currentUser.email;
        
        // Display bio
        const bioElement = document.getElementById('profile-bio');
        if (bioElement) {
            bioElement.textContent = currentUser.bio || 'No bio added yet';
        }
        
        // Update profile picture
        updateProfilePicture();
        
        // Load and display user statistics
        loadUserStats();
    } catch (error) {
        console.error('Error loading user profile:', error);
        document.getElementById('profile-username').textContent = currentUser.name || currentUser.username;
        document.getElementById('profile-email').textContent = currentUser.email;
        const bioElement = document.getElementById('profile-bio');
        if (bioElement) {
            bioElement.textContent = currentUser.bio || 'No bio added yet';
        }
        updateProfilePicture();
        loadUserStats();
    }
}

function updateProfilePicture() {
    const profilePic = document.getElementById('profile-picture');
    const defaultAvatar = document.getElementById('default-avatar');
    
    if (currentUser.profilePicture) {
        profilePic.src = currentUser.profilePicture;
        profilePic.style.display = 'block';
        defaultAvatar.style.display = 'none';
    } else {
        profilePic.style.display = 'none';
        defaultAvatar.style.display = 'block';
    }
}

async function loadUserStats() {
    try {
        const userData = await getUserData(currentUser.id, 'all');
        const likes = userData.likes || [];
        const saves = userData.saves || [];
        const comments = userData.comments || [];
        
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();
        
        // Count user's interactions
        const userPosts = posts.filter(post => post.author === currentUser.username || post.author === currentUser.id);
        
        // Update stats display
        // Hide posts count for non-admin users
        const postsStatItem = document.querySelector('.stat-item:has(#posts-count)');
        if (currentUser.role !== 'admin' && postsStatItem) {
            postsStatItem.style.display = 'none';
        } else {
            document.getElementById('posts-count').textContent = userPosts.length;
        }
        
        document.getElementById('likes-count').textContent = likes.length;
        document.getElementById('comments-count').textContent = comments.length;
        document.getElementById('saves-count').textContent = saves.length;
        
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

function initProfileTabs() {
    const tabButtons = document.querySelectorAll('.content-tab');
    const tabPanels = document.querySelectorAll('.content-panel');
    const addPostBtn = document.getElementById('add-post-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Remove active class from all tabs and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            const targetPanel = document.getElementById(`${tabName}-tab`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            
            // Show/hide Create Post button only for "myposts" tab
            if (addPostBtn) {
                if (tabName === 'myposts') {
                    addPostBtn.style.display = 'inline-flex';
                } else {
                    addPostBtn.style.display = 'none';
                }
            }
            
            // Load content for the active tab
            loadTabContent(tabName);
        });
    });
}

async function loadTabContent(tabName) {
    switch (tabName) {
        case 'myposts':
            await loadMyPosts();
            break;
        case 'liked':
            await loadLikedPosts();
            break;
        case 'saved':
            await loadSavedPosts();
            break;
        case 'comments':
            await loadUserComments();
            break;
    }
}

async function loadLikedPosts() {
    const container = document.getElementById('liked-posts');
    if (!container) return;
    
    try {
        const userData = await getUserData(currentUser.id, 'all');
        const likes = userData.likes || [];
        
        if (likes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="far fa-heart"></i>
                    </div>
                    <h3>No Liked Posts Yet</h3>
                    <p>Start exploring and like posts that inspire you. They'll appear here for easy access.</p>
                    <a href="gallery.php" class="empty-state-action">
                        <i class="fas fa-images"></i> Explore Gallery
                    </a>
                </div>
            `;
            return;
        }
        
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();
        
        const likedPosts = posts.filter(post => 
            likes.some(like => like.postId === post.id)
        );
        
        if (likedPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="far fa-heart"></i>
                    </div>
                    <h3>No Liked Posts Yet</h3>
                    <p>Start exploring and like posts that inspire you. They'll appear here for easy access.</p>
                    <a href="gallery.php" class="empty-state-action">
                        <i class="fas fa-images"></i> Explore Gallery
                    </a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = likedPosts.map(post => createProfilePostCard(post)).join('');
        addProfilePostListeners();
        
    } catch (error) {
        console.error('Error loading liked posts:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading liked posts</p>
            </div>
        `;
    }
}

async function loadSavedPosts() {
    const container = document.getElementById('saved-posts');
    if (!container) return;
    
    try {
        const userData = await getUserData(currentUser.id, 'all');
        const saves = userData.saves || [];
        
        if (saves.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="far fa-bookmark"></i>
                    </div>
                    <h3>No Saved Posts Yet</h3>
                    <p>Bookmark your favorite posts to build your personal collection. Access them anytime.</p>
                    <a href="gallery.php" class="empty-state-action">
                        <i class="fas fa-images"></i> Explore Gallery
                    </a>
                </div>
            `;
            return;
        }
        
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();
        
        const savedPosts = posts.filter(post => 
            saves.some(save => save.postId === post.id)
        );
        
        if (savedPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="far fa-bookmark"></i>
                    </div>
                    <h3>No Saved Posts Yet</h3>
                    <p>Bookmark your favorite posts to build your personal collection. Access them anytime.</p>
                    <a href="gallery.php" class="empty-state-action">
                        <i class="fas fa-images"></i> Explore Gallery
                    </a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = savedPosts.map(post => createProfilePostCard(post)).join('');
        addProfilePostListeners();
        
    } catch (error) {
        console.error('Error loading saved posts:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading saved posts</p>
            </div>
        `;
    }
}

async function loadUserComments() {
    const container = document.getElementById('user-comments');
    if (!container) return;
    
    try {
        const userData = await getUserData(currentUser.id, 'all');
        const comments = userData.comments || [];
        
        if (comments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="far fa-comment"></i>
                    </div>
                    <h3>No Comments Yet</h3>
                    <p>Share your thoughts and engage with the community. Your comments will be displayed here.</p>
                    <a href="gallery.php" class="empty-state-action">
                        <i class="fas fa-images"></i> Explore Gallery
                    </a>
                </div>
            `;
            return;
        }
        
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();
        
        comments.sort((a, b) => new Date(b.created) - new Date(a.created));
        
        container.innerHTML = comments.map(comment => {
            const post = posts.find(p => p.id === comment.postId);
            const postTitle = post ? post.title : 'Unknown Post';
            const isReply = comment.replyTo ? true : false;
            const replyTag = isReply ? `<span class="reply-tag"><i class="fas fa-reply"></i> Reply to @${comment.replyToUsername}</span>` : '';
            
            return `
                <div class="user-comment" data-comment-id="${comment.id}" data-post-id="${comment.postId}" onclick="navigateToComment('${comment.postId}', '${comment.id}')">
                    <div class="comment-header">
                        <a href="gallery.php?post=${comment.postId}" class="comment-post-title" onclick="event.stopPropagation()">
                            ${postTitle}
                        </a>
                        <span class="comment-date">${formatDate(comment.created)}</span>
                    </div>
                    ${replyTag}
                    <div class="comment-content">${comment.text}</div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading user comments:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading comments</p>
            </div>
        `;
    }
}

function navigateToComment(postId, commentId) {
    // Store the comment ID in session storage for scrolling
    sessionStorage.setItem('scrollToCommentId', commentId);
    window.location.href = `gallery.php?post=${postId}`;
}

function createProfilePostCard(post) {
    return `
        <div class="profile-post-item">
            <div class="profile-post-image" onclick="openPostModal('${post.id}')">
                <img src="${post.imageUrl}" alt="${post.title}" loading="lazy">
                <div class="profile-post-overlay">
                    <div class="profile-post-actions">
                        <button class="overlay-action-btn" onclick="event.stopPropagation(); toggleLike('${post.id}')" title="Like">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="overlay-action-btn" onclick="event.stopPropagation(); toggleSave('${post.id}')" title="Save">
                            <i class="far fa-bookmark"></i>
                        </button>
                        <button class="overlay-action-btn" onclick="event.stopPropagation(); sharePost('${post.id}')" title="Share">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="profile-post-footer">
                <span class="profile-post-title">
                    <i class="fas fa-image"></i> ${post.title}
                </span>
                <button class="profile-post-menu-btn" data-post-id="${post.id}" onclick="event.stopPropagation(); showProfilePostMenu(event, '${post.id}')">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </div>
    `;
}

function addProfilePostListeners() {
    // Click outside to close context menu
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.profile-post-menu-btn') && !e.target.closest('.profile-post-context-menu')) {
            const existingMenu = document.querySelector('.profile-post-context-menu');
            if (existingMenu) {
                existingMenu.remove();
            }
            const activeItem = document.querySelector('.profile-post-item.menu-active');
            if (activeItem) {
                activeItem.classList.remove('menu-active');
            }
        }
    });
}

function showProfilePostMenu(event, postId) {
    event.preventDefault();
    event.stopPropagation();
    
    // Remove any existing context menu and active state
    const existingMenu = document.querySelector('.profile-post-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    const existingActive = document.querySelector('.profile-post-item.menu-active');
    if (existingActive) {
        existingActive.classList.remove('menu-active');
    }
    
    // Add menu-active class to hide hover overlay
    const postItem = event.target.closest('.profile-post-item');
    if (postItem) {
        postItem.classList.add('menu-active');
    }
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'profile-post-context-menu';
    menu.innerHTML = `
        <button onclick="editUserPost('${postId}')">
            <i class="fas fa-edit"></i> Edit Post
        </button>
        <button onclick="deleteUserPost('${postId}')" class="delete-btn">
            <i class="fas fa-trash"></i> Delete Post
        </button>
    `;
    
    // Position the menu using fixed positioning
    const rect = event.target.closest('.profile-post-menu-btn').getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;
    
    document.body.appendChild(menu);
    
    // Close menu on scroll
    const closeOnScroll = () => {
        menu.remove();
        if (postItem) {
            postItem.classList.remove('menu-active');
        }
        window.removeEventListener('scroll', closeOnScroll, true);
    };
    window.addEventListener('scroll', closeOnScroll, true);
}

async function editUserPost(postId) {
    // Close context menu and remove active state
    const menu = document.querySelector('.profile-post-context-menu');
    if (menu) menu.remove();
    const activeItem = document.querySelector('.profile-post-item.menu-active');
    if (activeItem) activeItem.classList.remove('menu-active');
    
    try {
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const posts = await response.json();
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
            showNotification('Post not found', 'error');
            return;
        }
        
        // Parse tags if they're JSON strings
        let tags = post.tags;
        if (typeof tags === 'string') {
            try {
                tags = JSON.parse(tags);
            } catch (e) {
                tags = [];
            }
        }
        
        // Populate form
        document.getElementById('user-post-form-title').textContent = 'Edit Post';
        document.getElementById('user-submit-text').textContent = 'Update Post';
        document.getElementById('user-post-title').value = post.title;
        document.getElementById('user-post-category').value = post.category;
        document.getElementById('user-post-image').value = post.imageUrl;
        document.getElementById('user-post-description').value = post.description || '';
        document.getElementById('user-post-tags').value = Array.isArray(tags) ? tags.join(', ') : '';
        document.getElementById('user-post-id').value = postId;
        
        // Show image preview with the existing image
        const previewContainer = document.getElementById('user-images-preview');
        if (previewContainer && post.imageUrl) {
            previewContainer.innerHTML = `
                <div style="position: relative; border-radius: 8px; overflow: hidden;">
                    <img src="${post.imageUrl}" alt="Preview" style="width: 100%; height: 120px; object-fit: cover;">
                    <div style="padding: 5px; background: var(--bg-secondary); text-align: center; font-size: 0.8rem;">
                        Current Image
                    </div>
                </div>
            `;
        }
        
        showModal('user-post-form-modal');
        
    } catch (error) {
        console.error('Error loading post:', error);
        showNotification('Error loading post', 'error');
    }
}

async function deleteUserPost(postId) {
    // Close context menu and remove active state
    const menu = document.querySelector('.profile-post-context-menu');
    if (menu) menu.remove();
    const activeItem = document.querySelector('.profile-post-item.menu-active');
    if (activeItem) activeItem.classList.remove('menu-active');
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/posts.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: postId })
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete post');
        }
        
        showNotification('Post deleted successfully', 'success');
        
        // Reload stats immediately to update counters
        await loadUserStats();
        
        // Reload the tab content
        loadTabContent('myposts');
        
    } catch (error) {
        console.error('Error deleting post:', error);
        showNotification('Error deleting post', 'error');
    }
}

function initEditProfileModal() {
    const editBtn = document.getElementById('edit-profile-btn');
    const modal = document.getElementById('edit-profile-modal');
    const closeBtn = document.getElementById('edit-profile-close');
    const cancelBtn = document.getElementById('cancel-edit');
    const form = document.getElementById('edit-profile-form');
    
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            showEditProfileModal();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            hideModal('edit-profile-modal');
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            hideModal('edit-profile-modal');
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleEditProfile);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal('edit-profile-modal');
            }
        });
    }
    
    const uploadInput = document.getElementById('edit-profile-pic-upload');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    
    if (uploadInput) {
        uploadInput.addEventListener('change', handleProfilePicUpload);
    }
    
    avatarOptions.forEach(option => {
        option.addEventListener('click', handleDefaultAvatarSelection);
    });
}

function showEditProfileModal() {
    // Populate form with current user data
    const nameField = document.getElementById('edit-name');
    const usernameField = document.getElementById('edit-username');
    const emailField = document.getElementById('edit-email');
    const bioField = document.getElementById('edit-bio');
    const form = document.getElementById('edit-profile-form');
    
    if (nameField) nameField.value = currentUser.name || '';
    if (usernameField) usernameField.value = currentUser.username || '';
    if (emailField) emailField.value = currentUser.email || '';
    if (bioField) bioField.value = currentUser.bio || '';
    
    // Clear any previous selections and uploads
    document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
    if (form) {
        form.dataset.uploadedImage = '';
        form.dataset.selectedAvatar = '';
    }
    
    // Hide preview
    const preview = document.getElementById('profile-pic-preview');
    if (preview) preview.style.display = 'none';
    
    // Highlight currently selected avatar if it's a default one
    if (currentUser.profilePicture && currentUser.profilePicture.includes('/assets/default-avatars/')) {
        const avatarName = currentUser.profilePicture.split('/').pop().replace('.jpg', '');
        const currentAvatarOption = document.querySelector(`.avatar-option[data-avatar="${avatarName}"]`);
        if (currentAvatarOption) {
            currentAvatarOption.classList.add('selected');
        }
    }
    
    showModal('edit-profile-modal');
}

async function handleDefaultAvatarSelection(e) {
    const avatarOption = e.target.closest('.avatar-option');
    if (!avatarOption) return;
    
    const avatarValue = avatarOption.dataset.avatar;
    const avatarPath = '/assets/default-avatars/' + avatarValue + '.jpg';
    
    // Remove previous selection
    document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
    avatarOption.classList.add('selected');
    
    // Store the selected avatar path
    avatarOption.closest('form').dataset.selectedAvatar = avatarPath;
    
    // Clear file upload
    const uploadInput = document.getElementById('edit-profile-pic-upload');
    if (uploadInput) uploadInput.value = '';
    
    // Hide preview
    const preview = document.getElementById('profile-pic-preview');
    if (preview) preview.style.display = 'none';
    
    // Upload the selected avatar to API
    try {
        showNotification('Updating avatar...', 'info');
        const response = await fetch('/api/upload-profile-pic.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                image: avatarValue,
                userId: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            avatarOption.closest('form').dataset.uploadedImage = data.url;
            showNotification('Avatar updated successfully!', 'success');
        } else {
            showNotification('Failed to update avatar: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Avatar update error:', error);
        showNotification('Failed to update avatar', 'error');
    }
}


async function handleEditProfile(e) {
    e.preventDefault();
    
    const name = document.getElementById('edit-name').value.trim();
    const username = document.getElementById('edit-username').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    
    // Get profile picture from: uploaded image > selected avatar > current picture
    const form = e.target;
    const profilePicture = form.dataset.uploadedImage || form.dataset.selectedAvatar || currentUser.profilePicture;
    
    if (!name) {
        showNotification('Name is required', 'error');
        return;
    }
    
    if (!username) {
        showNotification('Username is required', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth-actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update_profile',
                userId: currentUser.id,
                name: name,
                username: username,
                email: email,
                profilePicture: profilePicture,
                bio: bio
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser.name = name;
            currentUser.username = username;
            currentUser.profilePicture = profilePicture;
            currentUser.bio = bio;
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            loadUserProfile();
            hideModal('edit-profile-modal');
            showNotification('Profile updated successfully!', 'success');
        } else {
            showNotification(data.error || 'Error updating profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile', 'error');
    }
}

async function loadUserContent() {
    // Check if user has posting permission
    const isAdmin = currentUser && currentUser.role === 'admin';
    let canPost = isAdmin;
    
    if (!isAdmin) {
        try {
            const response = await fetch('/api/get-users.php');
            if (response.ok) {
                const users = await response.json();
                const userData = users.find(u => u.id === currentUser.id);
                canPost = userData && userData.canPost;
            }
        } catch (error) {
            console.error('Error checking post permissions:', error);
        }
    }
    
    if (canPost) {
        // Show My Posts tab and button
        const myPostsTab = document.getElementById('myposts-tab-btn');
        const addPostBtn = document.getElementById('add-post-btn');
        
        if (myPostsTab) {
            myPostsTab.style.display = 'inline-flex';
            if (addPostBtn) {
                addPostBtn.style.display = 'inline-flex';
            }
            
            // Set My Posts as active by default
            document.querySelectorAll('.content-tab').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.content-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            myPostsTab.classList.add('active');
            const myPostsPanel = document.getElementById('myposts-tab');
            if (myPostsPanel) {
                myPostsPanel.classList.add('active');
            }
            
            await loadTabContent('myposts');
            return;
        }
    }
    
    // Default: Load liked posts
    await loadTabContent('liked');
}

function initChangePasswordModal() {
    const changePasswordBtn = document.getElementById('change-password-btn');
    const modal = document.getElementById('change-password-modal');
    const closeBtn = document.getElementById('change-password-close');
    const cancelBtn = document.getElementById('cancel-password');
    const form = document.getElementById('change-password-form');
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            showModal('change-password-modal');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            hideModal('change-password-modal');
            clearPasswordForm();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            hideModal('change-password-modal');
            clearPasswordForm();
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleChangePassword);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal('change-password-modal');
                clearPasswordForm();
            }
        });
    }
}

function clearPasswordForm() {
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('New password must be at least 8 characters long', 'error');
        return;
    }
    
    if (!/[A-Z]/.test(newPassword)) {
        showNotification('Password must contain at least one uppercase letter', 'error');
        return;
    }
    
    if (!/[a-z]/.test(newPassword)) {
        showNotification('Password must contain at least one lowercase letter', 'error');
        return;
    }
    
    if (!/[0-9]/.test(newPassword)) {
        showNotification('Password must contain at least one number', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (currentPassword === newPassword) {
        showNotification('New password must be different from current password', 'error');
        return;
    }
    
    try {
        // Verify current password and change to new one via API
        const response = await fetch('/api/auth-actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'change_password',
                userId: currentUser.id,
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Password changed successfully!', 'success');
            clearPasswordForm();
            hideModal('change-password-modal');
        } else {
            showNotification(data.error || 'Failed to change password', 'error');
        }
        
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Error changing password', 'error');
    }
}

// Password hashing function (same as in auth.js)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
}

// Post permission functionality
async function initPostPermissions() {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const requestBtn = document.getElementById('request-post-btn');
    const myPostsTab = document.getElementById('myposts-tab-btn');
    const myPostsPane = document.getElementById('myposts-tab');
    const addPostBtn = document.getElementById('add-post-btn');
    
    // Admin always has posting permission
    if (isAdmin) {
        if (myPostsTab) {
            myPostsTab.style.display = 'inline-block';
        }
        if (requestBtn) {
            requestBtn.style.display = 'none';
        }
        loadMyPosts();
    } else {
        // Fetch fresh user data to check canPost permission for non-admin users
        try {
            const response = await fetch('/api/get-users.php');
            if (response.ok) {
                const users = await response.json();
                const userData = users.find(u => u.id === currentUser.id);
                
                if (userData && userData.canPost) {
                    // User can post - show My Posts tab button
                    if (myPostsTab) {
                        myPostsTab.style.display = 'inline-block';
                    }
                    
                    // Hide request button
                    if (requestBtn) {
                        requestBtn.style.display = 'none';
                    }
                    
                    // Load user's posts
                    loadMyPosts();
                } else {
                    // User cannot post - show request button
                    if (requestBtn) {
                        requestBtn.style.display = 'inline-block';
                        requestBtn.addEventListener('click', handleRequestPostPermission);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking post permissions:', error);
        }
    }
    
    // Initialize post form modal
    if (addPostBtn) {
        addPostBtn.addEventListener('click', () => showAddPostModal());
    }
    
    const postFormClose = document.getElementById('user-post-form-close');
    const cancelUserPost = document.getElementById('cancel-user-post');
    const userPostForm = document.getElementById('user-post-form');
    
    if (postFormClose) {
        postFormClose.addEventListener('click', () => hideModal('user-post-form-modal'));
    }
    if (cancelUserPost) {
        cancelUserPost.addEventListener('click', () => hideModal('user-post-form-modal'));
    }
    if (userPostForm) {
        userPostForm.addEventListener('submit', handleUserPostForm);
    }
}

async function handleRequestPostPermission() {
    const btn = document.getElementById('request-post-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/auth-actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'request_post_permission',
                userId: currentUser.id,
                userName: currentUser.name || currentUser.username,
                userEmail: currentUser.email
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Request sent to admin successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to send request', 'error');
        }
    } catch (error) {
        console.error('Request permission error:', error);
        showNotification('Failed to send request', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function loadMyPosts() {
    const myPostsContainer = document.getElementById('my-posts');
    if (!myPostsContainer) return;
    
    try {
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const posts = await response.json();
        
        // Filter to show ONLY this user's posts (by user ID or username)
        const myPosts = posts.filter(post => 
            post.author === currentUser.id || 
            post.author === currentUser.username ||
            post.authorId === currentUser.id
        );
        
        
        if (myPosts.length === 0) {
            myPostsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-images"></i>
                    </div>
                    <h3>No Posts Yet</h3>
                    <p>You haven't created any posts yet. Share your creative work with the community by clicking the "Create Post" button above.</p>
                </div>
            `;
            return;
        }
        
        myPostsContainer.innerHTML = myPosts.map(post => createProfilePostCard(post)).join('');
        addProfilePostListeners();
        
    } catch (error) {
        console.error('Error loading my posts:', error);
        myPostsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading posts</p>
            </div>
        `;
    }
}

function showAddPostModal() {
    const form = document.getElementById('user-post-form');
    const uploadInput = document.getElementById('user-post-image-upload');
    const imagesPreview = document.getElementById('user-images-preview');
    
    document.getElementById('user-post-form-title').textContent = 'Create New Post';
    form.reset();
    document.getElementById('user-post-id').value = '';
    document.getElementById('user-post-image').value = '';
    
    if (imagesPreview) {
        imagesPreview.innerHTML = '';
    }
    
    // Clear the upload requirement
    if (uploadInput) {
        uploadInput.removeAttribute('required');
    }
    
    showModal('user-post-form-modal');
}

async function editMyPost(postId) {
    try {
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load post');
        
        const posts = await response.json();
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
            showNotification('Post not found', 'error');
            return;
        }
        
        // Check if user owns this post
        if (post.author !== currentUser.username && post.author !== currentUser.id) {
            showNotification('You can only edit your own posts', 'error');
            return;
        }
        
        // Parse tags
        let tags = [];
        if (typeof post.tags === 'string') {
            try {
                tags = JSON.parse(post.tags);
            } catch (e) {
                tags = [];
            }
        } else if (Array.isArray(post.tags)) {
            tags = post.tags;
        }
        
        // Populate form
        document.getElementById('user-post-form-title').textContent = 'Edit Post';
        document.getElementById('user-post-title').value = post.title || '';
        document.getElementById('user-post-category').value = post.category || '';
        document.getElementById('user-post-image').value = post.imageUrl || ''; // Store existing image URL
        document.getElementById('user-post-description').value = post.description || '';
        document.getElementById('user-post-tags').value = tags.join(', ');
        document.getElementById('user-post-download-url').value = post.downloadUrl || '';
        document.getElementById('user-post-id').value = postId; // Store post ID for edit
        
        // Clear the upload input (user can choose to upload a new image or keep existing)
        const uploadInput = document.getElementById('user-post-image-upload');
        if (uploadInput) {
            uploadInput.value = '';
            uploadInput.removeAttribute('required'); // Make image optional when editing
        }
        
        // Update label to show optional for editing
        const optionalLabel = document.getElementById('image-upload-optional');
        if (optionalLabel) {
            optionalLabel.textContent = '(Optional when editing)';
            optionalLabel.style.color = 'var(--text-muted)';
        }
        
        // Show current image preview
        const previewContainer = document.getElementById('user-image-upload-preview');
        const previewImg = document.getElementById('user-preview-img');
        if (post.imageUrl && previewImg && previewContainer) {
            previewImg.src = post.imageUrl;
            previewContainer.style.display = 'block';
        }
        
        showModal('user-post-form-modal');
        
    } catch (error) {
        console.error('Error loading post for editing:', error);
        showNotification('Error loading post', 'error');
    }
}

async function handleUserPostForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const postId = document.getElementById('user-post-id').value;
    const isEdit = !!postId;
    
    const title = document.getElementById('user-post-title').value.trim();
    const category = document.getElementById('user-post-category').value;
    let imageUrl = document.getElementById('user-post-image').value.trim();
    const description = document.getElementById('user-post-description').value.trim();
    const tagsInput = document.getElementById('user-post-tags').value.trim();
    const downloadUrl = document.getElementById('user-post-download-url').value.trim();
    
    // Check if we need to upload an image
    const userPostUpload = document.getElementById('user-post-image-upload');
    if (userPostUpload && userPostUpload.files && userPostUpload.files[0]) {
        try {
            showNotification('Uploading image...', 'info');
            const file = userPostUpload.files[0];
            const base64 = await fileToBase64(file);
            const uploadData = await uploadToImgBB(base64);
            imageUrl = uploadData.displayUrl;
            
            // Auto-populate download URL if not set
            if (!downloadUrl && uploadData.imageUrl) {
                document.getElementById('user-post-download-url').value = uploadData.imageUrl;
            }
        } catch (error) {
            console.error('Upload error:', error);
            showNotification('Failed to upload image: ' + error.message, 'error');
            return;
        }
    }
    
    // Validate image: required for new posts, optional for edits
    if (!imageUrl) {
        if (isEdit) {
            showNotification('Cannot save post without an image', 'error');
        } else {
            showNotification('Please select an image', 'error');
        }
        return;
    }
    
    // Parse tags
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    const postData = {
        title,
        category,
        imageUrl,
        description,
        tags,
        downloadUrl: downloadUrl || '',
        author: currentUser.username,
        featured: 0
    };
    
    if (isEdit) {
        postData.id = postId;
    }
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const response = await fetch('/api/posts.php', {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save post');
        }
        
        showNotification(isEdit ? 'Post updated successfully!' : 'Post created successfully!', 'success');
        hideModal('user-post-form-modal');
        
        // Reload stats immediately to update counters
        await loadUserStats();
        
        // Reload posts
        loadMyPosts();
        
        // Reset form
        form.reset();
        document.getElementById('user-post-id').value = '';
        document.getElementById('user-post-image').value = '';
        const previewContainer = document.getElementById('user-images-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
        
    } catch (error) {
        console.error('Error saving post:', error);
        showNotification(error.message || 'Error saving post', 'error');
    }
}

async function deleteMyPost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    try {
        // Verify ownership first
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load post');
        
        const posts = await response.json();
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
            showNotification('Post not found', 'error');
            return;
        }
        
        if (post.author !== currentUser.username && post.author !== currentUser.id) {
            showNotification('You can only delete your own posts', 'error');
            return;
        }
        
        // Delete the post
        const deleteResponse = await fetch('/api/posts.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: postId })
        });
        
        if (!deleteResponse.ok) {
            throw new Error('Failed to delete post');
        }
        
        showNotification('Post deleted successfully!', 'success');
        
        // Reload stats immediately to update counters
        await loadUserStats();
        
        // Reload posts
        loadMyPosts();
        
    } catch (error) {
        console.error('Error deleting post:', error);
        showNotification('Error deleting post', 'error');
    }
}

// Toggle post menu dropdown
function togglePostMenu(event, postId) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${postId}`);
    
    // Close all other menus
    document.querySelectorAll('.menu-dropdown').forEach(m => {
        if (m.id !== `menu-${postId}`) {
            m.classList.remove('show');
        }
    });
    
    menu.classList.toggle('show');
}

// Close menus when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.post-menu')) {
        document.querySelectorAll('.menu-dropdown').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Toggle like functionality for profile page
async function toggleLike(postId) {
    try {
        const response = await fetch('/api/post-actions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'like',
                postId: postId,
                userId: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            if (data.action === 'liked') {
                showNotification('Post liked!', 'success');
            } else {
                showNotification('Post unliked', 'success');
            }
            // Reload current tab content to update UI
            const activeTab = document.querySelector('.content-tab.active');
            if (activeTab) {
                const tabName = activeTab.id.replace('-tab-btn', '');
                loadTabContent(tabName);
            }
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Error updating like', 'error');
    }
}

// Toggle save functionality for profile page
async function toggleSave(postId) {
    try {
        const response = await fetch('/api/post-actions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'save',
                postId: postId,
                userId: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            if (data.action === 'saved') {
                showNotification('Post saved!', 'success');
            } else {
                showNotification('Post removed from saved', 'success');
            }
            // Reload current tab content to update UI
            const activeTab = document.querySelector('.content-tab.active');
            if (activeTab) {
                const tabName = activeTab.id.replace('-tab-btn', '');
                loadTabContent(tabName);
            }
        }
    } catch (error) {
        console.error('Error toggling save:', error);
        showNotification('Error updating save', 'error');
    }
}

// Convert various image hosting URLs to direct image URLs
function convertToDirectImageUrl(url) {
    if (!url) return url;
    
    // Google Drive conversion
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
    if (driveMatch) {
        return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    
    // Dropbox conversion
    if (url.includes('dropbox.com')) {
        return url.replace('?dl=0', '?raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }
    
    // OneDrive conversion
    if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
        if (url.includes('?')) {
            return url + '&embed=1';
        } else {
            return url + '?embed=1';
        }
    }
    
    // Google Photos warning
    if (url.includes('photos.google.com') || url.includes('photos.app.goo.gl')) {
        showNotification('Google Photos links may not work. Please use Google Drive, Imgur, or ImgBB instead.', 'warning');
    }
    
    return url;
}

async function handleProfilePicUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
        showNotification('Please select an image file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }
    
    document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
    
    const reader = new FileReader();
    reader.onload = async function(event) {
        const preview = document.getElementById('profile-pic-preview');
        const previewImg = document.getElementById('profile-preview-img');
        
        if (preview && previewImg) {
            previewImg.src = event.target.result;
            preview.style.display = 'block';
        }
        
        const base64Image = event.target.result.split(',')[1];
        
        try {
            showNotification('Uploading image...', 'info');
            
            const response = await fetch('/api/upload-profile-pic.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    image: base64Image,
                    userId: currentUser.id
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                e.target.closest('form').dataset.uploadedImage = data.url;
                showNotification('Image uploaded successfully!', 'success');
            } else {
                showNotification('Failed to upload image: ' + (data.error || 'Unknown error'), 'error');
                if (preview) preview.style.display = 'none';
            }
        } catch (error) {
            console.error('Upload error:', error);
            showNotification('Failed to upload image', 'error');
            if (preview) preview.style.display = 'none';
        }
    };
    
    reader.readAsDataURL(file);
}

// Initialize profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.location.pathname.includes('profile.php')) {
            initProfilePage();
        }
    }, 100);
});
