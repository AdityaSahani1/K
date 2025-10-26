-- SnapSera Database Schema
-- MySQL Database for InfinityFree Hosting

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created DATETIME NOT NULL,
    bio TEXT,
    profilePicture VARCHAR(500),
    isVerified BOOLEAN DEFAULT FALSE,
    otpToken VARCHAR(10),
    otpExpires DATETIME,
    otpCreated DATETIME,
    passwordResetToken VARCHAR(100),
    passwordResetExpires DATETIME,
    lastLogin DATETIME,
    canPost TINYINT(1) DEFAULT 0,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    imageUrl VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags JSON,
    author VARCHAR(50) NOT NULL,
    created DATETIME NOT NULL,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    views INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    downloadUrl VARCHAR(500),
    FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_author (author),
    INDEX idx_created (created),
    INDEX idx_featured (featured)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(50) PRIMARY KEY,
    postId VARCHAR(50) NOT NULL,
    userId VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created DATETIME NOT NULL,
    likes INT DEFAULT 0,
    replyTo VARCHAR(50),
    replyToUsername VARCHAR(100),
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_postId (postId),
    INDEX idx_userId (userId),
    INDEX idx_created (created)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Likes Table
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId VARCHAR(50) NOT NULL,
    userId VARCHAR(50) NOT NULL,
    created DATETIME NOT NULL,
    UNIQUE KEY unique_like (postId, userId),
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_postId (postId),
    INDEX idx_userId (userId)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Comment Likes Table
CREATE TABLE IF NOT EXISTS comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commentId VARCHAR(50) NOT NULL,
    userId VARCHAR(50) NOT NULL,
    created DATETIME NOT NULL,
    UNIQUE KEY unique_comment_like (commentId, userId),
    FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_commentId (commentId),
    INDEX idx_userId (userId)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Saves Table (Saved Posts)
CREATE TABLE IF NOT EXISTS saves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId VARCHAR(50) NOT NULL,
    userId VARCHAR(50) NOT NULL,
    created DATETIME NOT NULL,
    UNIQUE KEY unique_save (postId, userId),
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_postId (postId),
    INDEX idx_userId (userId)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Views Table
