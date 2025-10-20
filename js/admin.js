// Admin page JavaScript

let allUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    initAdminPage();
});

function initAdminPage() {
    // Check admin access
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Admin access required', 'error');
        window.location.href = 'index.php';
        return;
    }
    
    loadAdminData();
    initAdminModals();
    initAdminSearch();
}

async function loadAdminData() {
    try {
        await loadPostsTable();
    } catch (error) {
        console.error('Error loading admin data:', error);
        showNotification('Error loading admin data', 'error');
    }
}

async function loadPostsTable() {
    const tableBody = document.getElementById('admin-posts-table');
    if (!tableBody) return;
    
    try {
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const posts = await response.json();
        
        if (posts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: var(--spacing-2xl);">
                        <i class="fas fa-images" style="font-size: 2rem; color: var(--text-muted); margin-bottom: var(--spacing-md);"></i>
                        <p>No posts available. <a href="#" onclick="showAddPostModal()">Add your first post</a></p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort posts by creation date (newest first)
        posts.sort((a, b) => new Date(b.created) - new Date(a.created));
        
        // Parse tags if they're JSON strings
        posts.forEach(post => {
            if (typeof post.tags === 'string') {
                try {
                    post.tags = JSON.parse(post.tags);
                } catch (e) {
                    post.tags = [];
                }
            }
        });
        
        tableBody.innerHTML = posts.map(post => `
            <tr data-post-id="${post.id}">
                <td>
                    <img src="${post.imageUrl}" alt="${post.title}" class="post-thumbnail">
                </td>
                <td class="post-title-cell" title="${post.title}">${post.title}</td>
                <td>
                    <span class="category-tag ${post.category}">${post.category}</span>
                </td>
                <td class="stat-cell">
                    <span class="featured-badge ${post.featured ? 'featured' : 'not-featured'}">
                        <i class="fas ${post.featured ? 'fa-star' : 'fa-star-o'}"></i>
                        ${post.featured ? 'Yes' : 'No'}
                    </span>
                </td>
                <td class="stat-cell">${post.likes || 0}</td>
                <td class="stat-cell">${post.comments || 0}</td>
                <td>${formatDate(post.created)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="table-action-btn edit" onclick="editPost('${post.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn delete" onclick="deletePost('${post.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading posts table:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: var(--spacing-2xl); color: var(--accent-danger);">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading posts</p>
                </td>
            </tr>
        `;
    }
}

async function loadAnalytics() {
    // Analytics elements only exist when the modal is opened, so silently skip if not present
    const viewsEl = document.getElementById('total-views');
    if (!viewsEl) return; // Modal not open yet, skip analytics update
    
    try {
        // Load data from API
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const posts = await response.json();
        
        // Calculate totals from posts data (database already has these counts)
        const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
        const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
        
        // Update analytics display
        const likesEl = document.getElementById('total-likes');
        const commentsEl = document.getElementById('total-comments');
        
        if (viewsEl) viewsEl.textContent = totalViews;
        if (likesEl) likesEl.textContent = totalLikes;
        if (commentsEl) commentsEl.textContent = totalComments;
        
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function initAdminModals() {
    // Add Post Modal
    const addPostBtn = document.getElementById('add-post-btn');
    const postFormModal = document.getElementById('post-form-modal');
    const postFormClose = document.getElementById('post-form-close');
    const cancelPost = document.getElementById('cancel-post');
    const postForm = document.getElementById('post-form');
    
    if (addPostBtn) {
        addPostBtn.addEventListener('click', showAddPostModal);
    }
    
    if (postFormClose) {
        postFormClose.addEventListener('click', () => hideModal('post-form-modal'));
    }
    
    if (cancelPost) {
        cancelPost.addEventListener('click', () => hideModal('post-form-modal'));
    }
    
    if (postForm) {
        postForm.addEventListener('submit', handlePostForm);
    }
    
    if (postFormModal) {
        postFormModal.addEventListener('click', function(e) {
            if (e.target === postFormModal) {
                hideModal('post-form-modal');
            }
        });
    }
    
    // Manage Users Modal
    const manageUsersBtn = document.getElementById('manage-users-btn');
    const usersModal = document.getElementById('users-modal');
    const usersClose = document.getElementById('users-close');
    
    if (manageUsersBtn) {
        manageUsersBtn.addEventListener('click', showUsersModal);
    }
    
    if (usersClose) {
        usersClose.addEventListener('click', () => hideModal('users-modal'));
    }
    
    if (usersModal) {
        usersModal.addEventListener('click', function(e) {
            if (e.target === usersModal) {
                hideModal('users-modal');
            }
        });
    }
    
    // Edit User Modal
    const editUserModal = document.getElementById('edit-user-modal');
    const editUserClose = document.getElementById('edit-user-close');
    const cancelEditUser = document.getElementById('cancel-edit-user');
    const editUserForm = document.getElementById('edit-user-form');
    
    if (editUserClose) {
        editUserClose.addEventListener('click', () => hideModal('edit-user-modal'));
    }
    
    if (cancelEditUser) {
        cancelEditUser.addEventListener('click', () => hideModal('edit-user-modal'));
    }
    
    if (editUserForm) {
        editUserForm.addEventListener('submit', handleEditUserForm);
    }
    
    if (editUserModal) {
        editUserModal.addEventListener('click', function(e) {
            if (e.target === editUserModal) {
                hideModal('edit-user-modal');
            }
        });
    }
    
    // Analytics Modal
    const analyticsBtn = document.getElementById('analytics-btn');
    const analyticsModal = document.getElementById('analytics-modal');
    const analyticsClose = document.getElementById('analytics-close');
    
    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', async () => {
            showModal('analytics-modal');
            await loadAnalytics(); // Load after modal is shown so elements exist
        });
    }
    
    if (analyticsClose) {
        analyticsClose.addEventListener('click', () => hideModal('analytics-modal'));
    }
    
    if (analyticsModal) {
        analyticsModal.addEventListener('click', function(e) {
            if (e.target === analyticsModal) {
                hideModal('analytics-modal');
            }
        });
    }
    
    // User search and sort
    const userSearch = document.getElementById('user-search');
    const userSort = document.getElementById('user-sort');
    
    if (userSearch) {
        let searchTimeout;
        userSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterAndSortUsers();
            }, 300);
        });
    }
    
    if (userSort) {
        userSort.addEventListener('change', filterAndSortUsers);
    }
}

