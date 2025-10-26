
<?php

$pageTitle = 'Changelog - SnapSera';
$pageSpecificCSS = ['changelog.css'];
$pageSpecificJS = ['changelog.js'];
$currentPage = 'changelog';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php include 'components/head.php'; ?>
</head>
<body>
    <?php include 'components/navbar.php'; ?>

    <div class="changelog-container">
        <div class="changelog-header">
            <h1>Changelog</h1>
            <p class="subtitle">Track all updates and improvements to SnapSera</p>
        </div>

        <div id="changelog-content" class="changelog-timeline">
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading changelog...</p>
            </div>
        </div>
    </div>

    <?php include 'components/footer.php'; ?>
    <?php include 'components/scripts.php'; ?>
</body>
</html>
