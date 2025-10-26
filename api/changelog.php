<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {

    $db = Database::getInstance()->getConnection();

    $stmt = $db->query("

        SELECT id, version, title, description, changes, release_date, created_at

        FROM changelogs

        ORDER BY release_date DESC, created_at DESC

    ");

    $changelog = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($changelog);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode(['error' => 'Failed to fetch changelog']);

}
