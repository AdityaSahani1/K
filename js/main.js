// Main JavaScript file for common functionality



// Global variables

let currentUser = null;

let currentTheme = localStorage.getItem('theme') || 'light';



// Initialize app

document.addEventListener('DOMContentLoaded', function() {

    initTheme();

    initNavigation();

    initAuth();

    loadCurrentUser();

    initScrollFunctionality();

    initNotifications();

});



// Theme Management

function initTheme() {

    document.documentElement.setAttribute('data-theme', currentTheme);

    updateThemeIcon();

    

    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {

        themeToggle.addEventListener('click', toggleTheme);

    }

}



function toggleTheme() {

    currentTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);

    localStorage.setItem('theme', currentTheme);

    updateThemeIcon();

}



function updateThemeIcon() {

    const themeIcon = document.querySelector('#theme-toggle i');

    if (themeIcon) {

        themeIcon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';

    }

}



// Navigation

function initNavigation() {

    const navToggle = document.getElementById('nav-toggle');

    const navMenu = document.getElementById('nav-menu');

    const userBtn = document.getElementById('user-btn');

    const userDropdown = document.getElementById('user-dropdown');

    

    // Mobile menu toggle

    if (navToggle && navMenu) {

        navToggle.addEventListener('click', function() {

            navToggle.classList.toggle('active');

            navMenu.classList.toggle('active');

        });

    }

    

    // User dropdown toggle

    if (userBtn && userDropdown) {

        userBtn.addEventListener('click', function(e) {

            e.stopPropagation();

            userDropdown.classList.toggle('show');

        });

        

        // Close dropdown when clicking outside

        document.addEventListener('click', function() {

            userDropdown.classList.remove('show');

        });

    }

    

    // Search button functionality

    const searchBtn = document.getElementById('search-btn');

    if (searchBtn) {

        searchBtn.addEventListener('click', function() {

            // If we're not on gallery page, go to gallery

            if (!window.location.pathname.includes('gallery.php')) {

                window.location.href = 'gallery.php';

            } else {

                // If we're on gallery page, focus the search input

                const searchInput = document.getElementById('search-input');

                if (searchInput) {

                    searchInput.focus();

                }

            }

        });

    }

    

    // Logout functionality

    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {

        logoutBtn.addEventListener('click', logout);

    }

}



// Authentication

function initAuth() {

    updateAuthUI();

}



function loadCurrentUser() {

    const userData = localStorage.getItem('currentUser');

    if (userData) {

        currentUser = JSON.parse(userData);

        updateAuthUI();

    }

}



