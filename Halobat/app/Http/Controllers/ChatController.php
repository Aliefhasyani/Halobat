<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function index(Request $request){
        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $keys = [
            env('OPENROUTER_API_KEY_1'),
            env('OPENROUTER_API_KEY_2'),
            env('OPENROUTER_API_KEY_3'),
            env('OPENROUTER_API_KEY_4'),
        ];

        $prompt = "based on that symptom, give the answer with this format: <Diagnosis> | <drug1>, <drug2>, <drug3>, <drugN>";
        $content = $prompt . "\n\nSymptom: " . $validated['message'];

        $data = [
            "model" => "openai/gpt-oss-20b:free",
            "messages" => [
                [
                    "role" => "user",
                    "content" => $content
                ]
            ],
            "extra_body" => [
                "reasoning" => [
                    "enabled" => false
                ]
            ]
        ];

        foreach ($keys as $apiKey) {
            if (!$apiKey) continue;

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $apiKey
            ])->post('https://openrouter.ai/api/v1/chat/completions', $data);

            if ($response->successful()) {
                $result = $response->json();
                $answer = $result['choices'][0]['message']['content'] ?? 'No response';
                return response()->json([
                    'success' => true,
                    'data' => $answer
                ]);
            }
        }

        return response()->json(['error' => 'All API keys failed'], 500);
    }
}
