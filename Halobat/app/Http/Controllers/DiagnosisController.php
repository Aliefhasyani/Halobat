<?php

namespace App\Http\Controllers;

use App\Models\Diagnosis;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DiagnosisController extends Controller
{
    public function __construct()
    {
        // require an auth token for write actions and restrict by role
        $this->middleware('jwt.auth')->only(['store', 'update', 'destroy']);
        $this->middleware('role:admin,superadmin')->only(['store', 'update', 'destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $diagnoses = Diagnosis::with('user')->get();

        $formatted = $diagnoses->map(function ($d) {
            return [
                'diagnosis_id' => $d->id,
                'user_id' => $d->user_id,
                'user' => $d->user ? $d->user->full_name : null,
                'symptoms' => $d->symptoms,
                'diagnosis' => $d->diagnosis,
                'created_at' => $d->created_at,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'symptoms' => 'required|string',
            'diagnosis' => 'required|string',
        ]);

        // default to authenticated user if user_id not supplied
        if (!array_key_exists('user_id', $validated) || !$validated['user_id']) {
            $validated['user_id'] = Auth::id();
        }

        $diagnosis = Diagnosis::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Diagnosis created successfully.',
            'data' => $diagnosis->load('user')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Diagnosis $diagnosis)
    {
        try{
            $diagnosis = Diagnosis::with('user')->findOrFail($diagnosis->id);

            $data = [
                'diagnosis_id' => $diagnosis->id,
                'user_id' => $diagnosis->user_id,
                'user' => $diagnosis->user ? $diagnosis->user->full_name : null,
                'symptoms' => $diagnosis->symptoms,
                'diagnosis' => $diagnosis->diagnosis,
                'created_at' => $diagnosis->created_at,
                'updated_at' => $diagnosis->updated_at,
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

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Diagnosis $diagnosis)
    {
        $data = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'symptoms' => 'sometimes|required|string',
            'diagnosis' => 'sometimes|required|string',
        ]);

        $diagnosis->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Diagnosis updated successfully.',
            'data' => $diagnosis->load('user')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Diagnosis $diagnosis)
    {
        $diagnosis->delete();

        return response()->json([
            'success' => true,
            'message' => 'Diagnosis deleted successfully.'
        ]);
    }
}
