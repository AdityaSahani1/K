// Gallery page JavaScript



let allPosts = [];

let filteredPosts = [];

let currentPage = 1;

const postsPerPage = 30;


// Search and filter state
let currentSearchTerm = '';
let currentCategory = '';
let currentSortBy = 'newest';


document.addEventListener('DOMContentLoaded', function() {

    initGalleryPage();

});



function initGalleryPage() {

    loadAllPosts();

    initFilters();

    initSearch();

    initPostModal();

    initSearchToggle();

    initSearchPopup();

    initGallerySearch();
}



async function loadAllPosts() {

    try {

        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        allPosts = await response.json();

        filteredPosts = [...allPosts];

        

        updateCategoryCounts();
        loadGalleryPosts();

        

        // Check for post parameter after posts are loaded

        checkForPostParameter();

        

    } catch (error) {

        console.error('Error loading posts:', error);

        showErrorState();

    }

}



function loadTopPosts() {

    const topPostsGrid = document.getElementById('top-posts-grid');

    if (!topPostsGrid) return;

    

    // Sort by likes and take top 3

    const topPosts = [...allPosts]

        .sort((a, b) => (b.likes || 0) - (a.likes || 0))

        .slice(0, 3);

    

    if (topPosts.length === 0) {

        topPostsGrid.innerHTML = `

            <div class="no-posts">

                <i class="fas fa-trophy"></i>

                <p>No top posts available yet.</p>

            </div>

        `;

        return;

    }

    

    // Create special layout for most liked posts

    if (topPosts.length >= 3) {

        topPostsGrid.innerHTML = `

            <div class="most-liked-layout">

                <!-- First post (most liked) - center and bigger -->

                <article class="top-post-card main-post gold" data-post-id="${topPosts[0].id}">

                    <div class="rank-badge gold">1</div>

                    <div class="gallery-post-image">

                        <img src="${topPosts[0].imageUrl}" alt="${topPosts[0].title}" loading="lazy">

                        <div class="post-overlay">

                            <div class="overlay-actions">

                                <button class="overlay-btn like-btn" data-post-id="${topPosts[0].id}" title="Like">

                                    <i class="far fa-heart"></i>

                                </button>

                                <button class="overlay-btn save-btn" data-post-id="${topPosts[0].id}" title="Save">

                                    <i class="far fa-bookmark"></i>

                                </button>

                                <!--

                            </div>

                        </div>

                    </div>

                    <div class="post-info">

                        <h3 class="post-title">${topPosts[0].title}</h3>

                        <div class="post-meta">

                            <div class="post-stats">

                                <span><i class="far fa-heart"></i> ${topPosts[0].likes || 0}</span>

                                <span><i class="far fa-comment"></i> ${topPosts[0].comments || 0}</span>

                                <span><i class="far fa-eye"></i> ${topPosts[0].views || 0}</span>

                            </div>

                            <span class="category-badge ${topPosts[0].category}">${topPosts[0].category}</span>

                        </div>

                    </div>

                </article>

                

                <!-- Second post - left side below -->

                <article class="top-post-card side-post silver left-post" data-post-id="${topPosts[1].id}">

                    <div class="rank-badge silver">2</div>

                    <div class="gallery-post-image">

                        <img src="${topPosts[1].imageUrl}" alt="${topPosts[1].title}" loading="lazy">

                        <div class="post-overlay">

                            <div class="overlay-actions">

                                <button class="overlay-btn like-btn" data-post-id="${topPosts[1].id}" title="Like">

                                    <i class="far fa-heart"></i>

                                </button>

                                <button class="overlay-btn save-btn" data-post-id="${topPosts[1].id}" title="Save">

                                    <i class="far fa-bookmark"></i>

                                </button>

                                <!--

                            </div>

                        </div>

                    </div>

                    <div class="post-info">

                        <h3 class="post-title">${topPosts[1].title}</h3>

                        <div class="post-meta">

                            <div class="post-stats">

                                <span><i class="far fa-heart"></i> ${topPosts[1].likes || 0}</span>

                                <span><i class="far fa-comment"></i> ${topPosts[1].comments || 0}</span>

                                <span><i class="far fa-eye"></i> ${topPosts[1].views || 0}</span>

                            </div>

                            <span class="category-badge ${topPosts[1].category}">${topPosts[1].category}</span>

                        </div>

                    </div>

                </article>

                

                <!-- Third post - right side -->

                <article class="top-post-card side-post bronze right-post" data-post-id="${topPosts[2].id}">

                    <div class="rank-badge bronze">3</div>

                    <div class="gallery-post-image">

                        <img src="${topPosts[2].imageUrl}" alt="${topPosts[2].title}" loading="lazy">

                        <div class="post-overlay">

                            <div class="overlay-actions">

                                <button class="overlay-btn like-btn" data-post-id="${topPosts[2].id}" title="Like">

                                    <i class="far fa-heart"></i>

                                </button>

                                <button class="overlay-btn save-btn" data-post-id="${topPosts[2].id}" title="Save">

                                    <i class="far fa-bookmark"></i>

                                </button>

                                <!--

                            </div>

                        </div>

                    </div>

                    <div class="post-info">

                        <h3 class="post-title">${topPosts[2].title}</h3>

                        <div class="post-meta">

                            <div class="post-stats">

                                <span><i class="far fa-heart"></i> ${topPosts[2].likes || 0}</span>

                                <span><i class="far fa-comment"></i> ${topPosts[2].comments || 0}</span>

                                <span><i class="far fa-eye"></i> ${topPosts[2].views || 0}</span>

                            </div>

                            <span class="category-badge ${topPosts[2].category}">${topPosts[2].category}</span>

                        </div>

                    </div>

                </article>

            </div>

        `;

    } else {

        // Fallback for when there are less than 3 posts

        topPostsGrid.innerHTML = topPosts.map((post, index) => {

            const rank = ['gold', 'silver', 'bronze'][index];

            const rankNumber = index + 1;

            

            return `

                <article class="top-post-card ${rank}" data-post-id="${post.id}">

                    <div class="rank-badge ${rank}">${rankNumber}</div>

                    <div class="gallery-post-image">

                        <img src="${post.imageUrl}" alt="${post.title}" loading="lazy">

                        <div class="post-overlay">

                            <div class="overlay-actions">

                                <button class="overlay-btn like-btn" data-post-id="${post.id}" title="Like">

                                    <i class="far fa-heart"></i>

                                </button>

                                <button class="overlay-btn save-btn" data-post-id="${post.id}" title="Save">

                                    <i class="far fa-bookmark"></i>

                                </button>

                                <!--

                            </div>

                        </div>

                    </div>

                    <div class="post-info">

                        <h3 class="post-title">${post.title}</h3>

                        <div class="post-meta">

                            <div class="post-stats">

                                <span><i class="far fa-heart"></i> ${post.likes || 0}</span>

                                <span><i class="far fa-comment"></i> ${post.comments || 0}</span>

                                <span><i class="far fa-eye"></i> ${post.views || 0}</span>

                            </div>

                            <span class="category-badge ${post.category}">${post.category}</span>

                        </div>

                    </div>

                </article>

            `;

        }).join('');

    }

    

    addPostInteractionListeners();

}



