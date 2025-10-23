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

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    if (pwaInstallBtn) {
        pwaInstallBtn.style.display = 'inline-flex';
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
        }
        
        deferredPrompt = null;
        pwaInstallBtn.style.display = 'none';
    });
}

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (pwaInstallBtn) {
        pwaInstallBtn.style.display = 'none';
    }
    showNotification('SnapSera installed successfully!', 'success');
});
</script>
