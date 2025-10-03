<?php
$currentPage = $currentPage ?? 'home';
$showSearch = $showSearch ?? false;
?>
<!-- Navigation -->
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-logo">
            <a href="index.php">Portfolio</a>
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
            </ul>
        </div>
        
        <div class="nav-actions">
            <button class="search-btn" id="search-btn" <?= !$showSearch ? 'style="display: none;"' : '' ?>>
                <i class="fas fa-search"></i>
            </button>
            <button class="theme-toggle" id="theme-toggle">
                <i class="fas fa-moon"></i>
            </button>
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
