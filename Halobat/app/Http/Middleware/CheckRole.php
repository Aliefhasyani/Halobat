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
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Load the role relationship if not already loaded
        $user->loadMissing('role');

        // If no role parameters were provided, block by default
        if (empty($roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. No role specified.'
            ], 403);
        }
        // Support two common formats:
        //  - Variadic middleware params: role:admin,superadmin -> passed as two args ("admin","superadmin")
        //  - Single comma-separated param: role:"admin,superadmin"
        if (count($roles) === 1 && strpos($roles[0], ',') !== false) {
            $allowedRoles = array_map('trim', explode(',', $roles[0]));
        } else {
            $allowedRoles = array_map('trim', $roles);
        }

        $userRole = $user->role;
        $roleName = $userRole ? $userRole->name : null;

        // Check if user's role id or name matches any allowed role
        foreach ($allowedRoles as $allowedRole) {
            if ($allowedRole === '') {
                continue;
            }
            // numeric role id match
            if (is_numeric($allowedRole) && (string)$user->role_id === (string)$allowedRole) {
                return $next($request);
            }

            // role name match
            if ($roleName && $roleName === $allowedRole) {
                return $next($request);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized. Role: ' . ($roleName ?: 'none') . ' Allowed: ' . implode(', ', $allowedRoles),
        ], 403);
    }
}
