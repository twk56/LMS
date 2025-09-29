<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateTestUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-test {--email=test@example.com} {--password=password} {--name=Test User} {--role=student}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test user for authentication testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->option('email');
        $password = $this->option('password');
        $name = $this->option('name');
        $role = $this->option('role');

        // Check if user already exists
        if (User::where('email', $email)->exists()) {
            $this->warn("User with email {$email} already exists.");
            return;
        }

        // Create user
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => $role,
            'email_verified_at' => now(),
        ]);

        $this->info("Test user created successfully!");
        $this->line("Email: {$email}");
        $this->line("Password: {$password}");
        $this->line("Role: {$role}");
        $this->line("ID: {$user->id}");
    }
}