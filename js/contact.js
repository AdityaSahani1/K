// Contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
});

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const messageTextarea = document.getElementById('contact-message');
    const charCounter = document.querySelector('.char-counter');

    // Character counter for message textarea
    if (messageTextarea && charCounter) {
        messageTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            const maxLength = 2000;
            charCounter.textContent = `${currentLength}/${maxLength} characters`;
            
            if (currentLength > maxLength * 0.9) {
                charCounter.style.color = 'var(--accent-secondary)';
            } else {
                charCounter.style.color = 'var(--text-secondary)';
            }
        });
    }

    // Handle form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
}

async function handleContactSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('submit-btn');
    
    // Get form values
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const subject = formData.get('subject').trim();
    const message = formData.get('message').trim();
    
    // Validation
    if (!name || !email || !subject || !message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (name.length < 2 || name.length > 100) {
        showNotification('Name must be between 2 and 100 characters', 'error');
        return;
    }
    
    if (subject.length < 5 || subject.length > 200) {
        showNotification('Subject must be between 5 and 200 characters', 'error');
        return;
    }
    
    if (message.length < 10 || message.length > 2000) {
        showNotification('Message must be between 10 and 2000 characters', 'error');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
        const requestData = {
            name: name,
            email: email,
            subject: subject,
            message: message
        };
        
        // Include logged-in user's email if available
        if (currentUser && currentUser.email) {
            requestData.userEmail = currentUser.email;
        }
        
        const response = await fetch('/api/contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            showNotification(data.message, 'success');
            form.reset();
            
            // Reset character counter
            const charCounter = document.querySelector('.char-counter');
            if (charCounter) {
                charCounter.textContent = '0/2000 characters';
                charCounter.style.color = 'var(--text-secondary)';
            }
        } else {
            showNotification(data.error || 'Failed to send message', 'error');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        showNotification('An error occurred. Please try again later.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}