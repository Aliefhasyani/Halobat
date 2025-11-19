<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Laravel\Sanctum\HasApiTokens; 
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redis;



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
        if(Auth::attempt(['email' => $request->email , 'password' => $request->password])){
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json(
                [
                    "success" => true,
                    "message" => "login successful",
                    "token" => $token,
                    "user" => $user
                ]);
        }else{
            return response()->json(
                [
                    "success" => false,
                    "message" => "Invalid email or password"
                ], 401);
        }
    }

   public function logout(Request $request){
        $user = $request->user(); 
       
        $user->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'User logged out!'
        ]);
    }
}