function loadGalleryPosts() {

    const galleryGrid = document.getElementById('gallery-grid');

    const loadMoreBtn = document.getElementById('load-more-btn');

    

    if (!galleryGrid) return;

    

    const startIndex = (currentPage - 1) * postsPerPage;

    const endIndex = startIndex + postsPerPage;

    const postsToShow = filteredPosts.slice(startIndex, endIndex);

    

    if (currentPage === 1 && postsToShow.length === 0) {

        galleryGrid.innerHTML = `

            <div class="no-posts">

                <i class="fas fa-images"></i>

                <p>No posts found matching your criteria.</p>

            </div>

        `;

        if (loadMoreBtn) {

            loadMoreBtn.style.display = 'none';

        }

        return;

    }

    

    if (currentPage === 1) {

        galleryGrid.innerHTML = postsToShow.map(post => createGalleryPostCard(post)).join('');

    } else {

        const newPostsHTML = postsToShow.map(post => createGalleryPostCard(post)).join('');

        galleryGrid.insertAdjacentHTML('beforeend', newPostsHTML);

    }

    

    // Show/hide load more button

    if (loadMoreBtn) {

        if (endIndex >= filteredPosts.length) {

            loadMoreBtn.style.display = 'none';

        } else {

            loadMoreBtn.style.display = 'block';

            loadMoreBtn.onclick = loadMorePosts;

        }

    }

    

    addPostInteractionListeners();

    addPostMenuListeners();

}



