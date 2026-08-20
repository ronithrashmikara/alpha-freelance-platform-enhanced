# Comprehensive API Documentation Testing Script
$baseUrl = "http://127.0.0.1:8000/Sapi"
$headers = @{
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

Write-Host "=== ALPHA Freelance Platform API Testing ===" -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host "Testing all documented endpoints..." -ForegroundColor Cyan

$testResults = @()
$token = $null
$projectId = $null
$bidId = $null

# Helper function to log test results
function Log-Test {
    param($endpoint, $method, $success, $message)
    $result = @{
        Endpoint = $endpoint
        Method = $method
        Success = $success
        Message = $message
    }
    $script:testResults += $result
    
    if ($success) {
        Write-Host "✓ $method $endpoint - SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "✗ $method $endpoint - FAILED: $message" -ForegroundColor Red
    }
}

# 1. Authentication Endpoints
Write-Host "`n=== 1. Authentication Endpoints ===" -ForegroundColor Magenta

# 1.1 Register User
Write-Host "`n1.1 Testing POST /register" -ForegroundColor Cyan
$registerData = @{
    name = "API Test User"
    email = "apitest@example.com"
    password = "password123"
    password_confirmation = "password123"
    role = "consumer"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/register" -Method POST -Headers $headers -Body $registerData
    $token = $response.token
    Log-Test "/register" "POST" $true "User registered successfully"
    Write-Host "Token: $token" -ForegroundColor Gray
} catch {
    Log-Test "/register" "POST" $false $_.Exception.Message
}

# 1.2 Login User
Write-Host "`n1.2 Testing POST /login" -ForegroundColor Cyan
$loginData = @{
    email = "apitest@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Headers $headers -Body $loginData
    if (-not $token) { $token = $response.token }
    Log-Test "/login" "POST" $true "Login successful"
} catch {
    Log-Test "/login" "POST" $false $_.Exception.Message
}

# Set up auth headers
if ($token) {
    $authHeaders = $headers.Clone()
    $authHeaders["Authorization"] = "Bearer $token"
}

# 1.3 Get Current User (/me endpoint)
Write-Host "`n1.3 Testing GET /me" -ForegroundColor Cyan
if ($token) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/me" -Method GET -Headers $authHeaders
        Log-Test "/me" "GET" $true "User info retrieved"
        Write-Host "User: $($response.user.name) ($($response.user.email))" -ForegroundColor Gray
    } catch {
        Log-Test "/me" "GET" $false $_.Exception.Message
    }
} else {
    Log-Test "/me" "GET" $false "No token available"
}

# 2. Project Management
Write-Host "`n=== 2. Project Management ===" -ForegroundColor Magenta

# 2.1 Get All Projects
Write-Host "`n2.1 Testing GET /projects" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/projects" -Method GET -Headers $headers
    Log-Test "/projects" "GET" $true "Projects retrieved successfully"
    Write-Host "Total projects: $($response.total)" -ForegroundColor Gray
} catch {
    Log-Test "/projects" "GET" $false $_.Exception.Message
}

# 2.2 Create Project
Write-Host "`n2.2 Testing POST /projects" -ForegroundColor Cyan
if ($token) {
    $projectData = @{
        title = "API Test Project"
        description = "This is a test project created via API documentation testing"
        category = "Web Development"
        skills = @("PHP", "Laravel", "JavaScript", "API Testing")
        budget = 1500.00
        deadline = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/projects" -Method POST -Headers $authHeaders -Body $projectData
        $projectId = $response.project.id
        Log-Test "/projects" "POST" $true "Project created successfully"
        Write-Host "Project ID: $projectId" -ForegroundColor Gray
    } catch {
        Log-Test "/projects" "POST" $false $_.Exception.Message
    }
} else {
    Log-Test "/projects" "POST" $false "No token available"
}

# 2.3 Get Single Project
Write-Host "`n2.3 Testing GET /projects/{id}" -ForegroundColor Cyan
if ($projectId) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId" -Method GET -Headers $headers
        Log-Test "/projects/{id}" "GET" $true "Project details retrieved"
        Write-Host "Project: $($response.project.title)" -ForegroundColor Gray
    } catch {
        Log-Test "/projects/{id}" "GET" $false $_.Exception.Message
    }
} else {
    Log-Test "/projects/{id}" "GET" $false "No project ID available"
}

# 2.4 Update Project
Write-Host "`n2.4 Testing PUT /projects/{id}" -ForegroundColor Cyan
if ($token -and $projectId) {
    $updateData = @{
        title = "Updated API Test Project"
        description = "Updated description via API testing"
        budget = 1800.00
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId" -Method PUT -Headers $authHeaders -Body $updateData
        Log-Test "/projects/{id}" "PUT" $true "Project updated successfully"
    } catch {
        Log-Test "/projects/{id}" "PUT" $false $_.Exception.Message
    }
} else {
    Log-Test "/projects/{id}" "PUT" $false "No token or project ID available"
}

# 3. Bidding System
Write-Host "`n=== 3. Bidding System ===" -ForegroundColor Magenta

