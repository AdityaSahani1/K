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
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(50) PRIMARY KEY,
    postId VARCHAR(50) NOT NULL,
    userId VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created DATETIME NOT NULL,
    likes INT DEFAULT 0,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_postId (postId),
    INDEX idx_userId (userId),
    INDEX idx_created (created)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Views Table
CREATE TABLE IF NOT EXISTS views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId VARCHAR(50) NOT NULL,
    userId VARCHAR(50),
    ipAddress VARCHAR(45),
    created DATETIME NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_postId (postId),
    INDEX idx_userId (userId),
    INDEX idx_ipAddress (ipAddress)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50) NOT NULL,
    type ENUM('like', 'comment', 'follow', 'mention', 'system') NOT NULL,
    message TEXT NOT NULL,
    relatedId VARCHAR(50),
    relatedType VARCHAR(50),
    isRead BOOLEAN DEFAULT FALSE,
    created DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_isRead (isRead),
    INDEX idx_created (created)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contacts Table (Contact Form Submissions)
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    created DATETIME NOT NULL,
    status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
    INDEX idx_status (status),
    INDEX idx_created (created)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
