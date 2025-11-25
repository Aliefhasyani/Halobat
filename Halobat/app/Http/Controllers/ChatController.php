<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Diagnosis;
use App\Models\Drug;

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

                // Ask the LLM to return a compact JSON object with a diagnosis string and
                // a list of recommended drugs (names and optional quantities).  JSON only.
                $prompt = <<<'PROMPT'
Please analyze the symptoms below and create an output that strictly follows
this JSON structure (no extra text):

{
    "diagnosis": "short diagnosis summary",
    "drugs": [
        {"name": "drug name or generic name", "quantity": 1},
        {"name": "another drug", "quantity": 1}
    ]
}

Give at most 6 drug suggestions. If you are unsure about a specific drug, omit it. Return sensible default quantity (1) where not specified.

Symptoms:
PROMPT;

                $content = $prompt . "\n" . $validated['message'];

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
                $answer = $result['choices'][0]['message']['content'] ?? null;

                // try to extract a JSON object from the assistant content
                $structured = null;
                if ($answer) {
                    // first attempt to decode raw JSON
                    $decoded = json_decode($answer, true);
                    if (is_array($decoded)) {
                        $structured = $decoded;
                    } else {
                        // try to extract JSON-like substring
                        if (preg_match('/\{.*\}/s', $answer, $m)) {
                            $maybe = $m[0];
                            $decoded2 = json_decode($maybe, true);
                            if (is_array($decoded2)) {
                                $structured = $decoded2;
                            }
                        }
                    }
                }

                // fallback: try to parse a simple format "Diagnosis | drug1, drug2"
                if (!$structured && $answer) {
                    $parts = preg_split('/\|/', $answer, 2);
                    $diagText = trim($parts[0] ?? '');
                    $drugs = [];
                    if (isset($parts[1])) {
                        $list = explode(',', $parts[1]);
                        foreach ($list as $item) {
                            $name = trim($item);
                            if ($name !== '') $drugs[] = ['name' => $name, 'quantity' => 1];
                        }
                    }
                    $structured = ['diagnosis' => $diagText ?: 'No diagnosis', 'drugs' => $drugs];
                }

                if (!$structured) {
                    // still nothing meaningful
                    return response()->json(['success' => false, 'error' => 'Unable to parse LLM response: ' . substr($answer ?? '', 0, 100)], 500);
                }

                // choose a user id: prefer authenticated user, else fall back to first user
                $user = $request->user() ?? User::first();
                if (!$user) {
                    return response()->json(['success' => false, 'error' => 'No authenticated user and no fallback user found'], 500);
                }

                DB::beginTransaction();
                try {
                    // create diagnosis record
                    $diag = Diagnosis::create([
                        'user_id' => $user->id,
                        'symptoms' => $validated['message'],
                        'diagnosis' => trim($structured['diagnosis'] ?? ''),
                    ]);

                    $attached = [];
                    foreach ($structured['drugs'] as $d) {
                        $drugName = trim(strval($d['name'] ?? $d));
                        $qty = isset($d['quantity']) && is_numeric($d['quantity']) ? intval($d['quantity']) : 1;

                        if ($drugName === '') continue;

                        // try exact lower case match first
                        $drug = Drug::whereRaw('LOWER(generic_name) = ?', [strtolower($drugName)])->first();
                        if (!$drug) {
                            // then try a LIKE query
                            $drug = Drug::where('generic_name', 'LIKE', "%".$drugName."%")->first();
                        }

                        if ($drug) {
                            // attach pivot row
                            $diag->recommendedDrugs()->attach($drug->id, ['quantity' => $qty]);

                            $attached[] = [
                                'id' => $drug->id,
                                'name' => $drug->generic_name,
                                'price' => $drug->price,
                                'picture' => $drug->picture,
                                'manufacturer' => $drug->manufacturer ? $drug->manufacturer->name : null,
                                'quantity' => $qty,
                            ];
                        }
                    }

                    DB::commit();

                    return response()->json([
                        'success' => true,
                        'diagnosis' => $diag->diagnosis,
                        'recommended_drugs' => $attached,
                        'raw' => $answer,
                    ]);
                } catch (\Throwable $ex) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'error' => $ex->getMessage()], 500);
                }
            }
        }

        return response()->json(['error' => 'All API keys failed'], 500);
    }
}