function createGalleryPostCard(post) {

    const ratios = ['', 'ratio-square', 'ratio-portrait', 'ratio-wide', 'ratio-tall'];

    const randomRatio = ratios[Math.floor(Math.random() * ratios.length)];

    

    return `

        <div class="gallery-post-wrapper">

            <article class="gallery-post-card" data-post-id="${post.id}">

                <div class="gallery-post-image ${randomRatio}">

                    <img src="${post.imageUrl}" alt="${post.title}" loading="lazy">

                    <div class="post-overlay">

                        <div class="overlay-actions">

                            <button class="overlay-btn like-btn" data-post-id="${post.id}" title="Like">

                                <i class="far fa-heart"></i>

                            </button>

                            <button class="overlay-btn save-btn" data-post-id="${post.id}" title="Save">

                                <i class="far fa-bookmark"></i>

                            </button>
                            <button class="overlay-btn share-btn" data-post-id="${post.id}" title="Share">
                                <i class="fas fa-share-alt"></i>
                            </button>


                        </div>

                    </div>

                    <div class="category-badge ${post.category}">${post.category}</div>

                </div>

            </article>

            <div class="gallery-post-info">

                <h3 class="gallery-post-title">${post.title}</h3>

                <button class="post-menu-btn" data-post-id="${post.id}" title="More options">

                    <i class="fas fa-ellipsis-v"></i>

                </button>

            </div>

        </div>

    `;

}



function initFilters() {

    // Initialize category filters

    const categoryFilters = document.querySelectorAll('.category-filter');

    categoryFilters.forEach(filter => {

        filter.addEventListener('click', function() {

            // Remove active from all category filters

            categoryFilters.forEach(f => f.classList.remove('active'));

            // Add active to clicked filter

            this.classList.add('active');

            updateCategoryCounts();

            applyFilters();

        });

    });



    // Initialize sort options

    const sortOptions = document.querySelectorAll('.sort-option');

    sortOptions.forEach(option => {

        option.addEventListener('click', function() {

            // Remove active from all sort options

            sortOptions.forEach(o => o.classList.remove('active'));

            // Add active to clicked option

            this.classList.add('active');

            applyFilters();

        });

    });



    // Initialize view options

    const viewOptions = document.querySelectorAll('.view-option');

    viewOptions.forEach(option => {

        option.addEventListener('click', function() {

            // Remove active from all view options

            viewOptions.forEach(o => o.classList.remove('active'));

            // Add active to clicked option

            this.classList.add('active');

            changeView(this.dataset.view);

        });

    });



    // Initialize search clear button

    const searchClear = document.getElementById('search-clear');

    const searchInput = document.getElementById('search-input');

    

    if (searchClear && searchInput) {

        searchClear.addEventListener('click', function() {

            searchInput.value = '';

            searchClear.classList.remove('show');

            applyFilters();

        });



        searchInput.addEventListener('input', function() {

            if (this.value.length > 0) {

                searchClear.classList.add('show');

            } else {

                searchClear.classList.remove('show');

            }

        });

    }



    // Initialize filter reset

    const filterReset = document.getElementById('filter-reset');

    if (filterReset) {

        filterReset.addEventListener('click', resetAllFilters);

    }



    // Check for URL parameters

    const urlParams = new URLSearchParams(window.location.search);

    const category = urlParams.get('category');

    if (category) {

        const categoryButton = document.querySelector(`[data-category="${category}"]`);

        if (categoryButton) {

            document.querySelector('.category-filter.active').classList.remove('active');

            categoryButton.classList.add('active');

        }

    }



    // Initialize counts

    updateCategoryCounts();

    updateResultsCount();

}



