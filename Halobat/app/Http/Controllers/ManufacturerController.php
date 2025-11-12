<?php

namespace App\Http\Controllers;

use App\Models\Manufacturer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class ManufacturerController extends Controller
{
    public function index(){
        $manufacturers = Manufacturer::all();
        
        return response()->json([
            'success' => true,
            'data' => $manufacturers
        ]);
    }

    public function show($id){
       
        try{
            $manufacturer = Manufacturer::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $manufacturer
            ]);
        }catch(ModelNotFoundException $ex){
            return response()->json([
                'success' => false,
                'errors' => $ex->getMessage(),
               ],404);
        };
        
     
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
