<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles first
        $this->call(RoleSeeder::class);

        // Create a superadmin user after roles exist
        $this->call(SuperAdminSeeder::class);

        // Seed drug-related data
        $this->call(DosageFormSeeder::class);
        $this->call(ManufacturerSeeder::class);
        $this->call(ActiveIngredientSeeder::class);
        $this->call(DrugSeeder::class);
        $this->call(BrandSeeder::class);
        $this->call(DrugActiveIngredientSeeder::class);
    }
}
