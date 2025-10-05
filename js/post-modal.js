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
        const posts = await loadData('posts.json');
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
            showNotification('Post not found', 'error');
            return;
        }
        
        const postDetail = document.getElementById('post-detail');
        if (!postDetail) return;
        
        // Track view when opening post modal
        await trackPostView(postId);
        
        // Load comments for this post
        const comments = await loadPostComments(postId);
        
        // Load user interactions to show correct like/save states
        const likes = currentUser ? await loadData('likes.json') : [];
        const saves = currentUser ? await loadData('saves.json') : [];
        
        const isLiked = currentUser && likes.some(like => like.postId === postId && like.userId === currentUser.id);
        const isSaved = currentUser && saves.some(save => save.postId === postId && save.userId === currentUser.id);
        
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
                    ${post.downloadUrl ? `<button class="action-btn download-btn" data-post-id="${post.id}"><i class="fas fa-download"></i> Download</button>` : ''}
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
        // Don't track views for anonymous users
        if (!currentUser) return;
        
        let views = await loadData('views.json');
        let posts = await loadData('posts.json');
        
        // Check if this user has already viewed this post
        const existingView = views.find(view => view.postId === postId && view.userId === currentUser.id);
        
        if (!existingView) {
            // Add new view record
            views.push({
                id: generateId(),
                postId: postId,
                userId: currentUser.id,
                created: new Date().toISOString()
            });
            
            // Increment view count in post
            const post = posts.find(p => p.id === postId);
            if (post) {
                post.views = (post.views || 0) + 1;
            }
            
            await saveData('views.json', views);
            await saveData('posts.json', posts);
            
            updateModalViewCount(postId);
        }
    } catch (error) {
        console.error('Error tracking post view:', error);
    }
}

