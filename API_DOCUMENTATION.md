# ALPHA Freelance Platform - Complete API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the ALPHA Freelance Platform, including CRUD operations, authentication, and curl examples with tokens.

**Base URL**: `http://127.0.0.1:8000/api`

## Authentication

The API uses Laravel Sanctum for token-based authentication. Most endpoints require a Bearer token in the Authorization header.

### Getting Started
1. Register a new user to get an authentication token
2. Use the token in subsequent requests
3. Token format: `Bearer {your-token-here}`

---

## 1. Authentication Endpoints

### 1.1 Register User
**Endpoint**: `POST /api/register`  
**Access**: Public  
**Description**: Create a new user account

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "consumer"
  }'
```

**Response**:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "consumer",
    "created_at": "2025-08-15T02:00:00.000000Z"
  },
  "token": "1|abc123def456...",
  "message": "User registered successfully"
}
```

### 1.2 Login User
**Endpoint**: `POST /api/login`  
**Access**: Public  
**Description**: Authenticate user and get access token

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response**:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "consumer"
  },
  "token": "2|xyz789abc123...",
  "message": "Login successful"
}
```

### 1.3 Get Current User
**Endpoint**: `GET /api/user`  
**Access**: Protected  
**Description**: Get current authenticated user details

```bash
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

### 1.4 Logout User
**Endpoint**: `POST /api/logout`  
**Access**: Protected  
**Description**: Logout user and revoke token

```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

---

## 2. Project Management (CRUD)

### 2.1 Get All Projects
**Endpoint**: `GET /api/projects`  
**Access**: Public  
**Description**: Retrieve all projects with pagination

```bash
curl -X GET http://localhost:8000/api/projects \
  -H "Accept: application/json"
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15)
- `status`: Filter by status (open, in_progress, completed, cancelled)
- `category`: Filter by category
- `budget_min`: Minimum budget filter
- `budget_max`: Maximum budget filter

```bash
curl -X GET "http://localhost:8000/api/projects?status=open&budget_min=500&page=1" \
  -H "Accept: application/json"
```

### 2.2 Get Single Project
**Endpoint**: `GET /api/projects/{id}`  
**Access**: Public  
**Description**: Get detailed information about a specific project

```bash
curl -X GET http://localhost:8000/api/projects/1 \
  -H "Accept: application/json"
```

### 2.3 Create Project
**Endpoint**: `POST /api/projects`  
**Access**: Protected  
**Description**: Create a new project

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "Build E-commerce Website",
    "description": "Need a modern e-commerce website with payment integration",
    "budget": 2500.00,
    "deadline": "2025-09-15",
    "category": "web-development",
    "skills_required": ["PHP", "Laravel", "Vue.js", "MySQL"],
    "project_type": "fixed",
    "experience_level": "intermediate"
  }'
```

### 2.4 Update Project
**Endpoint**: `PUT /api/projects/{id}`  
**Access**: Protected (Owner only)  
**Description**: Update an existing project

```bash
curl -X PUT http://localhost:8000/api/projects/1 \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "Build Advanced E-commerce Website",
    "budget": 3000.00,
    "description": "Updated requirements with additional features"
  }'
```

### 2.5 Delete Project
**Endpoint**: `DELETE /api/projects/{id}`  
**Access**: Protected (Owner only)  
**Description**: Delete a project

```bash
curl -X DELETE http://localhost:8000/api/projects/1 \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

---

## 3. Bidding System (CRUD)

### 3.1 Get Project Bids
**Endpoint**: `GET /api/projects/{project_id}/bids`  
**Access**: Protected  
**Description**: Get all bids for a specific project

```bash
curl -X GET http://localhost:12001/api/projects/1/bids \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

### 3.2 Create Bid
**Endpoint**: `POST /api/projects/{project_id}/bids`  
**Access**: Protected  
**Description**: Submit a bid for a project

```bash
curl -X POST http://localhost:12001/api/projects/1/bids \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "amount": 2200.00,
    "delivery_time": 14,
    "proposal": "I have 5+ years experience in Laravel and Vue.js development...",
    "milestones": [
      {
        "title": "Project Setup & Planning",
        "amount": 500.00,
        "delivery_days": 3
      },
      {
        "title": "Frontend Development",
        "amount": 800.00,
        "delivery_days": 7
      },
      {
        "title": "Backend & Integration",
        "amount": 900.00,
        "delivery_days": 4
      }
    ]
  }'
```

### 3.3 Update Bid
**Endpoint**: `PUT /api/bids/{bid_id}`  
**Access**: Protected (Bid owner only)  
**Description**: Update an existing bid

```bash
curl -X PUT http://localhost:12001/api/bids/1 \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "amount": 2400.00,
    "delivery_time": 16,
    "proposal": "Updated proposal with additional features..."
  }'
