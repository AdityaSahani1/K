// Home page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initHomePage();
});

function initHomePage() {
    loadLatestPosts();
    initCategoryNavigation();
    initPostModal();
}

async function loadLatestPosts() {
    try {
        const posts = await loadData('posts.json');
        const postsGrid = document.getElementById('posts-grid');
        
        if (!postsGrid) return;
        
        // Filter for featured posts, sort by date (newest first) and take first 6
        const latestPosts = posts
            .filter(post => post.featured === true)
            .sort((a, b) => new Date(b.created) - new Date(a.created))
            .slice(0, 6);
        
        if (latestPosts.length === 0) {
            postsGrid.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-images"></i>
                    <p>No posts available yet.</p>
                </div>
            `;
            return;
        }
        
        postsGrid.innerHTML = latestPosts.map(post => createPostCard(post)).join('');
        
        // Add event listeners for post interactions
        addPostInteractionListeners();
        
    } catch (error) {
        console.error('Error loading latest posts:', error);
        const postsGrid = document.getElementById('posts-grid');
        if (postsGrid) {
            postsGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading posts. Please try again later.</p>
                </div>
            `;
        }
    }
}

function createPostCard(post) {
    return `
        <article class="post-card" data-post-id="${post.id}">
            <div class="post-image">
                <img src="${post.imageUrl}" alt="${post.title}" loading="lazy">
                <div class="post-overlay"></div>
                <div class="category-badge ${post.category}">${post.category}</div>
                <div class="post-actions">
                    <button class="action-btn like-btn" data-post-id="${post.id}" title="Like">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="action-btn save-btn" data-post-id="${post.id}" title="Save">
                        <i class="far fa-bookmark"></i>
                    </button>
                    <button class="action-btn share-btn" data-post-id="${post.id}" title="Share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
            <div class="post-info">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-description">${post.description}</p>
                <div class="post-meta">
                    <div class="post-stats">
                        <span><i class="far fa-heart"></i> ${post.likes || 0}</span>
                        <span><i class="far fa-comment"></i> ${post.comments || 0}</span>
                        <span><i class="far fa-eye"></i> ${post.views || 0}</span>
                    </div>
                    <div class="post-author">
                        <i class="fas fa-user"></i>
                        <span>${post.author}</span>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function initCategoryNavigation() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            // Navigate to gallery with category filter
            window.location.href = `gallery.php?category=${category}`;
        });
    });
}

function addPostInteractionListeners() {
    // Like button listeners
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!requireAuth()) return;
            
            const postId = this.dataset.postId;
            toggleLike(postId, this);
        });
    });
    
    // Save button listeners
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!requireAuth()) return;
            
            const postId = this.dataset.postId;
            toggleSave(postId, this);
        });
    });
    
    // Share button listeners
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const postId = this.dataset.postId;
            showShareMenu(postId, this);
        });
    });
    
    // Post card click listeners
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking on action buttons
            if (e.target.closest('.post-actions')) return;
            
            const postId = this.dataset.postId;
            openPostDetail(postId);
        });
    });
}

async function toggleLike(postId, button) {
    try {
        let likes = await loadData('likes.json');
        let posts = await loadData('posts.json');
        
        const existingLike = likes.find(like => like.postId === postId && like.userId === currentUser.id);
        
        if (existingLike) {
            // Remove like
            likes = likes.filter(like => !(like.postId === postId && like.userId === currentUser.id));
            button.innerHTML = '<i class="far fa-heart"></i>';
            button.classList.remove('liked');
            
            // Decrease like count in posts data
            const post = posts.find(p => p.id === postId);
            if (post && post.likes > 0) {
                post.likes = (post.likes || 0) - 1;
            }
        } else {
            // Add like
            likes.push({
                id: generateId(),
                postId: postId,
                userId: currentUser.id,
                created: new Date().toISOString()
            });
            button.innerHTML = '<i class="fas fa-heart"></i>';
            button.classList.add('liked');
            
            // Increase like count in posts data
            const post = posts.find(p => p.id === postId);
            if (post) {
                post.likes = (post.likes || 0) + 1;
            }
        }
        
        await saveData('likes.json', likes);
        await saveData('posts.json', posts);
        
        // Update post like count in UI
        updatePostLikeCount(postId);
        
        showNotification(existingLike ? 'Post unliked' : 'Post liked!', 'success');
        
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Error updating like', 'error');
    }
}

async function toggleSave(postId, button) {
    try {
        let saves = await loadData('saves.json');
        const existingSave = saves.find(save => save.postId === postId && save.userId === currentUser.id);
        
        if (existingSave) {
            // Remove save
            saves = saves.filter(save => !(save.postId === postId && save.userId === currentUser.id));
            button.innerHTML = '<i class="far fa-bookmark"></i>';
            button.classList.remove('saved');
            showNotification('Post removed from saved', 'success');
        } else {
            // Add save
            saves.push({
                id: generateId(),
                postId: postId,
                userId: currentUser.id,
                created: new Date().toISOString()
            });
            button.innerHTML = '<i class="fas fa-bookmark"></i>';
            button.classList.add('saved');
            showNotification('Post saved!', 'success');
        }
        
        await saveData('saves.json', saves);
        
    } catch (error) {
        console.error('Error toggling save:', error);
        showNotification('Error updating save', 'error');
    }
}


async function updatePostLikeCount(postId) {
    try {
        const likes = await loadData('likes.json');
        const posts = await loadData('posts.json');
        const post = posts.find(p => p.id === postId);
        const postLikes = post ? (post.likes || 0) : 0;
        
        // Update like count in post meta - more robust selector
        const likeCountElements = document.querySelectorAll(`[data-post-id="${postId}"] .post-meta span:first-child, [data-post-id="${postId}"] .post-stats span:first-child`);
        likeCountElements.forEach(element => {
            element.innerHTML = `<i class="far fa-heart"></i> ${postLikes}`;
        });
    } catch (error) {
        console.error('Error updating post like count:', error);
    }
}

async function openPostDetail(postId) {
    // Open post modal directly (view tracking handled inside openPostModal)
    await openPostModal(postId);
}

// trackPostView now handled by post-modal.js

// Load user's liked and saved posts status
async function loadUserInteractions() {
    if (!currentUser) return;
    
    try {
        const likes = await loadData('likes.json');
        const saves = await loadData('saves.json');
        
        // Update like buttons
        likes.forEach(like => {
            if (like.userId === currentUser.id) {
                const likeBtn = document.querySelector(`[data-post-id="${like.postId}"].like-btn`);
                if (likeBtn) {
                    likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
                    likeBtn.classList.add('liked');
                }
            }
        });
        
        // Update save buttons
        saves.forEach(save => {
            if (save.userId === currentUser.id) {
                const saveBtn = document.querySelector(`[data-post-id="${save.postId}"].save-btn`);
                if (saveBtn) {
                    saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
                    saveBtn.classList.add('saved');
                }
            }
        });
    } catch (error) {
        console.error('Error loading user interactions:', error);
    }
}

// Call this after loading posts and when user logs in
setTimeout(loadUserInteractions, 500);

// Post modal functions now handled by post-modal.js