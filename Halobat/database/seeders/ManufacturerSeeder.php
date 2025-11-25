<?php

namespace Database\Seeders;

use App\Models\Manufacturer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ManufacturerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $manufacturers = [
            ['name' => 'Pfizer'],
            ['name' => 'Johnson & Johnson'],
            ['name' => 'Novartis'],
            ['name' => 'Roche'],
            ['name' => 'Merck'],
        ];

        foreach ($manufacturers as $manufacturer) {
            Manufacturer::firstOrCreate($manufacturer);
        }
    }
}