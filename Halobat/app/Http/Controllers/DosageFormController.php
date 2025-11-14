<?php

namespace App\Http\Controllers;

use App\Models\DosageForm;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class DosageFormController extends Controller
{
    public function index(){
        $dosages = DosageForm::with('drugs')->get();
        $formatted = $dosages->map(function($dosage){
            return [
                'dosage_id' => $dosage->id,
                'dosage_name' => $dosage->name,
                'related_drugs' => $dosage->drugs->map(function($drug){
                    return [
                        'drug_id' => $drug->id,
                        'generic_name' => $drug->generic_name,
                        'description' => $drug->description,
                        'picture' => $drug->picture,
                        'price' => $drug->price ?? null,
                    ];
                })->values(),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    public function show($id){
        try{
            $dosage = DosageForm::with('drugs')->findOrFail($id);

            $data = [
                'dosage_id' => $dosage->id,
                'dosage_name' => $dosage->name,
                'related_drugs' => $dosage->drugs->map(function($drug){
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
               ], 404);
        }
        
     
    }

    public function store(Request $request){
        $data = $request->validate([
            'name' => 'string|required|max:255'
        ]);

        $dosage = DosageForm::create($data);

        $dosage->refresh();

        return response()->json([
            'success' => true,
            'message' => 'data created!',
            'data' => $dosage
        ]);
    }

    public function update(Request $request,$id){
        $dosage = DosageForm::findOrFail($id);

        $data = $request->validate([
            'name' => 'string|required|max:255'
        ]);
        
        $dosage->update($data);
        $dosage->refresh();

        return response()->json([
            'success' => true,
            'message' => 'data updated',
            'data_updated' => $dosage
        ]);
    }

    public function destroy($id){
        $dosage = DosageForm::findOrFail($id);

        $dosage->delete();

        return response()->json([
            'success' => true,
            'message' => 'data deleted!'
        ]);
    }
}
