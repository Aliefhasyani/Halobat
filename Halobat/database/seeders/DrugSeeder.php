<?php

namespace Database\Seeders;

use App\Models\Drug;
use App\Models\Manufacturer;
use App\Models\DosageForm;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DrugSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure manufacturers exist
        $manufacturers = [
            'Pfizer' => Manufacturer::firstOrCreate(['name' => 'Pfizer']),
            'Johnson & Johnson' => Manufacturer::firstOrCreate(['name' => 'Johnson & Johnson']),
            'Novartis' => Manufacturer::firstOrCreate(['name' => 'Novartis']),
            'Roche' => Manufacturer::firstOrCreate(['name' => 'Roche']),
        ];

        // Ensure dosage forms exist
        $dosageForms = [
            'Tablet' => DosageForm::firstOrCreate(['name' => 'Tablet']),
            'Capsule' => DosageForm::firstOrCreate(['name' => 'Capsule']),
        ];

        $drugs = [
            [
                'generic_name' => 'Acetaminophen',
                'description' => 'Pain reliever and fever reducer',
                'price' => 10.00,
                'manufacturer_id' => $manufacturers['Pfizer']->id,
                'dosage_form_id' => $dosageForms['Tablet']->id,
            ],
            [
                'generic_name' => 'Ibuprofen',
                'description' => 'Nonsteroidal anti-inflammatory drug',
                'price' => 15.00,
                'manufacturer_id' => $manufacturers['Johnson & Johnson']->id,
                'dosage_form_id' => $dosageForms['Tablet']->id,
            ],
            [
                'generic_name' => 'Aspirin',
                'description' => 'Anti-inflammatory and analgesic',
                'price' => 8.00,
                'manufacturer_id' => $manufacturers['Pfizer']->id,
                'dosage_form_id' => $dosageForms['Tablet']->id,
            ],
            [
                'generic_name' => 'Amoxicillin',
                'description' => 'Antibiotic for bacterial infections',
                'price' => 20.00,
                'manufacturer_id' => $manufacturers['Novartis']->id,
                'dosage_form_id' => $dosageForms['Capsule']->id,
            ],
            [
                'generic_name' => 'Omeprazole',
                'description' => 'Proton pump inhibitor for acid reflux',
                'price' => 12.00,
                'manufacturer_id' => $manufacturers['Roche']->id,
                'dosage_form_id' => $dosageForms['Tablet']->id,
            ],
        ];

        foreach ($drugs as $drug) {
            Drug::firstOrCreate($drug);
        }
    }
}