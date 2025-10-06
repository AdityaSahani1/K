-- SQLite schema for SnapSera (for Replit testing)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    bio TEXT,
    profilePicture TEXT,
    created TEXT DEFAULT (datetime('now')),
    lastLogin TEXT,
    isVerified INTEGER DEFAULT 0,
    otpToken TEXT,
    otpExpires TEXT,
    otpCreated TEXT,
    passwordResetToken TEXT,
    passwordResetExpires TEXT
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    imageUrl TEXT NOT NULL,
    category TEXT,
    tags TEXT,
    author TEXT DEFAULT 'admin',
    created TEXT DEFAULT (datetime('now')),
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    downloadUrl TEXT
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    text TEXT NOT NULL,
    created TEXT DEFAULT (datetime('now')),
    likes INTEGER DEFAULT 0,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created TEXT DEFAULT (datetime('now')),
    UNIQUE(postId, userId),
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commentId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created TEXT DEFAULT (datetime('now')),
    UNIQUE(commentId, userId),
    FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Saves table
CREATE TABLE IF NOT EXISTS saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created TEXT DEFAULT (datetime('now')),
    UNIQUE(postId, userId),
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Views table
CREATE TABLE IF NOT EXISTS views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId TEXT NOT NULL,
    userId TEXT,
    ipAddress TEXT,
    created TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    relatedId TEXT,
    isRead INTEGER DEFAULT 0,
    created TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'unread'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created DESC);
CREATE INDEX IF NOT EXISTS idx_comments_postId ON comments(postId);
CREATE INDEX IF NOT EXISTS idx_likes_postId ON likes(postId);
CREATE INDEX IF NOT EXISTS idx_likes_userId ON likes(userId);
CREATE INDEX IF NOT EXISTS idx_saves_userId ON saves(userId);
CREATE INDEX IF NOT EXISTS idx_views_postId ON views(postId);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
