/**
 * Post Modal - Reusable Component
 * Handles post detail view, comments, likes, saves, and shares
 */

// Initialize post modal
function initPostModal() {
    const postModal = document.getElementById('post-modal');
    
    if (postModal) {
        postModal.addEventListener('click', function(e) {
            if (e.target === postModal) {
                hideModal('post-modal');
            }
        });
    }
}

// Open post modal with post details
async function openPostModal(postId) {
    try {
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        
        const posts = await response.json();
        
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
        
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
            showNotification('Post not found', 'error');
            return;
        }
        
        const postDetail = document.getElementById('post-detail');
        if (!postDetail) return;
        
        // Store post ID in modal for later use
        const postModal = document.getElementById('post-modal');
        if (postModal) {
            postModal.dataset.currentPostId = postId;
        }
        
        // Track view when opening post modal
        await trackPostView(postId);
        
        // Load comments for this post
        const comments = await loadPostComments(postId);
        
        // Load user interactions to show correct like/save states
        let isLiked = false;
        let isSaved = false;
        
        if (currentUser) {
            const userData = await getUserData(currentUser.id, 'all');
            const likes = userData.likes || [];
            const saves = userData.saves || [];
            isLiked = likes.some(like => like.postId === postId);
            isSaved = saves.some(save => save.postId === postId);
        }
        
        postDetail.innerHTML = `
            <button class="post-modal-close" onclick="hideModal('post-modal')" title="Close">
                <i class="fas fa-times"></i>
            </button>
            <div class="post-detail-image">
                <img src="${post.imageUrl}" alt="${post.title}">
            </div>
            <div class="post-detail-info">
                <h2 class="post-detail-title">${post.title}</h2>
                <div class="post-detail-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(post.created)}</span>
                    <span><i class="fas fa-tag"></i> ${post.category}</span>
                    <span><i class="far fa-heart"></i> ${post.likes || 0}</span>
                    <span><i class="far fa-comment"></i> ${post.comments || 0}</span>
                    <span><i class="far fa-eye"></i> ${post.views || 0}</span>
                </div>
                
                <div class="post-detail-description">
                    <p>${post.description}</p>
                </div>
                
                <div class="post-tags">
                    ${post.tags.map(tag => `<a href="#" class="tag">#${tag}</a>`).join('')}
                </div>
                
                <div class="post-actions-bar">
                    <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                        <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> Like
                    </button>
                    <button class="action-btn save-btn ${isSaved ? 'saved' : ''}" data-post-id="${post.id}">
                        <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i> Save
                    </button>
                    <button class="action-btn share-btn" data-post-id="${post.id}">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                    ${post.downloadUrl && post.downloadUrl.trim() !== '' ? `<button class="action-btn download-btn" data-post-id="${post.id}"><i class="fas fa-download"></i> Download</button>` : ''}
                </div>
                
                <div class="comments-section">
                    <h3 class="comments-title">Comments (${comments.length})</h3>
                    
                    ${currentUser ? `
                        <div class="comment-form">
                            <textarea id="comment-input" placeholder="Write a comment..."></textarea>
                            <button onclick="submitPostComment('${post.id}')">Post Comment</button>
                        </div>
                    ` : `
                        <div class="comment-form">
                            <p>Please <a href="#" onclick="showAuthModal()">login</a> to comment.</p>
                        </div>
                    `}
                    
                    <div class="comments-list" id="comments-list">
                        ${comments.length > 0 ? await renderComments(comments) : '<p style="color: var(--text-muted); text-align: center; padding: var(--spacing-lg);">No comments yet. Be the first to comment!</p>'}
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for modal actions
        addPostModalInteractionListeners();
        
        showModal('post-modal');
        
        // Check if we need to scroll to a specific comment (from profile page)
        const scrollToCommentId = sessionStorage.getItem('scrollToCommentId');
        if (scrollToCommentId) {
            // Wait for modal animation to complete before scrolling
            setTimeout(() => {
                scrollToComment(scrollToCommentId);
                sessionStorage.removeItem('scrollToCommentId');
            }, 300);
        }
        
    } catch (error) {
        console.error('Error opening post modal:', error);
        showNotification('Error loading post details', 'error');
    }
}