# 3.1 Get Project Bids
Write-Host "`n3.1 Testing GET /projects/{id}/bids" -ForegroundColor Cyan
if ($token -and $projectId) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId/bids" -Method GET -Headers $authHeaders
        Log-Test "/projects/{id}/bids" "GET" $true "Project bids retrieved"
    } catch {
        Log-Test "/projects/{id}/bids" "GET" $false $_.Exception.Message
    }
} else {
    Log-Test "/projects/{id}/bids" "GET" $false "No token or project ID available"
}

# 3.2 Create Bid
Write-Host "`n3.2 Testing POST /projects/{id}/bids" -ForegroundColor Cyan
if ($token -and $projectId) {
    $bidData = @{
        amount = 1400.00
        delivery_time = 21
        proposal = "I am experienced in PHP and Laravel development. I can deliver this project within the specified timeframe with high quality."
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId/bids" -Method POST -Headers $authHeaders -Body $bidData
        $bidId = $response.bid.id
        Log-Test "/projects/{id}/bids" "POST" $true "Bid created successfully"
        Write-Host "Bid ID: $bidId" -ForegroundColor Gray
    } catch {
        Log-Test "/projects/{id}/bids" "POST" $false $_.Exception.Message
    }
} else {
    Log-Test "/projects/{id}/bids" "POST" $false "No token or project ID available"
}

# 4. Wallet Management
Write-Host "`n=== 4. Wallet Management ===" -ForegroundColor Magenta

# 4.1 Get Wallet
Write-Host "`n4.1 Testing GET /wallet" -ForegroundColor Cyan
if ($token) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/wallet" -Method GET -Headers $authHeaders
        Log-Test "/wallet" "GET" $true "Wallet info retrieved"
    } catch {
        Log-Test "/wallet" "GET" $false $_.Exception.Message
    }
} else {
    Log-Test "/wallet" "GET" $false "No token available"
}

# 4.2 Get Wallet Balance
Write-Host "`n4.2 Testing GET /wallet/balance" -ForegroundColor Cyan
if ($token) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/wallet/balance" -Method GET -Headers $authHeaders
        Log-Test "/wallet/balance" "GET" $true "Wallet balance retrieved"
    } catch {
        Log-Test "/wallet/balance" "GET" $false $_.Exception.Message
    }
} else {
    Log-Test "/wallet/balance" "GET" $false "No token available"
}

# 4.3 Get Wallet Transactions
Write-Host "`n4.3 Testing GET /wallet/transactions" -ForegroundColor Cyan
if ($token) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/wallet/transactions" -Method GET -Headers $authHeaders
        Log-Test "/wallet/transactions" "GET" $true "Wallet transactions retrieved"
    } catch {
        Log-Test "/wallet/transactions" "GET" $false $_.Exception.Message
    }
} else {
    Log-Test "/wallet/transactions" "GET" $false "No token available"
}

# 5. Reviews
Write-Host "`n=== 5. Reviews ===" -ForegroundColor Magenta

# 5.1 Get All Reviews
Write-Host "`n5.1 Testing GET /reviews" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reviews" -Method GET -Headers $headers
    Log-Test "/reviews" "GET" $true "Reviews retrieved successfully"
} catch {
    Log-Test "/reviews" "GET" $false $_.Exception.Message
}

# 6. Disputes
Write-Host "`n=== 6. Disputes ===" -ForegroundColor Magenta

# 6.1 Get Disputes
Write-Host "`n6.1 Testing GET /disputes" -ForegroundColor Cyan
if ($token) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/disputes" -Method GET -Headers $authHeaders
        Log-Test "/disputes" "GET" $true "Disputes retrieved successfully"
    } catch {
        Log-Test "/disputes" "GET" $false $_.Exception.Message
    }
} else {
    Log-Test "/disputes" "GET" $false "No token available"
}

# 7. Payments
Write-Host "`n=== 7. Payments ===" -ForegroundColor Magenta

# 7.1 Get Payments
Write-Host "`n7.1 Testing GET /payments" -ForegroundColor Cyan
if ($token) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/payments" -Method GET -Headers $authHeaders
        Log-Test "/payments" "GET" $true "Payments retrieved successfully"
    } catch {
        Log-Test "/payments" "GET" $false $_.Exception.Message
    }
} else {
    Log-Test "/payments" "GET" $false "No token available"
}

# 8. Logout
Write-Host "`n=== 8. Logout ===" -ForegroundColor Magenta

# 8.1 Logout User
Write-Host "`n8.1 Testing POST /logout" -ForegroundColor Cyan
if ($token) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/logout" -Method POST -Headers $authHeaders
        Log-Test "/logout" "POST" $true "Logout successful"
    } catch {
        Log-Test "/logout" "POST" $false $_.Exception.Message
    }
} else {
    Log-Test "/logout" "POST" $false "No token available"
}

# Summary Report
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
$successCount = ($testResults | Where-Object { $_.Success -eq $true }).Count
$totalCount = $testResults.Count
$failureCount = $totalCount - $successCount

Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $successCount" -ForegroundColor Green
Write-Host "Failed: $failureCount" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($successCount / $totalCount) * 100, 2))%" -ForegroundColor Yellow

if ($failureCount -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Success -eq $false } | ForEach-Object {
        Write-Host "  - $($_.Method) $($_.Endpoint): $($_.Message)" -ForegroundColor Red
    }
}

Write-Host "`nAPI Documentation Testing Complete!" -ForegroundColor Green
