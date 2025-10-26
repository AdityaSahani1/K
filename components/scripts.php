<?php
$pageSpecificJS = $pageSpecificJS ?? [];
if (!is_array($pageSpecificJS)) {
    $pageSpecificJS = [$pageSpecificJS];
}
?>
<script src="js/auth.js"></script>
<script src="js/main.js"></script>
<?php foreach ($pageSpecificJS as $script): ?>
<script src="js/<?= htmlspecialchars($script) ?>"></script>
<?php endforeach; ?>
<script>
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

let deferredPrompt;
const pwaInstallBtn = document.getElementById('pwa-install-btn');

// Check if already installed (only check actual install state, not localStorage)
const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

function updateInstallButtonState(installed) {
    if (!pwaInstallBtn) return;
    
    if (installed) {
        pwaInstallBtn.innerHTML = '<i class="fas fa-check-circle"></i><div class="btn-text"><small>Already</small><strong>Installed</strong></div>';
        pwaInstallBtn.disabled = true;
        pwaInstallBtn.style.opacity = '0.7';
        pwaInstallBtn.style.cursor = 'not-allowed';
    } else {
        pwaInstallBtn.innerHTML = '<i class="fas fa-download"></i><div class="btn-text"><small>Install</small><strong>Progressive Web App</strong></div>';
        pwaInstallBtn.disabled = false;
        pwaInstallBtn.style.opacity = '1';
        pwaInstallBtn.style.cursor = 'pointer';
    }
}

// Initialize button state
// Initialization removed - button will be enabled when beforeinstallprompt fires

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA: beforeinstallprompt event fired - app is installable');
    e.preventDefault();
    deferredPrompt = e;
    
    // Only enable if not already installed
    if (!isInstalled) {
        updateInstallButtonState(false);
        console.log('PWA: Install button is now enabled');
        showPWAPopupFirstTime();
    }
});

if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            showNotification('App is already installed or cannot be installed on this device', 'info');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            showNotification('Thanks for installing SnapSera!', 'success');
            updateInstallButtonState(true);
        }
        
        deferredPrompt = null;
    });
}

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateInstallButtonState(true);
    showNotification('SnapSera installed successfully!', 'success');
});

function showPWAPopupFirstTime() {
    const hasSeenPopup = localStorage.getItem('pwa_popup_shown');
    
    if (hasSeenPopup || !deferredPrompt) {
        return;
    }
    
    // Check if popup already exists to prevent duplicates
    if (document.querySelector('.pwa-install-popup')) {
        return;
    }
    
    const popup = document.createElement('div');
    popup.className = 'pwa-install-popup';
    popup.innerHTML = `
        <button class="pwa-popup-close" aria-label="Close">&times;</button>
        <div class="pwa-popup-content">
            <div class="pwa-popup-icon">
                <i class="fas fa-mobile-alt"></i>
            </div>
            <div class="pwa-popup-text">
                <h4>Install SnapSera</h4>
                <p>Install our app for a better experience! Access it instantly from your home screen.</p>
                <div class="pwa-popup-buttons">
                    <button class="pwa-popup-btn primary" id="popup-install-btn">
                        <i class="fas fa-download"></i> Install
                    </button>
                    <button class="pwa-popup-btn secondary" id="popup-later-btn">
                        Later
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => popup.classList.add('show'), 1000);
    
    const closeBtn = popup.querySelector('.pwa-popup-close');
    const laterBtn = popup.querySelector('#popup-later-btn');
    const installBtn = popup.querySelector('#popup-install-btn');
    
    const closePopup = () => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 400);
        localStorage.setItem('pwa_popup_shown', 'dismissed');
    };
    
    closeBtn.addEventListener('click', closePopup);
    laterBtn.addEventListener('click', closePopup);
    
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            showNotification('Installation not available at the moment', 'info');
            closePopup();
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            showNotification('Thanks for installing SnapSera!', 'success');
            updateInstallButtonState(true);
        }
        
        closePopup();
        deferredPrompt = null;
    });
}
</script>
