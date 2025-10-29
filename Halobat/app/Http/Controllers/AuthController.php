<?php

namespace App\Http\Controllers;

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
            'password' => 'required|min:8',
            'role_id' => 'required|exists:roles,id'
        ]);

        $data['password'] = Hash::make($data['password']);
        
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



            return response()->json(
                [
                    "message" => "login successful",
        
                ]);
        }elseif(!Auth::attempt()){
            return response()->json(
                [
                    "message" => "an error occured!"
                ]);
        };
    }
}
