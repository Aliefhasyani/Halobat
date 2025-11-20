<?php

namespace Database\Seeders;

use App\Models\DosageForm;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DosageFormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dosageForms = [
            ['name' => 'Tablet'],
            ['name' => 'Capsule'],
            ['name' => 'Syrup'],
            ['name' => 'Cream'],
            ['name' => 'Injection'],
        ];

        foreach ($dosageForms as $form) {
            DosageForm::firstOrCreate($form);
        }
    }
}