// Profile page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initProfilePage();
});

function initProfilePage() {
    if (!currentUser) {
        // Redirect to home if not logged in
        window.location.href = 'index.php';
        return;
    }
    
    loadUserProfile();
    initProfileTabs();
    initEditProfileModal();
    initChangePasswordModal();
    initResetPasswordButton();
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
        // Fallback to cached data
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
        const userPosts = posts.filter(post => post.author === currentUser.username);
        
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
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Remove active class from all tabs and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Load content for the active tab
            loadTabContent(tabName);
        });
    });
}

async function loadTabContent(tabName) {
    switch (tabName) {
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
                    <i class="far fa-heart"></i>
                    <h3>No Liked Posts</h3>
                    <p>Posts you like will appear here</p>
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
                    <i class="far fa-heart"></i>
                    <h3>No Liked Posts</h3>
                    <p>Posts you like will appear here</p>
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
                    <i class="far fa-bookmark"></i>
                    <h3>No Saved Posts</h3>
                    <p>Posts you save will appear here</p>
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
                    <i class="far fa-bookmark"></i>
                    <h3>No Saved Posts</h3>
                    <p>Posts you save will appear here</p>
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
                    <i class="far fa-comment"></i>
                    <h3>No Comments</h3>
                    <p>Your comments will appear here</p>
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
        <div class="profile-post-card" data-post-id="${post.id}">
            <div class="profile-post-image">
                <img src="${post.imageUrl}" alt="${post.title}" loading="lazy">
                <div class="profile-post-overlay">
                    <i class="fas fa-eye"></i>
                </div>
            </div>
            <div class="profile-post-info">
                <h4 class="profile-post-title">${post.title}</h4>
                <div class="profile-post-meta">
                    <span>${post.category}</span>
                    <span><i class="far fa-heart"></i> ${post.likes || 0}</span>
                </div>
            </div>
        </div>
    `;
}

function addProfilePostListeners() {
    document.querySelectorAll('.profile-post-card').forEach(card => {
        card.addEventListener('click', function() {
            const postId = this.dataset.postId;
            window.location.href = `gallery.php?post=${postId}`;
        });
    });
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
}

function showEditProfileModal() {
    // Populate form with current user data
    document.getElementById('edit-name').value = currentUser.name || '';
    document.getElementById('edit-username').value = currentUser.username;
    document.getElementById('edit-email').value = currentUser.email;
    document.getElementById('edit-profile-pic').value = currentUser.profilePicture || '';
    document.getElementById('edit-bio').value = currentUser.bio || '';
    
    showModal('edit-profile-modal');
}

async function handleEditProfile(e) {
    e.preventDefault();
    
    const name = document.getElementById('edit-name').value.trim();
    const username = document.getElementById('edit-username').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const profilePicture = document.getElementById('edit-profile-pic').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    
    if (!name || !username || !email) {
        showNotification('Name, username and email are required', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
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
            // Update current user object in memory
            currentUser.name = name;
            currentUser.username = username;
            currentUser.email = email;
            currentUser.profilePicture = profilePicture;
            currentUser.bio = bio;
            
            // Update in localStorage for session
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update UI
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

function loadUserContent() {
    // Load initial tab content
    loadTabContent('liked');
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

// Initialize profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure currentUser is loaded
    setTimeout(() => {
        if (window.location.pathname.includes('profile.php')) {
            initProfilePage();
        }
    }, 100);
});