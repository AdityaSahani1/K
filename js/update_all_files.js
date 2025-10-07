const fs = require('fs');

console.log('Starting comprehensive file updates...');

// ==================== GALLERY.JS ====================
let gallery = fs.readFileSync('gallery.js', 'utf8');

// Update toggleLikeFromMenu
gallery = gallery.replace(
    /\/\/ Toggle like from menu \(when like button not visible\)\nasync function toggleLikeFromMenu\(postId\) \{[\s\S]*?await saveData\('likes\.json', likes\);[\s\S]*?\n\}/m,
    `// Toggle like from menu (when like button not visible)
async function toggleLikeFromMenu(postId) {
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
            const postIndex = allPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                allPosts[postIndex].likes = data.likes;
            }
            
            showNotification(data.action === 'liked' ? 'Post liked!' : 'Like removed', 'success');
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Error updating like', 'error');
    }
}`
);

// Update toggleSaveFromMenu
gallery = gallery.replace(
    /\/\/ Toggle save from menu \(when save button not visible\)\nasync function toggleSaveFromMenu\(postId\) \{[\s\S]*?await saveData\('saves\.json', saves\);[\s\S]*?\n\}/m,
    `// Toggle save from menu (when save button not visible)
async function toggleSaveFromMenu(postId) {
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
            showNotification(data.action === 'saved' ? 'Post saved!' : 'Post removed from saved', 'success');
        }
    } catch (error) {
        console.error('Error toggling save:', error);
        showNotification('Error updating save', 'error');
    }
}`
);

fs.writeFileSync('gallery.js', gallery);
console.log('✓ gallery.js updated');

// ==================== POST-MODAL.JS ====================
let postModal = fs.readFileSync('post-modal.js', 'utf8');

// Update openPostModal - replace the likes/saves loading section
postModal = postModal.replace(
    /\/\/ Load user interactions to show correct like\/save states\n        const likes = currentUser \? await loadData\('likes\.json'\) : \[\];\n        const saves = currentUser \? await loadData\('saves\.json'\) : \[\];\n        \n        const isLiked = currentUser && likes\.some\(like => like\.postId === postId && like\.userId === currentUser\.id\);\n        const isSaved = currentUser && saves\.some\(save => save\.postId === postId && save\.userId === currentUser\.id\);/,
    `// Load user interactions to show correct like/save states
        let isLiked = false;
        let isSaved = false;
        
        if (currentUser) {
            const userData = await getUserData(currentUser.id, 'all');
            const likes = userData.likes || [];
            const saves = userData.saves || [];
            isLiked = likes.some(like => like.postId === postId);
            isSaved = saves.some(save => save.postId === postId);
        }`
);

// Update loadPostComments to use getPostComments
postModal = postModal.replace(
    /\/\/ Load comments for a post\nasync function loadPostComments\(postId\) \{[\s\S]*?\n\}/m,
    `// Load comments for a post
async function loadPostComments(postId) {
    try {
        return await getPostComments(postId);
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}`
);

// Update trackPostView
postModal = postModal.replace(
    /\/\/ Track post view\nasync function trackPostView\(postId\) \{[\s\S]*?await saveData\('views\.json', views\);[\s\S]*?await saveData\('posts\.json', posts\);[\s\S]*?\n\}/m,
    `// Track post view
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
}`
);

// Update submitPostComment
postModal = postModal.replace(
    /\/\/ Submit comment \(unified function name\)\nasync function submitPostComment\(postId\) \{[\s\S]*?await saveData\('comments\.json', comments\);[\s\S]*?await saveData\('posts\.json', posts\);[\s\S]*?\n        \/\/ Refresh comments display[\s\S]*?\n\}/m,
    `// Submit comment (unified function name)
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
}`
);

// Update togglePostLike
postModal = postModal.replace(
    /\/\/ Toggle like on post \(from modal\)\nasync function togglePostLike\(postId, button\) \{[\s\S]*?await saveData\('likes\.json', likes\);[\s\S]*?await saveData\('posts\.json', posts\);[\s\S]*?\n\}/m,
    `// Toggle like on post (from modal)
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
}`
);

