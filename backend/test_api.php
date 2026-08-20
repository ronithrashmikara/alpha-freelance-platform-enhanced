<?php

/**
 * Comprehensive API Testing Script for Alpha Freelance Platform
 * This script tests all CRUD operations, authentication, and API endpoints
 */

class APITester
{
    private $baseUrl = 'http://localhost:12000/api';
    private $authToken = null;
    private $testResults = [];
    private $testUsers = [];
    private $testProjects = [];
    private $timestamp;

    public function __construct()
    {
        echo "🚀 Starting Comprehensive API Testing...\n\n";
        $this->timestamp = time();
    }

    private function makeRequest($method, $endpoint, $data = null, $headers = [])
    {
        $url = $this->baseUrl . $endpoint;
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        if ($this->authToken) {
            $headers[] = 'Authorization: Bearer ' . $this->authToken;
        }

        if ($data) {
            if ($method === 'GET') {
                $url .= '?' . http_build_query($data);
                curl_setopt($ch, CURLOPT_URL, $url);
            } else {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                $headers[] = 'Content-Type: application/json';
            }
        }

        if (!empty($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ['error' => $error, 'http_code' => 0];
        }

        return [
            'data' => json_decode($response, true),
            'http_code' => $httpCode,
            'raw_response' => $response
        ];
    }

    private function logTest($testName, $success, $details = '')
    {
        $status = $success ? '✅ PASS' : '❌ FAIL';
        echo "{$status} - {$testName}\n";
        if ($details) {
            echo "   Details: {$details}\n";
        }
        
        $this->testResults[] = [
            'test' => $testName,
            'success' => $success,
            'details' => $details
        ];
    }

    public function testAuthentication()
    {
        echo "\n📋 Testing Authentication System...\n";

        // Test user registration
        $userData = [
            'name' => 'Test User',
            'email' => "test{$this->timestamp}@example.com",
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'consumer'
        ];

        $response = $this->makeRequest('POST', '/register', $userData);
        
        if ($response['http_code'] === 201 && isset($response['data']['token'])) {
            $this->authToken = $response['data']['token'];
            $this->testUsers['consumer'] = $response['data']['user'];
            $this->logTest('User Registration', true, 'Consumer registered successfully');
        } else {
            $this->logTest('User Registration', false, 'HTTP ' . $response['http_code'] . ': ' . ($response['data']['message'] ?? 'Unknown error'));
        }

        // Test login
        $loginData = [
            'email' => "test{$this->timestamp}@example.com",
            'password' => 'password123'
        ];

        $response = $this->makeRequest('POST', '/login', $loginData);
        
        if ($response['http_code'] === 200 && isset($response['data']['token'])) {
            $this->authToken = $response['data']['token'];
            $this->logTest('User Login', true, 'Login successful');
        } else {
            $this->logTest('User Login', false, 'HTTP ' . $response['http_code']);
        }

        // Test authenticated route
        $response = $this->makeRequest('GET', '/me');
        
        if ($response['http_code'] === 200 && isset($response['data']['user']['id'])) {
            $this->logTest('Authenticated Route Access', true, 'User profile retrieved');
        } else {
            $this->logTest('Authenticated Route Access', false, 'HTTP ' . $response['http_code']);
        }

        // Register a service provider for testing
        $providerData = [
            'name' => 'Test Provider',
            'email' => "provider{$this->timestamp}@example.com",
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'provider'
        ];

        $response = $this->makeRequest('POST', '/register', $providerData);
        
        if ($response['http_code'] === 201) {
            $this->testUsers['provider'] = $response['data']['user'];
            $this->logTest('Service Provider Registration', true, 'Provider registered successfully');
        } else {
            $this->logTest('Service Provider Registration', false, 'HTTP ' . $response['http_code']);
        }
    }

    public function testProjectCRUD()
    {
        echo "\n📋 Testing Project CRUD Operations...\n";

        // Create Project
        $projectData = [
            'title' => 'Test Project',
            'description' => 'This is a test project for API testing',
            'category' => 'web_development',
            'skills' => ['PHP', 'Laravel', 'MySQL'],
            'budget' => 1000.00,
            'deadline' => '2025-12-31'
        ];

        $response = $this->makeRequest('POST', '/projects', $projectData);
        
        if ($response['http_code'] === 201 && isset($response['data']['id'])) {
            $this->testProjects[] = $response['data'];
            $this->logTest('Project Creation', true, 'Project ID: ' . $response['data']['id']);
        } else {
            $this->logTest('Project Creation', false, 'HTTP ' . $response['http_code'] . ': ' . ($response['data']['message'] ?? 'Unknown error'));
        }

        // Read Projects (List)
        $response = $this->makeRequest('GET', '/projects');
        
        if ($response['http_code'] === 200 && isset($response['data']['data'])) {
            $this->logTest('Project List Retrieval', true, 'Found ' . count($response['data']['data']) . ' projects');
        } else {
            $this->logTest('Project List Retrieval', false, 'HTTP ' . $response['http_code']);
        }

        // Read Single Project
        if (!empty($this->testProjects)) {
            $projectId = $this->testProjects[0]['id'];
            $response = $this->makeRequest('GET', "/projects/{$projectId}");
            
            if ($response['http_code'] === 200 && isset($response['data']['project']['id'])) {
                $this->logTest('Single Project Retrieval', true, 'Project details retrieved');
            } else {
                $this->logTest('Single Project Retrieval', false, 'HTTP ' . $response['http_code']);
            }

            // Update Project
            $updateData = [
                'title' => 'Updated Test Project',
                'budget' => 1500.00
            ];

            $response = $this->makeRequest('PUT', "/projects/{$projectId}", $updateData);
            
            if ($response['http_code'] === 200) {
                $this->logTest('Project Update', true, 'Project updated successfully');
            } else {
                $this->logTest('Project Update', false, 'HTTP ' . $response['http_code']);
            }
        }
    }

    public function testBidCRUD()
    {
        echo "\n📋 Testing Bid CRUD Operations...\n";

        if (empty($this->testProjects)) {
            $this->logTest('Bid Testing', false, 'No test projects available');
            return;
        }

        // Switch to provider user for bidding
        if (isset($this->testUsers['provider'])) {
            // Login as provider
            $loginData = [
                'email' => "provider{$this->timestamp}@example.com",
                'password' => 'password123'
            ];

            $loginResponse = $this->makeRequest('POST', '/login', $loginData);
            if ($loginResponse['http_code'] === 200) {
                $this->authToken = $loginResponse['data']['token'];
            }
        }

        $projectId = $this->testProjects[0]['id'];

        // Create Bid (90% of budget to avoid auto-acceptance but pass validation)
        $bidData = [
            'amount' => 1350.00,
            'proposal' => 'I can complete this project efficiently and deliver high-quality results within the specified timeframe. I have extensive experience in similar projects.',
            'delivery_time' => 14
        ];

        $response = $this->makeRequest('POST', "/projects/{$projectId}/bids", $bidData);
        
        if ($response['http_code'] === 201 && isset($response['data']['bid']['id'])) {
            $bidId = $response['data']['bid']['id'];
            $this->logTest('Bid Creation', true, 'Bid ID: ' . $bidId);

            // Read Bids for Project
            $response = $this->makeRequest('GET', "/projects/{$projectId}/bids");
            
            if ($response['http_code'] === 200) {
                $this->logTest('Bid List Retrieval', true, 'Bids retrieved for project');
            } else {
                $this->logTest('Bid List Retrieval', false, 'HTTP ' . $response['http_code']);
            }

            // Update Bid
            $updateData = [
                'amount' => 950.00,
                'proposal' => 'Updated proposal with better pricing and improved timeline. I can deliver this project with enhanced features and better quality assurance.'
            ];

            $response = $this->makeRequest('PUT', "/bids/{$bidId}", $updateData);
            
            if ($response['http_code'] === 200) {
                $this->logTest('Bid Update', true, 'Bid updated successfully');
            } else {
                $this->logTest('Bid Update', false, 'HTTP ' . $response['http_code']);
            }

        } else {
            $this->logTest('Bid Creation', false, 'HTTP ' . $response['http_code'] . ': ' . ($response['data']['message'] ?? 'Unknown error'));
        }
    }

    public function testWalletOperations()
    {
        echo "\n📋 Testing Wallet Operations...\n";

        // Get Wallet Info
        $response = $this->makeRequest('GET', '/wallet');
        
        if ($response['http_code'] === 200) {
            $this->logTest('Wallet Info Retrieval', true, 'Wallet information retrieved');
        } else {
            $this->logTest('Wallet Info Retrieval', false, 'HTTP ' . $response['http_code']);
        }

        // Get Wallet Balance
        $response = $this->makeRequest('GET', '/wallet/balance');
        
        if ($response['http_code'] === 200) {
            $this->logTest('Wallet Balance Check', true, 'Balance: ' . ($response['data']['balance'] ?? 'N/A'));
        } else {
            $this->logTest('Wallet Balance Check', false, 'HTTP ' . $response['http_code']);
        }

        // Add Funds
        $fundData = [
            'amount' => 500.00,
            'payment_method' => 'credit_card'
        ];

        $response = $this->makeRequest('POST', '/wallet/add-funds', $fundData);
        
        if ($response['http_code'] === 200) {
            $this->logTest('Add Funds to Wallet', true, 'Funds added successfully');
        } else {
            $this->logTest('Add Funds to Wallet', false, 'HTTP ' . $response['http_code']);
        }
    }

    public function testValidationAndSecurity()
    {
        echo "\n📋 Testing Input Validation and Security...\n";

        // Test invalid project creation
        $invalidData = [
            'title' => '', // Empty title
            'budget' => -100, // Negative budget
            'skills' => 'not_an_array' // Invalid skills format
        ];

        $response = $this->makeRequest('POST', '/projects', $invalidData);
        
        if ($response['http_code'] === 422) {
            $this->logTest('Input Validation', true, 'Validation errors properly returned');
        } else {
            $this->logTest('Input Validation', false, 'Expected validation error, got HTTP ' . $response['http_code']);
        }

        // Test SQL injection attempt
        $sqlInjectionData = [
            'title' => "'; DROP TABLE projects; --",
            'description' => 'Test description',
            'category' => 'web_development',
            'budget' => 1000
        ];

        $response = $this->makeRequest('POST', '/projects', $sqlInjectionData);
        
        // Should either create project safely or reject with validation
        if ($response['http_code'] === 201 || $response['http_code'] === 422) {
            $this->logTest('SQL Injection Protection', true, 'System handled potential SQL injection safely');
        } else {
            $this->logTest('SQL Injection Protection', false, 'Unexpected response to SQL injection attempt');
        }

        // Test unauthorized access
        $originalToken = $this->authToken;
        $this->authToken = 'invalid_token';

        $response = $this->makeRequest('GET', '/me');
        
        if ($response['http_code'] === 401) {
            $this->logTest('Unauthorized Access Protection', true, 'Invalid token properly rejected');
        } else {
            $this->logTest('Unauthorized Access Protection', false, 'Expected 401, got HTTP ' . $response['http_code']);
        }

        $this->authToken = $originalToken;
    }

    public function testErrorHandling()
    {
        echo "\n📋 Testing Error Handling...\n";

        // Test non-existent resource
        $response = $this->makeRequest('GET', '/projects/99999');
        
        if ($response['http_code'] === 404) {
            $this->logTest('404 Error Handling', true, 'Non-existent resource properly handled');
        } else {
            $this->logTest('404 Error Handling', false, 'Expected 404, got HTTP ' . $response['http_code']);
        }

        // Test malformed JSON
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/projects');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_POSTFIELDS, '{invalid json}');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->authToken
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 400 || $httpCode === 422) {
            $this->logTest('Malformed JSON Handling', true, 'Malformed JSON properly rejected');
        } else {
            $this->logTest('Malformed JSON Handling', false, 'Expected 400/422, got HTTP ' . $httpCode);
        }
    }

