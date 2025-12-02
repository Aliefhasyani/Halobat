<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function __construct()
    {
        // Require JWT auth for uploads (consistent with other controllers)
        $this->middleware('jwt.auth');
    }

    /**
     * Upload an image to the configured s3 disk (MinIO/S3 compatible)
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');

            // Generate a unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

            // Upload to MinIO / S3 disk
            $path = Storage::disk('s3')->putFileAs('', $file, $filename, 'public');

            // Get URL
            $url = Storage::disk('s3')->url($path);

            return response()->json([
                'url' => $url,
                'message' => 'Image uploaded successfully'
            ], 201);
        }

        return response()->json(['error' => 'File not found'], 400);
    }
}
