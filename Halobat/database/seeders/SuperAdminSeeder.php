<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure superadmin role exists (idempotent)
        $role = Role::firstOrCreate(
            ['name' => 'superadmin'],
            ['description' => 'Super administrator with full access']
        );

        $email = 'yusranmazidan@gmail.com';

        // Create user if not exists, otherwise update role and password
        $user = User::where('email', $email)->first();

        if (! $user) {
            User::create([
                'full_name' => 'Yusran Mazidan',
                'username' => 'yousranmz',
                'email' => $email,
                'password' => Hash::make('123456789'),
                'role_id' => $role->id,
            ]);
        } else {
            $user->update([
                'role_id' => $role->id,
                'password' => Hash::make('123456789'),
            ]);
        }
    }
}