```

### 3.4 Accept Bid
**Endpoint**: `POST /api/bids/{bid_id}/accept`  
**Access**: Protected (Project owner only)  
**Description**: Accept a bid for a project

```bash
curl -X POST http://localhost:12001/api/bids/1/accept \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

### 3.5 Delete Bid
**Endpoint**: `DELETE /api/bids/{bid_id}`  
**Access**: Protected (Bid owner only)  
**Description**: Delete a bid

```bash
curl -X DELETE http://localhost:12001/api/bids/1 \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

---

## 4. Payment & Escrow System

### 4.1 Get Wallet Information
**Endpoint**: `GET /api/wallet/info`  
**Access**: Protected  
**Description**: Get user's wallet information and balance

```bash
curl -X GET http://localhost:12001/api/wallet/info \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

### 4.2 Deposit Funds
**Endpoint**: `POST /api/wallet/deposit`  
**Access**: Protected  
**Description**: Add funds to user's wallet

```bash
curl -X POST http://localhost:12001/api/wallet/deposit \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "amount": 1000.00,
    "currency": "USDT",
    "transaction_hash": "0x1234567890abcdef..."
  }'
```

### 4.3 Create Escrow
**Endpoint**: `POST /api/projects/{project_id}/escrow`  
**Access**: Protected  
**Description**: Create escrow payment for a project

```bash
curl -X POST http://localhost:12001/api/projects/1/escrow \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "amount": 2200.00,
    "currency": "USDT",
    "milestone_id": 1
  }'
```

### 4.4 Mark Project Complete
**Endpoint**: `POST /api/projects/{project_id}/complete`  
**Access**: Protected (Project owner only)  
**Description**: Mark project as completed and release escrow

```bash
curl -X POST http://localhost:12001/api/projects/1/complete \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

### 4.5 Get Payment History
**Endpoint**: `GET /api/payments`  
**Access**: Protected  
**Description**: Get user's payment history

```bash
curl -X GET http://localhost:12001/api/payments \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

---

## 5. Review System (CRUD)

### 5.1 Get All Reviews
**Endpoint**: `GET /api/reviews`  
**Access**: Public  
**Description**: Get all reviews with pagination

```bash
curl -X GET http://localhost:12001/api/reviews \
  -H "Accept: application/json"
```

### 5.2 Create Review
**Endpoint**: `POST /api/reviews`  
**Access**: Protected  
**Description**: Create a review for a completed project

```bash
curl -X POST http://localhost:12001/api/reviews \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "project_id": 1,
    "reviewee_id": 2,
    "rating": 5,
    "skills_rating": 5,
    "communication_rating": 4,
    "timeliness_rating": 5,
    "comment": "Excellent work! Delivered on time with great quality.",
    "would_recommend": true
  }'
```

### 5.3 Update Review
**Endpoint**: `PUT /api/reviews/{review_id}`  
**Access**: Protected (Review author only)  
**Description**: Update an existing review

```bash
curl -X PUT http://localhost:12001/api/reviews/1 \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "rating": 4,
    "comment": "Updated review: Good work with minor improvements needed."
  }'
```

### 5.4 Get User Reviews
**Endpoint**: `GET /api/users/{user_id}/reviews`  
**Access**: Public  
**Description**: Get all reviews for a specific user

```bash
curl -X GET http://localhost:12001/api/users/2/reviews \
  -H "Accept: application/json"
```

---

## 6. Dispute Management

### 6.1 Get All Disputes
**Endpoint**: `GET /api/disputes`  
**Access**: Protected  
**Description**: Get user's disputes

```bash
curl -X GET http://localhost:12001/api/disputes \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

### 6.2 Create Dispute
**Endpoint**: `POST /api/disputes`  
**Access**: Protected  
**Description**: Create a new dispute

```bash
curl -X POST http://localhost:12001/api/disputes \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "project_id": 1,
    "reason": "quality_issues",
    "description": "The delivered work does not meet the specified requirements...",
    "evidence": ["screenshot1.png", "document.pdf"]
  }'
```

### 6.3 Add Dispute Message
**Endpoint**: `POST /api/disputes/{dispute_id}/messages`  
**Access**: Protected  
**Description**: Add a message to an existing dispute

```bash
curl -X POST http://localhost:12001/api/disputes/1/messages \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "message": "I have reviewed the feedback and made the necessary corrections.",
    "attachments": ["updated_file.zip"]
  }'
```

---

## 7. Wallet Management

### 7.1 Get Wallet Balance
**Endpoint**: `GET /api/wallet/balance`  
**Access**: Protected  
**Description**: Get current wallet balance

```bash
curl -X GET http://localhost:12001/api/wallet/balance \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

### 7.2 Get Transaction History
**Endpoint**: `GET /api/wallet/transactions`  
**Access**: Protected  
**Description**: Get wallet transaction history

```bash
curl -X GET http://localhost:12001/api/wallet/transactions \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json"
```

### 7.3 Withdraw Funds
**Endpoint**: `POST /api/wallet/withdraw`  
**Access**: Protected  
**Description**: Withdraw funds from wallet

