<?php

function loadEnvFromFile($filePath) {
    if (!file_exists($filePath)) {
        return;
    }
    
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

if (file_exists(__DIR__ . '/../.env')) {
    loadEnvFromFile(__DIR__ . '/../.env');
} elseif (file_exists(__DIR__ . '/../env.txt')) {
    loadEnvFromFile(__DIR__ . '/../env.txt');
}

?>
