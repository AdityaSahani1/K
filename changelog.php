<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Changelog - SnapSera</title>

    <link rel="stylesheet" href="styles/main.css">

    <link rel="stylesheet" href="styles/changelog.css">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

</head>

<body>

    <nav class="navbar">

        <div class="nav-container">

            <a href="index.php" class="logo">SnapSera</a>

            <div class="nav-menu">

                <a href="index.php">Home</a>

                <a href="gallery.php">Gallery</a>

                <a href="about.php">About</a>

                <a href="contact.php">Contact</a>

                <a href="changelog.php" class="active">Changelog</a>

            </div>

            <div class="nav-icons">

                <button id="theme-toggle" class="icon-btn" aria-label="Toggle theme">

                    <i class="fas fa-moon"></i>

                </button>

                <div id="auth-buttons"></div>

            </div>

        </div>

    </nav>

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

    <footer class="footer">

        <div class="footer-content">

            <div class="footer-section">

                <h3>SnapSera</h3>

                <p>Share your creative vision with the world</p>

            </div>

            <div class="footer-section">

                <h4>Links</h4>

                <a href="index.php">Home</a>

                <a href="gallery.php">Gallery</a>

                <a href="about.php">About</a>

                <a href="contact.php">Contact</a>

            </div>

            <div class="footer-section">

                <h4>Categories</h4>

                <a href="gallery.php?category=Nature">Nature</a>

                <a href="gallery.php?category=Architecture">Architecture</a>

                <a href="gallery.php?category=People">People</a>

                <a href="gallery.php?category=Art">Art</a>

            </div>

            <div class="footer-section">

                <h4>Connect</h4>

                <div class="social-links">

                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>

                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>

                    <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>

                    <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest"></i></a>

                </div>

            </div>

        </div>

        <div class="footer-bottom">

            <p>&copy; 2024 SnapSera. All rights reserved.</p>

        </div>

    </footer>

    <script src="js/auth.js"></script>

    <script src="js/main.js"></script>

    <script src="js/changelog.js"></script>

</body>

</html>
