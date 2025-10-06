# Database Switching Guide

## Overview

SnapSera now supports **two database backends** that can be switched using the `DB_TYPE` environment variable:

- **SQLite** - For Replit testing (local file-based database)
- **MySQL** - For InfinityFree production (remote database)

## Current Configuration

The database type is controlled by the `DB_TYPE` environment variable in `config/database.php`:

```php
$this->dbtype = getenv('DB_TYPE') ?: 'mysql';
```

## Database Types

### SQLite (Replit Testing)
- **File location:** `data/snapsera.db`
- **No external server needed**
- **Perfect for local development and testing**
- **Built into PHP - no additional installation**

### MySQL (InfinityFree Production)
- **Host:** sql106.infinityfree.com
- **Database:** if0_40098287_snapsera
- **Username:** if0_40098287
- **Port:** 3306
- **For production deployment only**

## How to Switch Databases

### Option 1: Using Environment Variable (Replit)

Set the environment variable in your workflow or shell:

```bash
# For SQLite (Replit testing)
export DB_TYPE=sqlite
php -S 0.0.0.0:5000

# For MySQL (InfinityFree)
export DB_TYPE=mysql
# (or don't set it - MySQL is default)
```

### Option 2: Inline with Command (Current Setup)

The workflow is configured with:
```bash
DB_TYPE=sqlite php -S 0.0.0.0:5000
```

### Option 3: Modify config/database.php

Change the default in the constructor:
```php
// Force SQLite
$this->dbtype = 'sqlite';

// Force MySQL
$this->dbtype = 'mysql';
```

## Database Initialization

### SQLite Setup (Replit)

```bash
# Run migration
php migrate-sqlite.php

# This creates:
# - data/snapsera.db
# - All tables
# - Admin user (username: snapsera, password: admin123)
# - 5 sample posts
```

### MySQL Setup (InfinityFree)

```bash
# Upload files to InfinityFree
# Then run migration
php migrate.php

# Or visit in browser
# https://yoursite.infinityfreeapp.com/migrate.php
```

## Testing the Switch

### Test SQLite (Currently Active)

```bash
# Server is running with SQLite
# Visit: https://[replit-url]/

# Login credentials:
# Username: snapsera
# Password: admin123
```

### Test MySQL

```bash
# Stop current workflow
# Update workflow command to:
DB_TYPE=mysql php -S 0.0.0.0:5000

# Note: This will fail on Replit because MySQL database
# is on InfinityFree servers (not accessible externally)
```

## Unified API Layer

All API files now use **PDO** (PHP Data Objects) which works with both databases:

```php
// Old (MySQL only - mysqli)
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("s", $userId);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

// New (Both MySQL and SQLite - PDO)
$user = $db->fetchOne(
    "SELECT * FROM users WHERE id = ?",
    [$userId]
);
```

## Database Helper Methods

The `Database` class provides unified methods:

```php
$db = Database::getInstance();

// Execute query with parameters
$db->execute("INSERT INTO users (...) VALUES (?, ?)", [$val1, $val2]);

// Fetch one row
$user = $db->fetchOne("SELECT * FROM users WHERE id = ?", [$id]);

// Fetch all rows
$users = $db->fetchAll("SELECT * FROM users ORDER BY created DESC");

// Get database type
$type = $db->getType(); // 'sqlite' or 'mysql'

// Get last insert ID
$lastId = $db->getLastInsertId();
```

## Architecture Benefits

✅ **Single Codebase** - Same code works on both databases
✅ **Easy Testing** - Test locally with SQLite on Replit
✅ **Production Ready** - Deploy to MySQL on InfinityFree
✅ **No Code Changes** - Just change environment variable
✅ **Consistent API** - PDO provides uniform interface

## Files Overview

```
/
├── config/
│   └── database.php          # Unified database connector
├── schema.sql                # MySQL schema
├── schema-sqlite.sql         # SQLite schema
├── migrate.php               # MySQL migration
├── migrate-sqlite.php        # SQLite migration
└── data/
    └── snapsera.db          # SQLite database (created after migration)
```

## Current Status

🟢 **Active:** SQLite (Replit testing)
- Database: `data/snapsera.db`
- Server: Running on port 5000
- Users: 1 (admin: snapsera/admin123)
- Posts: 5 sample posts

🔴 **Inactive:** MySQL (InfinityFree production)
- Not accessible from Replit
- Requires deployment to InfinityFree
- Must run migrate.php after deployment
