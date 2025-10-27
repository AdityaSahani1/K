# Changelog Notification System - How It Works

## Overview
SnapSera has an automatic changelog notification system that alerts users when a new version is released. The system uses localStorage to track which version the user has last seen.

## How It Works

### 1. Version Storage
- **Location**: `config/version.php`
- **Format**: 
  ```php
  return [
      'version' => '1.4.0',
      'release_date' => '2025-10-27'
  ];
  ```

### 2. Changelog Database
- **Table**: `changelogs`
- **Columns**:
  - `id` - Auto-increment primary key
  - `version` - Version string (e.g., "SnapSera v1.4.0")
  - `title` - Short title of the update
  - `description` - Brief description
  - `changes` - JSON string with categorized changes
  - `release_date` - Release date
  - `created_at` - Timestamp

### 3. Notification Logic

#### JavaScript Flow (js/main.js - lines 1452-1518)

```javascript
// 1. Check for updates on page load (except on changelog.php)
async function checkForUpdates() {
    const response = await fetch('/api/changelog.php');
    const changelog = await response.json();
    const latestEntry = changelog[0]; // Most recent entry
    const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion');
    
    // Show notification if version is new or different
    if (!lastSeenVersion || lastSeenVersion !== latestEntry.version) {
        showChangelogNotification(latestEntry);
    }
}

// 2. When user clicks "View Changelog"
function viewChangelog(version) {
    localStorage.setItem('lastSeenChangelogVersion', version);
    document.querySelector('.changelog-notification')?.remove();
    window.location.href = 'changelog.php';
}

// 3. When user clicks "Dismiss"
function dismissChangelog(version) {
    localStorage.setItem('lastSeenChangelogVersion', version);
    document.querySelector('.changelog-notification')?.remove();
}
```

### 4. User Experience

1. **First Visit**: No `lastSeenChangelogVersion` in localStorage → Notification shows
2. **User Dismisses**: Version stored in localStorage → No notification on refresh
3. **New Update Released**: 
   - Admin adds new changelog entry with version "SnapSera v1.5.0"
   - User visits site
   - System compares: `localStorage.getItem('lastSeenChangelogVersion')` ("SnapSera v1.4.0") ≠ latest entry version ("SnapSera v1.5.0")
   - Notification shows again!
4. **After Viewing/Dismissing**: New version stored → No notification until next update

## Adding a New Changelog Entry

### Method 1: Using SQL File (Recommended for Bulk Import)

```bash
# Use the provided changelog-inserts.sql file
sqlite3 data/snapsera.db < changelog-inserts.sql
```

### Method 2: Manual SQL Insert

```sql
INSERT INTO changelogs (version, title, description, changes, release_date, created_at) 
VALUES (
    'SnapSera v1.5.0',
    'Your Update Title',
    'Brief description of the update',
    '{"features":["Feature 1","Feature 2"],"improvements":["Improvement 1"],"fixes":["Fix 1"]}',
    '2025-11-01',
    datetime('now')
);
```

### Method 3: Using PHP (Programmatic)

```php
$db = new PDO('sqlite:data/snapsera.db');
$stmt = $db->prepare('INSERT INTO changelogs (version, title, description, changes, release_date, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))');
$stmt->execute([
    'SnapSera v1.5.0',
    'Your Update Title',
    'Brief description',
    json_encode([
        'features' => ['Feature 1', 'Feature 2'],
        'improvements' => ['Improvement 1'],
        'fixes' => ['Fix 1'],
        'breaking' => [] // Optional
    ]),
    '2025-11-01'
]);
```

## Changes JSON Structure

The `changes` column stores a JSON object with categorized updates:

```json
{
  "features": [
    "New feature description 1",
    "New feature description 2"
  ],
  "improvements": [
    "Improvement description 1",
    "Improvement description 2"
  ],
  "fixes": [
    "Bug fix description 1",
    "Bug fix description 2"
  ],
  "breaking": [
    "Breaking change description"
  ]
}
```

### Categories Displayed With:
- **Features**: ⭐ Star icon
- **Improvements**: ⬆️ Arrow up icon
- **Fixes**: 🔧 Wrench icon
- **Breaking**: ⚠️ Warning icon

## Testing the System

### 1. Clear localStorage (Test Fresh User)
```javascript
// In browser console
localStorage.removeItem('lastSeenChangelogVersion');
location.reload();
```

### 2. Set Old Version (Test Update Notification)
```javascript
// In browser console
localStorage.setItem('lastSeenChangelogVersion', 'SnapSera v1.0.0');
location.reload();
```

### 3. Set Current Version (Test No Notification)
```javascript
// In browser console
localStorage.setItem('lastSeenChangelogVersion', 'SnapSera v1.4.0');
location.reload();
```

## Version Update Checklist

When releasing a new version:

1. ✅ Update `config/version.php` with new version number
2. ✅ Update `config/config.php` SNAPSERA_VERSION if needed
3. ✅ Add new entry to `changelogs` table (use SQL file or manual insert)
4. ✅ Test notification appears for users with old lastSeenChangelogVersion
5. ✅ Test dismiss functionality
6. ✅ Test "View Changelog" button redirects correctly
7. ✅ Verify changelog page displays all entries correctly

## Current Version
- **Latest**: SnapSera v1.4.0 (PWA Installation & Light Mode Improvements)
- **Release Date**: October 27, 2025

## Files Involved
- `config/version.php` - Version configuration
- `config/config.php` - App configuration
- `api/changelog.php` - API endpoint to fetch changelogs
- `api/version.php` - API endpoint to get current version
- `js/main.js` - Notification logic (lines 1452-1544)
- `js/changelog.js` - Changelog page display logic
- `changelog-inserts.sql` - SQL file with all changelog entries
- `data/snapsera.db` - SQLite database

## Notification Display
- **Position**: Top-right corner
- **Auto-hide**: After 10 seconds (can be dismissed manually)
- **Session**: Won't show again in same session after dismiss
- **Persistent**: Will show on next visit until user views/dismisses

## Troubleshooting

### Notification Not Showing?
1. Check browser console for errors
2. Verify changelog entry exists in database
3. Check localStorage value: `localStorage.getItem('lastSeenChangelogVersion')`
4. Ensure you're not on changelog.php (notification disabled there)
5. Try clearing localStorage and refreshing

### Notification Shows Every Time?
1. Check if localStorage is being blocked (private browsing)
2. Verify dismiss/view functions are working
3. Check browser console for errors when clicking buttons

### Version Mismatch?
- Make sure changelog entry version matches format: "SnapSera vX.X.X"
- Case-sensitive comparison is used