    public function generateReport()
    {
        echo "\n📊 Test Results Summary\n";
        echo "========================\n";

        $totalTests = count($this->testResults);
        $passedTests = array_filter($this->testResults, function($test) {
            return $test['success'];
        });
        $failedTests = $totalTests - count($passedTests);

        echo "Total Tests: {$totalTests}\n";
        echo "Passed: " . count($passedTests) . "\n";
        echo "Failed: {$failedTests}\n";
        echo "Success Rate: " . round((count($passedTests) / $totalTests) * 100, 2) . "%\n\n";

        if ($failedTests > 0) {
            echo "❌ Failed Tests:\n";
            foreach ($this->testResults as $test) {
                if (!$test['success']) {
                    echo "  - {$test['test']}: {$test['details']}\n";
                }
            }
        }

        return [
            'total' => $totalTests,
            'passed' => count($passedTests),
            'failed' => $failedTests,
            'success_rate' => round((count($passedTests) / $totalTests) * 100, 2),
            'details' => $this->testResults
        ];
    }

    public function runAllTests()
    {
        $this->testAuthentication();
        $this->testProjectCRUD();
        $this->testBidCRUD();
        $this->testWalletOperations();
        $this->testValidationAndSecurity();
        $this->testErrorHandling();

        return $this->generateReport();
    }
}

// Run the tests
$tester = new APITester();
$results = $tester->runAllTests();

echo "\n🎯 Testing Complete!\n";