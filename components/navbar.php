<?php
$currentPage = $currentPage ?? 'home';
$showSearch = $showSearch ?? false;
?>
<!-- Navigation -->
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-logo">
            <a href="index.php">
                <span>SnapSera</span>
            </a>
        </div>

        <div class="nav-menu" id="nav-menu">
            <ul class="nav-list">
                <li class="nav-item">
                    <a href="index.php" class="nav-link <?= $currentPage === 'home' ? 'active' : '' ?>">Home</a>
                </li>
                <li class="nav-item">
                    <a href="gallery.php" class="nav-link <?= $currentPage === 'gallery' ? 'active' : '' ?>">Gallery</a>
                </li>
                <li class="nav-item">
                    <a href="about.php" class="nav-link <?= $currentPage === 'about' ? 'active' : '' ?>">About</a>
                </li>
                <li class="nav-item">
                    <a href="contact.php" class="nav-link <?= $currentPage === 'contact' ? 'active' : '' ?>">Contact</a>
                </li>
                <li class="nav-item">
                    <a href="changelog.php" class="nav-link <?= $currentPage === 'changelog' ? 'active' : '' ?>">Changelog</a>
                </li>
            </ul>
        </div>

        <div class="nav-actions">
            <button class="theme-toggle" id="theme-toggle">
                <i class="fas fa-moon"></i>
            </button>
            <div class="notification-menu" id="notification-menu" style="display: none;">
                <button class="notification-btn" id="notification-btn">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge" id="notification-badge" style="display: none;">0</span>
                </button>
                <div class="notification-dropdown" id="notification-dropdown">
                    <div class="notification-header">
                        <h3>Notifications</h3>
                        <button class="mark-all-read" id="mark-all-read">Mark all as read</button>
                    </div>
                    <div class="notification-list" id="notification-list">
                        <p class="no-notifications">No notifications</p>
                    </div>
                </div>
            </div>
            <div class="user-menu" id="user-menu">
                <button class="user-btn" id="user-btn">
                    <i class="fas fa-user"></i>
                </button>
                <div class="user-dropdown" id="user-dropdown">
                    <a href="profile.php" class="dropdown-item">
                        <i class="fas fa-user"></i> Profile
                    </a>
                    <a href="#" class="dropdown-item" id="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
            <button class="nav-toggle" id="nav-toggle">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>
        </div>
    </div>
</nav>
