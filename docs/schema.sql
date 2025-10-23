-- SnapSera Database Schema
-- SQLite Database Schema
-- Database: data/snapsera.db
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    bio TEXT,
    profilePicture TEXT,
    role TEXT DEFAULT 'user',
    created DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    imageUrl TEXT NOT NULL,
    category TEXT,
    tags TEXT,
    author TEXT,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    downloadUrl TEXT
);
-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    postId TEXT NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, postId)
);
-- Saves table
CREATE TABLE IF NOT EXISTS saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    postId TEXT NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, postId)
);
-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    comment TEXT NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Comment Likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commentId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(commentId, userId)
);
-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    isRead INTEGER DEFAULT 0,
    created DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    userEmail TEXT,
    status TEXT,
    created TEXT DEFAULT CURRENT_TIMESTAMP
);
-- Changelogs table
CREATE TABLE IF NOT EXISTS changelogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    changes TEXT,
    release_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Post Downloads table
CREATE TABLE IF NOT EXISTS post_downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId TEXT NOT NULL,
    name TEXT NOT NULL,
    downloadUrl TEXT NOT NULL,
    displayOrder INTEGER,
    created TEXT DEFAULT CURRENT_TIMESTAMP
);
-- Post Images table (for multi-image posts)
CREATE TABLE IF NOT EXISTS post_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    displayOrder INTEGER,
    created TEXT DEFAULT CURRENT_TIMESTAMP
);
-- Views table (analytics)
CREATE TABLE IF NOT EXISTS views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId TEXT NOT NULL,
    userId TEXT,
    ipAddress TEXT,
    created TEXT DEFAULT CURRENT_TIMESTAMP
);
-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created);
CREATE INDEX IF NOT EXISTS idx_comments_postId ON comments(postId);
CREATE INDEX IF NOT EXISTS idx_comments_userId ON comments(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications(isRead);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created);
CREATE INDEX IF NOT EXISTS idx_post_downloads_postId ON post_downloads(postId);
CREATE INDEX IF NOT EXISTS idx_post_images_postId ON post_images(postId);
CREATE INDEX IF NOT EXISTS idx_views_postId ON views(postId);
CREATE INDEX IF NOT EXISTS idx_views_userId ON views(userId);