function initAdminSearch() {
    const searchInput = document.getElementById('admin-search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterPosts(this.value);
            }, 300);
        });
    }
}

function filterPosts(searchTerm) {
    const rows = document.querySelectorAll('#admin-posts-table tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const title = row.querySelector('.post-title-cell')?.textContent.toLowerCase() || '';
        const category = row.querySelector('.category-tag')?.textContent.toLowerCase() || '';
        
        if (title.includes(term) || category.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function showAddPostModal() {
    document.getElementById('post-form-title').textContent = 'Add New Post';
    document.getElementById('post-form').reset();
    document.getElementById('post-form').dataset.mode = 'add';
    showModal('post-form-modal');
}

async function editPost(postId) {
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
        
        // Populate form with post data
        document.getElementById('post-form-title').textContent = 'Edit Post';
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-image-url').value = post.imageUrl;
        document.getElementById('post-description').value = post.description || '';
        document.getElementById('post-tags').value = Array.isArray(tags) ? tags.join(', ') : '';
        document.getElementById('post-download-url').value = post.downloadUrl || '';
        document.getElementById('post-featured').checked = post.featured || false;
        
        // Set form mode and post ID
        const form = document.getElementById('post-form');
        form.dataset.mode = 'edit';
        form.dataset.postId = postId;
        
        showModal('post-form-modal');
        
    } catch (error) {
        console.error('Error loading post for editing:', error);
        showNotification('Error loading post', 'error');
    }
}

async function deletePost(postId) {
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
        loadPostsTable();
        
    } catch (error) {
        console.error('Error deleting post:', error);
        showNotification('Error deleting post', 'error');
    }
}

async function handlePostForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const mode = form.dataset.mode;
    const postId = form.dataset.postId;
    
    // Get form data
    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    let imageUrl = document.getElementById('post-image-url').value.trim();
    const description = document.getElementById('post-description').value.trim();
    const tags = document.getElementById('post-tags').value.trim();
    const downloadUrl = document.getElementById('post-download-url').value.trim();
    const featured = document.getElementById('post-featured').checked;
    
    // Validation
    if (!title || !category || !imageUrl) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Convert image URL to direct link if from supported platforms
    imageUrl = convertToDirectImageUrl(imageUrl);
    
    try {
        const postData = {
            title,
            category,
            imageUrl,
            description,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            downloadUrl: downloadUrl || null,
            featured: featured ? 1 : 0,
            author: currentUser.username
        };
        
        let method = 'POST';
        
        if (mode === 'add') {
            postData.id = 'post_' + Date.now();
        } else if (mode === 'edit') {
            postData.id = postId;
            method = 'PUT';
        }
        
        const response = await fetch('/api/posts.php', {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save post');
        }
        
        showNotification(mode === 'add' ? 'Post created successfully!' : 'Post updated successfully!', 'success');
        
        hideModal('post-form-modal');
        loadPostsTable();
        
    } catch (error) {
        console.error('Error saving post:', error);
        showNotification('Error saving post', 'error');
    }
}

async function showUsersModal() {
    await loadUsersTable();
    showModal('users-modal');
}

async function loadUsersTable() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    
    try {
        const response = await fetch('/api/get-users.php');
        if (!response.ok) throw new Error('Failed to load users');
        
        const users = await response.json();
        allUsers = users; // Store for filtering/sorting
        
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: var(--spacing-2xl);">
                        <i class="fas fa-users" style="font-size: 2rem; color: var(--text-muted); margin-bottom: var(--spacing-md);"></i>
                        <p>No users found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Apply current filter and sort
        filterAndSortUsers();
        
    } catch (error) {
        console.error('Error loading users table:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: var(--spacing-2xl); color: var(--accent-danger);">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading users</p>
                </td>
            </tr>
        `;
    }
}

async function editUser(userId) {
    try {
        const response = await fetch('/api/get-users.php');
        if (!response.ok) throw new Error('Failed to load users');
        
        const users = await response.json();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            showNotification('User not found', 'error');
            return;
        }
        
        // Populate form with user data
        document.getElementById('edit-user-name').value = user.name || '';
        document.getElementById('edit-user-username').value = user.username || '';
        document.getElementById('edit-user-email').value = user.email || '';
        document.getElementById('edit-user-bio').value = user.bio || '';
        document.getElementById('edit-user-profile-pic').value = user.profilePicture || '';
        document.getElementById('edit-user-role').value = user.role || 'user';
        document.getElementById('edit-user-verified').checked = user.isVerified || false;
        document.getElementById('edit-user-canpost').checked = user.canPost || false;
        document.getElementById('reset-email-address').value = user.email || '';
        
        // Store user ID for form submission
        document.getElementById('edit-user-form').dataset.userId = userId;
        
        showModal('edit-user-modal');
        
    } catch (error) {
        console.error('Error loading user for editing:', error);
        showNotification('Error loading user', 'error');
    }
}

async function handleEditUserForm(e) {
    e.preventDefault();
    
    const userId = e.target.dataset.userId;
    const name = document.getElementById('edit-user-name').value.trim();
    const username = document.getElementById('edit-user-username').value.trim();
    const email = document.getElementById('edit-user-email').value.trim();
    const bio = document.getElementById('edit-user-bio').value.trim();
    const profilePicture = document.getElementById('edit-user-profile-pic').value.trim();
    const role = document.getElementById('edit-user-role').value;
    const isVerified = document.getElementById('edit-user-verified').checked;
    const canPost = document.getElementById('edit-user-canpost').checked;
    
    if (!name || !username || !email) {
        showNotification('Name, username and email are required', 'error');
        return;
    }
    
    try {
        const userData = {
            id: userId,
            name,
            username,
            email,
            bio,
            profilePicture,
            role,
            isVerified,
            canPost
        };
        
        const response = await fetch('/api/get-users.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update user');
        }
        
        showNotification('User updated successfully!', 'success');
        hideModal('edit-user-modal');
        loadUsersTable();
        
    } catch (error) {
        console.error('Error updating user:', error);
        showNotification('Error updating user', 'error');
    }
}

async function sendPasswordResetEmail() {
    const email = document.getElementById('reset-email-address').value.trim();
    const sendBtn = document.getElementById('send-reset-email-btn');
    
    if (!email) {
        showNotification('Please enter an email address', 'error');
        return;
    }
    
    const originalHTML = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    sendBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth-actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'forgot_password',
                email: email
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Password reset email sent successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to send reset email', 'error');
        }
    } catch (error) {
        console.error('Error sending reset email:', error);
        showNotification('Error sending reset email', 'error');
    } finally {
        sendBtn.innerHTML = originalHTML;
        sendBtn.disabled = false;
    }
}

async function hashPasswordSecure(password) {
    // For frontend hashing, we'll use the same legacy hash
    // In production, this should be done server-side
    return hashPassword(password);
}

function filterAndSortUsers() {
    const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('user-sort')?.value || 'username';
    
    let filteredUsers = allUsers.filter(user => {
        const username = user.username?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const role = user.role?.toLowerCase() || '';
        return username.includes(searchTerm) || email.includes(searchTerm) || role.includes(searchTerm);
    });
    
    // Sort users
    filteredUsers.sort((a, b) => {
        switch(sortBy) {
            case 'username':
                return (a.username || '').localeCompare(b.username || '');
            case 'email':
                return (a.email || '').localeCompare(b.email || '');
            case 'role':
                return (a.role || 'user').localeCompare(b.role || 'user');
            case 'joined':
                return new Date(b.created || 0) - new Date(a.created || 0);
            default:
                return 0;
        }
    });
    
    displayUsers(filteredUsers);
}

function displayUsers(users) {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: var(--spacing-2xl);">
                    <i class="fas fa-users" style="font-size: 2rem; color: var(--text-muted); margin-bottom: var(--spacing-md);"></i>
                    <p>No users found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = users.map(user => {
        const profilePic = user.profilePicture ? 
            `<img src="${user.profilePicture}" alt="${user.username}" class="user-profile-pic">` :
            `<div class="user-profile-pic default"><i class="fas fa-user"></i></div>`;
        
        return `
            <tr data-user-id="${user.id}">
                <td>${profilePic}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge ${user.role || 'user'}">${user.role || 'user'}</span>
                </td>
                <td>${user.created ? formatDate(user.created) : 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="table-action-btn edit" onclick="editUser('${user.id}')" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                            <button class="table-action-btn delete" onclick="deleteUser('${user.id}')" title="Delete User">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function grantPostPermission(userId) {
    if (!confirm('Grant this user permission to create posts?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/get-users.php');
        if (!response.ok) throw new Error('Failed to load user');
        
        const users = await response.json();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            showNotification('User not found', 'error');
            return;
        }
        
        const updateResponse = await fetch('/api/get-users.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: userId,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio || '',
                profilePicture: user.profilePicture || '',
                role: user.role,
                isVerified: user.isVerified,
                canPost: true
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to grant permission');
        }
        
        showNotification('Post permission granted successfully!', 'success');
        loadUsersTable();
        
    } catch (error) {
        console.error('Error granting permission:', error);
        showNotification('Error granting permission', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/get-users.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: userId })
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete user');
        }
        
        showNotification('User deleted successfully', 'success');
        loadUsersTable();
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification(error.message || 'Error deleting user', 'error');
    }
}

// Convert various image hosting URLs to direct image URLs
function convertToDirectImageUrl(url) {
    if (!url) return url;
    
    // Google Drive conversion
    // From: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // To: https://drive.google.com/uc?export=view&id=FILE_ID
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
    if (driveMatch) {
        return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    
    // Dropbox conversion
    // From: https://www.dropbox.com/s/xxxxx/image.jpg?dl=0
    // To: https://www.dropbox.com/s/xxxxx/image.jpg?raw=1
    if (url.includes('dropbox.com')) {
        return url.replace('?dl=0', '?raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }
    
    // OneDrive conversion
    // From: https://1drv.ms/i/s!xxxxx or onedrive.live.com
    // To: Direct embed URL
    if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
        // OneDrive requires embed parameter
        if (url.includes('?')) {
            return url + '&embed=1';
        } else {
            return url + '?embed=1';
        }
    }
    
    // Google Photos - inform user it's not directly supported
    if (url.includes('photos.google.com') || url.includes('photos.app.goo.gl')) {
        showNotification('Google Photos links may not work. Please use Google Drive, Imgur, or ImgBB instead.', 'warning');
    }
    
    // Return original URL if no conversion needed
    return url;
}

// Note: initAdminPage is already called at the top of the file via DOMContentLoaded
// Image Upload Functionality for Admin
function initImageUpload() {
    // Post image upload
    const postImageUpload = document.getElementById('post-image-upload');
    const postImageUrl = document.getElementById('post-image-url');
    const imagePreview = document.getElementById('image-upload-preview');
    const previewImg = document.getElementById('preview-img');
    const removeUpload = document.getElementById('remove-upload');
    
    if (postImageUpload) {
        postImageUpload.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            // Upload to ImgBB
            try {
                const base64 = await fileToBase64(file);
                const uploadData = await uploadToImgBB(base64);
                postImageUrl.value = uploadData.displayUrl;
                postImageUrl.removeAttribute('required');
                
                // Auto-populate download URL
                const downloadUrlField = document.getElementById('post-download-url');
                if (downloadUrlField && uploadData.imageUrl) {
                    downloadUrlField.value = uploadData.imageUrl;
                }
                
                showNotification('Image uploaded successfully!', 'success');
            } catch (error) {
                console.error('Upload error:', error);
                showNotification('Failed to upload image: ' + error.message, 'error');
                imagePreview.style.display = 'none';
            }
        });
    }
    
    if (removeUpload) {
        removeUpload.addEventListener('click', function() {
            postImageUpload.value = '';
            postImageUrl.value = '';
            imagePreview.style.display = 'none';
            postImageUrl.setAttribute('required', '');
        });
    }
    
    // User profile picture upload (in edit user modal)
    const userPicUpload = document.getElementById('edit-user-profile-pic-upload');
    const userPicUrl = document.getElementById('edit-user-profile-pic');
    const userPicPreview = document.getElementById('user-pic-preview');
    const userPreviewImg = document.getElementById('user-preview-img');
    const removeUserUpload = document.getElementById('remove-user-upload');
    
    if (userPicUpload) {
        userPicUpload.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                userPreviewImg.src = e.target.result;
                userPicPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            // Upload to ImgBB
            try {
                const base64 = await fileToBase64(file);
                const uploadData = await uploadToImgBB(base64);
                userPicUrl.value = uploadData.displayUrl;
                showNotification('Profile picture uploaded successfully!', 'success');
            } catch (error) {
                console.error('Upload error:', error);
                showNotification('Failed to upload image: ' + error.message, 'error');
                userPicPreview.style.display = 'none';
            }
        });
    }
    
    if (removeUserUpload) {
        removeUserUpload.addEventListener('click', function() {
            userPicUpload.value = '';
            userPicUrl.value = '';
            userPicPreview.style.display = 'none';
        });
    }
}

// Convert file to base64
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Get base64 string without the data URL prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Upload image to ImgBB
async function uploadToImgBB(base64Image) {
    try {
        const response = await fetch('/api/upload-image.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Upload failed');
        }
        
        // Return full data object with display_url and image URL
        return {
            displayUrl: data.data.display_url,
            imageUrl: data.data.url,
            deleteUrl: data.data.delete_url
        };
    } catch (error) {
        console.error('ImgBB upload error:', error);
        throw error;
    }
}

// Call initImageUpload when modals are opened
document.addEventListener('DOMContentLoaded', function() {
    // Initialize when post form modal is shown
    const postFormModal = document.getElementById('post-form-modal');
    if (postFormModal) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (postFormModal.classList.contains('show')) {
                    initImageUpload();
                }
            });
        });
        observer.observe(postFormModal, { attributes: true, attributeFilter: ['class'] });
    }
    
    // Initialize when edit user modal is shown
    const editUserModal = document.getElementById('edit-user-modal');
    if (editUserModal) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (editUserModal.classList.contains('show')) {
                    initImageUpload();
                }
            });
        });
        observer.observe(editUserModal, { attributes: true, attributeFilter: ['class'] });
    }
});
