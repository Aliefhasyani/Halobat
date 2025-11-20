<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;



class AuthController extends Controller
{
    public function register(Request $request){
        $data = $request->validate([
            'full_name' => 'string|required|max:255',
            'username' => 'string|required|max:255',
            'email' =>  'required|email',
            'password' => 'required|min:8'
        ]);

        $data['password'] = Hash::make($data['password']);
        
        $defaultRole = Role::where('name', 'user')->first();
        $data['role_id'] = $defaultRole ? $defaultRole->id : null;
        
        $user = User::create($data);

        $user->refresh();

        return response()->json(
            [
                'success' => true,
                'message' => 'user successfully created!',
                'data' => $user
            ]);

    }

    public function login(Request $request){
        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password'
                ], 401);
            }
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not create token'
            ], 500);
        }

        $user = Auth::user();

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user_id' => $user->id
        ]);
    }

   public function logout(Request $request){
        try {
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json([
                'success' => true,
                'message' => 'User logged out!'
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to logout'
            ], 500);
        }
    }
}
