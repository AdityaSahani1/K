<?php
require_once 'config/database.php';

echo "Starting database migration...\n\n";

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    // Read schema file and execute
    echo "Creating database tables...\n";
    $schema = file_get_contents('schema.sql');
    
    // Split by semicolon and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $schema)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            if ($db->query($statement) === false) {
                throw new Exception("Failed to execute: " . substr($statement, 0, 100));
            }
        }
    }
    echo "✓ Tables created successfully!\n\n";
    
    // Migrate users
    echo "Migrating users...\n";
    $usersData = json_decode(file_get_contents('data/users.json'), true) ?? [];
    $userCount = 0;
    
    foreach ($usersData as $user) {
        $stmt = $conn->prepare("INSERT INTO users (id, name, username, email, password, role, created, bio, profilePicture, isVerified, otpToken, otpExpires, otpCreated, passwordResetToken, passwordResetExpires, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param(
            "sssssssssissssss",
            $user['id'],
            $user['name'],
            $user['username'],
            $user['email'],
            $user['password'],
            $user['role'] ?? 'user',
            $user['created'],
            $user['bio'] ?? null,
            $user['profilePicture'] ?? null,
            $user['isVerified'] ?? false,
            $user['otpToken'] ?? null,
            $user['otpExpires'] ?? null,
            $user['otpCreated'] ?? null,
            $user['passwordResetToken'] ?? null,
            $user['passwordResetExpires'] ?? null,
            $user['lastLogin'] ?? null
        );
        
        if ($stmt->execute()) {
            $userCount++;
        }
        $stmt->close();
    }
    echo "✓ Migrated $userCount users\n\n";
    
    // Migrate posts
    echo "Migrating posts...\n";
    $postsData = json_decode(file_get_contents('data/posts.json'), true) ?? [];
    $postCount = 0;
    
    foreach ($postsData as $post) {
        $stmt = $conn->prepare("INSERT INTO posts (id, title, description, imageUrl, category, tags, author, created, likes, comments, views, featured, downloadUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $tagsJson = json_encode($post['tags'] ?? []);
        
        $stmt->bind_param(
            "ssssssssiiiis",
            $post['id'],
            $post['title'],
            $post['description'] ?? null,
            $post['imageUrl'],
            $post['category'],
            $tagsJson,
            $post['author'],
            $post['created'],
            $post['likes'] ?? 0,
            $post['comments'] ?? 0,
            $post['views'] ?? 0,
            $post['featured'] ?? false,
            $post['downloadUrl'] ?? null
        );
        
        if ($stmt->execute()) {
            $postCount++;
        }
        $stmt->close();
    }
    echo "✓ Migrated $postCount posts\n\n";
    
    echo "✅ Migration completed successfully!\n";
    echo "Database is ready to use.\n";
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    error_log("Migration error: " . $e->getMessage());
}
?>
