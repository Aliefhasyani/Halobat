<?php

namespace Database\Seeders;

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
        $drugIngredients = [
            [
                'drug_id' => 1,
                'active_ingredient_id' => 1,
                'quantity' => 500,
            ],
            [
                'drug_id' => 2,
                'active_ingredient_id' => 2,
                'quantity' => 200,
            ],
            [
                'drug_id' => 3,
                'active_ingredient_id' => 3,
                'quantity' => 325,
            ],
            [
                'drug_id' => 4,
                'active_ingredient_id' => 4,
                'quantity' => 500,
            ],
            [
                'drug_id' => 5,
                'active_ingredient_id' => 5,
                'quantity' => 20,
            ],
        ];

        foreach ($drugIngredients as $item) {
            DB::table('drug_active_ingredients')->updateOrInsert(
                ['drug_id' => $item['drug_id'], 'active_ingredient_id' => $item['active_ingredient_id']],
                $item
            );
        }
    }
}