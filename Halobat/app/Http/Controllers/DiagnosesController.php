<?php

namespace App\Http\Controllers;

use App\Models\Diagnose;
use Illuminate\Http\Request;

class DiagnosesController extends Controller
{
    public function index(){
        $diagnoses = Diagnose::with(['user']);
        
        $formatted = $diagnoses->map(function($diagnose){
            return  [
                'diagnose_id' => $diagnose->id,
                'symptomps' => $diagnose->symptoms,
                'diagnosis' => $diagnose->diagnosis,
                'users_with_diagnosis' => [
                        'user_id' => $diagnose->user->id,
                        'full_name' => $diagnose->user->fullname,
                        'email' => $diagnose->user->email,
                ]
            ];
        });
        return response()->json([
            'success' => true,
            $formatted
        ]);
    }
}
