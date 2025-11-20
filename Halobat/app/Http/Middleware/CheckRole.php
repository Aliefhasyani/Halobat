<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Accepts a single role: role:admin
     */
    public function handle(Request $request, Closure $next, $role = null)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Load the role relationship if not already loaded
        $user->load('role');

        // If no role was provided, block by default
        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. No role specified.'
            ], 403);
        }

        $roleName = null;
        if ($user->relationLoaded('role') || method_exists($user, 'role')) {
            $userRole = $user->role;
            $roleName = $userRole ? $userRole->name : null;
        }

        // If role id or name matches the allowed role, continue
        if ((string)$user->role_id === $role || ($roleName && $roleName === $role)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized. Role: ' . ($roleName ?: 'none') . ' Allowed: ' . $role,
        ], 403);
    }
}
