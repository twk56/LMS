<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CreateAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, let's see what users exist
        echo "Current users in database:\n";
        User::all(['id', 'name', 'email', 'role'])->each(function($user) {
            echo "ID {$user->id}: {$user->name} ({$user->email}) - {$user->role}\n";
        });
        
        // Check if admin user with ID 1 already exists
        $existingUser = User::find(1);
        
        if ($existingUser) {
            // Update existing user to be admin with better email
            $existingUser->update([
                'name' => 'Admin User',
                'email' => 'admin@admin.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
            echo "\nUpdated existing user with ID 1 to be admin.\n";
            echo "Admin credentials:\n";
            echo "Email: admin@admin.com\n";
            echo "Password: password\n";
            echo "Role: admin\n";
        } else {
            // Check if admin@admin.com already exists
            $existingAdmin = User::where('email', 'admin@admin.com')->first();
            
            if ($existingAdmin) {
                // Update the existing admin user to have ID 1
                $existingAdmin->update([
                    'id' => 1,
                    'name' => 'Admin User',
                    'password' => Hash::make('password'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]);
                echo "\nUpdated existing admin user to have ID 1.\n";
            } else {
                // Create new admin user with ID 1
                User::create([
                    'id' => 1,
                    'name' => 'Admin User',
                    'email' => 'admin@admin.com',
                    'password' => Hash::make('password'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]);
                echo "\nCreated new admin user with ID 1.\n";
            }
            
            echo "Admin credentials:\n";
            echo "Email: admin@admin.com\n";
            echo "Password: password\n";
            echo "Role: admin\n";
        }
        
        echo "\nFinal admin user:\n";
        $adminUser = User::find(1);
        if ($adminUser) {
            echo "ID {$adminUser->id}: {$adminUser->name} ({$adminUser->email}) - {$adminUser->role}\n";
        }
    }
}
