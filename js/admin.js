// Admin page JavaScript

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
        const posts = await loadData('posts.json');
        
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
        // Use consistent data loading
        const posts = await loadData('posts.json');
        const users = await loadData('users.json');
        const likes = await loadData('likes.json');
        const comments = await loadData('comments.json');
        const saves = await loadData('saves.json');
        
        // Calculate totals
        const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
        const totalComments = comments.length;
        const totalSaves = saves.length;
        
        // Update analytics display
        const likesEl = document.getElementById('total-likes');
        const commentsEl = document.getElementById('total-comments');
        const savesEl = document.getElementById('total-saves');
        
        if (viewsEl) viewsEl.textContent = totalViews;
        if (likesEl) likesEl.textContent = totalLikes;
        if (commentsEl) commentsEl.textContent = totalComments;
        if (savesEl) savesEl.textContent = totalSaves;
        
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
        const posts = await loadData('posts.json');
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
            showNotification('Post not found', 'error');
            return;
        }
        
        // Populate form with post data
        document.getElementById('post-form-title').textContent = 'Edit Post';
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-image-url').value = post.imageUrl;
        document.getElementById('post-description').value = post.description || '';
        document.getElementById('post-tags').value = post.tags.join(', ');
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
        let posts = await loadData('posts.json');
        posts = posts.filter(post => post.id !== postId);
        await saveData('posts.json', posts);
        
        // Also remove related likes, comments, saves
        let likes = await loadData('likes.json');
        likes = likes.filter(like => like.postId !== postId);
        await saveData('likes.json', likes);
        
        let comments = await loadData('comments.json');
        comments = comments.filter(comment => comment.postId !== postId);
        await saveData('comments.json', comments);
        
        let saves = await loadData('saves.json');
        saves = saves.filter(save => save.postId !== postId);
        await saveData('saves.json', saves);
        
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
    const imageUrl = document.getElementById('post-image-url').value.trim();
    const description = document.getElementById('post-description').value.trim();
    const tags = document.getElementById('post-tags').value.trim();
    const downloadUrl = document.getElementById('post-download-url').value.trim();
    const featured = document.getElementById('post-featured').checked;
    
    // Validation
    if (!title || !category || !imageUrl) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        let posts = await loadData('posts.json');
        
        const postData = {
            title,
            category,
            imageUrl,
            description,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            downloadUrl: downloadUrl || null,
            featured,
            author: currentUser.username
        };
        
        if (mode === 'add') {
            // Add new post
            postData.id = generateId();
            postData.created = new Date().toISOString();
            postData.likes = 0;
            postData.comments = 0;
            postData.views = 0;
            
            posts.push(postData);
            showNotification('Post created successfully!', 'success');
            
        } else if (mode === 'edit') {
            // Edit existing post
            const postIndex = posts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                posts[postIndex] = { ...posts[postIndex], ...postData };
                showNotification('Post updated successfully!', 'success');
            } else {
                throw new Error('Post not found');
            }
        }
        
        // Save data consistently
        await saveData('posts.json', posts);
        
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
        const users = await loadData('users.json');
        
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: var(--spacing-2xl);">
                        <i class="fas fa-users" style="font-size: 2rem; color: var(--text-muted); margin-bottom: var(--spacing-md);"></i>
                        <p>No users found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = users.map(user => `
            <tr data-user-id="${user.id}">
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
        `).join('');
        
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
        const users = await loadData('users.json');
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            showNotification('User not found', 'error');
            return;
        }
        
        const newUsername = prompt('Enter new username:', user.username);
        if (newUsername === null) return;
        
        const newEmail = prompt('Enter new email:', user.email);
        if (newEmail === null) return;
        
        const newRole = user.role === 'admin' ? 'admin' : prompt('Enter role (user/admin):', user.role || 'user');
        if (newRole === null) return;
        
        const newBio = prompt('Enter bio:', user.bio || '');
        if (newBio === null) return;
        
        const newPassword = prompt('Enter new password (leave empty to keep current):', '');
        if (newPassword === null) return;
        
        const newIsVerified = confirm('Is this user verified?') ? true : false;
        
        const newAccountLocked = confirm('Lock this account?') ? true : false;
        
        if (!newUsername.trim() || !newEmail.trim()) {
            showNotification('Username and email cannot be empty', 'error');
            return;
        }
        
        if (newRole !== 'user' && newRole !== 'admin') {
            showNotification('Role must be either "user" or "admin"', 'error');
            return;
        }
        
        // Prepare updates object
        const updates = {
            username: newUsername.trim(),
            email: newEmail.trim(),
            role: newRole,
            bio: newBio.trim(),
            isVerified: newIsVerified,
            accountLocked: newAccountLocked,
            loginAttempts: newAccountLocked ? user.loginAttempts || 0 : 0
        };
        
        // Only include password if a new one was provided
        if (newPassword.trim()) {
            updates.password = hashPassword(newPassword.trim());
        }
        
        // Get session token from localStorage
        const sessionToken = localStorage.getItem('sessionToken');
        
        if (!sessionToken) {
            showNotification('Session expired. Please login again.', 'error');
            window.location.href = 'index.php';
            return;
        }
        
        // Call secure API endpoint for updating user
        const response = await fetch('/api/admin/update-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionToken: sessionToken,
                userId: userId,
                updates: updates
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update user');
        }
        
        // Update local user object
        Object.assign(user, updates);
        
        showNotification('User updated successfully', 'success');
        loadUsersTable();
        
    } catch (error) {
        console.error('Error editing user:', error);
        showNotification('Error editing user', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        let users = await loadData('users.json');
        const userToDelete = users.find(u => u.id === userId);
        
        if (!userToDelete) {
            showNotification('User not found', 'error');
            return;
        }
        
        if (userToDelete.role === 'admin') {
            showNotification('Cannot delete admin users', 'error');
            return;
        }
        
        users = users.filter(user => user.id !== userId);
        await saveData('users.json', users);
        
        showNotification('User deleted successfully', 'success');
        loadUsersTable();
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user', 'error');
    }
}

// Note: initAdminPage is already called at the top of the file via DOMContentLoaded