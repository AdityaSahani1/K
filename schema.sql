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


-- Insert default admin user
-- Password is 'admin123' (bcrypt hashed)
INSERT INTO users (id, name, username, email, password, role, created, isVerified) VALUES
('user_68e3e993baeb3', 'SnapSera Admin', 'snapsera', 'snapsera.team@gmail.com', '$2y$10$UIU/aPr84wQuoVJDa79OquN8VCmOtNRTTJTrYlOOUbc28sLqx9Jcm', 'admin', '2025-10-06 16:08:51', 1);

-- Insert 10 sample posts with zero stats
INSERT INTO posts (id, title, description, imageUrl, category, tags, author, created, likes, comments, views, featured) VALUES
('post_68e3e993cd52f', 'Mountain Sunrise', 'Beautiful sunrise over mountain peaks', 'https://picsum.photos/800/600?random=0', 'art', '["landscape","sunrise","mountains"]', 'user_68e3e993baeb3', '2025-10-06 16:08:51', 0, 0, 0, 1),
('post_68e3e993d246c', 'City Lights', 'Urban nightscape with city lights', 'https://picsum.photos/800/600?random=1', 'photography', '["city","night","architecture"]', 'user_68e3e993baeb3', '2025-10-05 16:08:51', 0, 0, 0, 0),
('post_68e3e993d8eee', 'Ocean Waves', 'Peaceful ocean waves at sunset', 'https://picsum.photos/800/600?random=2', 'nature', '["ocean","sunset","waves"]', 'user_68e3e993baeb3', '2025-10-04 16:08:51', 0, 0, 0, 0),
('post_68e3e993ddfbd', 'Forest Path', 'Mystical path through the forest', 'https://picsum.photos/800/600?random=3', 'nature', '["forest","path","trees"]', 'user_68e3e993baeb3', '2025-10-03 16:08:51', 0, 0, 0, 0),
('post_68e3e993e2393', 'Street Photography', 'Candid moment in the city', 'https://picsum.photos/800/600?random=4', 'photography', '["street","people","city"]', 'user_68e3e993baeb3', '2025-10-02 16:08:51', 0, 0, 0, 0),
('post_68e3e993e7890', 'Abstract Art', 'Colorful abstract composition', 'https://picsum.photos/800/600?random=5', 'art', '["abstract","colors","modern"]', 'user_68e3e993baeb3', '2025-10-01 16:08:51', 0, 0, 0, 0),
('post_68e3e993ec123', 'Desert Landscape', 'Golden sand dunes at dusk', 'https://picsum.photos/800/600?random=6', 'nature', '["desert","landscape","dunes"]', 'user_68e3e993baeb3', '2025-09-30 16:08:51', 0, 0, 0, 0),
('post_68e3e993f0456', 'Urban Design', 'Modern architectural masterpiece', 'https://picsum.photos/800/600?random=7', 'design', '["architecture","modern","building"]', 'user_68e3e993baeb3', '2025-09-29 16:08:51', 0, 0, 0, 0),
('post_68e3e993f4789', 'Digital Illustration', 'Vibrant digital artwork', 'https://picsum.photos/800/600?random=8', 'digital', '["illustration","digital","art"]', 'user_68e3e993baeb3', '2025-09-28 16:08:51', 0, 0, 0, 0),
('post_68e3e993f8abc', 'Nature Macro', 'Close-up of morning dew on leaves', 'https://picsum.photos/800/600?random=9', 'photography', '["macro","nature","closeup"]', 'user_68e3e993baeb3', '2025-09-27 16:08:51', 0, 0, 0, 0);
