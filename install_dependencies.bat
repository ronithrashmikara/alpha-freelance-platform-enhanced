@echo off
echo Alpha Freelance Platform - Dependency Installer
echo ================================================

echo.
echo Checking for required tools...

:: Check for PHP
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] PHP is installed
    php --version
) else (
    echo [MISSING] PHP is not installed
    echo Please download PHP from: https://windows.php.net/download/
    echo Add PHP to your system PATH
)

echo.

:: Check for Composer
composer --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Composer is installed
    composer --version
) else (
    echo [MISSING] Composer is not installed
    echo Please download Composer from: https://getcomposer.org/download/
)

echo.

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Node.js is installed
    node --version
) else (
    echo [MISSING] Node.js is not installed
    echo Please download Node.js from: https://nodejs.org/
)

echo.

:: Check for npm
npm --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] npm is installed
    npm --version
) else (
    echo [MISSING] npm is not installed (should come with Node.js)
)

echo.
echo ================================================
echo.

:: If all tools are available, proceed with setup
php --version >nul 2>&1 && composer --version >nul 2>&1 && node --version >nul 2>&1 && npm --version >nul 2>&1
if %errorlevel% == 0 (
    echo All required tools are available! Starting setup...
    echo.
    
    echo Setting up Backend...
    cd backend
    
    :: Copy environment file
    if not exist .env (
        copy .env.example .env
        echo Environment file created
    )
    
    :: Install composer dependencies
    echo Installing PHP dependencies...
    composer install
    
    :: Generate app key
    echo Generating application key...
    php artisan key:generate
    
    :: Create database file
    if not exist database\database.sqlite (
        echo. > database\database.sqlite
        echo SQLite database file created
    )
    
    :: Run migrations and seeders
    echo Running database migrations and seeders...
    php artisan migrate --seed
    
    cd ..
    
    echo.
    echo Setting up Frontend...
    cd frontend
    
    :: Install npm dependencies
    echo Installing Node.js dependencies...
    npm install
    
    cd ..
    
    echo.
    echo ================================================
    echo Setup completed successfully!
    echo.
    echo To start the servers:
    echo 1. Backend: cd backend && php artisan serve --host=0.0.0.0 --port=12001
    echo 2. Frontend: cd frontend && npm run dev -- --port 12000
    echo.
    echo Access URLs:
    echo - Frontend: http://localhost:12000
    echo - Backend API: http://localhost:12001/api
    echo ================================================
    
) else (
    echo.
    echo Please install the missing tools and run this script again.
    echo.
    echo Quick install links:
    echo - PHP: https://windows.php.net/download/
    echo - Composer: https://getcomposer.org/download/
    echo - Node.js: https://nodejs.org/
)

pause
