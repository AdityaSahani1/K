<?php
/**
 * Cleanup notifications older than 60 days
 * Run this script periodically (e.g., daily via cron job)
 */

require_once __DIR__ . '/config/database.php';

echo "🧹 Starting notification cleanup...\n";

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    // Delete notifications older than 60 days
    $stmt = $conn->prepare("DELETE FROM notifications WHERE datetime(created) < datetime('now', '-60 days')");
    $stmt->execute();
    
    $deletedCount = $stmt->rowCount();
    
    echo "✅ Cleanup completed!\n";
    echo "   Deleted $deletedCount old notifications\n";
    echo "   Timestamp: " . date('Y-m-d H:i:s') . "\n";
    
} catch (Exception $e) {
    echo "❌ Cleanup failed: " . $e->getMessage() . "\n";
    error_log("Notification cleanup error: " . $e->getMessage());
    exit(1);
}
?>