// Scroll to a specific comment
function scrollToComment(commentId) {
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (commentElement) {
        const commentsSection = document.querySelector('.comments-section');
        if (commentsSection) {
            // Scroll the modal to the comment
            commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the comment temporarily
            commentElement.style.backgroundColor = 'var(--accent-primary-light, rgba(59, 130, 246, 0.1))';
            setTimeout(() => {
                commentElement.style.backgroundColor = '';
            }, 2000);
        }
    }
}

// Add interaction listeners for modal actions
function addPostModalInteractionListeners() {
    // Like button
    const likeBtn = document.querySelector('#post-modal .like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!requireAuth()) return;
            const postId = this.dataset.postId;
            togglePostLike(postId, this);
        });
    }
    
    // Save button
    const saveBtn = document.querySelector('#post-modal .save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!requireAuth()) return;
            const postId = this.dataset.postId;
            togglePostSave(postId, this);
        });
    }
    
    // Share button
    const shareBtn = document.querySelector('#post-modal .share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.dataset.postId;
            showShareMenu(postId, this);
        });
    }
    
    // Download button
    const downloadBtn = document.querySelector('#post-modal .download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.dataset.postId;
            downloadPost(postId);
        });
    }
}

// Track post view
async function trackPostView(postId) {
    try {
        if (!currentUser) return;
        
        await fetch('/api/post-actions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'view',
                postId: postId,
                userId: currentUser.id
            })
        });
        
        // Update local post view count
        updateModalViewCount(postId);
    } catch (error) {
        console.error('Error tracking post view:', error);
    }
}

