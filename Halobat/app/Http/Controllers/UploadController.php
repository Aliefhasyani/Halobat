<?php

namespace App\Http\Controllers;

use Aws\S3\S3Client;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    /**
     * Generate a presigned PUT URL for direct uploads to MinIO/S3.
     * Expects { filename, contentType } in JSON body.
     */
    public function presign(Request $request)
    {
        $this->validate($request, [
            'filename' => 'required|string',
            'contentType' => 'required|string'
        ]);

        $filename = $request->input('filename');
        $contentType = $request->input('contentType');

        $key = 'uploads/' . uniqid() . '-' . basename($filename);

        $s3 = new S3Client([
            'version' => 'latest',
            'region' => env('MINIO_REGION', 'us-east-1'),
            'endpoint' => env('MINIO_ENDPOINT'),
            'use_path_style_endpoint' => true,
            'credentials' => [
                'key' => env('MINIO_ACCESS_KEY'),
                'secret' => env('MINIO_SECRET_KEY'),
            ],
        ]);

        $cmd = $s3->getCommand('PutObject', [
            'Bucket' => env('MINIO_BUCKET'),
            'Key' => $key,
            'ContentType' => $contentType,
        ]);

        // Presign for 15 minutes
        $request = $s3->createPresignedRequest($cmd, '+15 minutes');
        $presignedUrl = (string)$request->getUri();

        // Compute a public URL that frontend can use (depends on your MinIO hosting)
        $publicUrl = rtrim(env('MINIO_PUBLIC_URL', env('MINIO_ENDPOINT')), '/') . '/' . env('MINIO_BUCKET') . '/' . $key;

        return response()->json([
            'presignedUrl' => $presignedUrl,
            'publicUrl' => $publicUrl,
            'key' => $key,
        ]);
    }
}
