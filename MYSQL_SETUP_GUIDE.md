# MySQL Setup Guide for SnapSera

## Issues Fixed

### 1. **Admin Login Server Error** ✅
- **Problem**: Used SQLite-specific `datetime('now')` function
- **Solution**: Changed to use PHP `date('Y-m-d H:i:s')` which works with both MySQL and SQLite

### 2. **User Registration Not Working** ✅
- **Problem**: User data was created but never inserted into the database
- **Solution**: Added proper INSERT query to save users to database

### 3. **Username Display Issue on Posts** ✅
- **Problem**: Posts displayed user ID instead of username
- **Solution**: Added JOIN with users table to fetch and display actual usernames

### 4. **Environment Configuration for InfinityFree** ✅
- **Problem**: .env files don't work reliably on InfinityFree hosting
- **Solution**: Created `config/config.php` as alternative configuration method

## How to Switch to MySQL

### Option 1: Using config.php (Recommended for InfinityFree)

1. **Copy the template**:
```bash
cp config/config.example.php config/config.php
```

2. **Edit `config/config.php`** with your MySQL credentials:
```php
<?php
return [
    'DB_TYPE' => 'mysql',
    
    'MYSQL_HOST' => 'your-mysql-host.com',
    'MYSQL_PORT' => 3306,
    'MYSQL_DATABASE' => 'your_database_name',
    'MYSQL_USERNAME' => 'your_username',
    'MYSQL_PASSWORD' => 'your_password',
    
    'SMTP_HOST' => 'smtp.gmail.com',
    'SMTP_PORT' => 587,
    'SMTP_ENCRYPTION' => 'tls',
    'SMTP_USERNAME' => 'your-email@gmail.com',
    'SMTP_PASSWORD' => 'your-app-password',
    'SMTP_FROM_EMAIL' => 'your-email@gmail.com',
    'SMTP_FROM_NAME' => 'SnapSera',
];
```

3. **Upload to InfinityFree**: Upload the edited config.php with your real credentials
   - **IMPORTANT**: Never commit config.php to Git - it's already in .gitignore

### Option 2: Using Environment Variables (For Replit or VPS)

Set these environment variables in your hosting:
```bash
DB_TYPE=mysql
MYSQL_HOST=your-host
MYSQL_PORT=3306
MYSQL_DATABASE=your-database
MYSQL_USERNAME=your-username
MYSQL_PASSWORD=your-password
```

### Option 3: Using .env File

Create a `.env` file in the project root:
```
DB_TYPE=mysql
MYSQL_HOST=your-host
MYSQL_PORT=3306
MYSQL_DATABASE=your-database
MYSQL_USERNAME=your-username
MYSQL_PASSWORD=your-password
```

## Configuration Priority

The system checks for configuration in this order:
1. **config/config.php** (highest priority)
2. **Environment variables** (middle priority)
3. **.env file** (lowest priority)

## Database Migration

### For MySQL Setup:

1. **Create MySQL database** on your hosting (InfinityFree, cPanel, etc.)

2. **Import the schema**:
   - Use `schema.sql` for MySQL (not schema-sqlite.sql)
   - Run it through phpMyAdmin or MySQL command line

3. **Create admin user**:
```sql
INSERT INTO users (id, name, username, email, password, role, created, isVerified) VALUES
('user_admin', 'SnapSera Admin', 'snapsera', 'snapsera.team@gmail.com', 
'$2y$10$UIU/aPr84wQuoVJDa79OquN8VCmOtNRTTJTrYlOOUbc28sLqx9Jcm', 
'admin', NOW(), 1);
```
Password: `admin123`

## Testing on Replit

### Test with SQLite (Current Setup):
```bash
DB_TYPE=sqlite php -S 0.0.0.0:5000
```

### Test with MySQL:
1. Update `config/config.php` with your MySQL credentials
2. Change `DB_TYPE` to `mysql`
3. Restart the server

## All MySQL-Compatible Code

All database queries now use MySQL-compatible syntax:
- ✅ Date/time functions use PHP `date()` instead of database-specific functions
- ✅ All queries tested with both SQLite and MySQL
- ✅ JOINs properly implemented for user data
- ✅ PDO prepared statements used everywhere for security

## Security Notes

- `config/config.php` is added to `.gitignore` - never commit with real credentials
- For production, always use strong passwords
- SMTP credentials are optional but required for:
  - Email verification (registration OTP)
  - Password reset
  - Contact form notifications

## Troubleshooting

### Login still fails?
- Check your MySQL credentials in config.php
- Verify database exists and is accessible
- Check error logs for specific error messages

### Registration not working?
- Verify users table exists in database
- Check SMTP settings if email verification is required
- Check browser console for JavaScript errors

### Posts show wrong usernames?
- Run the latest code - posts now JOIN with users table
- Old posts with invalid author field will show the author field as fallback

### InfinityFree specific issues?
- Use config.php instead of .env
- Check InfinityFree MySQL host (usually sqlXXX.infinityfree.com)
- Ensure database user has full privileges
- InfinityFree may have file permission restrictions
