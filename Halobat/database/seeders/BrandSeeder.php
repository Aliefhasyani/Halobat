<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Drug;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure drugs exist (from DrugSeeder)
        $drugs = [
            'Acetaminophen' => Drug::where('generic_name', 'Acetaminophen')->first(),
            'Ibuprofen' => Drug::where('generic_name', 'Ibuprofen')->first(),
            'Aspirin' => Drug::where('generic_name', 'Aspirin')->first(),
            'Amoxicillin' => Drug::where('generic_name', 'Amoxicillin')->first(),
            'Omeprazole' => Drug::where('generic_name', 'Omeprazole')->first(),
        ];

        $brands = [
            [
                'name' => 'Tylenol',
                'price' => 12.00,
                'drug_id' => $drugs['Acetaminophen'] ? $drugs['Acetaminophen']->id : null,
            ],
            [
                'name' => 'Advil',
                'price' => 18.00,
                'drug_id' => $drugs['Ibuprofen'] ? $drugs['Ibuprofen']->id : null,
            ],
            [
                'name' => 'Bayer',
                'price' => 10.00,
                'drug_id' => $drugs['Aspirin'] ? $drugs['Aspirin']->id : null,
            ],
            [
                'name' => 'Amoxil',
                'price' => 25.00,
                'drug_id' => $drugs['Amoxicillin'] ? $drugs['Amoxicillin']->id : null,
            ],
            [
                'name' => 'Prilosec',
                'price' => 15.00,
                'drug_id' => $drugs['Omeprazole'] ? $drugs['Omeprazole']->id : null,
            ],
        ];

        foreach ($brands as $brand) {
            if ($brand['drug_id']) {
                Brand::firstOrCreate($brand);
            }
        }
    }
}