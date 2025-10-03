<?php
$pageTitle = "Reset Password - Portfolio";
$currentPage = '';
$showSearch = false;
?>
<!DOCTYPE html>
<html lang="en">
<?php include 'components/head.php'; ?>
<body>
    <?php include 'components/navbar.php'; ?>

    <!-- Reset Password Container -->
    <div class="auth-page-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>Reset Password</h1>
                <p>Enter your new password below</p>
            </div>
            
            <form id="reset-password-form">
                <div class="form-group">
                    <input type="password" id="new-password" placeholder="New Password" autocomplete="new-password" required minlength="6">
                    <i class="fas fa-lock"></i>
                </div>
                
                <div class="form-group">
                    <input type="password" id="confirm-password" placeholder="Confirm New Password" autocomplete="new-password" required minlength="6">
                    <i class="fas fa-lock"></i>
                </div>
                
                <button type="submit" class="auth-btn" id="reset-btn">Reset Password</button>
            </form>
            
            <div class="auth-links">
                <a href="index.php">Back to Home</a>
            </div>
        </div>
    </div>

    <?php include 'components/scripts.php'; ?>
    
    <script>
        let resetToken = '';
        
        // Get token from URL
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            resetToken = urlParams.get('token');
            
            if (!resetToken) {
                showNotification('Invalid or missing reset token', 'error');
                setTimeout(() => {
                    window.location.href = 'index.php';
                }, 3000);
                return;
            }
        });
        
        // Handle form submission
        document.getElementById('reset-password-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const resetBtn = document.getElementById('reset-btn');
            
            if (newPassword !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showNotification('Password must be at least 6 characters long', 'error');
                return;
            }
            
            resetBtn.disabled = true;
            resetBtn.textContent = 'Resetting...';
            
            try {
                const response = await fetch('/api/auth-actions.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'reset_password',
                        token: resetToken,
                        password: newPassword
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.status === 'success') {
                    showNotification('Password reset successfully! Redirecting to login...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.php';
                    }, 2000);
                } else {
                    showNotification(data.error || 'Failed to reset password', 'error');
                }
            } catch (error) {
                showNotification('An error occurred. Please try again.', 'error');
            } finally {
                resetBtn.disabled = false;
                resetBtn.textContent = 'Reset Password';
            }
        });
    </script>
</body>
</html>
