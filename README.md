# SnapSera - Photography Portfolio Application







## Overview







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