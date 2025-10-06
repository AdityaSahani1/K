# Quick Fix Guide - SnapSera Issues

## Your Two Main Issues (SOLVED ✅)

### Issue 1: Not Working on InfinityFree ❌→✅

**Problem:** The `server.php` router doesn't work on InfinityFree (it's only for PHP's built-in dev server).

**Solution:** ✅ **FIXED**
- Updated `.htaccess` file to work with Apache hosting
- All API endpoints will now work directly on InfinityFree
- No code changes needed - just upload files

---

### Issue 2: JSON Files Not Updating & Email Not Working ❌→✅

**Two sub-problems:**

#### A) JSON Files Not Saving
**Cause:** Missing error handling & directory creation

**Solution:** ✅ **FIXED**
- Added automatic `/data/` directory creation
- Added file write error handling with helpful messages
- Added `LOCK_EX` flag to prevent corruption

#### B) Email Not Working  
**Cause:** Missing SMTP configuration

**Solution:** ✅ **REQUIRES SETUP**
You need to configure SMTP credentials. See below.

---

## How to Deploy to InfinityFree (Step-by-Step)

### 1. Upload Files
Via FTP or File Manager, upload to `/htdocs/`:
```
✅ All files EXCEPT:
   ❌ server.php (dev only)
   ❌ .replit, replit.nix
   ❌ .env (has secrets)
```

### 2. Set Data Folder Permissions
```
Right-click /htdocs/data/ → Permissions → 755 or 777
```

### 3. Configure Email (REQUIRED)

Create `.env` file in `/htdocs/`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=SnapSera
SMTP_PORT=587
SMTP_ENCRYPTION=tls
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification first
3. Generate App Password for "SnapSera"
4. Copy the 16-character password
5. Paste in `.env` (remove spaces)

---

## Testing Locally (Termux/Windows)

### Before Running:
Create `.env` file in project root with SMTP credentials (same as above)

### Run Server:
```bash
php -S localhost:8000 -t . server.php
```

✅ Now registration, contact form, and email will work!

---

## What Was Changed

### 1. `.htaccess` File (Updated)
- Added Apache routing support
- Protected JSON files from direct access
- Disabled directory browsing

### 2. `api/auth-actions.php` (Fixed)
- Added directory creation before saving files
- Added error handling with helpful messages
- Better SMTP error messages

### 3. `api/contact.php` (Fixed)
- Added directory creation
- Added file write error handling
- Improved error messages

### 4. Added `DEPLOYMENT.md`
- Complete deployment guide
- SMTP setup instructions
- Troubleshooting section

---

## Quick Test After Deployment

### Test 1: Homepage
```
Visit: https://yoursite.infinityfreeapp.com/
✅ Should load homepage
```

### Test 2: Data Directory
```
1. Try to register a user
2. If error: "Failed to save user data"
   → Fix: Set /data/ permissions to 755
```

### Test 3: Email
```
1. Try to register with your email
2. If error: "Failed to send OTP email"
   → Fix: Create .env with SMTP credentials
```

---

## Error Messages & Solutions

| Error Message | Solution |
|---------------|----------|
| "Failed to save user data" | Set `/data/` permissions to 755 or 777 |
| "Failed to send OTP email. Please check SMTP configuration." | Create `.env` with Gmail App Password |
| "Failed to send message. Please check SMTP configuration." | Same - configure SMTP in `.env` |
| 500 Internal Server Error | Check InfinityFree error logs |

---

## Files You Need to Create on InfinityFree

### 1. `/htdocs/.env` (REQUIRED for email)
```env
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=yourmail@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=yourmail@gmail.com
SMTP_FROM_NAME=SnapSera
SMTP_PORT=587
SMTP_ENCRYPTION=tls
```

### 2. `/htdocs/data/` folder (Will auto-create)
Just ensure it has 755 permissions if created manually.

---

## Need More Help?

📖 **Full Guide:** See `DEPLOYMENT.md`  
🔧 **Troubleshooting:** Check error logs in InfinityFree panel  
💬 **InfinityFree Support:** https://forum.infinityfree.com/

---

## Summary

✅ Your app is now **production-ready**  
✅ Works on **InfinityFree** and **any Apache hosting**  
✅ Better **error messages** to help you debug  
✅ **JSON file writing** fixed with auto-directory creation  
✅ Just configure **SMTP** and you're good to go!

**Remember:** Email requires SMTP setup (Gmail App Password) - this is mandatory for registration, OTP, and contact form to work.
