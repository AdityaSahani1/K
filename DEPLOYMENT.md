# SnapSera - Deployment Guide

This guide will help you deploy SnapSera to **InfinityFree hosting** or any **Apache-based hosting** service.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [File Preparation](#file-preparation)
3. [InfinityFree Deployment Steps](#infinityfree-deployment-steps)
4. [SMTP Email Configuration](#smtp-email-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Local Development](#local-development)

---

## Prerequisites

✅ **InfinityFree Account** (or any Apache/cPanel hosting)  
✅ **FTP Client** (FileZilla recommended) or use hosting File Manager  
✅ **Gmail Account** or other SMTP provider for email functionality  
✅ **All project files** from this repository

---

## File Preparation

### 1. **Remove Development-Only Files**
Before uploading, **DO NOT** upload these files:
- `.replit`
- `replit.nix`
- `replit.md`
- `.env` or `env.txt` (contains secrets)
- `server.php` (only needed for PHP built-in dev server)
- `.git/` folder (if present)

### 2. **Files TO Upload**
Upload these to your **htdocs/** folder:
```
htdocs/
├── index.php
├── .htaccess           ← Important!
├── about.php
├── admin.php
├── contact.php
├── gallery.php
├── profile.php
├── reset-password.php
├── api/                ← All PHP files
├── components/
├── config/
├── data/               ← Create this folder (755 permissions)
├── js/
├── styles/
├── vendor/             ← PHPMailer library
├── favicon.ico
└── composer.json
```

---

## InfinityFree Deployment Steps

### Step 1: Create Account
1. Go to [InfinityFree.com](https://www.infinityfree.com/)
2. Sign up for free hosting
3. Create a new website
4. Note your FTP credentials

### Step 2: Upload Files via FTP

#### Using FileZilla:
1. **Connect to FTP:**
   - Host: `ftpupload.net`
   - Username: `YOUR_USERNAME` (from InfinityFree panel)
   - Password: `YOUR_PASSWORD`
   - Port: `21`

2. **Navigate to `/htdocs/` folder** on the remote server

3. **Upload all files** (except development-only files listed above)

#### Using File Manager (Web):
1. Login to InfinityFree Control Panel
2. Go to **File Manager**
3. Navigate to `htdocs/`
4. Upload files via the upload button

### Step 3: Set Folder Permissions

**CRITICAL:** The `data/` folder must be writable:

1. In File Manager or FTP client
2. Right-click `data/` folder → **Permissions/CHMOD**
3. Set to **755** or **777**
4. ✅ Apply recursively to all files inside

### Step 4: Verify Deployment

Visit your website URL:
```
https://yoursite.infinityfreeapp.com/
```

✅ Homepage should load  
✅ Navigation should work  
✅ Gallery should display posts

---

## SMTP Email Configuration

⚠️ **InfinityFree does NOT provide built-in email.** You must use external SMTP.

### Option 1: Gmail SMTP (Recommended for Testing)

#### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

#### Step 2: Generate App Password
1. Visit [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **App:** Mail
3. Select **Device:** Other (custom name) → "SnapSera"
4. Click **Generate**
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

#### Step 3: Configure Environment Variables

Create a file called **`.env`** in your `/htdocs/` folder:

```env
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=SnapSera
SMTP_PORT=587
SMTP_ENCRYPTION=tls
```

**Important:**
- Replace `your-email@gmail.com` with your Gmail address
- Replace `your-app-password-here` with the 16-char App Password (remove spaces)
- Keep this file secure (don't share it)

#### Step 4: Protect `.env` File

The `.htaccess` file already blocks access to `.env`, but verify:

```apache
# Already in .htaccess
<FilesMatch "^\.">
    Require all denied
</FilesMatch>
```

### Option 2: Alternative SMTP Providers

| Provider | Free Tier | Setup |
|----------|-----------|-------|
| **SendGrid** | 100 emails/day | [Guide](https://sendgrid.com/) |
| **Brevo (Sendinblue)** | 300 emails/day | [Guide](https://www.brevo.com/) |
| **Elastic Email** | 100 emails/day | [Guide](https://elasticemail.com/) |

Use the same `.env` format with provider-specific settings.

---

## Troubleshooting

### ❌ Problem: JSON Files Not Updating

**Cause:** File permissions issue

**Solution:**
```bash
# Via FTP or File Manager
chmod 755 /htdocs/data/
chmod 644 /htdocs/data/*.json
```

Or delete the `data/` folder and let PHP recreate it automatically.

---

### ❌ Problem: Email Not Sending

**Cause:** SMTP credentials not configured or incorrect

**Solution:**
1. Verify `.env` file exists in `/htdocs/`
2. Check SMTP credentials are correct
3. For Gmail: Ensure App Password is used (not regular password)
4. Check PHP error logs in InfinityFree panel

---

### ❌ Problem: 500 Internal Server Error

**Cause:** PHP error or missing files

**Solution:**
1. Check error logs in InfinityFree Control Panel → **Error Logs**
2. Verify `.htaccess` is uploaded correctly
3. Ensure all PHP files are uploaded
4. Check file permissions

---

### ❌ Problem: "Failed to save user data"

**Cause:** Data directory not writable

**Solution:**
```bash
# Ensure data directory has write permissions
chmod 755 /htdocs/data/

# Or recreate the directory via File Manager
# Then set permissions to 755
```

---

### ❌ Problem: Registration/Login Not Working

**Check:**
1. ✅ `.env` file configured with SMTP
2. ✅ `/data/` folder has write permissions (755 or 777)
3. ✅ Check browser console for JavaScript errors
4. ✅ Check InfinityFree error logs

**Debug Mode:**
Add to top of `api/register.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

---

## Local Development

### Running Locally (PHP Built-in Server)

```bash
# Navigate to project folder
cd snapsera

# Start PHP server
php -S localhost:8000 -t . server.php

# Or use the custom port
php -S localhost:5000 -t . server.php
```

### Running Locally (Termux on Android)

```bash
# Install PHP
pkg install php

# Navigate to project folder
cd /sdcard/snapsera

# Start server
php -S localhost:8000 -t . server.php
```

**Note:** The `server.php` router file is **only used for local development**. It won't work on InfinityFree.

---

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SMTP_HOST` | SMTP server address | `smtp.gmail.com` | Yes |
| `SMTP_USERNAME` | SMTP username (email) | - | Yes |
| `SMTP_PASSWORD` | SMTP password (App Password for Gmail) | - | Yes |
| `SMTP_FROM_EMAIL` | Sender email address | - | Yes |
| `SMTP_FROM_NAME` | Sender name | `SnapSera` | No |
| `SMTP_PORT` | SMTP port | `587` | No |
| `SMTP_ENCRYPTION` | Encryption type (`tls` or `ssl`) | `tls` | No |

---

## Important Notes

1. **File Storage:** This app uses JSON files (no database). Ensure `/data/` is writable.

2. **InfinityFree Limits:**
   - Max 150 emails/day
   - No cron jobs
   - PHP execution time: 60 seconds

3. **Security:**
   - Never commit `.env` to Git
   - Use strong passwords
   - Keep PHPMailer updated

4. **Data Backup:**
   - Regularly backup `/data/` folder
   - Download JSON files from File Manager

---

## Support

For hosting issues: [InfinityFree Forum](https://forum.infinityfree.com/)  
For application issues: Check error logs or create an issue in the repository

---

**✅ Deployment Checklist**

- [ ] Files uploaded to `/htdocs/`
- [ ] `.htaccess` file uploaded
- [ ] `/data/` folder permissions set to 755/777
- [ ] `.env` file created with SMTP credentials
- [ ] Website loads successfully
- [ ] Registration/login tested
- [ ] Email sending tested
- [ ] Contact form tested

---

**Happy Deploying! 🚀**
