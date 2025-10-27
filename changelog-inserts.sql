-- Changelog Insert Statements for SnapSera
-- This file contains all changelog entries for easy database seeding

-- Clear existing changelogs (optional - uncomment if needed)
-- DELETE FROM changelogs;

-- SnapSera v1.4.0 - PWA Installation & Light Mode Improvements (Latest)
INSERT INTO changelogs (version, title, description, changes, release_date, created_at) VALUES (
    'SnapSera v1.4.0',
    'PWA Installation & Light Mode Improvements',
    'Enhanced Progressive Web App installation with slide-up prompts and improved button styling for light mode',
    '{"features":["Slide-up PWA install card that appears 5 seconds after page load","Smart install prompt with 7-day dismissal cooldown","HTTPS requirement detection and helpful warnings","Manual installation instructions for iOS/Android","Footer PWA install button with improved visibility"],"improvements":["Enhanced button styling for light mode with purple gradients","Better contrast and visibility for all download buttons","Improved border colors and hover effects","Smart detection of beforeinstallprompt event","Automatic hiding of install button after app is installed"],"fixes":["Fixed PWA install button styling in light mode","Fixed install prompt not showing on supported browsers","Fixed button contrast issues in light theme"]}',
    '2025-10-27',
    datetime('now')
);

-- SnapSera v1.3.0 - UI/UX Improvements & Bug Fixes
INSERT INTO changelogs (version, title, description, changes, release_date, created_at) VALUES (
    'SnapSera v1.3.0',
    'UI/UX Improvements & Bug Fixes',
    'Enhanced user interface with modern design patterns and critical bug fixes',
    '{"features":["Bottom slide-up sheet for share menu (modern mobile UX)","Improved post modal button layout for mobile devices","Enhanced backdrop overlays for better focus"],"improvements":["Like, Save, and Share buttons now aligned in one row on mobile","Download button gets full width below action buttons","Share menu slides from bottom with smooth animations","Added backdrop click to close share menu"],"fixes":["Fixed PWA installation popup showing when app already installed","Fixed share menu UX to match modern app patterns","Fixed button layout responsiveness on small screens"]}',
    '2025-10-26',
    datetime('now')
);

-- SnapSera v1.2.0 - CRUD Operations & Cross-Platform Compatibility
INSERT INTO changelogs (version, title, description, changes, release_date, created_at) VALUES (
    'SnapSera v1.2.0',
    'CRUD Operations & Cross-Platform Compatibility',
    'Major fixes for data persistence and shared hosting compatibility',
    '{"features":["POST-based CRUD operations for cross-platform support","Edit posts without re-uploading images","Enhanced error handling with visual notifications"],"improvements":["Converted PUT/DELETE to POST with action parameters","Better compatibility with shared hosting platforms","Improved API response handling"],"fixes":["Fixed CRUD operations not persisting on shared hosting","Fixed edit post requiring image re-upload","Fixed base64 validation errors in edit mode"]}',
    '2025-10-24',
    datetime('now')
);

-- SnapSera v1.1.0 - Performance & Stability
INSERT INTO changelogs (version, title, description, changes, release_date, created_at) VALUES (
    'SnapSera v1.1.0',
    'Performance & Stability',
    'Backend optimizations and bug fixes',
    '{"improvements":["Optimized database queries","Improved API response times","Enhanced caching strategy"],"fixes":["Fixed comment deletion issues","Fixed profile update problems","Resolved image upload edge cases"]}',
    '2025-10-15',
    datetime('now')
);

-- SnapSera v1.0.0 - Initial Release
INSERT INTO changelogs (version, title, description, changes, release_date, created_at) VALUES (
    'SnapSera v1.0.0',
    'Initial Release',
    'First stable release of SnapSera photography portfolio',
    '{"features":["User authentication with email OTP verification","Photo gallery with category filtering","Social interactions (likes, comments, saves)","Admin panel for content management","Progressive Web App (PWA) support","Responsive design for all devices"]}',
    '2025-10-01',
    datetime('now')
);

-- Note: The changes column stores JSON data with the following structure:
-- {
--   "features": ["feature 1", "feature 2"],
--   "improvements": ["improvement 1", "improvement 2"],
--   "fixes": ["fix 1", "fix 2"],
--   "breaking": ["breaking change 1"]  (optional)
-- }
