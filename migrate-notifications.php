<?php
/**
 * Migration to update notifications table
 */

// Set database type to SQLite
putenv('DB_TYPE=sqlite');

require_once 'config/database.php';

echo "🚀 Updating notifications table...\n";

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    echo "✅ Connected to SQLite database\n";
    
    // Drop and recreate notifications table with new schema
    $conn->exec('DROP TABLE IF EXISTS notifications');
    echo "   Dropped old notifications table\n";
    
    $conn->exec('
        CREATE TABLE notifications (
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
        )
    ');
    echo "   Created new notifications table with actorId and readAt columns\n";
    
    // Create indexes
    $conn->exec('CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId)');
    $conn->exec('CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications(isRead)');
    $conn->exec('CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created DESC)');
    echo "   Created indexes\n";
    
    echo "\n✅ Migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
