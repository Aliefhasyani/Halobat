<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Accepts multiple roles separated by commas: role:admin,superadmin
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

        $allowedRoles = explode(',', $role);

        $roleName = null;
        if ($user->relationLoaded('role') || method_exists($user, 'role')) {
            $userRole = $user->role;
            $roleName = $userRole ? $userRole->name : null;
        }

        // Check if user's role id or name matches any allowed role
        foreach ($allowedRoles as $allowedRole) {
            $allowedRole = trim($allowedRole);
            if ((string)$user->role_id === $allowedRole || ($roleName && $roleName === $allowedRole)) {
                return $next($request);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized. Role: ' . ($roleName ?: 'none') . ' Allowed: ' . implode(', ', $allowedRoles),
        ], 403);
    }
}
