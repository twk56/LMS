<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create test regular user
        User::create([
            'name' => 'Test User',
            'email' => 'user@test.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'email_verified_at' => now(),
        ]);

        // Create test instructor (using admin role)
        User::create([
            'name' => 'Test Instructor',
            'email' => 'instructor@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
    }
}
