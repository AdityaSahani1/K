<?php

require_once __DIR__ . '/../database.php';



try {

    $db = Database::getInstance()->getConnection();

    

    $db->exec("

        CREATE TABLE IF NOT EXISTS changelogs (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            version TEXT NOT NULL,

            title TEXT NOT NULL,

            description TEXT,

            changes TEXT,

            release_date DATE NOT NULL,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP

        )

    ");

    

    echo "Changelog table created successfully!\n";

    

} catch (PDOException $e) {

    echo "Error creating changelog table: " . $e->getMessage() . "\n";

    exit(1);

}
