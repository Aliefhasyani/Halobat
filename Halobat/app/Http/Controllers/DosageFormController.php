<?php

namespace App\Http\Controllers;

use App\Models\DosageForm;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class DosageFormController extends Controller
{
    public function index(){
        $dosages = DosageForm::all();
        
        return response()->json([
            'success' => true,
            'data' => $dosages
        ]);
    }

    public function show($id){
       
        try{
            $dosage = DosageForm::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $dosage
            ]);
        }catch(ModelNotFoundException $ex){
               return response()->json([
                'success' => false,
                'errors' => $ex->getMessage(),
               ]);
        };
        
     
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
