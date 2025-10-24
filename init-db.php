<?php
// Initialize SQLite database
try {
    $dbPath = __DIR__ . '/data/snapsera.db';
    $dataDir = __DIR__ . '/data';
    
    // Create data directory if it doesn't exist
    if (!file_exists($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    // Read schema
    $schema = file_get_contents(__DIR__ . '/schema-sqlite.sql');
    
    // Create PDO connection
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("PRAGMA foreign_keys = ON");
    
    // Execute schema
    $pdo->exec($schema);
    
    echo "Database initialized successfully!\n";
    echo "Database location: $dbPath\n";
    
    // Verify
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Users in database: " . $result['count'] . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