// Load comments for a post
async function loadPostComments(postId) {
    try {
        const comments = await loadData('comments.json');
        return comments.filter(comment => comment.postId === postId)
                      .sort((a, b) => new Date(a.created) - new Date(b.created));
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}

// Render comments with likes and replies
async function renderComments(comments) {
    const commentLikes = currentUser ? await loadData('comment-likes.json') : [];
    
    return comments.map(comment => {
        const isLiked = currentUser && commentLikes.some(like => like.commentId === comment.id && like.userId === currentUser.id);
        const likeCount = commentLikes.filter(like => like.commentId === comment.id).length;
        const replies = comments.filter(c => c.replyTo === comment.id);
        
        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${formatDate(comment.created)}</span>
                </div>
                <div class="comment-content">
                    ${comment.replyToUsername ? `<span class="reply-to">@${comment.replyToUsername}</span> ` : ''}
                    ${comment.content}
                </div>
                <div class="comment-actions">
                    ${currentUser ? `
                        <button class="comment-action-btn comment-like-btn ${isLiked ? 'liked' : ''}" onclick="toggleCommentLike('${comment.id}', this)">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> ${likeCount > 0 ? likeCount : ''}
                        </button>
                        <button class="comment-action-btn comment-reply-btn" onclick="showReplyInput('${comment.id}', '${comment.author}')">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                    ` : ''}
                </div>
                <div class="reply-input-container" id="reply-input-${comment.id}" style="display: none;">
                    <textarea class="reply-textarea" placeholder="Write a reply..." id="reply-text-${comment.id}"></textarea>
                    <div class="reply-actions">
                        <button class="btn-secondary" onclick="hideReplyInput('${comment.id}')">Cancel</button>
                        <button class="btn-primary" onclick="submitReply('${comment.id}', '${comment.author}')">Reply</button>
                    </div>
                </div>
                ${replies.length > 0 ? `
                    <div class="comment-replies">
                        ${replies.map(reply => `
                            <div class="comment reply" data-comment-id="${reply.id}">
                                <div class="comment-header">
                                    <span class="comment-author">${reply.author}</span>
                                    <span class="comment-date">${formatDate(reply.created)}</span>
                                </div>
                                <div class="comment-content">
                                    <span class="reply-to">@${reply.replyToUsername}</span> ${reply.content}
                                </div>
                                <div class="comment-actions">
                                    ${currentUser ? `
                                        <button class="comment-action-btn comment-like-btn ${commentLikes.some(like => like.commentId === reply.id && like.userId === currentUser.id) ? 'liked' : ''}" onclick="toggleCommentLike('${reply.id}', this)">
                                            <i class="${commentLikes.some(like => like.commentId === reply.id && like.userId === currentUser.id) ? 'fas' : 'far'} fa-heart"></i> ${commentLikes.filter(like => like.commentId === reply.id).length > 0 ? commentLikes.filter(like => like.commentId === reply.id).length : ''}
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).filter(c => !comments.find(comment => comment.id === comments.find(co => co.id === c.match(/data-comment-id="([^"]+)"/)?.[1])?.replyTo)).join('');
}

// Toggle comment like
async function toggleCommentLike(commentId, button) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    try {
        let commentLikes = await loadData('comment-likes.json');
        const existingLike = commentLikes.find(like => like.commentId === commentId && like.userId === currentUser.id);
        
        if (existingLike) {
            commentLikes = commentLikes.filter(like => !(like.commentId === commentId && like.userId === currentUser.id));
            button.classList.remove('liked');
            button.innerHTML = '<i class="far fa-heart"></i>';
        } else {
            commentLikes.push({
                id: generateId(),
                commentId: commentId,
                userId: currentUser.id,
                created: new Date().toISOString()
            });
            button.classList.add('liked');
            button.innerHTML = '<i class="fas fa-heart"></i> 1';
        }
        
        const likeCount = commentLikes.filter(like => like.commentId === commentId).length;
        if (likeCount > 0) {
            button.innerHTML = `<i class="${existingLike ? 'far' : 'fas'} fa-heart"></i> ${likeCount}`;
        }
        
        await saveData('comment-likes.json', commentLikes);
    } catch (error) {
        console.error('Error toggling comment like:', error);
        showNotification('Error updating like', 'error');
    }
}

// Show reply input
function showReplyInput(commentId, authorUsername) {
    const replyInput = document.getElementById(`reply-input-${commentId}`);
    if (replyInput) {
        replyInput.style.display = 'block';
        document.getElementById(`reply-text-${commentId}`).focus();
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
async function submitReply(commentId, replyToUsername) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    const replyText = document.getElementById(`reply-text-${commentId}`).value.trim();
    
    if (!replyText) {
        showNotification('Please enter a reply', 'warning');
        return;
    }
    
    try {
        let comments = await loadData('comments.json');
        const originalComment = comments.find(c => c.id === commentId);
        
        if (!originalComment) {
            showNotification('Original comment not found', 'error');
            return;
        }
        
        const newReply = {
            id: generateId(),
            postId: originalComment.postId,
            author: currentUser.username,
            content: replyText,
            replyTo: commentId,
            replyToUsername: replyToUsername,
            created: new Date().toISOString()
        };
        
        comments.push(newReply);
        
        // Update post comment count
        let posts = await loadData('posts.json');
        const post = posts.find(p => p.id === originalComment.postId);
        if (post) {
            post.comments = (post.comments || 0) + 1;
        }
        
        await saveData('comments.json', comments);
        await saveData('posts.json', posts);
        
        // Create notification for the original commenter
        if (replyToUsername !== currentUser.username) {
            await createNotification(replyToUsername, commentId, originalComment.postId);
        }
        
        showNotification('Reply posted!', 'success');
        hideReplyInput(commentId);
        
        // Refresh comments display
        const postId = originalComment.postId;
        const updatedComments = await loadPostComments(postId);
        document.getElementById('comments-list').innerHTML = await renderComments(updatedComments);
        updateModalCommentCount(postId);
        
    } catch (error) {
        console.error('Error posting reply:', error);
        showNotification('Error posting reply', 'error');
    }
}

// Create notification
async function createNotification(username, commentId, postId) {
    try {
        let notifications = await loadData('notifications.json');
        
        notifications.push({
            id: generateId(),
            username: username,
            type: 'reply',
            commentId: commentId,
            postId: postId,
            from: currentUser.username,
            read: false,
            created: new Date().toISOString()
        });
        
        await saveData('notifications.json', notifications);
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
        let comments = await loadData('comments.json');
        let posts = await loadData('posts.json');
        
        const newComment = {
            id: generateId(),
            postId: postId,
            author: currentUser.username,
            content: content,
            created: new Date().toISOString()
        };
        
        comments.push(newComment);
        
        // Update post comment count
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments = (post.comments || 0) + 1;
        }
        
        await saveData('comments.json', comments);
        await saveData('posts.json', posts);
        
        // Clear input
        commentInput.value = '';
        
        showNotification('Comment posted!', 'success');
        
        // Add comment to DOM without reloading
        addCommentToDOM(newComment);
        updateModalCommentCount(postId);
        
    } catch (error) {
        console.error('Error posting comment:', error);
        showNotification('Error posting comment', 'error');
    }
}

// Toggle like on post (from modal)
async function togglePostLike(postId, button) {
    try {
        let likes = await loadData('likes.json');
        let posts = await loadData('posts.json');
        
        const existingLike = likes.find(like => like.postId === postId && like.userId === currentUser.id);
        
        if (existingLike) {
            // Remove like
            likes = likes.filter(like => !(like.postId === postId && like.userId === currentUser.id));
            button.innerHTML = '<i class="far fa-heart"></i> Like';
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
            button.innerHTML = '<i class="fas fa-heart"></i> Like';
            button.classList.add('liked');
            
            // Increase like count in posts data
            const post = posts.find(p => p.id === postId);
            if (post) {
                post.likes = (post.likes || 0) + 1;
            }
        }
        
        await saveData('likes.json', likes);
        await saveData('posts.json', posts);
        
        // Update like count in modal
        updateModalLikeCount(postId);
        
        showNotification(existingLike ? 'Post unliked' : 'Post liked!', 'success');
        
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Error updating like', 'error');
    }
}

// Toggle save on post (from modal)
async function togglePostSave(postId, button) {
    try {
        let saves = await loadData('saves.json');
        const existingSave = saves.find(save => save.postId === postId && save.userId === currentUser.id);
        
        if (existingSave) {
            // Remove save
            saves = saves.filter(save => !(save.postId === postId && save.userId === currentUser.id));
            button.innerHTML = '<i class="far fa-bookmark"></i> Save';
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
            button.innerHTML = '<i class="fas fa-bookmark"></i> Save';
            button.classList.add('saved');
            showNotification('Post saved!', 'success');
        }
        
        await saveData('saves.json', saves);
        
    } catch (error) {
        console.error('Error toggling save:', error);
        showNotification('Error updating save', 'error');
    }
}

// Update like count in modal view
async function updateModalLikeCount(postId) {
    try {
        const posts = await loadData('posts.json');
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
        const posts = await loadData('posts.json');
        const post = posts?.find(p => p.id === postId);
        
        if (!post || !post.downloadUrl) {
            showNotification('Download not available for this post', 'warning');
            return;
        }
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = post.downloadUrl;
        link.download = `${post.title}.zip`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Download started!', 'success');
    } catch (error) {
        console.error('Error downloading post:', error);
        showNotification('Error starting download', 'error');
    }
}

// Update view count in modal view
async function updateModalViewCount(postId) {
    try {
        const posts = await loadData('posts.json');
        const post = posts.find(p => p.id === postId);
        const postViews = post ? (post.views || 0) : 0;
        
        const viewCountElement = document.querySelector('#post-detail .post-detail-meta span:nth-child(1)');
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
        const posts = await loadData('posts.json');
        const post = posts.find(p => p.id === postId);
        const postComments = post ? (post.comments || 0) : 0;
        
        const commentCountElement = document.querySelector('#post-detail .post-detail-meta span:nth-child(2)');
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
