<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth')->only(['store','update','destroy']);
        $this->middleware('role:admin,superadmin')->only(['store','update','destroy']);
    }
    public function index(){
        $users = User::with('role')->get();

        $formatted = $users->map(function($user){
            return [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role->name,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    public function show($id){
        try{
            $user = User::with('role')->findOrFail($id);
        
            $user_data = [
                'full_name' => $user->full_name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role->name
            ];
            
            
            return response()->json(
                [
                    'success' => true,
                    'data' => $user_data
                ]);
        }catch(ModelNotFoundException $ex){
            return response()->json([
                'success' => false,
                'error' => $ex->getMessage()
            ]);
        }
    }

    public function store(Request $request){
        $data = $request->validate(
            [
                'full_name' => 'required|string|max:255',
                'username' => 'required|string|max:255',
                'email'=> 'required|email',
                'password' => 'required|string|min:8'
            ]);

        $data['password'] = Hash::make($data['password']);

        $defaultRole = Role::where('name', 'user')->first();
        $data['role_id'] = $defaultRole ? $defaultRole->id : null;

        $created_data = User::create($data);

        $created_data->refresh();

        return response()->json(
            [
                'success' => true,
                'created_data' => $created_data
            ]);
    }

    public function update(Request $request,$id){
        $user = User::findOrFail($id);

        $data = $request->validate(
            [
                'full_name' => 'required|string|max:255',
                'username' => 'required|string|max:255',
                'email'=> 'required|email',
                'password' => 'sometimes|string|min:8',
                'role_id' => 'sometimes|exists:roles,id'
            ]);

        if (array_key_exists('password', $data)) {
            $data['password'] = Hash::make($data['password']);
        }
        // Only superadmin may change role_id
        if (array_key_exists('role_id', $data) && JWTAuth::user()->role->name !== 'superadmin') {
            return response()->json([
                'success' => false,
                'error' => 'Only superadmin can change user roles.'
            ], 403);
        }

        $user->update($data);
        $user->refresh();

         return response()->json(
            [
                'success' => true,
                'created_data' => $user
            ]);


    }


    public function destroy($id){
        $user = User::findOrFail($id);
        
        $user->delete();

        return response()->json(
            [
                'success' => true
            ]);

    }


}
