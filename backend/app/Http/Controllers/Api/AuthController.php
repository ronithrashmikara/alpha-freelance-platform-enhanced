<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:consumer,provider,admin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Generate unique verification hash
        $verificationHash = $user->generateVerificationHash();

        // Create wallet with welcome bonus
        Wallet::create([
            'user_id' => $user->id,
            'address' => '0x' . bin2hex(random_bytes(20)),
            'private_key' => bin2hex(random_bytes(32)),
            'balance_usdt' => 20.00, // Welcome bonus
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user->fresh(),
            'token' => $token,
            'verification_hash' => $verificationHash,
            'note' => 'Please save your verification hash. You will need it along with your email to reset your password.',
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->load('wallet'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('wallet')
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $request->user()->id,
            'bio' => 'nullable|string|max:1000',
            'skills' => 'nullable|array',
            'hourly_rate' => 'nullable|numeric|min:1',
            'avatar' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url',
            'github' => 'nullable|string',
            'linkedin' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $user->update($request->only([
            'name', 'email', 'bio', 'skills', 'hourly_rate', 
            'avatar', 'location', 'website', 'github', 'linkedin'
        ]));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('wallet')
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && file_exists(public_path('storage/' . $user->avatar))) {
                unlink(public_path('storage/' . $user->avatar));
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            
            $user->update(['avatar' => $avatarPath]);

            return response()->json([
                'message' => 'Avatar uploaded successfully',
                'avatar_url' => asset('storage/' . $avatarPath),
                'user' => $user->load('wallet')
            ]);
        }

        return response()->json([
            'message' => 'No file uploaded'
        ], 400);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    public function deleteAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required',
            'confirmation' => 'required|in:DELETE_MY_ACCOUNT',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Password is incorrect'
            ], 400);
        }

        // Check for active projects
        $activeProjects = $user->projects()->whereIn('status', ['open', 'in_progress'])->count();
        $assignedProjects = Project::where('assigned_to', $user->id)
            ->whereIn('status', ['in_progress'])
            ->count();

        if ($activeProjects > 0 || $assignedProjects > 0) {
            return response()->json([
                'message' => 'Cannot delete account with active projects'
            ], 400);
        }

        // Revoke all tokens
        $user->tokens()->delete();
        
        // Soft delete user
        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully'
        ]);
    }

    public function requestPasswordReset(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // Generate new verification hash
        $verificationHash = $user->generateVerificationHash();

        return response()->json([
            'message' => 'Password reset hash generated successfully',
            'verification_hash' => $verificationHash,
            'expires_at' => $user->hash_generated_at->addHours(24)->toISOString(),
            'note' => 'Use this hash along with your email to reset your password. Hash expires in 24 hours.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'verification_hash' => 'required|string|size:8',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)
                   ->where('verification_hash', strtoupper($request->verification_hash))
                   ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid email or verification hash'
            ], 400);
        }

        if (!$user->isHashValid()) {
            return response()->json([
                'message' => 'Verification hash has expired. Please request a new one.'
            ], 400);
        }

        // Update password and clear verification hash
        $user->update([
            'password' => Hash::make($request->password),
            'verification_hash' => null,
            'hash_generated_at' => null,
        ]);

        // Revoke all existing tokens for security
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successfully. Please login with your new password.'
        ]);
    }

    public function regenerateHash(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // Generate new verification hash
        $verificationHash = $user->generateVerificationHash();

        return response()->json([
            'message' => 'New verification hash generated successfully',
            'verification_hash' => $verificationHash,
            'expires_at' => $user->hash_generated_at->addHours(24)->toISOString(),
            'note' => 'Your new verification hash. Previous hash is now invalid.',
        ]);
    }

    public function getVerificationHash(Request $request)
    {
        $user = $request->user();
        
        if (!$user->verification_hash || !$user->isHashValid()) {
            $verificationHash = $user->generateVerificationHash();
            
            return response()->json([
                'message' => 'New verification hash generated',
                'verification_hash' => $verificationHash,
                'expires_at' => $user->hash_generated_at->addHours(24)->toISOString(),
            ]);
        }

        return response()->json([
            'message' => 'Current verification hash',
            'verification_hash' => $user->verification_hash,
            'expires_at' => $user->hash_generated_at->addHours(24)->toISOString(),
            'time_remaining' => $user->hash_generated_at->addHours(24)->diffForHumans(),
        ]);
    }
}