function updateAuthUI() {

    const userBtn = document.getElementById('user-btn');

    const userDropdown = document.getElementById('user-dropdown');

    

    if (typeof updateJoinCommunityButton === 'function') {
        updateJoinCommunityButton();
    }

    if (currentUser) {

        // User is logged in

        if (userBtn) {

            // Remove any existing click listeners by cloning the node

            const newUserBtn = userBtn.cloneNode(true);

            userBtn.parentNode.replaceChild(newUserBtn, userBtn);

            

            newUserBtn.innerHTML = `<i class="fas fa-user"></i>`;

            newUserBtn.title = currentUser.username;

            

            // Add the dropdown toggle functionality

            newUserBtn.addEventListener('click', function(e) {

                e.stopPropagation();

                const dropdown = document.getElementById('user-dropdown');

                if (dropdown) {

                    dropdown.classList.toggle('show');

                }

            });

        }

        

        if (userDropdown) {

            userDropdown.innerHTML = `

                <a href="profile.php" class="dropdown-item">

                    <i class="fas fa-user"></i> Profile

                </a>

                <a href="#" class="dropdown-item" id="logout-btn">

                    <i class="fas fa-sign-out-alt"></i> Logout

                </a>

            `;

            

            // Re-attach logout functionality

            const logoutBtn = document.getElementById('logout-btn');

            if (logoutBtn) {

                logoutBtn.addEventListener('click', logout);

            }

        }

        

        // Show notification menu when logged in
        const notificationMenu = document.getElementById('notification-menu');
        if (notificationMenu) {
            notificationMenu.style.display = 'block';
        }
        
        // Initialize notifications for logged in user
        initNotifications();

        // Show admin link if user is admin

        if (currentUser.role === 'admin') {

            addAdminNavLink();

        }

    } else {

        // User is not logged in

        if (userBtn) {

            // Remove any existing click listeners by cloning the node

            const newUserBtn = userBtn.cloneNode(true);

            userBtn.parentNode.replaceChild(newUserBtn, userBtn);

            

            newUserBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i>`;

            newUserBtn.title = 'Login';

            newUserBtn.addEventListener('click', function() {

                showAuthModal();

            });

        }

        

        if (userDropdown) {

            userDropdown.innerHTML = `

                <a href="#" class="dropdown-item" onclick="showAuthModal()">

                    <i class="fas fa-sign-in-alt"></i> Login

                </a>

            `;

        }
        
        // Hide notification menu when logged out
        const notificationMenu = document.getElementById('notification-menu');
        if (notificationMenu) {
            notificationMenu.style.display = 'none';
        }

    }

}



function addAdminNavLink() {

    const navList = document.querySelector('.nav-list');

    if (navList && !document.querySelector('.nav-link[href="admin.php"]')) {

        const adminItem = document.createElement('li');

        adminItem.className = 'nav-item';

        adminItem.innerHTML = `

            <a href="admin.php" class="nav-link">

                <i class="fas fa-cog"></i> Admin

            </a>

        `;

        navList.appendChild(adminItem);

    }

}



function logout() {

    currentUser = null;

    localStorage.removeItem('currentUser');
    
    // Clear notification interval and reset initialization flag
    if (notificationIntervalId) {
        clearInterval(notificationIntervalId);
        notificationIntervalId = null;
    }
    notificationsInitialized = false;

    updateAuthUI();

    

    // Redirect to home if on admin or profile page

    if (window.location.pathname.includes('admin.php') || window.location.pathname.includes('profile.php')) {

        window.location.href = 'index.php';

    }

    

    showNotification('Logged out successfully', 'success');

}



// Modal Management

function showModal(modalId) {

    const modal = document.getElementById(modalId);

    if (modal) {

        modal.classList.add('show');

        document.body.style.overflow = 'hidden';

    }

}



function hideModal(modalId) {

    const modal = document.getElementById(modalId);

    if (modal) {

        modal.classList.remove('show');

        document.body.style.overflow = 'auto';

    }

}



function showAuthModal() {

    showModal('auth-modal');

}



// Utility Functions

function showNotification(message, type = 'info') {

    // Create notification element

    const notification = document.createElement('div');

    notification.className = `notification notification-${type}`;

    notification.innerHTML = `

        <div class="notification-content">

            <span class="notification-message">${message}</span>

            <button class="notification-close">&times;</button>

        </div>

    `;

    

    // Add to page

    document.body.appendChild(notification);

    

    // Show notification

    setTimeout(() => notification.classList.add('show'), 100);

    

    // Auto hide after 5 seconds

    setTimeout(() => hideNotification(notification), 5000);

    

    // Close button functionality

    notification.querySelector('.notification-close').addEventListener('click', () => {

        hideNotification(notification);

    });

}



function hideNotification(notification) {

    notification.classList.remove('show');

    setTimeout(() => {

        if (notification.parentNode) {

            notification.parentNode.removeChild(notification);

        }

    }, 300);

}



function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {

        year: 'numeric',

        month: 'short',

        day: 'numeric'

    });

}



function generateId() {

    return Date.now().toString(36) + Math.random().toString(36).substr(2);

}



// Data Management - Database API Functions

async function loadData(filename) {

    try {

        let endpoint = '';

        

        // Map legacy JSON files to API endpoints

        switch(filename) {

            case 'posts.json':

                endpoint = '/api/posts.php';

                break;

            case 'users.json':

                endpoint = '/api/get-users.php';

                break;

            default:

                console.warn(`${filename} is no longer supported. Use specific API endpoints instead.`);

                return [];

        }

        

        const response = await fetch(endpoint);

        if (!response.ok) {

            throw new Error(`Failed to load data from ${endpoint}`);

        }

        return await response.json();

    } catch (error) {

        console.error(`Error loading data:`, error);

        return [];

    }

}






// Get user-specific data from database

async function getUserData(userId, type = 'all') {

    try {

        const response = await fetch(`/api/user-data.php?userId=${userId}&type=${type}`);

        if (!response.ok) {

            throw new Error('Failed to load user data');

        }

        return await response.json();

    } catch (error) {

        console.error('Error loading user data:', error);

        return type === 'all' ? { likes: [], saves: [], comments: [] } : [];

    }

}



// Get comments for a specific post

async function getPostComments(postId) {

    try {

        const url = currentUser 

            ? `/api/post-comments.php?postId=${postId}&userId=${currentUser.id}`

            : `/api/post-comments.php?postId=${postId}`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error('Failed to load comments');

        }

        return await response.json();

    } catch (error) {

        console.error('Error loading comments:', error);

        return [];

    }

}



// Image handling

function loadImage(src) {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = reject;

        img.src = src;

    });

}



function createImagePlaceholder(width = 300, height = 200) {

    const canvas = document.createElement('canvas');

    canvas.width = width;

    canvas.height = height;

    const ctx = canvas.getContext('2d');

    

    // Create gradient background

    const gradient = ctx.createLinearGradient(0, 0, width, height);

    gradient.addColorStop(0, '#f1f5f9');

    gradient.addColorStop(1, '#e2e8f0');

    

    ctx.fillStyle = gradient;

    ctx.fillRect(0, 0, width, height);

    

    // Add icon

    ctx.fillStyle = '#94a3b8';

    ctx.font = '24px Font Awesome';

    ctx.textAlign = 'center';

    ctx.fillText('🖼️', width / 2, height / 2);

    

    return canvas.toDataURL();

}



// Social sharing

async function sharePost(postId, platform) {

    const post = await getCurrentPost(postId);

    if (!post) return;

    

    const url = `${window.location.origin}/post.html?id=${postId}`;

    const text = `Check out this amazing post: ${post.title}`;

    

    let shareUrl = '';

    

    switch (platform) {

        case 'whatsapp':

            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;

            break;

        case 'instagram':

            // Instagram doesn't support direct link sharing, so copy to clipboard

            copyToClipboard(url);

            showNotification('Link copied to clipboard! Share it on Instagram.', 'success');

            return;

        case 'twitter':

            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

            break;

        case 'copy':

            copyToClipboard(url);

            showNotification('Link copied to clipboard!', 'success');

            return;

        default:

            if (navigator.share) {

                navigator.share({

                    title: post.title,

                    text: text,

                    url: url

                });

            } else {

                copyToClipboard(url);

                showNotification('Link copied to clipboard!', 'success');

            }

            return;

    }

    

    if (shareUrl) {

        window.open(shareUrl, '_blank');

    }

}



function copyToClipboard(text) {

    if (navigator.clipboard) {

        navigator.clipboard.writeText(text);

    } else {

        // Fallback for older browsers

        const textArea = document.createElement('textarea');

        textArea.value = text;

        document.body.appendChild(textArea);

        textArea.select();

        document.execCommand('copy');

        document.body.removeChild(textArea);

    }

}



async function getCurrentPost(postId) {

    try {

        const posts = await loadData('posts.json');

        return posts.find(post => post.id === postId);

    } catch (error) {

        console.error('Error loading posts:', error);

        return null;

    }

}



// Share menu functionality

async function showShareMenu(postId, button) {

    const existingMenu = document.querySelector('.share-menu');

    if (existingMenu) {

        existingMenu.remove();

    }

    

    // Get post data for title

    const posts = await loadData('posts.json');

    const post = posts.find(p => p.id === postId);

    const title = post ? post.title : 'Check out this post';

    const url = `${window.location.origin}/gallery.php?post=${postId}`;

    

    const shareMenu = document.createElement('div');

    shareMenu.className = 'share-menu-dropdown';

    shareMenu.innerHTML = `

        <button class="share-menu-close">

            <i class="fas fa-times"></i>

        </button>

        <button class="share-menu-item" data-platform="whatsapp">

            <i class="fab fa-whatsapp"></i>

            <span>Share on WhatsApp</span>

        </button>

        <button class="share-menu-item" data-platform="instagram">

            <i class="fab fa-instagram"></i>

            <span>Share on Instagram</span>

        </button>

        <button class="share-menu-item" data-platform="copy">

            <i class="fas fa-link"></i>

            <span>Copy Link</span>

        </button>

        <button class="share-menu-item" data-platform="native">

            <i class="fas fa-share"></i>

            <span>Share</span>

        </button>

    `;

    

    document.body.appendChild(shareMenu);

    

    // Show menu with animation

    setTimeout(() => shareMenu.classList.add('show'), 10);

    

    // Add close button listener

    const closeBtn = shareMenu.querySelector('.share-menu-close');

    if (closeBtn) {

        closeBtn.addEventListener('click', () => shareMenu.remove());

    }

    

    // Add event listeners

    shareMenu.querySelectorAll('.share-menu-item').forEach(option => {

        option.addEventListener('click', function(e) {

            e.preventDefault();

            e.stopPropagation();

            

            const platform = this.dataset.platform;

            shareMenu.remove();

            

            switch(platform) {

                case 'whatsapp':

                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`;

                    window.open(whatsappUrl, '_blank');

                    break;

                case 'instagram':

                    copyToClipboard(url);

                    showNotification('Link copied! Paste it in your Instagram post or story', 'info');

                    break;

                case 'copy':

                    copyToClipboard(url);

                    showNotification('Link copied to clipboard!', 'success');

                    break;

                case 'native':

                    // Use native share API if available

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

                    break;

            }

        });

    });

    

    // Close menu when clicking outside

    setTimeout(() => {

        document.addEventListener('click', function closeShareMenu(e) {

            if (!shareMenu.contains(e.target)) {

                shareMenu.remove();

                document.removeEventListener('click', closeShareMenu);

            }

        });

    }, 100);

}



