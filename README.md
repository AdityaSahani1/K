# SnapSera - Photography Portfolio Application

## Overview

## Troubleshooting & Known Issues (Fixed)

### Problem 1: CRUD Operations Not Working on Shared Hosting (InfinityFree, XAMPP, etc.)

**Issue**: Edit post, delete post, and other database operations worked on Replit but failed on other hosting platforms like InfinityFree or XAMPP. Changes made to posts were lost after exporting/importing the project.

**Root Cause**: The application originally used HTTP methods `PUT` and `DELETE` for update and delete operations. Many shared hosting providers and some web servers (especially those with restrictive security configurations) block or don't properly support PUT and DELETE methods, causing the request body to be empty or the request to fail entirely.

**Solution**: Changed all API endpoints to use `POST` method with an `action` parameter to specify the operation:
- `POST` with `action: 'create'` for creating posts
- `POST` with `action: 'update'` for updating posts  
- `POST` with `action: 'delete'` for deleting posts

**Files Modified**:
- `api/posts.php` - Changed to accept POST with action parameter
- `api/get-users.php` - Changed to accept POST with action parameter
- `js/admin.js` - Updated to send POST requests with action
- `js/profile.js` - Updated delete operations to use POST with action

### Problem 2: Edit Post Requiring Image Re-upload

**Issue**: When editing a post, the system required re-uploading the image even if you only wanted to change the title or description.

**Root Cause**: The validation required `imageUrl` field to be filled, and the update function didn't preserve the existing image if none was provided.

**Solution**: 
- Modified validation to only require image URL for new posts (`mode === 'add'`)
- Updated `updatePost()` function in `api/posts.php` to fetch and preserve existing image URL if none is provided
- Image URL field is now optional when editing posts

### Problem 3: Base64 Undefined Error

**Issue**: When editing posts and changing images, the application threw "base64 not defined" errors.

**Root Cause**: This was related to the PUT/DELETE method issue - the request body wasn't being received properly on shared hosting, so image data was undefined.

**Solution**: Fixed by switching to POST method with action parameter, ensuring request bodies are properly transmitted.

### Problem 4: Database Changes Not Persisting on Export/Import

**Issue**: When exporting the project and importing to another server, all posts, users, and changes were lost.

**Root Cause**: The SQLite database file (`data/snapsera.db`) is in `.gitignore`, so it's not included in exports. Only the schema files are exported.

**Solution**: This is by design for security. To migrate data:
1. Run `php init-db.php` on the new server to initialize the database
2. For production, switch to MySQL by updating `config/config.php` and setting `DB_TYPE` to `mysql`
3. For data migration, export the SQLite database separately or use the MySQL schema (`schema.sql`)

### Compatibility Notes

The application now works correctly on:
- ✅ InfinityFree
- ✅ XAMPP
- ✅ Most shared hosting providers
- ✅ Any server supporting PHP 8.2+ and standard POST requests

### Additional Fixes Applied

- Improved error messages throughout the application
- Enhanced UI/UX for post management
- Fixed PWA installation prompts
- Updated share button functionality
- Optimized mobile responsive layouts

SnapSera is a PHP-based photography portfolio and gallery application featuring:

- Photo gallery with categories and tags

- User authentication and registration with email OTP verification

- Admin panel for managing posts and users

- Social features: likes, comments, saves, views

- Contact form with email notifications

- Responsive design with modern UI

## Technology Stack

- **Backend**: PHP 8.2 with PDO

- **Database**: 

  - SQLite (for local development)

  - MySQL (for production)

- **Dependencies**: PHPMailer for email functionality

- **Frontend**: Vanilla JavaScript, CSS3

## Database Configuration

The application supports dual database backends controlled by the `DB_TYPE` environment variable:

- `DB_TYPE=sqlite` - Uses local SQLite database at `data/snapsera.db`

- `DB_TYPE=mysql` - Uses MySQL on InfinityFree hosting

### Current Setup (Replit)

- Database: SQLite

- Location: `data/snapsera.db`

- Admin credentials:

  - Username: `snapsera`

  - Password: `admin123`

  - Email: `snapsera.team@gmail.com`

## Project Structure

```

/

├── api/                 # Backend API endpoints

├── components/          # Reusable PHP components (header, footer, etc.)

├── config/             # Database and environment configuration

├── data/               # SQLite database and JSON files

├── js/                 # Frontend JavaScript

├── styles/             # CSS stylesheets

├── vendor/             # Composer dependencies (PHPMailer)

├── index.php           # Homepage

├── gallery.php         # Photo gallery

├── profile.php         # User profile

├── admin.php           # Admin panel

├── about.php           # About page

├── contact.php         # Contact form

└── migrate-sqlite.php  # SQLite database migration script

```

## Development Setup

1. Run SQLite migration: `php migrate-sqlite.php`

2. Start PHP server: `DB_TYPE=sqlite php -S 0.0.0.0:5000`

3. Access at: Replit webview URL

## API Endpoints

- **POST /api/login.php** - User authentication

- **POST /api/register.php** - User registration

- **GET /api/posts.php** - Fetch all posts

- **POST /api/posts.php** - Create new post

- **PUT /api/posts.php** - Update existing post

- **DELETE /api/posts.php** - Delete post

- **GET /api/get-users.php** - Fetch all users

- **PUT /api/get-users.php** - Update user details

- **DELETE /api/get-users.php** - Delete user

- **POST /api/post-actions.php** - Handle post interactions (like, save, view, comment)

## Recent Changes

- 2025-10-06: Migrated from JSON files to database API endpoints

  - All data now stored in SQLite database

  - Removed JSON data files (posts.json, users.json, etc.)

  - Updated all JavaScript to use REST API endpoints

  - Admin operations (add/edit/delete posts, edit/delete users) fully functional

- 2025-10-06: Imported from GitHub, configured for Replit environment
