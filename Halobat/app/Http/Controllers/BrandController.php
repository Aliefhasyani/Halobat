<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->only(['store','update','destroy']);
        $this->middleware('role:admin,superadmin')->only(['store','update','destroy']);
    }

    public function index(){
        $brands = Brand::with('drug')->get();

        $formatted = $brands->map(function ($brand) {
            return [
                'brand_id' => $brand->id,
                'brand_name' => $brand->name,
                'picture' => $brand->picture,
                'drug_data' => $brand->drug ? [
                    'drug_id' => $brand->drug->id,
                    'generic_name' => $brand->drug->generic_name,
                    'description' => $brand->drug->description,
                    'price' => $brand->drug->price,
                    'picture' => $brand->drug->picture,
                ] : null,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }


    public function show($id){
        
        try{
            $brand = Brand::with('drug')->findOrFail($id);

            $data = [
                'brand_id' => $brand->id,
                'brand_name' => $brand->name,
                'picture' => $brand->picture,
                'drug_data' => $brand->drug ? [
                    'drug_id' => $brand->drug->id,
                    'generic_name' => $brand->drug->generic_name,
                    'description' => $brand->drug->description,
                    'price' => $brand->drug->price,
                    'picture' => $brand->drug->picture,
                ] : null,
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        }catch(ModelNotFoundException $ex){
            return response()->json([
                'success' => false,
                'error' => $ex -> getMessage()
            ],404);
        }
     
    }


    public function store(Request $request){
        $validated = $request->validate([
            'name' => 'required|string',
            'picture' => 'nullable|string',
            'drug_id' => 'required|exists:drugs,id'
        ]);

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Brand created successfully',
            'data' => $brand,
        ], 201);
    }

   
    public function update(Request $request, $id){
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'picture' => 'nullable|string',
            'drug_id' => 'sometimes|exists:drugs,id'
        ]);

        $brand->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Brand updated successfully',
            'data' => $brand,
        ]);
    }


    public function destroy($id){
        $brand = Brand::findOrFail($id);
        $brand->delete();

        return response()->json([
            'success' => true,
            'message' => 'Brand deleted successfully',
        ]);
    }
}