// Add notification styles to head

const notificationStyles = `

<style>

.notification {

    position: fixed;

    top: 100px;

    right: 20px;

    background: var(--bg-primary);

    border: 1px solid var(--border-color);

    border-radius: var(--radius-lg);

    box-shadow: 0 10px 30px var(--shadow-color);

    min-width: 300px;

    z-index: 3000;

    transform: translateX(400px);

    transition: transform var(--transition-normal);

}



.notification.show {

    transform: translateX(0);

}



.notification-content {

    padding: var(--spacing-lg);

    display: flex;

    align-items: center;

    justify-content: space-between;

}



.notification-message {

    color: var(--text-primary);

    font-weight: 500;

}



.notification-close {

    background: none;

    border: none;

    color: var(--text-muted);

    font-size: 1.2rem;

    cursor: pointer;

    margin-left: var(--spacing-md);

}



.notification-success {

    border-left: 4px solid var(--accent-success);

}



.notification-error {

    border-left: 4px solid var(--accent-danger);

}



.notification-warning {

    border-left: 4px solid var(--accent-warning);

}



.notification-info {

    border-left: 4px solid var(--accent-primary);

}

</style>

`;



document.head.insertAdjacentHTML('beforeend', notificationStyles);



// Scroll Functionality

function initScrollFunctionality() {

    const scrollToTopBtn = document.getElementById('scroll-to-top');

    if (scrollToTopBtn) {

        // Show/hide scroll to top button based on scroll position

        window.addEventListener('scroll', function() {

            if (window.pageYOffset > 300) {

                scrollToTopBtn.classList.add('show');

            } else {

                scrollToTopBtn.classList.remove('show');

            }

        });

        

        // Smooth scroll to top functionality

        scrollToTopBtn.addEventListener('click', function(e) {

            e.preventDefault();

            scrollToTop();

        });

    }

    

    // Initialize smooth scrolling for anchor links

    initSmoothScrolling();

}