// Load comments for a post
async function loadPostComments(postId) {
    try {
        return await getPostComments(postId);
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}

// Render comments with likes and replies (only 2 levels: parent and direct replies)
async function renderComments(comments) {
    const parentComments = comments.filter(comment => !comment.replyTo);
    
    function renderReply(reply) {
        const isLiked = reply.isLiked || false;
        
        return `
            <div class="comment reply" data-comment-id="${reply.id}">
                <div class="comment-header">
                    <div class="comment-meta">
                        <div class="comment-avatar">
                            ${reply.profilePicture ? 
                                `<img src="${reply.profilePicture}" alt="${reply.username || 'User'}">` : 
                                `<i class="fas fa-user"></i>`
                            }
                        </div>
                        <span class="comment-author">${reply.username || 'anonymous'}</span>
                        <span class="comment-date">${formatDate(reply.created)}</span>
                    </div>
                    ${currentUser ? `
                        <button class="comment-action-btn comment-like-btn ${isLiked ? 'liked' : ''}" onclick="toggleCommentLike('${reply.id}', this)">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> ${reply.likes > 0 ? reply.likes : ''}
                        </button>
                    ` : ''}
                </div>
                <div class="comment-content">
                    ${reply.replyToUsername ? `<span class="reply-to">@${reply.replyToUsername}</span> ` : ''}
                    ${reply.text || reply.content || ''}
                </div>
                <div class="comment-actions">
                    ${currentUser ? `
                        <button class="comment-action-btn comment-reply-btn" onclick="showReplyInput('${reply.id}', '${reply.username || 'user'}', '${reply.userId}')">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                        ${(currentUser.id === reply.userId || currentUser.role === 'admin') ? `
                            <button class="comment-action-btn comment-delete-btn" onclick="deleteComment('${reply.id}', this)">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : ''}
                    ` : ''}
                </div>
                <div class="reply-input-container" id="reply-input-${reply.id}" style="display: none;">
                    <textarea class="reply-textarea" placeholder="Write a reply..." id="reply-text-${reply.id}"></textarea>
                    <div class="reply-actions">
                        <button class="btn-secondary" onclick="hideReplyInput('${reply.id}')">Cancel</button>
                        <button class="btn-primary" onclick="submitReply('${reply.id}', '${reply.username || 'user'}', '${reply.userId}')">Reply</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function renderParentComment(comment) {
        const isLiked = comment.isLiked || false;
        const allReplies = comments.filter(c => c.replyTo === comment.id || 
            comments.some(parent => parent.id === c.replyTo && parent.replyTo === comment.id));
        
        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-meta">
                        <div class="comment-avatar">
                            ${comment.profilePicture ? 
                                `<img src="${comment.profilePicture}" alt="${comment.username || 'User'}">` : 
                                `<i class="fas fa-user"></i>`
                            }
                        </div>
                        <span class="comment-author">${comment.username || 'anonymous'}</span>
                        <span class="comment-date">${formatDate(comment.created)}</span>
                    </div>
                    ${currentUser ? `
                        <button class="comment-action-btn comment-like-btn ${isLiked ? 'liked' : ''}" onclick="toggleCommentLike('${comment.id}', this)">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> ${comment.likes > 0 ? comment.likes : ''}
                        </button>
                    ` : ''}
                </div>
                <div class="comment-content">
                    ${comment.text || comment.content || ''}
                </div>
                <div class="comment-actions">
                    ${currentUser ? `
                        <button class="comment-action-btn comment-reply-btn" onclick="showReplyInput('${comment.id}', '${comment.username || 'user'}', '${comment.userId}')">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                        ${(currentUser.id === comment.userId || currentUser.role === 'admin') ? `
                            <button class="comment-action-btn comment-delete-btn" onclick="deleteComment('${comment.id}', this)">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : ''}
                    ` : ''}
                </div>
                <div class="reply-input-container" id="reply-input-${comment.id}" style="display: none;">
                    <textarea class="reply-textarea" placeholder="Write a reply..." id="reply-text-${comment.id}"></textarea>
                    <div class="reply-actions">
                        <button class="btn-secondary" onclick="hideReplyInput('${comment.id}')">Cancel</button>
                        <button class="btn-primary" onclick="submitReply('${comment.id}', '${comment.username || 'user'}', '${comment.userId}')">Reply</button>
                    </div>
                </div>
                ${allReplies.length > 0 ? `
                    <div class="comment-replies">
                        ${allReplies.map(reply => renderReply(reply)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    return parentComments.map(comment => renderParentComment(comment)).join('');
}

// Toggle comment like
async function toggleCommentLike(commentId, button) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    try {
        const response = await fetch('/api/post-actions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'comment_like',
                commentId: commentId,
                userId: currentUser.id
            })
        });
        
        if (!response.ok) throw new Error('Failed to toggle comment like');
        
        const data = await response.json();
        
        if (data.status === 'success') {
            if (data.action === 'liked') {
                button.classList.add('liked');
                button.innerHTML = `<i class="fas fa-heart"></i> ${data.likes > 0 ? data.likes : ''}`;
            } else {
                button.classList.remove('liked');
                button.innerHTML = `<i class="far fa-heart"></i> ${data.likes > 0 ? data.likes : ''}`;
            }
        } else {
            showNotification(data.error || 'Error updating like', 'error');
        }
    } catch (error) {
        console.error('Error toggling comment like:', error);
        showNotification('Error updating like', 'error');
    }
}

// Show reply input
function showReplyInput(commentId, authorUsername, authorUserId) {
    const replyInput = document.getElementById(`reply-input-${commentId}`);
    if (replyInput) {
        replyInput.style.display = 'block';
        const textarea = document.getElementById(`reply-text-${commentId}`);
        if (textarea) {
            textarea.focus();
            textarea.dataset.replyToUserId = authorUserId;
        }
    }
}

// Hide reply input
function hideReplyInput(commentId) {
    const replyInput = document.getElementById(`reply-input-${commentId}`);
    if (replyInput) {
        replyInput.style.display = 'none';
        document.getElementById(`reply-text-${commentId}`).value = '';
    }
}

// Submit reply
async function submitReply(commentId, replyToUsername, replyToUserId) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    const textarea = document.getElementById(`reply-text-${commentId}`);
    const replyText = textarea.value.trim();
    
    if (!replyText) {
        showNotification('Please enter a reply', 'warning');
        return;
    }
    
    try {
        // Get the current post ID from the modal
        const postModal = document.getElementById('post-modal');
        const postId = postModal.dataset.currentPostId;
        
        if (!postId) {
            showNotification('Error: Post ID not found', 'error');
            return;
        }
        
        const response = await fetch('/api/post-actions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'comment_reply',
                postId: postId,
                userId: currentUser.id,
                text: replyText,
                replyTo: commentId,
                replyToUsername: replyToUsername,
                replyToUserId: replyToUserId
            })
        });
        
        if (!response.ok) throw new Error('Failed to post reply');
        
        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification('Reply posted successfully', 'success');
            hideReplyInput(commentId);
            // Reload comments to show the new reply
            const comments = await loadPostComments(postId);
            const commentsList = document.getElementById('comments-list');
            if (commentsList) {
                commentsList.innerHTML = await renderComments(comments);
            }
        }
    } catch (error) {
        console.error('Error posting reply:', error);
        showNotification('Error posting reply', 'error');
    }
}