function updateCategoryCounts() {

    const counts = {

        '': allPosts.length,

        'art': allPosts.filter(p => p.category === 'art').length,

        'photography': allPosts.filter(p => p.category === 'photography').length,

        'design': allPosts.filter(p => p.category === 'design').length,

        'digital': allPosts.filter(p => p.category === 'digital').length

    };



    Object.entries(counts).forEach(([category, count]) => {

        const countElement = document.getElementById(`count-${category || 'all'}`);

        if (countElement) {

            countElement.textContent = count;

        }

    });

}



function updateResultsCount() {

    const resultsCount = document.getElementById('results-count');

    if (resultsCount) {

        resultsCount.textContent = filteredPosts.length;

    }

}



function resetAllFilters() {

    // Reset search

    const searchInput = document.getElementById('search-input');

    const searchClear = document.getElementById('search-clear');

    if (searchInput) {

        searchInput.value = '';

        searchClear.classList.remove('show');

    }



    // Reset category filter to "All"

    document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));

    document.querySelector('[data-category=""]').classList.add('active');



    // Reset sort to "Newest"

    document.querySelectorAll('.sort-option').forEach(o => o.classList.remove('active'));

    document.querySelector('[data-sort="newest"]').classList.add('active');



    applyFilters();

}



function changeView(viewType) {

    const galleryGrid = document.getElementById('gallery-grid');

    if (!galleryGrid) return;



    // Remove existing view classes

    galleryGrid.classList.remove('grid-view', 'list-view', 'masonry-view');

    

    // Add new view class

    galleryGrid.classList.add(`${viewType}-view`);



    // Reload posts with new view

    loadGalleryPosts();

}



function checkForPostParameter() {

    const urlParams = new URLSearchParams(window.location.search);

    const postId = urlParams.get('post');

    if (postId && allPosts.length > 0) {

        // Posts are loaded, open modal immediately

        openPostModal(postId);

    }

}



function initSearch() {

    const searchInput = document.getElementById('search-input');

    if (searchInput) {

        let searchTimeout;

        searchInput.addEventListener('input', function() {

            clearTimeout(searchTimeout);

            searchTimeout = setTimeout(() => {

                applyFilters();

            }, 300);

        });

    }

}



function applyFilters() {

    // Use global variables for current filter state
    const searchTerm = currentSearchTerm.toLowerCase();
    const activeCategory = currentCategory;
    const activeSort = currentSortBy;
    
    // Filter posts
    filteredPosts = allPosts.filter(post => {
        const matchesSearch = !searchTerm || 
            post.title.toLowerCase().includes(searchTerm) ||
            post.description.toLowerCase().includes(searchTerm) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
        
        const matchesCategory = !activeCategory || post.category === activeCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    // Sort posts
    filteredPosts.sort((a, b) => {
        switch (activeSort) {
            case 'oldest':
                return new Date(a.created) - new Date(b.created);
            case 'popular':
                return (b.views || 0) - (a.views || 0);
            case 'liked':
                return (b.likes || 0) - (a.likes || 0);
            case 'newest':
            default:
                return new Date(b.created) - new Date(a.created);
        }
    });
    
    // Update results count
    updateResultsCount();
    
    // Reset pagination
    currentPage = 1;
    loadGalleryPosts();
}
function loadMorePosts() {

    currentPage++;

    loadGalleryPosts();

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
            const menuBtn = document.querySelector(`[data-post-id="${postId}"].post-menu-btn`);
            if (menuBtn) menuBtn.click();
        });
    });

    

    

    

    // Post card click listeners

    document.querySelectorAll('.gallery-post-card, .top-post-card').forEach(card => {

        card.addEventListener('click', function(e) {

            // Don't open modal if clicking on buttons or menus

            if (e.target.closest('.overlay-actions, .post-menu, .menu-dropdown, .post-menu-btn, .post-menu-dropdown, .gallery-post-info')) return;

            

            const postId = this.dataset.postId;

            openPostModal(postId);

        });

    });

}