function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior: 'smooth'

    });

}



function initSmoothScrolling() {

    // Add smooth scrolling to all anchor links that point to sections on the same page

    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {

        link.addEventListener('click', function(e) {

            const targetId = this.getAttribute('href');

            

            // Skip if it's just "#" or empty

            if (targetId === '#' || targetId === '') return;

            

            const targetElement = document.querySelector(targetId);

            if (targetElement) {

                e.preventDefault();

                

                // Calculate offset to account for fixed navbar

                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;

                const targetPosition = targetElement.offsetTop - navbarHeight;

                

                window.scrollTo({

                    top: targetPosition,

                    behavior: 'smooth'

                });

            }

        });

    });

}



// Enhanced scroll utilities

function scrollToElement(element, offset = 80) {

    if (typeof element === 'string') {

        element = document.querySelector(element);

    }

    

    if (element) {

        const targetPosition = element.offsetTop - offset;

        window.scrollTo({

            top: targetPosition,

            behavior: 'smooth'

        });

    }

}



function isElementInViewport(element) {

    if (typeof element === 'string') {

        element = document.querySelector(element);

    }

    

    if (!element) return false;

    

    const rect = element.getBoundingClientRect();

    return (

        rect.top >= 0 &&

        rect.left >= 0 &&

        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&

        rect.right <= (window.innerWidth || document.documentElement.clientWidth)

    );

}



// Notifications
let notificationIntervalId = null;
let notificationsInitialized = false;

