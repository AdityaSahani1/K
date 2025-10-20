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
    passwordResetExpires TEXT,
    canPost INTEGER DEFAULT 0
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
    replyTo TEXT,
    replyToUsername TEXT,
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
    actorId TEXT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    relatedId TEXT,
    isRead INTEGER DEFAULT 0,
    readAt TEXT,
    created TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE SET NULL
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created TEXT DEFAULT (datetime('now')),
    userEmail TEXT,
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
CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications(isRead);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created DESC);

-- Delete all existing data
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
