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
    public function store(Request $request)
    {
        $data = $request->validate([
            'generic_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'picture' => 'nullable|url',
            'price' => 'nullable|numeric|min:0',
            'manufacturer_id' => 'required|uuid|exists:manufacturers,id',
            'dosage_form_id' => 'required|uuid|exists:dosage_forms,id',
            'active_ingredients' => 'nullable|array',
            'active_ingredients.*.id' => 'required_with:active_ingredients|uuid|exists:active_ingredients,id',
            'active_ingredients.*.quantity' => 'required_with:active_ingredients|integer|min:1',
        ]);

        $created = null;

        DB::beginTransaction();
        try {
            $drug = Drug::create([
                'generic_name' => $data['generic_name'],
                'description' => $data['description'] ?? null,
                'picture' => $data['picture'] ?? null,
                'price' => $data['price'] ?? null,
                'manufacturer_id' => $data['manufacturer_id'],
                'dosage_form_id' => $data['dosage_form_id'],
            ]);

            if (!empty($data['active_ingredients'])) {
                $attach = [];
                foreach ($data['active_ingredients'] as $ai) {
                    // pivot table has its own uuid primary `id`, generate one for each row
                    $attach[$ai['id']] = [
                        'id' => (string) Str::uuid(),
                        'quantity' => $ai['quantity']
                    ];
                }
                $drug->activeIngredients()->attach($attach);
            }

            // brands are managed via BrandController; no brand creation here

            DB::commit();
            $created = $drug->load(['manufacturer', 'dosageForm', 'activeIngredients', 'brand']);

            return response()->json(['success' => true, 'data' => $created], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $drug = Drug::with(['manufacturer', 'dosageForm', 'activeIngredients', 'brand'])->findOrFail($id);
            return response()->json(['success' => true, 'data' => $drug]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Drug not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $drug = Drug::findOrFail($id);

            $data = $request->validate([
                'generic_name' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|nullable|string',
                'picture' => 'sometimes|nullable|url',
                'price' => 'sometimes|nullable|numeric|min:0',
                'manufacturer_id' => 'sometimes|required|uuid|exists:manufacturers,id',
                'dosage_form_id' => 'sometimes|required|uuid|exists:dosage_forms,id',
                'active_ingredients' => 'nullable|array',
                'active_ingredients.*.id' => 'required_with:active_ingredients|uuid|exists:active_ingredients,id',
                'active_ingredients.*.quantity' => 'required_with:active_ingredients|integer|min:1',
            ]);

            DB::beginTransaction();
            $drug->fill(array_filter([
                'generic_name' => $data['generic_name'] ?? null,
                'description' => array_key_exists('description', $data) ? $data['description'] : $drug->description,
                'picture' => array_key_exists('picture', $data) ? $data['picture'] : $drug->picture,
                'price' => array_key_exists('price', $data) ? $data['price'] : $drug->price,
                'manufacturer_id' => $data['manufacturer_id'] ?? $drug->manufacturer_id,
                'dosage_form_id' => $data['dosage_form_id'] ?? $drug->dosage_form_id,
            ]));
            $drug->save();

            if (isset($data['active_ingredients'])) {
                $sync = [];
                foreach ($data['active_ingredients'] as $ai) {
                    // when syncing, also provide a uuid for the pivot row so insert
                    // operations satisfy the pivot table `id` NOT NULL primary key
                    $sync[$ai['id']] = [
                        'id' => (string) Str::uuid(),
                        'quantity' => $ai['quantity']
                    ];
                }
                $drug->activeIngredients()->sync($sync);
            }

            // brands are managed separately via BrandController

            DB::commit();

            return response()->json(['success' => true, 'data' => $drug->load(['manufacturer', 'dosageForm', 'activeIngredients', 'brand'])]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Drug not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $drug = Drug::findOrFail($id);

            DB::beginTransaction();
            $drug->activeIngredients()->detach();
            // delete associated brands
            Brand::where('drug_id', $drug->id)->delete();
            $drug->delete();
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Drug deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Drug not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    
}
