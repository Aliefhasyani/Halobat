<?php

namespace App\Http\Controllers;

use App\Models\ActiveIngredient;
use Illuminate\Http\Request;

class ActiveIngredientController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth')->only(['store','update','destroy']);
        $this->middleware('role:admin,superadmin')->only(['store','update','destroy']);
    }
    
    public function index(){    
        $ingredients = ActiveIngredient::all();
        $formatted = $ingredients->map(function($ingredient){
            return [
                'id' => $ingredient->id,
                'ingredient_name' => $ingredient->name,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    public function show($id){
        $ingredient = ActiveIngredient::with('drugs')->findOrFail($id);
        $data = [
            'id' => $ingredient->id,
            'ingredient_name' => $ingredient->name,
            'related_drugs' => $ingredient->drugs->map(function($drug){
                return [
                    'drug_id' => $drug->id,
                    'generic_name' => $drug->generic_name,
                    'description' => $drug->description,
                    'picture' => $drug->picture,
                    'price' => $drug->price ?? null,
                ];
            })->values(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }


    public function store(Request $request){
        $request->validate([
            'name' => 'required|string'
        ]);

        $ingredient = ActiveIngredient::create([
            'name' => $request->name
        ]);

        return response()->json([
            'success' => true,
            'data' => $ingredient
        ], 201);
    }


    public function update(Request $request, $id){
        $ingredient = ActiveIngredient::findOrFail($id);

        $request->validate([
            'name' => 'required|string'
        ]);

        $ingredient->update([
            'name' => $request->name
        ]);

        return response()->json([
            'success' => true,
            'data' => $ingredient
        ]);
    }

    
    public function destroy($id){
        $ingredient = ActiveIngredient::findOrFail($id);
        $ingredient->delete();

        return response()->json([
            'success' => true,
            'message' => 'Active Ingredient deleted'
        ]);
    }
}
