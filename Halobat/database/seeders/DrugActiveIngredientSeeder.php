<?php

namespace Database\Seeders;

use App\Models\Drug;
use App\Models\ActiveIngredient;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DrugActiveIngredientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure drugs and ingredients exist
        $drugs = [
            'Acetaminophen' => Drug::where('generic_name', 'Acetaminophen')->first(),
            'Ibuprofen' => Drug::where('generic_name', 'Ibuprofen')->first(),
            'Aspirin' => Drug::where('generic_name', 'Aspirin')->first(),
            'Amoxicillin' => Drug::where('generic_name', 'Amoxicillin')->first(),
            'Omeprazole' => Drug::where('generic_name', 'Omeprazole')->first(),
        ];

        $ingredients = [
            'Paracetamol' => ActiveIngredient::where('name', 'Paracetamol')->first(),
            'Ibuprofen' => ActiveIngredient::where('name', 'Ibuprofen')->first(),
            'Aspirin' => ActiveIngredient::where('name', 'Aspirin')->first(),
            'Amoxicillin' => ActiveIngredient::where('name', 'Amoxicillin')->first(),
            'Omeprazole' => ActiveIngredient::where('name', 'Omeprazole')->first(),
        ];

        $drugIngredients = [
            [
                'drug_id' => $drugs['Acetaminophen'] ? $drugs['Acetaminophen']->id : null,
                'active_ingredient_id' => $ingredients['Paracetamol'] ? $ingredients['Paracetamol']->id : null,
                'quantity' => 500,
            ],
            [
                'drug_id' => $drugs['Ibuprofen'] ? $drugs['Ibuprofen']->id : null,
                'active_ingredient_id' => $ingredients['Ibuprofen'] ? $ingredients['Ibuprofen']->id : null,
                'quantity' => 200,
            ],
            [
                'drug_id' => $drugs['Aspirin'] ? $drugs['Aspirin']->id : null,
                'active_ingredient_id' => $ingredients['Aspirin'] ? $ingredients['Aspirin']->id : null,
                'quantity' => 325,
            ],
            [
                'drug_id' => $drugs['Amoxicillin'] ? $drugs['Amoxicillin']->id : null,
                'active_ingredient_id' => $ingredients['Amoxicillin'] ? $ingredients['Amoxicillin']->id : null,
                'quantity' => 500,
            ],
            [
                'drug_id' => $drugs['Omeprazole'] ? $drugs['Omeprazole']->id : null,
                'active_ingredient_id' => $ingredients['Omeprazole'] ? $ingredients['Omeprazole']->id : null,
                'quantity' => 20,
            ],
        ];

        foreach ($drugIngredients as $item) {
            if ($item['drug_id'] && $item['active_ingredient_id']) {
                DB::table('drug_active_ingredients')->updateOrInsert(
                    ['drug_id' => $item['drug_id'], 'active_ingredient_id' => $item['active_ingredient_id']],
                    array_merge($item, ['id' => \Illuminate\Support\Str::uuid()])
                );
            }
        }
    }
}