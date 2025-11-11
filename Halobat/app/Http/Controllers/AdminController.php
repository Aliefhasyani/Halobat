<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function index(){
        $users = User::with('role')->get();

        $formatted = $users->map(function($user){
            return [
                'full_name' => $user->full_name,
                'username' => $user->username,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role' => $user->role->name,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    public function show($id){
        $user = User::findOrFail($id);
        
        $user_data = [
            'full_name' => $user->full_name,
            'username' => $user->username,
            'email' => $user->email,
            'role_id' => $user->role_id,
            'role' => $user->role->name
        ];
        
        
        return response()->json(
            [
                'success' => true,
                'data' => $user_data
            ]);
    }

    public function store(Request $request){
        $data = $request->validate(
            [
                'full_name' => 'required|string|max:255',
                'username' => 'required|string|max:255',
                'email'=> 'required|email',
                'password' => 'required|string|min:8',
                'role_id' => 'required|exists:roles,id'
            ]);

        $data['password'] = Hash::make($data['password']);

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
                'password' => 'required|string|min:8',
                'role_id' => 'required|exists:roles,id'
            ]);

        $data['password'] = Hash::make($data['password']);

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
