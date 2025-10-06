<?php
require_once 'config/database.php';

header('Content-Type: application/json');

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    // Check if users table exists
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    
    if ($result->num_rows == 0) {
        // Database not initialized, run migration
        echo json_encode([
            'status' => 'needs_migration',
            'message' => 'Database needs to be initialized. Please run migrate.php from command line or contact administrator.'
        ]);
    } else {
        echo json_encode([
            'status' => 'ready',
            'message' => 'Database is initialized and ready'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ]);
}
?>
