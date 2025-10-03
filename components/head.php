<?php
$pageTitle = $pageTitle ?? 'Portfolio';
$pageSpecificCSS = $pageSpecificCSS ?? [];
if (!is_array($pageSpecificCSS)) {
    $pageSpecificCSS = [$pageSpecificCSS];
}
?>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= htmlspecialchars($pageTitle) ?></title>
<link rel="stylesheet" href="styles/main.css">
<?php foreach ($pageSpecificCSS as $css): ?>
<?php if ($css): ?>
<link rel="stylesheet" href="styles/<?= htmlspecialchars($css) ?>">
<?php endif; ?>
<?php endforeach; ?>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
