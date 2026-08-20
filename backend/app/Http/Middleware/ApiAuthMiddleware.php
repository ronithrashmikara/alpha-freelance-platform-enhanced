<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Auth;

class ApiAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Extract token from Authorization header
            $token = $request->bearerToken();
            
            if (!$token) {
                return response()->json([
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            // Find the token in the database
            $accessToken = PersonalAccessToken::findToken($token);
            
            if (!$accessToken || !$accessToken->tokenable) {
                return response()->json([
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            // Set the authenticated user
            Auth::setUser($accessToken->tokenable);
            $request->setUserResolver(function () use ($accessToken) {
                return $accessToken->tokenable;
            });
            
            return $next($request);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }
    }
}
