# Security Note - Action Required

## Exposed Credentials

The following InfinityFree MySQL credentials were temporarily exposed in the Git history:

- **Host**: sql106.infinityfree.com
- **Username**: if0_40098287
- **Database**: if0_40098287_snapsera

## Immediate Actions Required

1. **Change the MySQL password** on InfinityFree immediately
2. **Update config.php** with the new password (do NOT commit it)
3. The new config.php is already in .gitignore to prevent future exposure

## What Happened

During initial setup, production credentials were accidentally included in config/config.php. This file has now been sanitized with placeholder values, and a template file (config.example.php) has been created.

## Going Forward

- **config/config.php** is in .gitignore - safe to add real credentials locally
- **config.example.php** is the template - safe to commit with placeholder values
- Always use environment variables or config.php for sensitive data
- Never commit files with real passwords or API keys

## Files Safe to Commit

✅ config.example.php (template with placeholders)
✅ All code files
✅ Documentation

## Files to Never Commit

❌ config/config.php (contains real credentials)
❌ .env (contains real credentials)
❌ Any file with production passwords or API keys
