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
    
    echo "📋 Creating tables...\n";
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $conn->exec($statement);
        }
    }
    echo "✅ Tables created successfully\n\n";
    
    // Import admin user
    echo "👤 Creating admin user...\n";
    $userId = 'user_' . uniqid();
    $username = 'snapsera';
    $email = 'snapsera.team@gmail.com';
    $password = password_hash('admin123', PASSWORD_BCRYPT);
    $name = 'SnapSera Admin';
    $role = 'admin';
    $created = date('Y-m-d H:i:s');
    $isVerified = 1;
    
    $stmt = $conn->prepare("INSERT INTO users (id, username, email, password, name, role, created, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $username, $email, $password, $name, $role, $created, $isVerified]);
    echo "✅ Admin user created\n";
    echo "   Username: $username\n";
    echo "   Password: admin123\n";
    echo "   Email: $email\n\n";
    
    // Import sample posts
    echo "📸 Creating sample posts...\n";
    $samplePosts = [
        ['Mountain Sunrise', 'Beautiful sunrise over mountain peaks', 'nature', ['landscape', 'sunrise', 'mountains']],
        ['City Lights', 'Urban nightscape with city lights', 'urban', ['city', 'night', 'architecture']],
        ['Ocean Waves', 'Peaceful ocean waves at sunset', 'nature', ['ocean', 'sunset', 'waves']],
        ['Forest Path', 'Mystical path through the forest', 'nature', ['forest', 'path', 'trees']],
        ['Street Photography', 'Candid moment in the city', 'urban', ['street', 'people', 'city']],
    ];
    
    $postsCreated = 0;
    foreach ($samplePosts as $index => $post) {
        $postId = 'post_' . uniqid();
        $title = $post[0];
        $description = $post[1];
        $imageUrl = "https://picsum.photos/800/600?random=$index";
        $category = $post[2];
        $tags = json_encode($post[3]);
        $author = $username;
        $created = date('Y-m-d H:i:s', time() - (86400 * $index));
        
        $stmt = $conn->prepare("INSERT INTO posts (id, title, description, imageUrl, category, tags, author, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$postId, $title, $description, $imageUrl, $category, $tags, $author, $created]);
        $postsCreated++;
    }
    
    echo "✅ $postsCreated sample posts created\n\n";
    
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
