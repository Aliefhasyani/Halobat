<?php

namespace App\Http\Controllers;

use App\Models\Drug;
use App\Models\Brand;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class DrugController extends Controller
{
    public function __construct()
    {
        // require an auth token for write actions and restrict by role
        $this->middleware('jwt.auth')->only(['store', 'update', 'destroy']);
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

            // accept detailed active ingredient objects with pivot data
            'active_ingredients' => 'nullable|array',
            'active_ingredients.*.id' => 'required_with:active_ingredients|exists:active_ingredients,id',
            'active_ingredients.*.quantity' => 'required_with:active_ingredients|integer|min:0',

            // accept brand objects to create for this drug
            'brands' => 'nullable|array',
            'brands.*.id' => 'nullable|uuid',
            'brands.*.name' => 'required_with:brands|string|max:255',
            'brands.*.picture' => 'nullable|string',
            'brands.*.price' => 'nullable|numeric',
        ]);

        // create drug and related records inside a transaction
        $created = DB::transaction(function () use ($validated, $request) {
            // remove nested payloads before creating model
            $drugData = collect($validated)->except(['active_ingredients', 'brands'])->toArray();

            $drug = Drug::create($drugData);

            // attach active ingredients with pivot quantity
            if ($request->has('active_ingredients')) {
                $sync = [];
                foreach ($request->input('active_ingredients', []) as $ai) {
                    $sync[$ai['id']] = ['quantity' => isset($ai['quantity']) ? (int)$ai['quantity'] : 0];
                }
                $drug->activeIngredients()->sync($sync);
            }

            // create brands if provided
            if ($request->has('brands')) {
                foreach ($request->input('brands', []) as $b) {
                    $brandData = [
                        'id' => $b['id'] ?? (string) Str::uuid(),
                        'name' => $b['name'] ?? null,
                        'picture' => $b['picture'] ?? null,
                        'price' => $b['price'] ?? null,
                        'drug_id' => $drug->id,
                    ];
                    // create only when name present
                    if (!empty($brandData['name'])) {
                        Brand::create($brandData);
                    }
                }
            }

            return $drug->load(['activeIngredients', 'brand', 'manufacturer', 'dosageForm']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Drug created successfully.',
            'data' => $created
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

            'active_ingredients' => 'nullable|array',
            'active_ingredients.*.id' => 'required_with:active_ingredients|exists:active_ingredients,id',
            'active_ingredients.*.quantity' => 'required_with:active_ingredients|integer|min:0',

            'brands' => 'nullable|array',
            'brands.*.id' => 'nullable|uuid',
            'brands.*.name' => 'required_with:brands|string|max:255',
            'brands.*.picture' => 'nullable|string',
            'brands.*.price' => 'nullable|numeric',
        ]);

        $drug = Drug::findOrFail($id);

        $updated = DB::transaction(function () use ($drug, $validated, $request) {
            // update scalar fields only
            $drugData = collect($validated)->except(['active_ingredients', 'brands'])->toArray();
            if (!empty($drugData)) {
                $drug->update($drugData);
            }

            // sync active ingredients (replace existing pivot rows)
            if ($request->has('active_ingredients')) {
                $sync = [];
                foreach ($request->input('active_ingredients', []) as $ai) {
                    $sync[$ai['id']] = ['quantity' => isset($ai['quantity']) ? (int)$ai['quantity'] : 0];
                }
                $drug->activeIngredients()->sync($sync);
            }

            // handle brands: update existing or create new
            if ($request->has('brands')) {
                foreach ($request->input('brands', []) as $b) {
                    if (!empty($b['id'])) {
                        $brand = Brand::where('id', $b['id'])->where('drug_id', $drug->id)->first();
                        if ($brand) {
                            $brand->update([
                                'name' => $b['name'] ?? $brand->name,
                                'picture' => $b['picture'] ?? $brand->picture,
                                'price' => $b['price'] ?? $brand->price,
                            ]);
                            continue;
                        }
                    }

                    // create new brand if name provided
                    $brandData = [
                        'id' => $b['id'] ?? (string) Str::uuid(),
                        'name' => $b['name'] ?? null,
                        'picture' => $b['picture'] ?? null,
                        'price' => $b['price'] ?? null,
                        'drug_id' => $drug->id,
                    ];
                    if (!empty($brandData['name'])) {
                        Brand::create($brandData);
                    }
                }
            }

            return $drug->load(['activeIngredients', 'brand', 'manufacturer', 'dosageForm']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Drug updated successfully.',
            'data' => $updated
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
