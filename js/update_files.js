const fs = require('fs');

// Restore backups first
fs.copyFileSync('gallery.js.bak', 'gallery.js');
fs.copyFileSync('post-modal.js.bak', 'post-modal.js');
fs.copyFileSync('profile.js.bak', 'profile.js');

console.log('Backups restored, starting updates...');

// Update gallery.js
let gallery = fs.readFileSync('gallery.js', 'utf8');

// 1. Update loadUserInteractions
gallery = gallery.replace(
    /async function loadUserInteractions\(\) \{\n    if \(!currentUser\) return;\n    \n    try \{\n        const likes = await loadData\('likes\.json'\);\n        const saves = await loadData\('saves\.json'\);\n        \n        \/\/ Update like buttons\n        likes\.forEach\(like => \{\n            if \(like\.userId === currentUser\.id\) \{\n                const likeBtn = document\.querySelector\(`\[data-post-id="\$\{like\.postId\}"\]\.like-btn`\);\n                if \(likeBtn\) \{\n                    likeBtn\.innerHTML = '<i class="fas fa-heart"><\/i>';\n                    likeBtn\.classList\.add\('liked'\);\n                \}\n            \}\n        \}\);\n        \n        \/\/ Update save buttons\n        saves\.forEach\(save => \{\n            if \(save\.userId === currentUser\.id\) \{\n                const saveBtn = document\.querySelector\(`\[data-post-id="\$\{save\.postId\}"\]\.save-btn`\);\n                if \(saveBtn\) \{\n                    saveBtn\.innerHTML = '<i class="fas fa-bookmark"><\/i>';\n                    saveBtn\.classList\.add\('saved'\);\n                \}\n            \}\n        \}\);\n    \} catch \(error\) \{\n        console\.error\('Error loading user interactions:', error\);\n    \}\n\}/,
    `async function loadUserInteractions() {
    if (!currentUser) return;
    
    try {
        const userData = await getUserData(currentUser.id, 'all');
        const likes = userData.likes || [];
        const saves = userData.saves || [];
        
        // Update like buttons
        likes.forEach(like => {
            const likeBtn = document.querySelector(\`[data-post-id="\${like.postId}"].like-btn\`);
            if (likeBtn) {
                likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
                likeBtn.classList.add('liked');
            }
        });
        
        // Update save buttons
        saves.forEach(save => {
            const saveBtn = document.querySelector(\`[data-post-id="\${save.postId}"].save-btn\`);
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
                saveBtn.classList.add('saved');
            }
        });
    } catch (error) {
        console.error('Error loading user interactions:', error);
    }
}`
);

console.log('Updated loadUserInteractions in gallery.js');

// 2. Update toggleLike in gallery.js
const toggleLikeNew = `async function toggleLike(postId, button) {
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
                button.innerHTML = '<i class="fas fa-heart"></i>';
                button.classList.add('liked');
            } else {
                button.innerHTML = '<i class="far fa-heart"></i>';
                button.classList.remove('liked');
            }
            
            // Update post like count in allPosts array
            const postIndex = allPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                allPosts[postIndex].likes = data.likes;
            }
            
            // Update UI
            updatePostLikeCount(postId);
            showNotification(data.action === 'liked' ? 'Post liked!' : 'Post unliked', 'success');
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Error updating like', 'error');
    }
}`;

gallery = gallery.replace(/\/\/ Like and Save functionality\nasync function toggleLike\(postId, button\) \{[\s\S]*?\n\}/m, toggleLikeNew);

console.log('Updated toggleLike in gallery.js');

// 3. Update toggleSave in gallery.js
const toggleSaveNew = `async function toggleSave(postId, button) {
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
                button.innerHTML = '<i class="fas fa-bookmark"></i>';
                button.classList.add('saved');
                showNotification('Post saved!', 'success');
            } else {
                button.innerHTML = '<i class="far fa-bookmark"></i>';
                button.classList.remove('saved');
                showNotification('Post removed from saved', 'success');
            }
        }
    } catch (error) {
        console.error('Error toggling save:', error);
        showNotification('Error updating save', 'error');
    }
}`;

gallery = gallery.replace(/async function toggleSave\(postId, button\) \{[\s\S]*?await saveData\('saves\.json', saves\);[\s\S]*?\n\}/m, toggleSaveNew);

console.log('Updated toggleSave in gallery.js');

// Write gallery.js
fs.writeFileSync('gallery.js', gallery);
console.log('gallery.js saved successfully');

console.log('All files updated successfully!');
