<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Brand;
use App\Models\Drug;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class BrandController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth')->only(['store', 'update', 'destroy']);
        $this->middleware('role:admin,superadmin')->only(['store', 'update', 'destroy']);
    }

    public function index()
    {
        $brands = Brand::with(['drug.manufacturer', 'drug.dosageForm'])->get();

        $formatted = $brands->map(function ($brand) {
            return [
                'id' => $brand->id,
                'name' => $brand->name,
                'description' => $brand->drug ? $brand->drug->description : null,
                'picture' => $brand->picture,
                'price' => $brand->price,
                'drug_id' => $brand->drug_id,
                'drug' => $brand->drug ? [
                    'id' => $brand->drug->id,
                    'generic_name' => $brand->drug->generic_name,
                    'manufacturer' => $brand->drug->manufacturer ? ['id' => $brand->drug->manufacturer->id, 'name' => $brand->drug->manufacturer->name] : null,
                    'dosage_form' => $brand->drug->dosageForm ? ['id' => $brand->drug->dosageForm->id, 'name' => $brand->drug->dosageForm->name] : null,
                ] : null,
            ];
        });

        return response()->json(['success' => true, 'data' => $formatted]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'picture' => 'nullable|string',
            'price' => 'nullable|numeric',
            'drug_id' => 'required|string|exists:drugs,id',
        ]);

        try {
            DB::beginTransaction();
            $brand = Brand::create([
                'name' => $data['name'],
                'picture' => $data['picture'] ?? null,
                'price' => $data['price'] ?? null,
                'drug_id' => $data['drug_id'],
            ]);
            DB::commit();

            return response()->json(['success' => true, 'data' => $brand->load('drug.manufacturer', 'drug.dosageForm')], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $brand = Brand::with(['drug.manufacturer', 'drug.dosageForm'])->findOrFail($id);
            return response()->json(['success' => true, 'data' => $brand]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Brand not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $brand = Brand::findOrFail($id);

            $data = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'picture' => 'nullable|string',
                'price' => 'nullable|numeric',
                'drug_id' => 'sometimes|required|string|exists:drugs,id',
            ]);

            $brand->update(array_filter([
                'name' => $data['name'] ?? null,
                'picture' => array_key_exists('picture', $data) ? $data['picture'] : $brand->picture,
                'price' => array_key_exists('price', $data) ? $data['price'] : $brand->price,
                'drug_id' => $data['drug_id'] ?? $brand->drug_id,
            ]));

            return response()->json(['success' => true, 'data' => $brand->load('drug.manufacturer', 'drug.dosageForm')]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Brand not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $brand->delete();
            return response()->json(['success' => true, 'message' => 'Brand deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Brand not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}

