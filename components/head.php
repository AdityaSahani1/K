<?php
$pageTitle = $pageTitle ?? 'SnapSera';
$pageSpecificCSS = $pageSpecificCSS ?? [];
if (!is_array($pageSpecificCSS)) {
    $pageSpecificCSS = [$pageSpecificCSS];
}
?>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Professional photography portfolio and gallery application">
<meta name="theme-color" content="#6C5CE7">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="SnapSera">
<title><?= htmlspecialchars($pageTitle) ?></title>
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/assets/pwa-icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/pwa-icons/icon-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/assets/pwa-icons/icon-512x512.png">
<link rel="stylesheet" href="styles/main.css">
<link rel="stylesheet" href="styles/changelog-notification.css">
<?php foreach ($pageSpecificCSS as $css): ?>
<?php if ($css): ?>
<link rel="stylesheet" href="styles/<?= htmlspecialchars($css) ?>">
<?php endif; ?>
<?php endforeach; ?>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
