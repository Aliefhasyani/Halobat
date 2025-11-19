<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Accepts roles as a comma-separated list: role:admin,superadmin
     */
    public function handle(Request $request, Closure $next, $roles = null)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // If no roles were provided, block by default
        if (!$roles) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. No role specified.'
            ], 403);
        }

        // Accept both pipe and comma separators
        $roles = preg_split('/[|,]/', $roles);

        // Normalize roles
        $roles = array_map('trim', $roles);

        $roleName = null;
        if ($user->relationLoaded('role') || method_exists($user, 'role')) {
            $role = $user->role;
            $roleName = $role ? $role->name : null;
        }

        // If role id or name matches one of the allowed roles, continue
        if (in_array((string)$user->role_id, $roles, true) || ($roleName && in_array($roleName, $roles, true))) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized. Insufficient role privileges.'
        ], 403);
    }
}
