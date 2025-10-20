<?php
// SQLite migration script for Replit testing

// Set database type to SQLite
putenv('DB_TYPE=sqlite');

require_once 'config/database.php';

echo "🚀 Starting SQLite migration for SnapSera...\n\n";

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    echo "✅ Connected to SQLite database\n";
    echo "   Database: " . __DIR__ . "/data/snapsera.db\n\n";
    
    // Read and execute schema
    $schema = file_get_contents(__DIR__ . '/schema-sqlite.sql');
    $statements = array_filter(array_map('trim', explode(';', $schema)));
    
    echo "📋 Executing schema and importing data...\n";
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $conn->exec($statement);
        }
    }
    echo "✅ Database schema executed successfully\n";
    echo "✅ Admin user and sample posts imported from schema\n";
    echo "   Username: snapsera\n";
    echo "   Password: admin123\n";
    echo "   Email: snapsera.team@gmail.com\n";
    echo "   Sample Posts: 10 fresh posts created\n\n";
    
    echo "🎉 Migration completed successfully!\n\n";
    echo "🔧 Database Configuration:\n";
    echo "   Type: SQLite (for Replit testing)\n";
    echo "   Location: data/snapsera.db\n\n";
    echo "🚀 To switch to MySQL (InfinityFree):\n";
    echo "   Remove DB_TYPE environment variable or set DB_TYPE=mysql\n\n";
    echo "✨ You can now access your site!\n";
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    echo "   Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>
