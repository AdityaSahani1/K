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

// Data Management
async function loadData(filename) {
    try {
        // Always load from server JSON files first (server is the source of truth)
        // Use secure API endpoint for users.json to prevent exposure of sensitive data
        if (filename === 'users.json') {
            const response = await fetch('/api/get-users');
            if (!response.ok) {
                throw new Error(`Failed to load users`);
            }
            const jsonData = await response.json();
            return jsonData;
        }
        
        // Load other data from JSON files
        const response = await fetch(`data/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        const jsonData = await response.json();
        
        return jsonData;
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        
        // Only fall back to localStorage if server fails (offline mode)
        const localStorageKey = filename.replace('.json', '');
        const localData = localStorage.getItem(localStorageKey);
        if (localData) {
            console.log(`Using cached data for ${filename}`);
            return JSON.parse(localData);
        }
        
        return [];
    }
}

async function saveData(filename, data) {
    try {
        // Save to server first (server is the source of truth)
        const response = await fetch('/api/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: filename,
                data: data
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to save ${filename} to server`);
        }
        
        // Also cache in localStorage for offline access
        const localStorageKey = filename.replace('.json', '');
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        
        return true;
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
        
        // If server save fails, at least save to localStorage
        const localStorageKey = filename.replace('.json', '');
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        
        return false;
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
function showShareMenu(postId, button) {
    const existingMenu = document.querySelector('.share-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const shareMenu = document.createElement('div');
    shareMenu.className = 'share-menu';
    shareMenu.innerHTML = `
        <div class="share-options">
            <button class="share-option" data-platform="whatsapp">
                <i class="fab fa-whatsapp"></i> WhatsApp
            </button>
            <button class="share-option" data-platform="instagram">
                <i class="fab fa-instagram"></i> Instagram
            </button>
            <button class="share-option" data-platform="copy">
                <i class="fas fa-link"></i> Copy Link
            </button>
            <button class="share-option" data-platform="share">
                <i class="fas fa-share"></i> Share
            </button>
        </div>
    `;
    
    document.body.appendChild(shareMenu);
    
    // Position menu near button
    const buttonRect = button.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    shareMenu.style.position = 'absolute';
    shareMenu.style.top = (buttonRect.bottom + scrollTop + 10) + 'px';
    shareMenu.style.left = Math.max(10, (buttonRect.left + scrollLeft - 80)) + 'px';
    shareMenu.style.zIndex = '2000';
    
    // Show menu with animation
    setTimeout(() => shareMenu.classList.add('show'), 10);
    
    // Add event listeners
    shareMenu.querySelectorAll('.share-option').forEach(option => {
        option.addEventListener('click', function() {
            const platform = this.dataset.platform;
            sharePost(postId, platform);
            shareMenu.remove();
        });
    });
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeShareMenu(e) {
            if (!shareMenu.contains(e.target)) {
                shareMenu.classList.remove('show');
                setTimeout(() => {
                    shareMenu.remove();
                    document.removeEventListener('click', closeShareMenu);
                }, 200);
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

// Add scroll progress indicator (optional enhancement)
function addScrollProgressIndicator() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progressBar);
    
    // Update progress on scroll
    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    });
}