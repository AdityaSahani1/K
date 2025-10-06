<?php
require_once __DIR__ . '/../config/database.php';
require_once 'email-handler.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$subject = trim($input['subject'] ?? '');
$message = trim($input['message'] ?? '');

// Validation
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit();
}

if (strlen($name) < 2 || strlen($name) > 100) {
    http_response_code(400);
    echo json_encode(['error' => 'Name must be between 2 and 100 characters']);
    exit();
}

if (strlen($subject) < 5 || strlen($subject) > 200) {
    http_response_code(400);
    echo json_encode(['error' => 'Subject must be between 5 and 200 characters']);
    exit();
}

if (strlen($message) < 10 || strlen($message) > 2000) {
    http_response_code(400);
    echo json_encode(['error' => 'Message must be between 10 and 2000 characters']);
    exit();
}

try {
    // Send contact email
    $emailHandler = new EmailHandler();
    $emailSent = $emailHandler->sendContactEmail($name, $email, $subject, $message);
    
    if ($emailSent) {
        // Save contact message to database
        $db = Database::getInstance();
        $conn = $db->getConnection();
        
        $created = date('Y-m-d H:i:s');
        $status = 'unread';
        
        $stmt = $conn->prepare("INSERT INTO contacts (name, email, subject, message, created, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $name, $email, $subject, $message, $created, $status);
        $stmt->execute();
        $stmt->close();
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Thank you for your message! We will get back to you soon.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send message. Please check SMTP configuration.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log("Contact form error: " . $e->getMessage());
}
?>
