<?php
$pageSpecificJS = $pageSpecificJS ?? [];
if (!is_array($pageSpecificJS)) {
    $pageSpecificJS = [$pageSpecificJS];
}
?>
<script src="js/auth.js"></script>
<script src="js/main.js"></script>
<?php foreach ($pageSpecificJS as $script): ?>
<script src="js/<?= htmlspecialchars($script) ?>"></script>
<?php endforeach; ?>