// Update togglePostSave
postModal = postModal.replace(
    /\/\/ Toggle save on post \(from modal\)\nasync function togglePostSave\(postId, button\) \{[\s\S]*?await saveData\('saves\.json', saves\);[\s\S]*?\n\}/m,
    `// Toggle save on post (from modal)
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
}`
);

fs.writeFileSync('post-modal.js', postModal);
console.log('✓ post-modal.js updated');

// ==================== PROFILE.JS ====================
let profile = fs.readFileSync('profile.js', 'utf8');

// Update loadUserStats
profile = profile.replace(
    /async function loadUserStats\(\) \{[\s\S]*?const likes = await loadData\('likes\.json'\);[\s\S]*?const saves = await loadData\('saves\.json'\);[\s\S]*?const comments = await loadData\('comments\.json'\);[\s\S]*?const posts = await loadData\('posts\.json'\);[\s\S]*?\/\/ Count user's interactions[\s\S]*?const userLikes = likes\.filter\(like => like\.userId === currentUser\.id\);[\s\S]*?const userSaves = saves\.filter\(save => save\.userId === currentUser\.id\);[\s\S]*?const userComments = comments\.filter\(comment => comment\.author === currentUser\.username\);/,
    `async function loadUserStats() {
    try {
        const userData = await getUserData(currentUser.id, 'all');
        const likes = userData.likes || [];
        const saves = userData.saves || [];
        const comments = userData.comments || [];
        const posts = await loadData('posts.json');
        
        // Count user's interactions`
);

// Update loadLikedPosts
profile = profile.replace(
    /async function loadLikedPosts\(\) \{[\s\S]*?const likes = await loadData\('likes\.json'\);[\s\S]*?const posts = await loadData\('posts\.json'\);[\s\S]*?\/\/ Get posts that the user has liked[\s\S]*?const userLikes = likes\.filter\(like => like\.userId === currentUser\.id\);[\s\S]*?const likedPosts = posts\.filter\(post =>/,
    `async function loadLikedPosts() {
    const container = document.getElementById('liked-posts');
    if (!container) return;
    
    try {
        const userData = await getUserData(currentUser.id, 'all');
        const likes = userData.likes || [];
        const posts = await loadData('posts.json');
        
        // Get posts that the user has liked
        const likedPosts = posts.filter(post =>`
);

// Update loadSavedPosts
profile = profile.replace(
    /async function loadSavedPosts\(\) \{[\s\S]*?const saves = await loadData\('saves\.json'\);[\s\S]*?const posts = await loadData\('posts\.json'\);[\s\S]*?\/\/ Get posts that the user has saved[\s\S]*?const userSaves = saves\.filter\(save => save\.userId === currentUser\.id\);[\s\S]*?const savedPosts = posts\.filter\(post =>/,
    `async function loadSavedPosts() {
    const container = document.getElementById('saved-posts');
    if (!container) return;
    
    try {
        const userData = await getUserData(currentUser.id, 'all');
        const saves = userData.saves || [];
        const posts = await loadData('posts.json');
        
        // Get posts that the user has saved
        const savedPosts = posts.filter(post =>`
);

// Update loadUserComments
profile = profile.replace(
    /async function loadUserComments\(\) \{[\s\S]*?const comments = await loadData\('comments\.json'\);[\s\S]*?const posts = await loadData\('posts\.json'\);[\s\S]*?\/\/ Get all comments and replies by the current user[\s\S]*?const userComments = comments\.filter\(comment => comment\.author === currentUser\.username\);/,
    `async function loadUserComments() {
    const container = document.getElementById('user-comments');
    if (!container) return;
    
    try {
        const userData = await getUserData(currentUser.id, 'all');
        const comments = userData.comments || [];
        const posts = await loadData('posts.json');`
);

fs.writeFileSync('profile.js', profile);
console.log('✓ profile.js updated');

console.log('\n✅ All files updated successfully!');
