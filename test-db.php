<?php
require_once "config/database.php";

header("Content-Type: application/json");

try {
  $db = Database::getInstance();
  $dbType = $db->getType();

  // Test database connection
  $users = $db->fetchAll("SELECT id, username, email, role FROM users");
  $posts = $db->fetchAll("SELECT id, title, author FROM posts");

  $dbInfo = [
    "type" => $dbType,
    "location" =>
      $dbType === "sqlite" ? "data/snapsera.db" : "sql106.infinityfree.com",
    "status" => "connected",
  ];

  echo json_encode(
    [
      "success" => true,
      "database" => $dbInfo,
      "stats" => [
        "users" => count($users),
        "posts" => count($posts),
      ],
      "users" => $users,
      "posts" => $posts,
    ],
    JSON_PRETTY_PRINT
  );
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(
    [
      "success" => false,
      "error" => $e->getMessage(),
      "database" => [
        "type" => getenv("DB_TYPE") ?: "mysql",
        "status" => "connection failed",
      ],
    ],
    JSON_PRETTY_PRINT
  );
}
?>
