<?php

namespace App\Http\Controllers;

use App\Models\Manufacturer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class ManufacturerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->only(['store','update','destroy']);
        $this->middleware('role:admin,superadmin')->only(['store','update','destroy']);
    }
    public function index(){
        $manufacturers = Manufacturer::all();
        $formatted = $manufacturers->map(function($manufacturer){
            return [
                'manufacturer_id' => $manufacturer->id,
                'manufacturer_name' => $manufacturer->name,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    public function show($id){
        try{
            $manufacturer = Manufacturer::with('drugs')->findOrFail($id);

            $data = [
                'manufacturer_id' => $manufacturer->id,
                'manufacturer_name' => $manufacturer->name,
                'related_drugs' => $manufacturer->drugs->map(function($drug){
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
        }catch(ModelNotFoundException $ex){
            return response()->json([
                'success' => false,
                'error' => $ex->getMessage(),
               ],404);
        }
        
     
    }

    public function store(Request $request){
        $data = $request->validate([
            'name' => 'string|required|max:255'
        ]);

        $manufacturer = Manufacturer::create($data);

        $manufacturer->refresh();

        return response()->json([
            'success' => true,
            'message' => 'data created!',
            'data' => $manufacturer
        ]);
    }

    public function update(Request $request,$id){
        $manufacturer = Manufacturer::findOrFail($id);

        $data = $request->validate([
            'name' => 'string|required|max:255'
        ]);
        
        $manufacturer->update($data);
        $manufacturer->refresh();

        return response()->json([
            'success' => true,
            'message' => 'data updated',
            'data_updated' => $manufacturer
        ]);
    }

    public function destroy($id){
        $manufacturer = Manufacturer::findOrFail($id);

        $manufacturer->delete();

        return response()->json([
            'success' => true,
            'message' => 'data deleted!'
        ]);
    }
}
