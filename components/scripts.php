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
<script>
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
</script>
