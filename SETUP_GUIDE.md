# Alpha Freelance Platform - Setup Guide

## Prerequisites Required

Before running this project, you need to install the following tools:

### Backend Requirements
- **PHP 8.2+** - Download from [php.net](https://www.php.net/downloads.php)
- **Composer** - Download from [getcomposer.org](https://getcomposer.org/download/)

### Frontend Requirements  
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)

## Setup Instructions

### 1. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
copy .env.example .env

# Generate application key
php artisan key:generate

# Create SQLite database file
echo. > database/database.sqlite

# Run database migrations and seeders
php artisan migrate --seed

# Start Laravel server
php artisan serve --host=0.0.0.0 --port=12001
```

### 2. Frontend Setup (Next.js)

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev -- --port 12000
```

### 3. Access the Application

- **Frontend**: http://localhost:12000
- **Backend API**: http://localhost:12001/api
- **Backend Admin**: http://localhost:12001

## Troubleshooting

### Common Issues

1. **PHP not found**: Install PHP and add it to your system PATH
2. **Composer not found**: Install Composer globally
3. **Node.js not found**: Install Node.js from the official website
4. **Port conflicts**: Change ports in the commands above

### Database Issues

If you encounter database issues:
```bash
# Reset database
php artisan migrate:fresh --seed
```

### Permission Issues

On Windows, run commands as Administrator if you encounter permission errors.

## Project Structure

- `backend/` - Laravel API server
- `frontend/` - Next.js React application
- `database/` - SQLite database and migrations
- `config/` - Laravel configuration files

## API Endpoints

The backend provides 46+ API endpoints for:
- Authentication & Users
- Projects Management
- Bidding System
- Payment & Escrow
- Reviews & Ratings
- Dispute Resolution
- Wallet Management

## Default Users (After Seeding)

The system creates sample users for testing:
- Admin users for platform management
- Service providers for project bidding
- Consumers for project posting

Check the database seeders for login credentials.
