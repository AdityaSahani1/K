let deferredPrompt;
let installCard;
let footerInstallBtn;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('SW Registered!');
        })
        .catch(error => {
            console.log('SW Registration Failed!', error);
        });
}

window.addEventListener('load', () => {
    installCard = document.getElementById('pwa-install-card');
    footerInstallBtn = document.getElementById('pwa-install-btn');
    
    const isHTTPS = window.location.protocol === 'https:' || 
                    window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    
    if (!isHTTPS && footerInstallBtn) {
        footerInstallBtn.addEventListener('click', () => {
            showHTTPSWarning();
        });
    }
});

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installDismissed = localStorage.getItem('pwa-install-dismissed');
    const lastDismissed = localStorage.getItem('pwa-install-dismissed-time');
    
    if (!installDismissed || (lastDismissed && Date.now() - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => {
            showInstallCard();
        }, 5000);
    }
    
    if (footerInstallBtn) {
        footerInstallBtn.style.display = 'flex';
        footerInstallBtn.addEventListener('click', showInstallPrompt);
    }
});

function showInstallCard() {
    if (installCard) {
        installCard.classList.add('show');
        
        const installBtn = document.getElementById('card-install-btn');
        const dismissBtn = document.getElementById('card-dismiss-btn');
        const closeBtn = document.getElementById('card-close-btn');
        
        if (installBtn) {
            installBtn.addEventListener('click', showInstallPrompt);
        }
        
        if (dismissBtn) {
            dismissBtn.addEventListener('click', dismissInstallCard);
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', dismissInstallCard);
        }
    }
}

function dismissInstallCard() {
    if (installCard) {
        installCard.classList.remove('show');
        localStorage.setItem('pwa-install-dismissed', 'true');
        localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
    }
}

async function showInstallPrompt() {
    if (!deferredPrompt) {
        showManualInstallInstructions();
        return;
    }
    
    if (installCard) {
        installCard.classList.remove('show');
    }
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        localStorage.removeItem('pwa-install-dismissed');
        localStorage.removeItem('pwa-install-dismissed-time');
    } else {
        console.log('User dismissed the install prompt');
    }
    
    deferredPrompt = null;
}

function showManualInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let message = 'To install this app:\n\n';
    
    if (isIOS) {
        message += '1. Tap the Share button (square with arrow)\n';
        message += '2. Scroll down and tap "Add to Home Screen"\n';
        message += '3. Tap "Add" in the top right corner';
    } else if (isAndroid) {
        message += '1. Tap the menu (three dots) in your browser\n';
        message += '2. Tap "Add to Home screen" or "Install app"\n';
        message += '3. Follow the on-screen instructions';
    } else {
        message += '1. Click the install icon in your browser\'s address bar\n';
        message += '2. Or click the menu (three dots) and select "Install SnapSera"\n';
        message += '3. Follow the on-screen instructions';
    }
    
    alert(message);
}

function showHTTPSWarning() {
    const message = 'PWA Installation Requirements:\n\n' +
                   '⚠️ HTTPS is required for PWA installation.\n\n' +
                   'For XAMPP (localhost):\n' +
                   '• Access via http://localhost or http://127.0.0.1\n' +
                   '• Or enable SSL/HTTPS in XAMPP\n' +
                   '• Or use ngrok: ngrok http 80\n\n' +
                   'For InfinityFree hosting:\n' +
                   '• Free accounts block PWA functionality\n' +
                   '• Consider upgrading to premium hosting\n' +
                   '• Or use Vercel, Netlify, or GitHub Pages (free HTTPS)\n\n' +
                   'Current URL: ' + window.location.href;
    
    alert(message);
}

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    
    if (installCard) {
        installCard.classList.remove('show');
    }
    
    if (footerInstallBtn) {
        footerInstallBtn.style.display = 'none';
    }
    
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('pwa-install-dismissed-time');
});
