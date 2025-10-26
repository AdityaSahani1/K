// PWA Installation Prompt Handler
let deferredPrompt;
let installPromptShown = false;

// Initialize PWA install functionality
function initPWAInstall() {
    // Check if already installed
    if (isAppInstalled()) {
        return;
    }
    // Check if prompt was dismissed recently
    const dismissedTime = localStorage.getItem('pwa-dismissed');
    if (dismissedTime) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
            return;
        }
    }
    // Show prompt after delay on first visit or returning users
    const hasVisitedBefore = localStorage.getItem('has-visited');
    const delay = hasVisitedBefore ? 30000 : 10000;
    setTimeout(() => {
        if (deferredPrompt && !installPromptShown) {
            showInstallPrompt();
        }
    }, delay);
    localStorage.setItem('has-visited', 'true');
}

// Check if app is already installed
function isAppInstalled() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }
    if (window.navigator.standalone === true) {
        return true;
    }
    return false;
}

// Capture beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!installPromptShown && !isAppInstalled()) {
        const hasVisitedBefore = localStorage.getItem('has-visited');
        const delay = hasVisitedBefore ? 30000 : 10000;
        setTimeout(() => {
            if (!installPromptShown) {
                showInstallPrompt();
            }
        }, delay);
    }
});

// Show custom install prompt
function showInstallPrompt() {
    if (installPromptShown || isAppInstalled()) {
        return;
    }
    installPromptShown = true;
    const installCard = document.createElement('div');
    installCard.className = 'pwa-install-card';
    installCard.innerHTML = `
        <div class="pwa-install-content">
            <button class="pwa-install-close" onclick="dismissInstallPrompt()">&times;</button>
            <div class="pwa-install-icon">
                <img src="/assets/pwa-icons/icon-192x192.png" alt="SnapSera">
            </div>
            <h3>Install SnapSera</h3>
            <p>Install our app for a better experience with offline access and quick launch from your home screen.</p>
            <div class="pwa-install-buttons">
                <button class="pwa-install-btn" onclick="installPWA()">
                    <i class="fas fa-download"></i> Install
                </button>
                <button class="pwa-dismiss-btn" onclick="dismissInstallPrompt()">
                    Not Now
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(installCard);
    setTimeout(() => installCard.classList.add('show'), 100);
}

// Install PWA
async function installPWA() {
    if (!deferredPrompt) {
        showNotification('Installation is not available on this device', 'info');
        return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        showNotification('Thank you for installing SnapSera!', 'success');
    }
    deferredPrompt = null;
    hideInstallPrompt();
}

// Dismiss install prompt
function dismissInstallPrompt() {
    localStorage.setItem('pwa-dismissed', Date.now().toString());
    hideInstallPrompt();
}

// Hide install prompt
function hideInstallPrompt() {
    const installCard = document.querySelector('.pwa-install-card');
    if (installCard) {
        installCard.classList.remove('show');
        setTimeout(() => installCard.remove(), 300);
    }
    installPromptShown = false;
}

// Handle app installed event
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
    hideInstallPrompt();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        initPWAInstall();
    }
});
