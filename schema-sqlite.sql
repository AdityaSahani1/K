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

-- Insert default admin user
-- Password is 'admin123' (bcrypt hashed)
INSERT INTO users (id, name, username, email, password, role, created, isVerified) VALUES
('user_68e3e993baeb3', 'SnapSera Admin', 'snapsera', 'snapsera.team@gmail.com', '$2y$10$UIU/aPr84wQuoVJDa79OquN8VCmOtNRTTJTrYlOOUbc28sLqx9Jcm', 'admin', '2025-10-06 16:08:51', 1);

-- Insert sample posts
INSERT INTO posts (id, title, description, imageUrl, category, tags, author, created, featured) VALUES
('post_68e3e993cd52f', 'Mountain Sunrise', 'Beautiful sunrise over mountain peaks', 'https://picsum.photos/800/600?random=0', 'art', '["landscape","sunrise","mountains"]', 'user_68e3e993baeb3', '2025-10-06 16:08:51', 1),
('post_68e3e993d246c', 'City Lights', 'Urban nightscape with city lights', 'https://picsum.photos/800/600?random=1', 'urban', '["city","night","architecture"]', 'user_68e3e993baeb3', '2025-10-05 16:08:51', 0),
('post_68e3e993d8eee', 'Ocean Waves', 'Peaceful ocean waves at sunset', 'https://picsum.photos/800/600?random=2', 'nature', '["ocean","sunset","waves"]', 'user_68e3e993baeb3', '2025-10-04 16:08:51', 0),
('post_68e3e993ddfbd', 'Forest Path', 'Mystical path through the forest', 'https://picsum.photos/800/600?random=3', 'nature', '["forest","path","trees"]', 'user_68e3e993baeb3', '2025-10-03 16:08:51', 0),
('post_68e3e993e2393', 'Street Photography', 'Candid moment in the city', 'https://picsum.photos/800/600?random=4', 'urban', '["street","people","city"]', 'user_68e3e993baeb3', '2025-10-02 16:08:51', 0);