function addPostMenuListeners() {

    // New post menu button listeners

    document.querySelectorAll('.post-menu-btn').forEach(btn => {

        btn.addEventListener('click', function(e) {

            e.preventDefault();

            e.stopPropagation();

            

            const postId = this.dataset.postId;

            

            // Close all other dropdowns

            document.querySelectorAll('.post-menu-dropdown').forEach(menu => {

                menu.remove();

            });

            

            // Create dropdown with Share option
            
            // Find the post to check if it has a download URL
            const post = allPosts.find(p => p.id == postId);
            const hasDownloadUrl = post && post.downloadUrl;
            

            const dropdown = document.createElement('div');

            dropdown.className = 'post-menu-dropdown';

            dropdown.innerHTML = `


                <button class="post-menu-item" data-action="share-whatsapp" data-post-id="${postId}">

                    <i class="fab fa-whatsapp"></i>

                    <span>Share on WhatsApp</span>

                </button>

                <button class="post-menu-item" data-action="share-instagram" data-post-id="${postId}">

                    <i class="fab fa-instagram"></i>

                    <span>Share on Instagram</span>

                </button>

                <button class="post-menu-item" data-action="share-copy" data-post-id="${postId}">

                    <i class="fas fa-link"></i>

                    <span>Copy Link</span>

                </button>

                <button class="post-menu-item" data-action="share-native" data-post-id="${postId}">

                    <i class="fas fa-share"></i>

                    <span>Share</span>

                </button>


            `;

            

            // Position dropdown below button

            const infoSection = this.closest('.gallery-post-info');

            if (infoSection) {

                infoSection.appendChild(dropdown);

                

                // Add event listeners to menu items

                dropdown.querySelectorAll('.post-menu-item').forEach(item => {

                    item.addEventListener('click', function(e) {

                        e.preventDefault();

                        e.stopPropagation();

                        

                        const action = this.dataset.action;

                        const pid = this.dataset.postId;

                        

                        // Remove dropdown

                        dropdown.remove();

                        

                        // Handle action

                        handlePostMenuAction(action, pid);

                    });

                });

            }

        });

    });

    

    

    // Close menus when clicking outside

    document.addEventListener('click', function(e) {

        if (!e.target.closest('.post-menu-btn') && !e.target.closest('.post-menu-dropdown')) {

            document.querySelectorAll('.post-menu-dropdown').forEach(menu => {

                menu.remove();

            });

        }

        document.querySelectorAll('.menu-dropdown').forEach(menu => {

            menu.classList.remove('show');

        });

    });

}



// Handle post menu actions