// Create notification
async function createNotification(username, commentId, postId) {
    try {
        console.log('Notification created for:', username);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

// Submit comment (unified function name)
async function submitPostComment(postId) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    const commentInput = document.getElementById('comment-input');
    const content = commentInput.value.trim();
    
    if (!content) {
        showNotification('Please enter a comment', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/post-actions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'comment',
                postId: postId,
                userId: currentUser.id,
                text: content
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            commentInput.value = '';
            showNotification('Comment posted!', 'success');
            
            // Refresh comments display
            const updatedComments = await getPostComments(postId);
            document.getElementById('comments-list').innerHTML = await renderComments(updatedComments);
            updateModalCommentCount(postId);
        } else {
            showNotification(data.error || 'Error posting comment', 'error');
        }
    } catch (error) {
        console.error('Error posting comment:', error);
        showNotification('Error posting comment', 'error');
    }
}

// Delete comment
async function deleteComment(commentId, button) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    const postId = document.getElementById('post-modal').dataset.postId;
    
    try {
        const response = await fetch('/api/post-actions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete_comment',
                commentId: commentId,
                userId: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification('Comment deleted', 'success');
            
            // Remove comment from UI
            const commentElement = button.closest('.comment');
            if (commentElement) {
                commentElement.remove();
            }
            
            // Update comment count
            updateModalCommentCount(postId);
        } else {
            showNotification(data.error || 'Error deleting comment', 'error');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        showNotification('Error deleting comment', 'error');
    }
}

// Toggle like on post (from modal)
async function togglePostLike(postId, button) {
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
                button.innerHTML = '<i class="fas fa-heart"></i> Like';
                button.classList.add('liked');
            } else {
                button.innerHTML = '<i class="far fa-heart"></i> Like';
                button.classList.remove('liked');
            }
            
            // Update like count in modal
            updateModalLikeCount(postId);
            showNotification(data.action === 'liked' ? 'Post liked!' : 'Post unliked', 'success');
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Error updating like', 'error');
    }
}

// Toggle save on post (from modal)
async function togglePostSave(postId, button) {
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
                button.innerHTML = '<i class="fas fa-bookmark"></i> Save';
                button.classList.add('saved');
                showNotification('Post saved!', 'success');
            } else {
                button.innerHTML = '<i class="far fa-bookmark"></i> Save';
                button.classList.remove('saved');
                showNotification('Post removed from saved', 'success');
            }
        }
    } catch (error) {
        console.error('Error toggling save:', error);
        showNotification('Error updating save', 'error');
    }
}