function initNotifications() {

    if (!currentUser) return;
    
    // Prevent duplicate initialization
    if (notificationsInitialized) {
        updateNotificationBadge();
        return;
    }
    
    notificationsInitialized = true;

    

    const notificationMenu = document.getElementById('notification-menu');

    const notificationBtn = document.getElementById('notification-btn');

    const notificationDropdown = document.getElementById('notification-dropdown');

    const markAllReadBtn = document.getElementById('mark-all-read');

    

    if (notificationMenu) {

        notificationMenu.style.display = 'block';

    }

    

    if (notificationBtn && notificationDropdown) {

        const newNotificationBtn = notificationBtn.cloneNode(true);
        notificationBtn.parentNode.replaceChild(newNotificationBtn, notificationBtn);

        newNotificationBtn.addEventListener('click', function(e) {

            e.stopPropagation();

            document.getElementById('notification-dropdown').classList.toggle('show');

            if (document.getElementById('notification-dropdown').classList.contains('show')) {

                loadNotifications();

            }

        });

        

        document.addEventListener('click', function() {

            const dropdown = document.getElementById('notification-dropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }

        });

    }

    

    if (markAllReadBtn) {

        const newMarkAllReadBtn = markAllReadBtn.cloneNode(true);
        markAllReadBtn.parentNode.replaceChild(newMarkAllReadBtn, markAllReadBtn);
        newMarkAllReadBtn.addEventListener('click', markAllNotificationsRead);

    }

    

    // Load notification count on init

    updateNotificationBadge();

    

    // Clear any existing interval and start a new one
    if (notificationIntervalId) {
        clearInterval(notificationIntervalId);
    }
    notificationIntervalId = setInterval(updateNotificationBadge, 30000);

}



async function loadNotifications() {

    if (!currentUser) return;

    

    try {

        const response = await fetch(`/api/notifications.php?userId=${currentUser.id}`);
        if (!response.ok) throw new Error('Failed to load notifications');
        const notifications = await response.json();

        const userNotifications = notifications.sort((a, b) => new Date(b.created) - new Date(a.created));

        

        const notificationList = document.getElementById('notification-list');

        if (!notificationList) return;

        

        if (userNotifications.length === 0) {

            notificationList.innerHTML = '<p class="no-notifications">No notifications</p>';

            return;

        }

        

        notificationList.innerHTML = userNotifications.map(notification => `

            <div class="notification-item ${notification.isRead ? 'read' : 'unread'}" data-notification-id="${notification.id}">

                <div class="notification-content" onclick="handleNotificationClick('${notification.id}', '${notification.relatedId || ''}')">

                    <p>${notification.message}</p>

                    <span class="notification-time">${formatDate(notification.created)}</span>

                </div>

                <button class="notification-mark-read" onclick="markNotificationRead(event, '${notification.id}')" title="${notification.isRead ? 'Already read' : 'Mark as read'}">

                    <i class="fas fa-check"></i>

                </button>

            </div>

        `).join('');

        

    } catch (error) {

        console.error('Error loading notifications:', error);

    }

}



async function updateNotificationBadge() {

    if (!currentUser) return;

    

    try {

        const response = await fetch(`/api/notifications.php?userId=${currentUser.id}`);
        if (!response.ok) throw new Error('Failed to load notifications');
        const notifications = await response.json();
        const unreadCount = notifications.filter(n => !n.isRead).length;

        

        const badge = document.getElementById('notification-badge');

        if (badge) {

            if (unreadCount > 0) {

                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;

                badge.style.display = 'inline-block';

            } else {

                badge.style.display = 'none';

            }

        }

    } catch (error) {

        console.error('Error updating notification badge:', error);

    }

}



async function handleNotificationClick(notificationId, postId, commentId) {

    try {

        // Navigate to the post

        window.location.href = `gallery.php?post=${postId}`;

    } catch (error) {

        console.error('Error handling notification click:', error);

    }

}



async function markNotificationRead(event, notificationId) {
    event.stopPropagation();
    
    if (!currentUser) return;

    try {
        const response = await fetch('/api/notifications.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'mark_read',
                notificationId: notificationId,
                userId: currentUser.id
            })
        });

        if (!response.ok) throw new Error('Failed to mark notification as read');

        loadNotifications();
        updateNotificationBadge();

    } catch (error) {

        console.error('Error marking notification as read:', error);

    }

}



async function markAllNotificationsRead() {

    if (!currentUser) return;

    

    try {
        const response = await fetch('/api/notifications.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'mark_all_read',
                userId: currentUser.id
            })
        });

        if (!response.ok) throw new Error('Failed to mark all notifications as read');

        await loadNotifications();

        await updateNotificationBadge();

        showNotification('All notifications marked as read', 'success');

    } catch (error) {

        console.error('Error marking all notifications as read:', error);

    }

}