function handlePostMenuAction(action, postId) {

    switch (action) {

        case 'like':

            if (!requireAuth()) return;

            const likeBtn = document.querySelector(`[data-post-id="${postId}"].like-btn`);

            if (likeBtn) {

                toggleLike(postId, likeBtn);

            } else {

                toggleLikeFromMenu(postId);

            }

            break;

        case 'save':

            if (!requireAuth()) return;

            const saveBtn = document.querySelector(`[data-post-id="${postId}"].save-btn`);

            if (saveBtn) {

                toggleSave(postId, saveBtn);

            } else {

                toggleSaveFromMenu(postId);

            }

            break;

        case 'share-whatsapp':
            {
                const url = `${window.location.origin}/gallery.php?post=${postId}`;
                const post = allPosts.find(p => p.id === postId);
                const title = post ? post.title : 'Check out this post';
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`;
                window.open(whatsappUrl, '_blank');
            }
            break;

        case 'share-instagram':
            {
                const url = `${window.location.origin}/gallery.php?post=${postId}`;
                copyToClipboard(url);
                showNotification('Link copied! Paste it in your Instagram post or story', 'info');
            }
            break;

        case 'share-copy':
            {
                const url = `${window.location.origin}/gallery.php?post=${postId}`;
                copyToClipboard(url);
            }
            break;

        case 'share-native':
            {
                const url = `${window.location.origin}/gallery.php?post=${postId}`;
                const post = allPosts.find(p => p.id === postId);
                const title = post ? post.title : 'Check out this post';
                
                if (navigator.share) {
                    navigator.share({
                        title: title,
                        url: url
                    }).catch((error) => {
                        if (error.name !== 'AbortError') {
                            copyToClipboard(url);
                        }
                    });
                } else {
                    copyToClipboard(url);
                    showNotification('Link copied to clipboard!', 'success');
                }
            }
            break;

        case 'download':

            downloadPostFromGallery(postId);

            break;

    }

}



// Toggle like from menu (when like button not visible)
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
            if (data.action === 'liked') {
                showNotification('Post liked!', 'success');
            } else {
                showNotification('Like removed', 'success');
            }
            const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        allPosts = await response.json();
            filteredPosts = [...allPosts];
            loadGalleryPosts();
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Error updating like', 'error');
    }
}

// Toggle save from menu (when save button not visible)
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
            if (data.action === 'saved') {
                showNotification('Post saved!', 'success');
            } else {
                showNotification('Post removed from saved', 'success');
            }
        }
    } catch (error) {
        console.error('Error toggling save:', error);
        showNotification('Error updating save', 'error');
    }
}






// Download post from gallery

async function downloadPostFromGallery(postId) {
    try {
        const post = allPosts?.find(p => p.id === postId);
        
        if (!post || !post.imageUrl) {
            showNotification('Download not available for this post', 'warning');
            return;
        }
        
        showNotification('Preparing download...', 'info');
        
        const imgResponse = await fetch(post.imageUrl);
        if (!imgResponse.ok) throw new Error('Failed to fetch image');
        
        const blob = await imgResponse.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        
        const urlPath = post.imageUrl.split('?')[0];
        const extension = urlPath.substring(urlPath.lastIndexOf('.')) || '.jpg';
        link.download = `${post.title}${extension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        
        showNotification('Download started!', 'success');
    } catch (error) {
        console.error('Error downloading post:', error);
        showNotification('Error starting download', 'error');
    }
}



// Copy to clipboard helper

function copyToClipboard(text) {

    if (navigator.clipboard) {

        navigator.clipboard.writeText(text).then(() => {

            showNotification('Link copied to clipboard!', 'success');

        }).catch(() => {

            fallbackCopyToClipboard(text);

        });

    } else {

        fallbackCopyToClipboard(text);

    }

}



function fallbackCopyToClipboard(text) {

    const textArea = document.createElement('textarea');

    textArea.value = text;

    textArea.style.position = 'fixed';

    textArea.style.left = '-999999px';

    document.body.appendChild(textArea);

    textArea.select();

    try {

        document.execCommand('copy');

        showNotification('Link copied to clipboard!', 'success');

    } catch (error) {

        showNotification('Could not copy link', 'error');

    }

    document.body.removeChild(textArea);

}



// Post modal functions now handled by post-modal.js



function showErrorState() {

    const galleryGrid = document.getElementById('gallery-grid');

    if (galleryGrid) {

        galleryGrid.innerHTML = `

            <div class="error-state">

                <i class="fas fa-exclamation-triangle"></i>

                <p>Error loading gallery. Please try again later.</p>

            </div>

        `;

    }

}






// Like and Save functionality
async function toggleLike(postId, button) {
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
                showNotification('Post liked!', 'success');
            } else {
                button.innerHTML = '<i class="far fa-heart"></i>';
                button.classList.remove('liked');
                showNotification('Post unliked', 'success');
            }
            // Reload posts to update like counts
            const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        allPosts = await response.json();
            filteredPosts = [...allPosts];
            updatePostLikeCount(postId);
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Error updating like', 'error');
    }
}

async function toggleSave(postId, button) {
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
}



async function updatePostLikeCount(postId) {
    try {
        const response = await fetch('/api/posts.php');
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();
        const post = posts.find(p => p.id === postId);
        const postLikes = post ? (post.likes || 0) : 0;
        
        // Update like count in all instances of this post across the page
        const likeCountElements = document.querySelectorAll(`[data-post-id="${postId}"] .post-stats span:first-child, [data-post-id="${postId}"] .post-meta span:first-child`);
        likeCountElements.forEach(element => {
            element.innerHTML = `<i class="far fa-heart"></i> ${postLikes}`;
        });
        
        // Also update the modal view if it's open
        const modalDetailElements = document.querySelectorAll('#post-detail .post-detail-meta span:nth-child(3)');
        modalDetailElements.forEach(element => {
            if (element.innerHTML.includes('fa-heart')) {
                element.innerHTML = `<i class="far fa-heart"></i> ${postLikes}`;
            }
        });
    } catch (error) {
        console.error('Error updating post like count:', error);
    }
}



