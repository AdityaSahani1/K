document.addEventListener('DOMContentLoaded', async () => {
    await loadChangelog();
});

async function loadChangelog() {
    const container = document.getElementById('changelog-content');
    try {
        const response = await fetch('/api/changelog.php');
        if (!response.ok) throw new Error('Failed to load changelog');
        const changelog = await response.json();

        if (changelog.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>No changelog entries yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = changelog.map(entry => `
            <div class="changelog-entry">
                <h2 class="changelog-version-title">${escapeHtml(entry.version)}</h2>
                <div class="changelog-date">
                    <i class="far fa-calendar"></i>
                    ${formatDate(entry.release_date)}
                </div>
                <h3 class="changelog-title">${escapeHtml(entry.title)}</h3>
                <p class="changelog-description">${escapeHtml(entry.description)}</p>
                ${entry.changes ? renderChanges(entry.changes) : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading changelog:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load changelog</p>
            </div>
        `;
    }
}

async function checkForNewChangelog() {
    try {
        const versionResponse = await fetch('/api/version.php');
        if (!versionResponse.ok) return;

        const versionData = await versionResponse.json();
        if (!versionData || !versionData.version) return;

        const currentVersion = versionData.version;
        const lastSeenVersion = localStorage.getItem('last_seen_changelog_version');

        if (!lastSeenVersion || currentVersion !== lastSeenVersion) {
            showChangelogNotification(currentVersion);
            localStorage.setItem('last_seen_changelog_version', currentVersion);
        }
    } catch (error) {
        console.error('Error checking changelog version:', error);
    }
}

function showChangelogNotification(version) {
    const hasSeenNotification = sessionStorage.getItem(`changelog_notif_${version}`);
    if (hasSeenNotification) return;

    const notification = document.createElement('div');
    notification.className = 'changelog-notification';
    notification.innerHTML = `
        <div class="changelog-notif-content">
            <div class="changelog-notif-icon">
                <i class="fas fa-rocket"></i>
            </div>
            <div class="changelog-notif-text">
                <h4>New Update Available!</h4>
                <p>SnapSera v${version} is now live with new features and improvements</p>
            </div>
            <button class="changelog-notif-btn" onclick="window.location.href='changelog.php'">
                View Changelog
            </button>
            <button class="changelog-notif-close" onclick="this.closest('.changelog-notification').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    sessionStorage.setItem(`changelog_notif_${version}`, 'seen');

    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }
    }, 10000);
}

function renderChanges(changesJson) {
    try {
        const changes = JSON.parse(changesJson);
        let html = '<div class="changelog-changes">';

        if (changes.features && changes.features.length > 0) {
            html += '<h4><i class="fas fa-star"></i> Features</h4><ul>';
            changes.features.forEach(feature => {
                html += `<li><span class="change-type feature">Feature</span>${escapeHtml(feature)}</li>`;
            });
            html += '</ul>';
        }

        if (changes.fixes && changes.fixes.length > 0) {
            html += '<h4><i class="fas fa-wrench"></i> Fixes</h4><ul>';
            changes.fixes.forEach(fix => {
                html += `<li><span class="change-type fix">Fix</span>${escapeHtml(fix)}</li>`;
            });
            html += '</ul>';
        }

        if (changes.improvements && changes.improvements.length > 0) {
            html += '<h4><i class="fas fa-arrow-up"></i> Improvements</h4><ul>';
            changes.improvements.forEach(improvement => {
                html += `<li><span class="change-type improvement">Improvement</span>${escapeHtml(improvement)}</li>`;
            });
            html += '</ul>';
        }

        if (changes.breaking && changes.breaking.length > 0) {
            html += '<h4><i class="fas fa-exclamation-triangle"></i> Breaking Changes</h4><ul>';
            changes.breaking.forEach(breaking => {
                html += `<li><span class="change-type breaking">Breaking</span>${escapeHtml(breaking)}</li>`;
            });
            html += '</ul>';
        }

        html += '</div>';
        return html;
    } catch (error) {
        console.error('Error parsing changes:', error);
        return '';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
