<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create multiple admin users
        $admins = [
            [
                'name' => 'System Administrator',
                'email' => 'system@admin.com',
                'password' => 'systemadmin123',
            ],
            [
                'name' => 'Content Manager',
                'email' => 'content@admin.com',
                'password' => 'contentadmin123',
            ],
            [
                'name' => 'Course Manager',
                'email' => 'course@admin.com',
                'password' => 'courseadmin123',
            ],
        ];

        foreach ($admins as $adminData) {
            // Check if admin already exists
            $existingAdmin = User::where('email', $adminData['email'])->first();
            
            if (!$existingAdmin) {
                User::create([
                    'name' => $adminData['name'],
                    'email' => $adminData['email'],
                    'password' => Hash::make($adminData['password']),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]);
                
                $this->command->info("Created admin: {$adminData['name']} ({$adminData['email']})");
            } else {
                $this->command->warn("Admin already exists: {$adminData['email']}");
            }
        }

        $this->command->info('Custom admin seeding completed!');
    }
}