CREATE TABLE IF NOT EXISTS views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId VARCHAR(50) NOT NULL,
    userId VARCHAR(50),
    ipAddress VARCHAR(50),
    created DATETIME NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_postId (postId),
    INDEX idx_userId (userId),
    INDEX idx_created (created)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50) NOT NULL,
    actorId VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    relatedId VARCHAR(50),
    isRead TINYINT(1) DEFAULT 0,
    readAt DATETIME,
    created DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_userId (userId),
    INDEX idx_isRead (isRead),
    INDEX idx_created (created DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    created DATETIME NOT NULL,
    userEmail VARCHAR(255),
    status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
    INDEX idx_status (status),
    INDEX idx_created (created)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Post Images Table (for multiple images per post)
CREATE TABLE IF NOT EXISTS post_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId VARCHAR(50) NOT NULL,
    imageUrl VARCHAR(500) NOT NULL,
    displayOrder INT DEFAULT 0,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_postId (postId),
    INDEX idx_displayOrder (displayOrder)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Post Downloads Table (for multiple download URLs with names)
CREATE TABLE IF NOT EXISTS post_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    downloadUrl VARCHAR(500) NOT NULL,
    displayOrder INT DEFAULT 0,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_postId (postId),
    INDEX idx_displayOrder (displayOrder)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Changelogs Table
CREATE TABLE IF NOT EXISTS changelogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    changes TEXT,
    release_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_version (version),
    INDEX idx_release_date (release_date DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Delete all existing data
DELETE FROM post_downloads;
DELETE FROM post_images;
DELETE FROM comment_likes;
DELETE FROM likes;
DELETE FROM saves;
DELETE FROM views;
DELETE FROM notifications;
DELETE FROM contacts;
DELETE FROM comments;
DELETE FROM posts;
DELETE FROM users;

-- Insert default admin user
-- Password is 'admin123' (bcrypt hashed)
INSERT INTO users (id, name, username, email, password, role, created, isVerified) VALUES
('user_admin2025', 'SnapSera Admin', 'snapsera', 'snapsera.team@gmail.com', '$2y$10$UIU/aPr84wQuoVJDa79OquN8VCmOtNRTTJTrYlOOUbc28sLqx9Jcm', 'admin', '2025-10-20 00:00:00', 1);

-- Insert 15 fresh sample posts with zero stats (5 with download URLs)
INSERT INTO posts (id, title, description, imageUrl, category, tags, author, created, likes, comments, views, featured, downloadUrl) VALUES
('post_fresh_001', 'Golden Hour Photography', 'Stunning golden hour landscape with warm tones', 'https://picsum.photos/800/600?random=101', 'photography', '["landscape","golden-hour","nature"]', 'user_admin2025', '2025-10-20 10:00:00', 0, 0, 0, 1, NULL),
('post_fresh_002', 'Minimalist Design', 'Clean and modern minimalist design concept', 'https://picsum.photos/800/600?random=102', 'design', '["minimalist","modern","clean"]', 'user_admin2025', '2025-10-19 10:00:00', 0, 0, 0, 0, NULL),
('post_fresh_003', 'Watercolor Dreams', 'Beautiful watercolor painting with soft colors', 'https://picsum.photos/800/600?random=103', 'art', '["watercolor","painting","art"]', 'user_admin2025', '2025-10-18 10:00:00', 0, 0, 0, 0, NULL),
('post_fresh_004', 'Urban Architecture', 'Modern skyscraper with glass reflections', 'https://picsum.photos/800/600?random=104', 'photography', '["architecture","urban","building"]', 'user_admin2025', '2025-10-17 10:00:00', 0, 0, 0, 0, NULL),
('post_fresh_005', 'Digital Portrait', 'Creative digital portrait with vibrant colors', 'https://picsum.photos/800/600?random=105', 'digital', '["portrait","digital","illustration"]', 'user_admin2025', '2025-10-16 10:00:00', 0, 0, 0, 0, NULL),
('post_fresh_006', 'Mountain Peak', 'Majestic mountain peak at sunrise', 'https://picsum.photos/800/600?random=106', 'nature', '["mountain","sunrise","landscape"]', 'user_admin2025', '2025-10-15 10:00:00', 0, 0, 0, 0, NULL),
('post_fresh_007', 'Abstract Colors', 'Bold abstract art with vibrant color palette', 'https://picsum.photos/800/600?random=107', 'art', '["abstract","colors","modern"]', 'user_admin2025', '2025-10-14 10:00:00', 0, 0, 0, 0, NULL),
('post_fresh_008', 'Coastal Sunset', 'Breathtaking coastal sunset view', 'https://picsum.photos/800/600?random=108', 'photography', '["sunset","coastal","ocean"]', 'user_admin2025', '2025-10-13 10:00:00', 0, 0, 0, 0, NULL),
('post_fresh_009', '3D Render', 'Photorealistic 3D rendering', 'https://picsum.photos/800/600?random=109', 'digital', '["3d","render","digital"]', 'user_admin2025', '2025-10-12 10:00:00', 0, 0, 0, 0, NULL),
('post_fresh_010', 'Nature Details', 'Macro photography of natural textures', 'https://picsum.photos/800/600?random=110', 'nature', '["macro","nature","details"]', 'user_admin2025', '2025-10-11 10:00:00', 0, 0, 0, 0, NULL),
('post_fresh_011', 'Premium Landscape Pack', 'High-resolution landscape photography collection', 'https://picsum.photos/800/600?random=111', 'photography', '["landscape","collection","premium"]', 'user_admin2025', '2025-10-10 10:00:00', 0, 0, 0, 1, 'https://picsum.photos/1920/1080?random=111'),
('post_fresh_012', 'Vector Art Bundle', 'Modern vector illustrations and graphics', 'https://picsum.photos/800/600?random=112', 'design', '["vector","bundle","graphics"]', 'user_admin2025', '2025-10-09 10:00:00', 0, 0, 0, 0, 'https://picsum.photos/1920/1080?random=112'),
('post_fresh_013', 'Texture Collection', 'Seamless patterns and textures for design', 'https://picsum.photos/800/600?random=113', 'art', '["textures","patterns","seamless"]', 'user_admin2025', '2025-10-08 10:00:00', 0, 0, 0, 0, 'https://picsum.photos/1920/1080?random=113'),
('post_fresh_014', 'Digital Wallpaper Set', 'Beautiful desktop and mobile wallpapers', 'https://picsum.photos/800/600?random=114', 'digital', '["wallpaper","desktop","mobile"]', 'user_admin2025', '2025-10-07 10:00:00', 0, 0, 0, 0, 'https://picsum.photos/1920/1080?random=114'),
('post_fresh_015', 'Nature Photo Pack', 'Stunning nature photography in 4K', 'https://picsum.photos/800/600?random=115', 'nature', '["nature","4k","photo-pack"]', 'user_admin2025', '2025-10-06 10:00:00', 0, 0, 0, 0, 'https://picsum.photos/1920/1080?random=115');

-- Sample changelog entries with proper version format
INSERT INTO changelogs (version, title, description, changes, release_date) VALUES
('SnapSera v1.3.0', 'UI/UX Improvements & Bug Fixes', 'Enhanced user interface with modern design patterns and critical bug fixes', '{"features":["Bottom slide-up sheet for share menu (modern mobile UX)","Improved post modal button layout for mobile devices","Enhanced backdrop overlays for better focus"],"improvements":["Like, Save, and Share buttons now aligned in one row on mobile","Download button gets full width below action buttons","Share menu slides from bottom with smooth animations","Added backdrop click to close share menu"],"fixes":["Fixed PWA installation popup showing when app already installed","Fixed share menu UX to match modern app patterns","Fixed button layout responsiveness on small screens"]}', '2025-10-26'),
('SnapSera v1.2.0', 'CRUD Operations & Cross-Platform Compatibility', 'Major fixes for data persistence and shared hosting compatibility', '{"features":["POST-based CRUD operations for cross-platform support","Edit posts without re-uploading images","Enhanced error handling with visual notifications"],"improvements":["Converted PUT/DELETE to POST with action parameters","Better compatibility with shared hosting platforms","Improved API response handling"],"fixes":["Fixed CRUD operations not persisting on shared hosting","Fixed edit post requiring image re-upload","Fixed base64 validation errors in edit mode"]}', '2025-10-24'),
('SnapSera v1.1.0', 'Performance & Stability', 'Backend optimizations and bug fixes', '{"improvements":["Optimized database queries","Improved API response times","Enhanced caching strategy"],"fixes":["Fixed comment deletion issues","Fixed profile update problems","Resolved image upload edge cases"]}', '2025-10-15'),
('SnapSera v1.0.0', 'Initial Release', 'First stable release of SnapSera photography portfolio', '{"features":["User authentication with email OTP verification","Photo gallery with category filtering","Social interactions (likes, comments, saves)","Admin panel for content management","Progressive Web App (PWA) support","Responsive design for all devices"]}', '2025-10-01');
