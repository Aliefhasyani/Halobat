<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'user', 'description' => 'Regular application user'],
            ['name' => 'admin', 'description' => 'Administrator with elevated privileges'],
            ['name' => 'superadmin', 'description' => 'Super administrator with full access'],
        ];

        foreach ($roles as $role) {
            // Idempotent: only create if a role with the same name doesn't already exist
            $existing = Role::where('name', $role['name'])->first();
            if (! $existing) {
                Role::create($role);
            }
        }
    }
}
