<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

$versionConfig = require __DIR__ . '/../config/version.php';

echo json_encode($versionConfig);
