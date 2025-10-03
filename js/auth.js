// Authentication JavaScript

// Initialize auth modal functionality
document.addEventListener('DOMContentLoaded', function() {
    initAuthModal();
});

let pendingUserData = null; // Store user data during OTP verification

function initAuthModal() {
    const authModal = document.getElementById('auth-modal');
    const authClose = document.getElementById('auth-close');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginFormElement = document.getElementById('login-form-element');
    const registerFormElement = document.getElementById('register-form-element');
    
    // New form elements
    const forgotPasswordLink = document.getElementById('forgot-password');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const forgotPasswordFormElement = document.getElementById('forgot-password-form-element');
    const backToLogin = document.getElementById('back-to-login');
    const otpForm = document.getElementById('otp-form');
    const otpFormElement = document.getElementById('otp-form-element');
    const backToRegister = document.getElementById('back-to-register');
    const resendOtp = document.getElementById('resend-otp');

    // Close modal functionality
    if (authClose) {
        authClose.addEventListener('click', function() {
            hideModal('auth-modal');
        });
    }

    // Switch between login and register
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            switchToRegister();
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            switchToLogin();
        });
    }

    // New navigation handlers
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchToForgotPassword();
        });
    }

    if (backToLogin) {
        backToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            switchToLogin();
        });
    }

    if (backToRegister) {
        backToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            switchToRegister();
        });
    }

    if (resendOtp) {
        resendOtp.addEventListener('click', function(e) {
            e.preventDefault();
            handleResendOTP();
        });
    }

    // Form submissions
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', handleLogin);
    }

    if (registerFormElement) {
        registerFormElement.addEventListener('submit', handleRegister);
    }

    if (forgotPasswordFormElement) {
        forgotPasswordFormElement.addEventListener('submit', handleForgotPassword);
    }

    if (otpFormElement) {
        otpFormElement.addEventListener('submit', handleOTPVerification);
    }

    // Close modal when clicking outside
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                hideModal('auth-modal');
            }
        });
    }
}

function switchToRegister() {
    hideAllAuthForms();
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.classList.remove('hidden');
    }
}

function switchToLogin() {
    hideAllAuthForms();
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.classList.remove('hidden');
    }
}

function switchToForgotPassword() {
    hideAllAuthForms();
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.classList.remove('hidden');
    }
}

function switchToOTPForm() {
    hideAllAuthForms();
    const otpForm = document.getElementById('otp-form');
    if (otpForm) {
        otpForm.classList.remove('hidden');
    }
}

function hideAllAuthForms() {
    const forms = ['login-form', 'register-form', 'forgot-password-form', 'otp-form'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.classList.add('hidden');
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        // Call server-side login endpoint with plain password (server handles hashing)
        const response = await fetch('/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
            // Login successful - store session token and user info
            currentUser = {
                id: result.user.id,
                username: result.user.username,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role || 'user',
                bio: result.user.bio || '',
                profilePicture: result.user.profilePicture || ''
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('sessionToken', result.sessionToken);
            updateAuthUI();
            hideModal('auth-modal');
            showNotification(`Welcome back, ${result.user.username}!`, 'success');
            
            // Clear form
            document.getElementById('login-form-element').reset();
        } else {
            showNotification(result.error || 'Invalid username or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const submitBtn = document.getElementById('register-btn');
    
    if (!name || !username || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Basic validation
    if (username.length < 3) {
        showNotification('Username must be at least 3 characters long', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
        // Call server-side registration endpoint (validates and returns user with hashed password)
        const registerResponse = await fetch('/api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                username: username,
                email: email,
                password: password  // Send plain password, server hashes it
            })
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
            showNotification(registerData.error || 'Registration failed', 'error');
            return;
        }

        // Store user data temporarily for OTP verification (already has hashed password)
        pendingUserData = registerData.user;

        // Send OTP for email verification
        const otpResponse = await fetch('/api/auth-actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'send_otp',
                email: email,
                name: name,
                userData: registerData.user
            })
        });

        const otpData = await otpResponse.json();

        if (otpResponse.ok && otpData.status === 'success') {
            showNotification('Please check your email for the OTP code', 'success');
            switchToOTPForm();
        } else {
            showNotification(otpData.error || 'Failed to send OTP', 'error');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        const response = await fetch('/api/auth-actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'forgot_password',
                email: email
            })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            showNotification('Password reset link sent to your email', 'success');
            document.getElementById('forgot-password-form-element').reset();
            switchToLogin();
        } else {
            showNotification(data.error || 'Failed to send password reset email', 'error');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        showNotification('An error occurred. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
    }
}

async function handleOTPVerification(e) {
    e.preventDefault();
    
    const otp = document.getElementById('otp-input').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (!otp || otp.length !== 6) {
        showNotification('Please enter a valid 6-digit OTP', 'error');
        return;
    }

    if (!pendingUserData) {
        showNotification('Session expired. Please register again.', 'error');
        switchToRegister();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    try {
        const response = await fetch('/api/auth-actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'verify_otp',
                email: pendingUserData.email,
                otp: otp
            })
        });

        const data = await response.json();

        if (response.ok && data.verified) {
            // OTP verified, now create the user account
            let users = await loadData('users.json');

            // Add the verified user
            pendingUserData.isVerified = true;
            users.push(pendingUserData);
            
            // Save to server
            await saveData('users.json', users);

            showNotification('Registration successful! You can now login.', 'success');
            
            // Clear form data
            pendingUserData = null;
            document.getElementById('otp-form-element').reset();
            switchToLogin();
        } else {
            showNotification(data.error || 'Invalid OTP', 'error');
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        showNotification('Verification failed. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verify OTP';
    }
}

async function handleResendOTP() {
    if (!pendingUserData) {
        showNotification('Session expired. Please register again.', 'error');
        switchToRegister();
        return;
    }

    const resendBtn = document.getElementById('resend-otp');
    resendBtn.style.pointerEvents = 'none';
    resendBtn.textContent = 'Sending...';

    try {
        const response = await fetch('/api/auth-actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'resend_otp',
                email: pendingUserData.email,
                name: pendingUserData.name
            })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            showNotification('New OTP sent to your email', 'success');
        } else {
            showNotification(data.error || 'Failed to resend OTP', 'error');
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        showNotification('Failed to resend OTP. Please try again.', 'error');
    } finally {
        resendBtn.style.pointerEvents = 'auto';
        resendBtn.textContent = 'Resend OTP';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password hashing is now handled server-side using PHP's password_hash() for security

function requireAuth() {
    if (!currentUser) {
        showAuthModal();
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Admin access required', 'error');
        window.location.href = 'index.php';
        return false;
    }
    return true;
}

// Check admin access on admin pages
if (window.location.pathname.includes('admin.php')) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (!requireAdmin()) {
                return;
            }
        }, 100);
    });
}