// Search toggle functionality

function initSearchToggle() {

    const searchBtn = document.getElementById('search-btn');

    const filterBar = document.querySelector('.filter-bar');

    

    // Only initialize if filter-bar element exists (for responsive layouts)

    if (searchBtn && filterBar) {

        searchBtn.addEventListener('click', function(e) {

            e.preventDefault();

            e.stopPropagation();

            filterBar.classList.toggle('show');

            

            // Focus search input when shown

            if (filterBar.classList.contains('show')) {

                const searchInput = document.getElementById('search-input');

                if (searchInput) {

                    setTimeout(() => searchInput.focus(), 300);

                }

            }

        });

    }

}



// Search popup functionality

function initSearchPopup() {

    const searchBtn = document.getElementById('search-btn');

    const searchModal = document.getElementById('search-modal');

    const searchClose = document.getElementById('search-close');

    const searchSubmit = document.getElementById('search-submit');

    const searchInputPopup = document.getElementById('search-input-popup');

    const applyFiltersBtn = document.getElementById('apply-filters');

    const clearFiltersBtn = document.getElementById('clear-filters');

    const filterBar = document.querySelector('.filter-bar');

    

    // Only attach popup handler if filter-bar doesn't exist (mutually exclusive with toggle)

    if (searchBtn && !filterBar) {

        searchBtn.addEventListener('click', function(e) {

            e.preventDefault();

            e.stopPropagation();

            updateCategoryCounts(); // Update counts when opening popup

            showModal('search-modal');

            setTimeout(() => {

                if (searchInputPopup) {

                    searchInputPopup.focus();

                }

            }, 300);

        });

    }

    

    // Close search popup

    if (searchClose) {

        searchClose.addEventListener('click', function() {

            hideModal('search-modal');

        });

    }

    

    // Handle search submission

    if (searchSubmit) {

        searchSubmit.addEventListener('click', performSearch);

    }

    

    if (searchInputPopup) {

        searchInputPopup.addEventListener('keypress', function(e) {

            if (e.key === 'Enter') {

                performSearch();

            }

        });

    }

    

    // Apply filters button

    if (applyFiltersBtn) {

        applyFiltersBtn.addEventListener('click', applyFiltersFromPopup);

    }

    

    // Clear filters button

    if (clearFiltersBtn) {

        clearFiltersBtn.addEventListener('click', clearAllFiltersFromPopup);

    }

    

    // Close modal when clicking outside

    if (searchModal) {

        searchModal.addEventListener('click', function(e) {

            if (e.target === searchModal) {

                hideModal('search-modal');

            }

        });

    }

    

    // Initialize popup filters

    initPopupFilters();

}



function performSearch() {

    const searchInputPopup = document.getElementById('search-input-popup');

    

    if (searchInputPopup) {

        const searchTerm = searchInputPopup.value.trim();

        

        // Update the global search term

        currentSearchTerm = searchTerm;

        

        // Hide the search modal

        hideModal('search-modal');

        

        // Apply filters with the new search term

        applyFilters();

        

        // Clear the popup search input

        searchInputPopup.value = '';

    }

}



// Initialize filters in the popup modal

function initPopupFilters() {

    // Initialize category filters in popup

    const popupCategoryFilters = document.querySelectorAll('#search-modal .category-filter');

    popupCategoryFilters.forEach(filter => {

        filter.addEventListener('click', function() {

            // Remove active class from all category filters

            popupCategoryFilters.forEach(f => f.classList.remove('active'));

            // Add active class to clicked filter

            this.classList.add('active');

        });

    });

    

    // Initialize sort options in popup

    const popupSortOptions = document.querySelectorAll('#search-modal .sort-option');

    popupSortOptions.forEach(option => {

        option.addEventListener('click', function() {

            // Remove active class from all sort options

            popupSortOptions.forEach(o => o.classList.remove('active'));

            // Add active class to clicked option

            this.classList.add('active');

        });

    });

}



// Apply filters from popup and close modal