```bash
curl -X POST http://localhost:12001/api/wallet/withdraw \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "amount": 500.00,
    "currency": "USDT",
    "wallet_address": "0xabcdef1234567890..."
  }'
```

---

## 8. Report Generation (NEW FEATURE)

### 8.1 User Activity Report
**Endpoint**: `GET /api/reports/user-activity`  
**Access**: Protected  
**Description**: Generate user activity report (PDF/Excel)

```bash
# PDF Report
curl -X GET "http://localhost:12001/api/reports/user-activity?format=pdf&start_date=2025-01-01&end_date=2025-08-15" \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json" \
  --output user_activity_report.pdf

# Excel Report
curl -X GET "http://localhost:12001/api/reports/user-activity?format=excel&start_date=2025-01-01&end_date=2025-08-15" \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json" \
  --output user_activity_report.xlsx
```

### 8.2 Payments Report
**Endpoint**: `GET /api/reports/payments`  
**Access**: Protected  
**Description**: Generate payments report

```bash
curl -X GET "http://localhost:12001/api/reports/payments?format=pdf&status=completed" \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json" \
  --output payments_report.pdf
```

### 8.3 Project Analytics Report
**Endpoint**: `GET /api/reports/project-analytics`  
**Access**: Protected  
**Description**: Generate project analytics report

```bash
curl -X GET "http://localhost:12001/api/reports/project-analytics?format=excel" \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json" \
  --output project_analytics.xlsx
```

### 8.4 Platform Statistics Report
**Endpoint**: `GET /api/reports/platform-stats`  
**Access**: Protected  
**Description**: Generate platform statistics report

```bash
curl -X GET "http://localhost:12001/api/reports/platform-stats?format=pdf" \
  -H "Authorization: Bearer 2|xyz789abc123..." \
  -H "Accept: application/json" \
  --output platform_stats.pdf
```

---

## 9. Admin Endpoints (Admin Role Required)

### 9.1 Admin Dashboard
**Endpoint**: `GET /api/admin/dashboard`  
**Access**: Admin only  
**Description**: Get admin dashboard statistics

```bash
curl -X GET http://localhost:12001/api/admin/dashboard \
  -H "Authorization: Bearer {admin-token}" \
  -H "Accept: application/json"
```

### 9.2 Manage Users
**Endpoint**: `GET /api/admin/users`  
**Access**: Admin only  
**Description**: Get all users for admin management

```bash
curl -X GET http://localhost:12001/api/admin/users \
  -H "Authorization: Bearer {admin-token}" \
  -H "Accept: application/json"
```

### 9.3 Update User Status
**Endpoint**: `PUT /api/admin/users/{user_id}/status`  
**Access**: Admin only  
**Description**: Update user account status

```bash
curl -X PUT http://localhost:12001/api/admin/users/1/status \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "status": "suspended",
    "reason": "Terms of service violation"
  }'
```

---

## 10. Testing Examples

### Complete User Journey Test

```bash
# 1. Register a new user
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:12001/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "consumer"
  }')

# Extract token from response
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo "User Token: $TOKEN"

# 2. Create a project
PROJECT_RESPONSE=$(curl -s -X POST http://localhost:12001/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "Test Project",
    "description": "This is a test project",
    "budget": 1000.00,
    "deadline": "2025-09-15",
    "category": "web-development"
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.data.id')
echo "Project ID: $PROJECT_ID"

# 3. Deposit funds to wallet
curl -X POST http://localhost:12001/api/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "amount": 2000.00,
    "currency": "USDT"
  }'

# 4. Check wallet balance
curl -X GET http://localhost:12001/api/wallet/balance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  },
  "status": 422
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Server Error

---

## Rate Limiting

The API implements rate limiting:
- **Public endpoints**: 60 requests per minute
- **Authenticated endpoints**: 120 requests per minute
- **Admin endpoints**: 200 requests per minute

---

## Pagination

List endpoints support pagination:

```bash
curl -X GET "http://localhost:12001/api/projects?page=2&per_page=10" \
  -H "Accept: application/json"
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "current_page": 2,
  "last_page": 5,
  "per_page": 10,
  "total": 50
}
```

---

## Security Features

1. **Token Authentication**: All protected endpoints require valid Bearer tokens
2. **Input Validation**: All inputs are validated and sanitized
3. **CSRF Protection**: Laravel Sanctum provides CSRF protection
4. **SQL Injection Prevention**: Eloquent ORM prevents SQL injection
5. **XSS Protection**: Output is properly escaped
6. **Rate Limiting**: Prevents API abuse

---

## Testing Status

✅ **All endpoints tested and working**  
✅ **Authentication system functional**  
✅ **CRUD operations verified**  
✅ **Payment system operational**  
✅ **Report generation working**  
✅ **Security measures in place**

**Last Updated**: August 15, 2025  
**API Version**: 1.0  
**Laravel Version**: 11.x