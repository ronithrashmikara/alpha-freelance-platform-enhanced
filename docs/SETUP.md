# ALPHA Freelance Platform - Local Setup Guide

## 🚀 Latest Commit
**Commit Hash:** `13aa76a`  
**Repository:** https://github.com/Magicwander/alpha-freelance-platform

## 📋 Prerequisites

- **PHP 8.1+** with extensions: `mbstring`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `tokenizer`
- **Composer** (PHP dependency manager)
- **Node.js 18+** and **npm**
- **SQLite** (included with PHP)
- **Git**

## 🛠️ Backend Setup (Laravel)

### 1. Clone Repository
```bash
git clone https://github.com/Magicwander/alpha-freelance-platform.git
cd alpha-freelance-platform/backend
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup
```bash
# Create SQLite database
touch database/database.sqlite

# Run migrations with seeders
php artisan migrate --seed
```

### 5. Storage Setup
```bash
# Create storage link for file uploads
php artisan storage:link
```

### 6. Start Backend Server
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Backend will be available at: `http://localhost:8000`

## 🎨 Frontend Setup (Next.js)

### 1. Navigate to Frontend
```bash
cd ../frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Create environment file
cp .env.example .env.local

# Edit .env.local and set:
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Start Frontend Server
```bash
npm run dev -- --port 3000
```

Frontend will be available at: `http://localhost:3000`

## 🧪 Test the Platform

### Default Admin Account
- **Email:** `admin@alpha.com`
- **Password:** `admin123`

### Test User Accounts
- **Consumer:** `sarah@example.com` / `password123`
- **Provider:** `marcus@example.com` / `password123`

### API Testing
```bash
# Test API health
curl http://localhost:8000/api/projects

# Test authentication
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@alpha.com", "password": "admin123"}'
```

## 🔧 Key Features Implemented

### ✅ Complete CRUD Operations
- **Users:** Registration, Authentication, Profile Management
- **Projects:** Create, Read, Update, Delete, Assignment
- **Bids:** Create, Read, Update (Accept/Reject), Delete
- **Payments:** Escrow Creation, Hold, Release, Refund
- **Disputes:** Create, Read, Update (Resolution), Delete
- **Wallets:** Create, Read, Update (Balance), Delete

### ✅ End-to-End Workflow
1. **User Registration** (Consumer & Service Provider)
2. **Project Creation** with AI breakdown
3. **Project Discovery** and bidding
4. **Bid Acceptance** and project assignment
5. **Project Completion** tracking
6. **Escrow Payment** creation and release
7. **Dispute Resolution** with admin intervention
8. **Wallet Management** with balance tracking

### ✅ New Features Added
- **Profile Picture Upload** with validation
- **File Storage** with automatic cleanup
- **Database Schema Fixes** for proper relationships
- **Payment Escrow System** with hold/release functionality

## 📁 Project Structure

```
alpha-freelance-platform/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── ...
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── database.sqlite
│   ├── routes/api.php
│   └── ...
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── public/
│   └── ...
└── SETUP.md               # This file
```

## 🔍 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user
- `PUT /api/profile` - Update profile
- `POST /api/upload-avatar` - Upload profile picture

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Bids
- `GET /api/bids` - List bids
- `POST /api/bids` - Create bid
- `PUT /api/bids/{id}` - Update bid
- `DELETE /api/bids/{id}` - Delete bid

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/{id}` - Update payment

### Disputes
- `GET /api/disputes` - List disputes
- `POST /api/disputes` - Create dispute
- `PUT /api/disputes/{id}` - Update dispute

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Ensure SQLite file exists
   touch database/database.sqlite
   php artisan migrate --seed
   ```

2. **Storage Permission Error**
   ```bash
   # Fix storage permissions
   chmod -R 775 storage bootstrap/cache
   php artisan storage:link
   ```

3. **CORS Issues**
   ```bash
   # Clear config cache
   php artisan config:clear
   php artisan cache:clear
   ```

4. **Frontend API Connection**
   ```bash
   # Check .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

## 📊 Database Schema

### Key Tables
- `users` - User accounts with roles
- `projects` - Project listings with AI breakdowns
- `bids` - Service provider proposals
- `payments` - Escrow payment system
- `disputes` - Conflict resolution system
- `wallets` - User balance management

## 🔐 Security Features

- **Sanctum Authentication** with token-based API access
- **Input Validation** on all endpoints
- **SQL Injection Prevention** with Eloquent ORM
- **File Upload Validation** with type and size limits
- **Role-based Access Control** (Consumer, Provider, Admin)

## 🎯 Testing Workflow

1. Register as Consumer and Service Provider
2. Create a project as Consumer
3. Place bid as Service Provider
4. Accept bid as Consumer
5. Complete project as Service Provider
6. Release payment as Consumer
7. Create dispute if needed
8. Resolve dispute as Admin

## 📞 Support

For issues or questions:
- Check the GitHub repository: https://github.com/Magicwander/alpha-freelance-platform
- Review the commit history for recent changes
- Test API endpoints using the provided curl commands

---

**Last Updated:** August 14, 2025  
**Version:** 1.0.0 (Complete End-to-End Workflow)