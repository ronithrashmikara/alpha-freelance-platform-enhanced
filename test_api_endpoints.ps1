# API Endpoint Testing Script
$baseUrl = "http://localhost:8000/api"
$headers = @{
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

Write-Host "Testing API Endpoints..." -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow

# Test 1: Health Check - Get Projects (Public endpoint)
Write-Host "`n1. Testing GET /projects (Public)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/projects" -Method GET -Headers $headers
    Write-Host "SUCCESS: Projects endpoint working" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Register endpoint
Write-Host "`n2. Testing POST /register" -ForegroundColor Cyan
$registerData = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    password_confirmation = "password123"
    role = "consumer"
} | ConvertTo-Json

$token = $null
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/register" -Method POST -Headers $headers -Body $registerData
    Write-Host "SUCCESS: Register endpoint working" -ForegroundColor Green
    $token = $response.token
    Write-Host "Token received: $token" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Gray
    } catch {
        # Ignore error reading response
    }
}

# Test 3: Login endpoint (try with existing user)
Write-Host "`n3. Testing POST /login" -ForegroundColor Cyan
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Headers $headers -Body $loginData
    Write-Host "SUCCESS: Login endpoint working" -ForegroundColor Green
    $token = $response.token
    Write-Host "Token received: $token" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test authenticated endpoints if we have a token
if ($token) {
    $authHeaders = $headers.Clone()
    $authHeaders["Authorization"] = "Bearer $token"
    
    # Test 4: Me endpoint
    Write-Host "`n4. Testing GET /me (Authenticated)" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/me" -Method GET -Headers $authHeaders
        Write-Host "SUCCESS: Me endpoint working" -ForegroundColor Green
        Write-Host "User: $($response.user.name) ($($response.user.email))" -ForegroundColor Gray
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Test 5: Create Project
    Write-Host "`n5. Testing POST /projects (Authenticated)" -ForegroundColor Cyan
    $projectData = @{
        title = "Test Project"
        description = "This is a test project created via API"
        category = "Web Development"
        skills = @("PHP", "Laravel", "JavaScript")
        budget = 500.00
        deadline = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    } | ConvertTo-Json

    $projectId = $null
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/projects" -Method POST -Headers $authHeaders -Body $projectData
        Write-Host "SUCCESS: Create project endpoint working" -ForegroundColor Green
        $projectId = $response.project.id
        Write-Host "Project created with ID: $projectId" -ForegroundColor Gray
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Gray
        } catch {
            # Ignore error reading response
        }
    }

    # Test 6: Get specific project
    if ($projectId) {
        Write-Host "`n6. Testing GET /projects/$projectId" -ForegroundColor Cyan
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId" -Method GET -Headers $headers
            Write-Host "SUCCESS: Get project endpoint working" -ForegroundColor Green
            Write-Host "Project: $($response.project.title)" -ForegroundColor Gray
        } catch {
            Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # Test 7: Wallet endpoints
    Write-Host "`n7. Testing GET /wallet (Authenticated)" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/wallet" -Method GET -Headers $authHeaders
        Write-Host "SUCCESS: Wallet endpoint working" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`nSkipping authenticated tests - no token available" -ForegroundColor Yellow
}

# Test 8: Reviews endpoints (public)
Write-Host "`n8. Testing GET /reviews (Public)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reviews" -Method GET -Headers $headers
    Write-Host "SUCCESS: Reviews endpoint working" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI Testing Complete!" -ForegroundColor Green