// Update like count in modal view
async function updateModalLikeCount(postId) {
    try {
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();
        const post = posts.find(p => p.id === postId);
        const postLikes = post ? (post.likes || 0) : 0;
        
        // Update like count in modal meta
        const likeCountElement = document.querySelector('#post-detail .post-detail-meta span:nth-child(3)');
        if (likeCountElement && likeCountElement.innerHTML.includes('fa-heart')) {
            likeCountElement.innerHTML = `<i class="far fa-heart"></i> ${postLikes}`;
        }
    } catch (error) {
        console.error('Error updating modal like count:', error);
    }
}

// Download post
async function downloadPost(postId) {
    try {
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();
        const post = posts?.find(p => p.id === postId);
        
        if (!post || !post.downloadUrl || post.downloadUrl.trim() === '') {
            showNotification('Download not available for this post', 'warning');
            return;
        }
        
        showNotification('Preparing download...', 'info');
        
        try {
            // Fetch the image as a blob to force download
            const imgResponse = await fetch(post.downloadUrl);
            if (!imgResponse.ok) throw new Error('Failed to fetch image');
            
            const blob = await imgResponse.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            
            // Extract file extension from URL or use default
            const urlPath = post.downloadUrl.split('?')[0];
            const extension = urlPath.substring(urlPath.lastIndexOf('.')) || '.jpg';
            link.download = `${post.title}${extension}`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the blob URL
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            
            showNotification('Download started!', 'success');
        } catch (fetchError) {
            // Fallback: open in new tab if fetch fails (e.g., CORS issues)
            console.warn('Fetch failed, falling back to new tab:', fetchError);
            window.open(post.downloadUrl, '_blank');
            showNotification('Opening image in new tab...', 'info');
        }
    } catch (error) {
        console.error('Error downloading post:', error);
        showNotification('Error starting download', 'error');
    }
}

// Update view count in modal view
async function updateModalViewCount(postId) {
    try {
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();
        const post = posts.find(p => p.id === postId);
        const postViews = post ? (post.views || 0) : 0;
        
        const viewCountElement = document.querySelector('#post-detail .post-detail-meta span:nth-child(5)');
        if (viewCountElement && viewCountElement.innerHTML.includes('fa-eye')) {
            viewCountElement.innerHTML = `<i class="far fa-eye"></i> ${postViews}`;
        }
    } catch (error) {
        console.error('Error updating modal view count:', error);
    }
}

// Update comment count in modal view
async function updateModalCommentCount(postId) {
    try {
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();
        const post = posts.find(p => p.id === postId);
        const postComments = post ? (post.comments || 0) : 0;
        
        const commentCountElement = document.querySelector('#post-detail .post-detail-meta span:nth-child(4)');
        if (commentCountElement && commentCountElement.innerHTML.includes('fa-comment')) {
            commentCountElement.innerHTML = `<i class="far fa-comment"></i> ${postComments}`;
        }
    } catch (error) {
        console.error('Error updating modal comment count:', error);
    }
}

// Add comment to DOM without reloading
function addCommentToDOM(comment) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    const commentHTML = `
        <div class="comment">
            <div class="comment-author">
                <i class="fas fa-user-circle"></i>
                <span>${comment.author}</span>
            </div>
            <p class="comment-content">${comment.content}</p>
            <div class="comment-date">${formatDate(comment.created)}</div>
        </div>
    `;
    
    commentsList.insertAdjacentHTML('beforeend', commentHTML);
    
    commentsList.scrollTop = commentsList.scrollHeight;
}

// Backwards compatibility aliases for existing code
// These ensure the modal works with both gallery.js and home.js
function addComment(postId) {
    submitPostComment(postId);
}

function submitComment(postId) {
    submitPostComment(postId);
}

function addModalActionListeners() {
    addPostModalInteractionListeners();
}
