<?php

namespace Database\Seeders;

use App\Models\ActiveIngredient;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ActiveIngredientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ingredients = [
            ['name' => 'Paracetamol'],
            ['name' => 'Ibuprofen'],
            ['name' => 'Aspirin'],
            ['name' => 'Amoxicillin'],
            ['name' => 'Omeprazole'],
        ];

        foreach ($ingredients as $ingredient) {
            ActiveIngredient::firstOrCreate($ingredient);
        }
    }
}