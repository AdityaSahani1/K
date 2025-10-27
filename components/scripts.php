<?php
$pageSpecificJS = $pageSpecificJS ?? [];
if (!is_array($pageSpecificJS)) {
    $pageSpecificJS = [$pageSpecificJS];
}
?>
<script src="js/post-utils.js"></script>
<script src="js/auth.js"></script>
<script src="js/main.js"></script>
<script src="js/pwa-install.js"></script>
<?php foreach ($pageSpecificJS as $script): ?>
<script src="js/<?= htmlspecialchars($script) ?>"></script>
<?php endforeach; ?>
