<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class ProfileController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    public function show()
    {
        $authUser = JWTAuth::user();

        $user = User::with('role')->find($authUser->id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not found.'
            ], 404);
        }

        $user_data = [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role->name,
        ];

        return response()->json([
            'success' => true,
            'data' => $user_data
        ]);
    }

    public function update(Request $request)
    {
        $authUser = JWTAuth::user();

        $user = User::findOrFail($authUser->id);

        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'sometimes|string|min:8',
            'role_id' => 'sometimes|exists:roles,id'
        ]);

        if (array_key_exists('password', $data)) {
            $data['password'] = Hash::make($data['password']);
        }

        // Prevent non-superadmin from changing role
        if (array_key_exists('role_id', $data) && $authUser->role->name !== 'superadmin') {
            return response()->json([
                'success' => false,
                'error' => 'Only superadmin can change user roles.'
            ], 403);
        }

        $user->update($data);
        $user->refresh();

        return response()->json([
            'success' => true,
            'created_data' => $user
        ]);
    }
}
