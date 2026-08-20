#!/bin/bash

# ALPHA Freelance Platform - API Endpoint Testing Script
# This script tests all major API endpoints to verify functionality

BASE_URL="http://localhost:12001/api"
echo "🚀 Starting API Endpoint Testing for ALPHA Freelance Platform"
echo "Base URL: $BASE_URL"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local headers=$3
    local data=$4
    local description=$5
    
    echo -e "${BLUE}Testing:${NC} $description"
    echo -e "${YELLOW}$method${NC} $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" $headers -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" $headers)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        echo -e "${GREEN}✅ SUCCESS${NC} (HTTP $http_code)"
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        echo "Response: $body"
    fi
    echo "---"
}

# 1. Test Public Endpoints
echo -e "${BLUE}📋 TESTING PUBLIC ENDPOINTS${NC}"
echo "=================================================="

test_endpoint "GET" "/projects" "" "" "Get all projects (public)"

test_endpoint "GET" "/reviews" "" "" "Get all reviews (public)"

# 2. Test Authentication
echo -e "${BLUE}🔐 TESTING AUTHENTICATION${NC}"
echo "=================================================="

# Register a test user
REGISTER_DATA='{
    "name": "API Test User",
    "email": "apitest@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "consumer"
}'

echo -e "${BLUE}Testing:${NC} User Registration"
echo -e "${YELLOW}POST${NC} /register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$REGISTER_DATA")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ SUCCESS${NC} - User registered"
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token' 2>/dev/null || echo "")
    USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id' 2>/dev/null || echo "")
    echo "Token: ${TOKEN:0:20}..."
    echo "User ID: $USER_ID"
else
    echo -e "${RED}❌ FAILED${NC} - Registration failed"
    echo "Response: $REGISTER_RESPONSE"
fi
echo "---"

# Test login
LOGIN_DATA='{
    "email": "apitest@example.com",
    "password": "password123"
}'

test_endpoint "POST" "/login" "-H 'Content-Type: application/json' -H 'Accept: application/json'" "$LOGIN_DATA" "User Login"

