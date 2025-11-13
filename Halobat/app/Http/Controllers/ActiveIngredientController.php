<?php

namespace App\Http\Controllers;

use App\Models\ActiveIngredient;
use Illuminate\Http\Request;

class ActiveIngredientController extends Controller
{
    public function index(){
        $active_ingredients = ActiveIngredient::all();

        $formatted = $active_ingredients->map(function($a){
            return[
                'id' => $a->id,
                'name' => $a->name
            ];

        });

        return response()->json([
            'success' => true,
            'data' => $formatted
            
        ]);
    }
}