function applyFiltersFromPopup() {

    const searchInputPopup = document.getElementById('search-input-popup');

    const activeCategory = document.querySelector('#search-modal .category-filter.active');

    const activeSort = document.querySelector('#search-modal .sort-option.active');

    

    // Update global filter state

    if (searchInputPopup) {

        currentSearchTerm = searchInputPopup.value.trim();

    }

    

    if (activeCategory) {

        currentCategory = activeCategory.getAttribute('data-category') || '';

    }

    

    if (activeSort) {

        currentSortBy = activeSort.getAttribute('data-sort') || 'newest';

    }

    

    // Close modal

    hideModal('search-modal');

    

    // Apply filters

    applyFilters();

    

    // Clear search input

    if (searchInputPopup) {

        searchInputPopup.value = '';

    }

}



// Clear all filters from popup

function clearAllFiltersFromPopup() {

    // Reset search input

    const searchInputPopup = document.getElementById('search-input-popup');

    if (searchInputPopup) {

        searchInputPopup.value = '';

    }

    

    // Reset category to "All"

    const popupCategoryFilters = document.querySelectorAll('#search-modal .category-filter');

    popupCategoryFilters.forEach(filter => {

        filter.classList.remove('active');

        if (filter.getAttribute('data-category') === '') {

            filter.classList.add('active');

        }

    });

    

    // Reset sort to "Newest"

    const popupSortOptions = document.querySelectorAll('#search-modal .sort-option');

    popupSortOptions.forEach(option => {

        option.classList.remove('active');

        if (option.getAttribute('data-sort') === 'newest') {

            option.classList.add('active');

        }

    });

    

    // Reset global filter state

    currentSearchTerm = '';

    currentCategory = '';

    currentSortBy = 'newest';

    

    // Close modal

    hideModal('search-modal');

    

    // Apply cleared filters

    applyFilters();

}



// Update category counts in search popup

function updateCategoryCounts() {

    if (!allPosts || allPosts.length === 0) return;

    

    // Count posts by category

    const categoryCounts = {

        all: allPosts.length,

        art: 0,

        photography: 0,

        design: 0,

        digital: 0

    };

    

    allPosts.forEach(post => {

        if (post.category && categoryCounts.hasOwnProperty(post.category)) {

            categoryCounts[post.category]++;

        }

    });

    


    // Update counts in popup (with null checks)

    const countAll = document.getElementById('count-all');

    const countArt = document.getElementById('count-art');

    const countPhotography = document.getElementById('count-photography');

    const countDesign = document.getElementById('count-design');

    const countDigital = document.getElementById('count-digital');

    if (countAll) countAll.textContent = categoryCounts.all;

    if (countArt) countArt.textContent = categoryCounts.art;

    if (countPhotography) countPhotography.textContent = categoryCounts.photography;

    if (countDesign) countDesign.textContent = categoryCounts.design;

    if (countDigital) countDigital.textContent = categoryCounts.digital;

}

// Gallery search functionality (new inline search)
function initGallerySearch() {
    const searchInput = document.getElementById('gallery-search-input');
    const searchClearBtn = document.getElementById('gallery-search-clear');
    const filtersToggleBtn = document.getElementById('filters-toggle-btn');
    const filtersPanel = document.getElementById('filters-panel');
    const categoryFilters = document.querySelectorAll('.category-filters .filter-chip');
    const sortFilters = document.querySelectorAll('.sort-filters .filter-chip');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (searchClearBtn) {
                searchClearBtn.style.display = value ? 'flex' : 'none';
            }
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearchTerm = value;
                applyFilters();
            }, 300);
        });
    }
    
    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                currentSearchTerm = '';
                this.style.display = 'none';
                applyFilters();
            }
        });
    }
    
    if (filtersToggleBtn && filtersPanel) {
        filtersToggleBtn.addEventListener('click', function() {
            const isHidden = filtersPanel.style.display === 'none';
            filtersPanel.style.display = isHidden ? 'block' : 'none';
            this.classList.toggle('active');
        });
    }
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            categoryFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category || '';
            applyFilters();
        });
    });
    
    sortFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            sortFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            currentSortBy = this.dataset.sort || 'newest';
            applyFilters();
        });
    });
}
