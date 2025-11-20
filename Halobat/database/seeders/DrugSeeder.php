<?php

namespace Database\Seeders;

use App\Models\Drug;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DrugSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $drugs = [
            [
                'generic_name' => 'Acetaminophen',
                'description' => 'Pain reliever and fever reducer',
                'price' => 10.00,
                'manufacturer_id' => 1,
                'dosage_form_id' => 1,
            ],
            [
                'generic_name' => 'Ibuprofen',
                'description' => 'Nonsteroidal anti-inflammatory drug',
                'price' => 15.00,
                'manufacturer_id' => 2,
                'dosage_form_id' => 1,
            ],
            [
                'generic_name' => 'Aspirin',
                'description' => 'Anti-inflammatory and analgesic',
                'price' => 8.00,
                'manufacturer_id' => 1,
                'dosage_form_id' => 1,
            ],
            [
                'generic_name' => 'Amoxicillin',
                'description' => 'Antibiotic for bacterial infections',
                'price' => 20.00,
                'manufacturer_id' => 3,
                'dosage_form_id' => 2,
            ],
            [
                'generic_name' => 'Omeprazole',
                'description' => 'Proton pump inhibitor for acid reflux',
                'price' => 12.00,
                'manufacturer_id' => 4,
                'dosage_form_id' => 1,
            ],
        ];

        foreach ($drugs as $drug) {
            Drug::firstOrCreate($drug);
        }
    }
}