<?php

namespace App\Http\Controllers;

use App\Models\Drug;
use App\Models\Brand;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class DrugController extends Controller
{
    public function __construct()
    {
        // require an auth token for write actions and restrict by role
        $this->middleware('auth:sanctum')->only(['store', 'update', 'destroy']);
        $this->middleware('role:admin,superadmin')->only(['store', 'update', 'destroy']);
    }
    public function index()
    {
        $drugs = Drug::with(['manufacturer', 'dosageForm'])->get();
        $brands = Brand::with('drug.manufacturer', 'drug.dosageForm')->get();

        $formattedDrugs = $drugs->map(function ($drug) {
            return [
                'type' => 'generic',
                'id' => $drug->id,
                'name' => $drug->generic_name,
                'description' => $drug->description,
                'picture' => $drug->picture,
                'price' => $drug->price,
                'manufacturer_data' => [
                    'id' => $drug->manufacturer->id,
                    'name' => $drug->manufacturer->name
                ],
                'dosage_form_data' => [
                    'id' => $drug->dosageForm->id,
                    'name' => $drug->dosageForm->name,
                ],
            ];
        });

        $formattedBrands = $brands->map(function ($brand) {
            return [
                'type' => 'brand',
                'id' => $brand->id,
                'name' => $brand->name,
                'description' => $brand->drug ? $brand->drug->description : null,
                'picture' => $brand->picture,
                'price' => $brand->price,
                'drug_id' => $brand->drug_id,
                'manufacturer_data' => $brand->drug ? [
                    'id' => $brand->drug->manufacturer->id,
                    'name' => $brand->drug->manufacturer->name
                ] : null,
                'dosage_form_data' => $brand->drug ? [
                    'id' => $brand->drug->dosageForm->id,
                    'name' => $brand->drug->dosageForm->name,
                ] : null,
                'drug_data' => $brand->drug ? [
                    'drug_id' => $brand->drug->id,
                    'generic_name' => $brand->drug->generic_name,
                    'description' => $brand->drug->description,
                    'price' => $brand->drug->price,
                    'picture' => $brand->drug->picture,
                ] : null,
            ];
        });

        $all = $formattedDrugs->concat($formattedBrands)->values();

        return response()->json([
            'success' => true,
            'data' => $all
        ]);
    }

    public function show($id)
    {
        try{
            $drug = Drug::with(['manufacturer', 'dosageForm'])->findOrFail($id);

            $data = [
                'drug_id' => $drug->id,
                'generic_name' => $drug->generic_name,
                'description' => $drug->description,
                'picture' => $drug->picture,
                'price' => $drug->price,
                'manufacturer_data' => [
                    'id' => $drug->manufacturer->id,
                    'name' => $drug->manufacturer->name
                ],
                'dosage_form_data' => [
                    'id' => $drug->dosageForm->id,
                    'name' => $drug->dosageForm->name,
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        }catch(ModelNotFoundException $ex){
            return response()->json([
                'success' => false,
                'error' => $ex->getMessage()
            ],404);
        }
        
    }

    public function store(Request $request){
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'picture' => 'nullable|string',
            'price' => 'required|numeric',
            'manufacturer_id' => 'required|exists:manufacturers,id',
            'dosage_form_id' => 'required|exists:dosage_forms,id',

        
            'active_ingredient_ids' => 'nullable|array',
            'active_ingredient_ids.*' => 'exists:active_ingredients,id',
        ]);

        
        $drug = Drug::create($validated);

    
        if ($request->filled('active_ingredient_ids')) {
            $drug->activeIngredients()->sync($request->active_ingredient_ids);
        }

        return response()->json([
            'success' => true,
            'message' => 'Drug created successfully.',
            'data' => $drug->load(['activeIngredients'])
        ], 201);
    }


    public function update(Request $request, $id){
        $validated = $request->validate([
            'generic_name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'picture' => 'nullable|string',
            'price' => 'sometimes|required|numeric',
            'manufacturer_id' => 'sometimes|required|exists:manufacturers,id',
            'dosage_form_id' => 'sometimes|required|exists:dosage_forms,id',

            
            'active_ingredient_ids' => 'nullable|array',
            'active_ingredient_ids.*' => 'exists:active_ingredients,id',
        ]);

        $drug = Drug::findOrFail($id);

        
        $drug->update($validated);

    
        if ($request->filled('active_ingredient_ids')) {
            $drug->activeIngredients()->sync($request->active_ingredient_ids);
        }

        return response()->json([
            'success' => true,
            'message' => 'Drug updated successfully.',
            'data' => $drug->load(['activeIngredients'])
        ]);
    }


    public function destroy($id)
    {
        $drug = Drug::findOrFail($id);
        $drug->delete();

        return response()->json([
            'success' => true,
            'message' => 'Drug deleted successfully.'
        ]);
    }
}