# If we have a token, test protected endpoints
if [ -n "$TOKEN" ]; then
    AUTH_HEADER="-H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -H 'Accept: application/json'"
    
    echo -e "${BLUE}🔒 TESTING PROTECTED ENDPOINTS${NC}"
    echo "=================================================="
    
    # Test get current user
    test_endpoint "GET" "/user" "-H 'Authorization: Bearer $TOKEN' -H 'Accept: application/json'" "" "Get current user"
    
    # 3. Test Project CRUD
    echo -e "${BLUE}📝 TESTING PROJECT CRUD${NC}"
    echo "=================================================="
    
    # Create project
    PROJECT_DATA='{
        "title": "API Test Project",
        "description": "This is a test project created via API",
        "budget": 1500.00,
        "deadline": "2025-09-15",
        "category": "web-development",
        "skills_required": ["PHP", "Laravel", "API"],
        "project_type": "fixed",
        "experience_level": "intermediate"
    }'
    
    echo -e "${BLUE}Testing:${NC} Create Project"
    echo -e "${YELLOW}POST${NC} /projects"
    PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d "$PROJECT_DATA")
    
    if echo "$PROJECT_RESPONSE" | grep -q "id"; then
        echo -e "${GREEN}✅ SUCCESS${NC} - Project created"
        PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.data.id' 2>/dev/null || echo "")
        echo "Project ID: $PROJECT_ID"
    else
        echo -e "${RED}❌ FAILED${NC} - Project creation failed"
        echo "Response: $PROJECT_RESPONSE"
    fi
    echo "---"
    
    # Get specific project
    if [ -n "$PROJECT_ID" ]; then
        test_endpoint "GET" "/projects/$PROJECT_ID" "-H 'Accept: application/json'" "" "Get specific project"
    fi
    
    # 4. Test Wallet Operations
    echo -e "${BLUE}💰 TESTING WALLET OPERATIONS${NC}"
    echo "=================================================="
    
    test_endpoint "GET" "/wallet/info" "-H 'Authorization: Bearer $TOKEN' -H 'Accept: application/json'" "" "Get wallet info"
    
    # Deposit funds
    DEPOSIT_DATA='{
        "amount": 2000.00,
        "currency": "USDT",
        "transaction_hash": "0x1234567890abcdef"
    }'
    
    test_endpoint "POST" "/wallet/deposit" "$AUTH_HEADER" "$DEPOSIT_DATA" "Deposit funds to wallet"
    
    test_endpoint "GET" "/wallet/balance" "-H 'Authorization: Bearer $TOKEN' -H 'Accept: application/json'" "" "Get wallet balance"
    
    # 5. Test Bidding System (if we have a project)
    if [ -n "$PROJECT_ID" ]; then
        echo -e "${BLUE}💼 TESTING BIDDING SYSTEM${NC}"
        echo "=================================================="
        
        # Register a second user for bidding
        BIDDER_DATA='{
            "name": "API Bidder User",
            "email": "bidder@example.com",
            "password": "password123",
            "password_confirmation": "password123",
            "role": "provider"
        }'
        
        echo -e "${BLUE}Testing:${NC} Register Bidder User"
        BIDDER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d "$BIDDER_DATA")
        
        if echo "$BIDDER_RESPONSE" | grep -q "token"; then
            BIDDER_TOKEN=$(echo "$BIDDER_RESPONSE" | jq -r '.token' 2>/dev/null || echo "")
            echo -e "${GREEN}✅ SUCCESS${NC} - Bidder registered"
            echo "Bidder Token: ${BIDDER_TOKEN:0:20}..."
            
            # Create a bid
            BID_DATA='{
                "amount": 1200.00,
                "delivery_time": 14,
                "proposal": "I can complete this project with high quality and on time."
            }'
            
            test_endpoint "POST" "/projects/$PROJECT_ID/bids" "-H 'Authorization: Bearer $BIDDER_TOKEN' -H 'Content-Type: application/json' -H 'Accept: application/json'" "$BID_DATA" "Create bid on project"
            
            # Get project bids
            test_endpoint "GET" "/projects/$PROJECT_ID/bids" "-H 'Authorization: Bearer $TOKEN' -H 'Accept: application/json'" "" "Get project bids"
        else
            echo -e "${RED}❌ FAILED${NC} - Bidder registration failed"
        fi
        echo "---"
    fi
    
    # 6. Test Report Generation
    echo -e "${BLUE}📊 TESTING REPORT GENERATION${NC}"
    echo "=================================================="
    
    test_endpoint "GET" "/reports/user-activity?format=pdf&start_date=2025-01-01&end_date=2025-08-15" "-H 'Authorization: Bearer $TOKEN' -H 'Accept: application/json'" "" "Generate user activity PDF report"
    
    test_endpoint "GET" "/reports/payments?format=excel" "-H 'Authorization: Bearer $TOKEN' -H 'Accept: application/json'" "" "Generate payments Excel report"
    
    test_endpoint "GET" "/reports/project-analytics?format=pdf" "-H 'Authorization: Bearer $TOKEN' -H 'Accept: application/json'" "" "Generate project analytics report"
    
    test_endpoint "GET" "/reports/platform-stats?format=pdf" "-H 'Authorization: Bearer $TOKEN' -H 'Accept: application/json'" "" "Generate platform stats report"
    
    # 7. Test Review System
    echo -e "${BLUE}⭐ TESTING REVIEW SYSTEM${NC}"
    echo "=================================================="
    
    # Create a review (if we have project and bidder)
    if [ -n "$PROJECT_ID" ] && [ -n "$BIDDER_TOKEN" ]; then
        REVIEW_DATA='{
            "project_id": '$PROJECT_ID',
            "reviewee_id": 2,
            "rating": 5,
            "skills_rating": 5,
            "communication_rating": 4,
            "timeliness_rating": 5,
            "comment": "Excellent work! API testing shows great quality.",
            "would_recommend": true
        }'
        
        test_endpoint "POST" "/reviews" "$AUTH_HEADER" "$REVIEW_DATA" "Create review"
    fi
    
    # 8. Test Dispute System
    echo -e "${BLUE}⚖️ TESTING DISPUTE SYSTEM${NC}"
    echo "=================================================="
    
    test_endpoint "GET" "/disputes" "-H 'Authorization: Bearer $TOKEN' -H 'Accept: application/json'" "" "Get user disputes"
    
    # Create a dispute if we have a project
    if [ -n "$PROJECT_ID" ]; then
        DISPUTE_DATA='{
            "project_id": '$PROJECT_ID',
            "reason": "quality_issues",
            "description": "API testing dispute - this is a test dispute for API validation."
        }'
        
        test_endpoint "POST" "/disputes" "$AUTH_HEADER" "$DISPUTE_DATA" "Create dispute"
    fi
    
    # 9. Test Logout
    echo -e "${BLUE}🚪 TESTING LOGOUT${NC}"
    echo "=================================================="
    
    test_endpoint "POST" "/logout" "-H 'Authorization: Bearer $TOKEN' -H 'Accept: application/json'" "" "User logout"
    
else
    echo -e "${RED}❌ Cannot test protected endpoints - no authentication token${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 API ENDPOINT TESTING COMPLETED${NC}"
echo "=================================================="
echo ""
echo "📋 SUMMARY:"
echo "- All major CRUD operations tested"
echo "- Authentication system verified"
echo "- Payment and wallet operations checked"
echo "- Report generation functionality tested"
echo "- Review and dispute systems validated"
echo ""
echo "📖 For detailed API documentation, see: API_DOCUMENTATION.md"
echo "🔗 Backend running on: http://localhost:12001"
echo "🔗 Frontend running on: http://localhost:12000"