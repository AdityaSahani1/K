<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    if ($method === 'GET') {
        // Get notifications for a user
        $userId = $_GET['userId'] ?? '';

        if (empty($userId)) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            exit();
        }

        // Get notifications that haven't expired (within 60 days)
        $stmt = $conn->prepare("
            SELECT n.*, u.username as actorUsername, u.profilePicture as actorProfilePic
            FROM notifications n
            LEFT JOIN users u ON n.actorId = u.id
            WHERE n.userId = ?
            AND datetime(n.created) > datetime('now', '-60 days')
            ORDER BY n.created DESC
        ");
        $stmt->execute([$userId]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert isRead to boolean
        foreach ($notifications as &$notification) {
            $notification['isRead'] = (bool)$notification['isRead'];
        }

        echo json_encode($notifications);

    } elseif ($method === 'POST') {
        // Mark notifications as read
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'mark_read') {
            $notificationId = $input['notificationId'] ?? '';
            $userId = $input['userId'] ?? '';

            if (empty($notificationId) || empty($userId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Notification ID and User ID are required']);
                exit();
            }

            $readAt = date('Y-m-d H:i:s');
            $stmt = $conn->prepare("UPDATE notifications SET isRead = 1, readAt = ? WHERE id = ? AND userId = ?");
            $stmt->execute([$readAt, $notificationId, $userId]);

            echo json_encode(['status' => 'success']);

        } elseif ($action === 'mark_all_read') {
            $userId = $input['userId'] ?? '';

            if (empty($userId)) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                exit();
            }

            $readAt = date('Y-m-d H:i:s');
            $stmt = $conn->prepare("UPDATE notifications SET isRead = 1, readAt = ? WHERE userId = ? AND isRead = 0");
            $stmt->execute([$readAt, $userId]);

            echo json_encode(['status' => 'success']);

        } elseif ($action === 'create') {
            // Create a new notification
            $userId = $input['userId'] ?? '';
            $actorId = $input['actorId'] ?? null;
            $type = $input['type'] ?? '';
            $message = $input['message'] ?? '';
            $relatedId = $input['relatedId'] ?? null;

            if (empty($userId) || empty($type) || empty($message)) {
                http_response_code(400);
                echo json_encode(['error' => 'userId, type, and message are required']);
                exit();
            }

            $id = uniqid('notif_');
            $created = date('Y-m-d H:i:s');

            $stmt = $conn->prepare("INSERT INTO notifications (id, userId, actorId, type, message, relatedId, created) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $userId, $actorId, $type, $message, $relatedId, $created]);

            echo json_encode(['status' => 'success', 'notificationId' => $id]);

        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("Notifications API error: " . $e->getMessage());
}
?>
