<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            [
                'name' => 'Tylenol',
                'price' => 12.00,
                'drug_id' => 1,
            ],
            [
                'name' => 'Advil',
                'price' => 18.00,
                'drug_id' => 2,
            ],
            [
                'name' => 'Bayer',
                'price' => 10.00,
                'drug_id' => 3,
            ],
            [
                'name' => 'Amoxil',
                'price' => 25.00,
                'drug_id' => 4,
            ],
            [
                'name' => 'Prilosec',
                'price' => 15.00,
                'drug_id' => 5,
            ],
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate($brand);
        }
    }
}