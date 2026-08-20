<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\BidController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\DisputeController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ProjectBreakdownController;
use App\Http\Controllers\Api\SimpleProjectController;
use App\Http\Controllers\Api\ReportController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password reset routes (public)
Route::post('/password/reset-request', [AuthController::class, 'requestPasswordReset']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);
Route::post('/password/regenerate-hash', [AuthController::class, 'regenerateHash']);

// Public project routes
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{project}', [ProjectController::class, 'show']);

// Public review routes
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{review}', [ReviewController::class, 'show']);
Route::get('/users/{user}/reviews', [ReviewController::class, 'userStats']);
Route::get('/projects/{project}/reviews', [ReviewController::class, 'projectReviews']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Special route with custom auth middleware for testing
Route::middleware('api.auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/upload-avatar', [AuthController::class, 'uploadAvatar']);
    Route::put('/password', [AuthController::class, 'changePassword']);
    Route::delete('/account', [AuthController::class, 'deleteAccount']);
    Route::get('/verification-hash', [AuthController::class, 'getVerificationHash']);
    
    // Project routes
    Route::post('/projects', [ProjectController::class, 'store']);
    
    // Simple project routes (cache-free)
    Route::post('/simple-projects', [SimpleProjectController::class, 'store']);
    Route::get('/simple-projects', [SimpleProjectController::class, 'index']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    
    // Bid routes
    Route::get('/projects/{project}/bids', [BidController::class, 'index']);
    Route::post('/projects/{project}/bids', [BidController::class, 'store']);
    Route::put('/bids/{bid}', [BidController::class, 'update']);
    Route::delete('/bids/{bid}', [BidController::class, 'destroy']);
    Route::post('/bids/{bid}/accept', [BidController::class, 'accept']);
    
    // Payment routes
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::post('/projects/{project}/escrow', [PaymentController::class, 'createEscrow']);
    Route::post('/payments/{payment}/release', [PaymentController::class, 'releaseEscrow']);
    Route::post('/projects/{project}/complete', [PaymentController::class, 'markCompleted']);
    Route::post('/payments/{payment}/refund', [PaymentController::class, 'requestRefund']);
    Route::post('/payments/{payment}/process-refund', [PaymentController::class, 'processRefund']);
    
    // Wallet management routes
    Route::get('/wallet/info', [PaymentController::class, 'getWallet']);
    Route::post('/wallet/deposit', [PaymentController::class, 'deposit']);
    Route::post('/wallet/withdraw', [PaymentController::class, 'withdraw']);
    
    // Dispute routes
    Route::get('/disputes', [DisputeController::class, 'index']);
    Route::post('/disputes', [DisputeController::class, 'store']);
    Route::get('/disputes/{dispute}', [DisputeController::class, 'show']);
    Route::put('/disputes/{dispute}', [DisputeController::class, 'update']);
    Route::post('/disputes/{dispute}/messages', [DisputeController::class, 'addMessage']);
    Route::post('/disputes/{dispute}/close', [DisputeController::class, 'close']);
    Route::get('/disputes/statistics', [DisputeController::class, 'statistics']);
    
    // Review routes
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
    
    // Wallet routes
    Route::get('/wallet', [WalletController::class, 'show']);
    Route::get('/wallet/balance', [WalletController::class, 'balance']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    Route::get('/wallet/statistics', [WalletController::class, 'statistics']);
    Route::post('/wallet/add-funds', [WalletController::class, 'addFunds']);
    Route::post('/wallet/regenerate', [WalletController::class, 'regenerateAddress']);
    
    // Project breakdown and AI features
    Route::post('/projects/{project}/breakdown', [ProjectBreakdownController::class, 'generateBreakdown']);
    Route::post('/projects/{project}/research', [ProjectBreakdownController::class, 'researchProject']);
    Route::get('/projects/{project}/analysis', [ProjectBreakdownController::class, 'getComprehensiveAnalysis']);
    
    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::get('/admin/projects', [AdminController::class, 'projects']);
        Route::get('/admin/payments', [AdminController::class, 'payments']);
        Route::get('/admin/disputes', [AdminController::class, 'disputes']);
        Route::get('/admin/stats', [AdminController::class, 'systemStats']);
        Route::put('/admin/users/{user}/status', [AdminController::class, 'updateUserStatus']);
        Route::post('/admin/disputes/{dispute}/resolve', [AdminController::class, 'resolveDispute']);
        
        // Enhanced user management routes
        Route::get('/admin/users/{user}/details', [AdminController::class, 'getUserDetails']);
        Route::put('/admin/users/{user}/profile', [AdminController::class, 'updateUserProfile']);
        Route::put('/admin/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::delete('/admin/users/{user}/delete', [AdminController::class, 'deleteUserAccount']);
        
        // Service provider management routes
        Route::get('/admin/service-providers', [AdminController::class, 'getServiceProviders']);
        Route::get('/admin/consumers', [AdminController::class, 'getConsumers']);
        
        // Admin project management routes
        Route::get('/admin/projects/{project}/details', [AdminController::class, 'getProjectDetails']);
        Route::put('/admin/projects/{project}', [AdminController::class, 'updateProject']);
        Route::delete('/admin/projects/{project}', [AdminController::class, 'deleteProject']);
        
        // Reporting endpoints
        Route::get('/admin/reports/users', [AdminController::class, 'generateUserReport']);
        Route::get('/admin/reports/projects', [AdminController::class, 'generateProjectReport']);
        Route::get('/admin/reports/financial', [AdminController::class, 'generateFinancialReport']);
        Route::get('/admin/reports/disputes', [AdminController::class, 'generateDisputeReport']);
        Route::get('/admin/export', [AdminController::class, 'exportData']);
    });
    
    // Report generation routes
    Route::get('/reports/user-activity', [ReportController::class, 'userActivity']);
    Route::get('/reports/payments', [ReportController::class, 'payments']);
    Route::get('/reports/project-analytics', [ReportController::class, 'projectAnalytics']);
    Route::get('/reports/platform-stats', [ReportController::class, 'platformStats']);
});