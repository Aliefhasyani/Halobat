<?php

namespace App\Http\Controllers;

use App\Models\Diagnose;
use Illuminate\Http\Request;

class DiagnosesController extends Controller
{
    public function index(){
        $diagnoses = Diagnose::with('user')->get();
        
        $formatted = $diagnoses->map(function($diagnose){
            return  [
                'diagnose_id' => $diagnose->id,
                'symptoms' => $diagnose->symptoms,
                'diagnosis' => $diagnose->diagnosis,
                'users_with_diagnosis' => [
                        'user_id' => $diagnose->user->id ?? null,
                        'full_name' => $diagnose->user->full_name ?? null,
                        'email' => $diagnose->user->email ?? null,
                ]
            ];
        })->values();
        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }
}
