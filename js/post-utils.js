// Shared utilities for post management across admin and profile pages

// Convert various image hosting URLs to direct image URLs
function convertToDirectImageUrl(url) {
    if (!url) return url;
    // Google Drive conversion
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
    if (driveMatch) {
        return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    // Dropbox conversion
    if (url.includes('dropbox.com')) {
        return url.replace('?dl=0', '?raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }
    // OneDrive conversion
    if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
        if (url.includes('?')) {
            return url + '&embed=1';
        } else {
            return url + '?embed=1';
        }
    }
    // Google Photos warning
    if (url.includes('photos.google.com') || url.includes('photos.app.goo.gl')) {
        showNotification('Google Photos links may not work. Please use Google Drive, Imgur, or ImgBB instead.', 'warning');
    }
    return url;
}

// Convert file to base64 string
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// Upload image to ImgBB via secure backend endpoint
async function uploadToImgBB(base64Image) {
    try {
        const response = await fetch('/api/upload-image.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Image })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Upload failed');
        }
        return {
            displayUrl: data.data.display_url,
            imageUrl: data.data.url,
            deleteUrl: data.data.delete_url
        };
    } catch (error) {
        console.error('Image upload error:', error);
        throw new Error('Failed to upload image: ' + error.message);
    }
}

// Setup image upload preview functionality
function setupImageUploadPreview(uploadInput, urlInput, previewContainer, previewImg, removeBtn, options = {}) {
    const { autoUpload = false, required = false } = options;
    if (uploadInput) {
        uploadInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.match('image.*')) {
                showNotification('Please select an image file', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Image size must be less than 5MB', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = async function(e) {
                if (previewImg) {
                    previewImg.src = e.target.result;
                }
                if (previewContainer) {
                    previewContainer.style.display = 'block';
                }
                if (autoUpload && urlInput) {
                    try {
                        showNotification('Uploading image...', 'info');
                        const base64 = await fileToBase64(file);
                        const uploadData = await uploadToImgBB(base64);
                        urlInput.value = uploadData.displayUrl;
                        if (required) {
                            urlInput.removeAttribute('required');
                        }
                        showNotification('Image uploaded successfully!', 'success');
                    } catch (error) {
                        console.error('Upload error:', error);
                        showNotification('Failed to upload image: ' + error.message, 'error');
                        if (previewContainer) {
                            previewContainer.style.display = 'none';
                        }
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    }
    if (removeBtn && uploadInput && urlInput && previewContainer) {
        removeBtn.addEventListener('click', function() {
            uploadInput.value = '';
            urlInput.value = '';
            if (previewContainer) {
                previewContainer.style.display = 'none';
            }
            if (required) {
                urlInput.setAttribute('required', '');
            }
        });
    }
}

// Parse tags from string to array
function parseTags(tagsString) {
    return tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
}

// Validate post form data
function validatePostData(title, category, imageUrl, mode = 'add') {
    if (!title || !category) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }
    if (mode === 'add' && !imageUrl) {
        showNotification('Please provide an image URL or upload an image', 'error');
        return false;
    }
    return true;
}
