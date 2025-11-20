<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index(Request $request){
        $validated = $request->validate([
            'message' => 'required|string',
        ]);
        return response()->json([
            'success' => true,
            'data' => 'ChatController index method'
        ]);
    }
}
