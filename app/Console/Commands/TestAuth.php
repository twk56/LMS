<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class TestAuth extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auth:test {email=test@example.com} {password=password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test authentication with given credentials';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        $this->info("Testing authentication for: {$email}");

        // Check if user exists
        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("User not found with email: {$email}");
            return;
        }

        $this->info("User found: {$user->name} (ID: {$user->id})");

        // Test password verification
        $isPasswordValid = Hash::check($password, $user->password);
        $this->info("Password verification: " . ($isPasswordValid ? 'PASS' : 'FAIL'));

        // Test Auth::attempt
        $attemptResult = Auth::attempt(['email' => $email, 'password' => $password]);
        $this->info("Auth::attempt result: " . ($attemptResult ? 'PASS' : 'FAIL'));

        // Show user details
        $this->table(
            ['Field', 'Value'],
            [
                ['ID', $user->id],
                ['Name', $user->name],
                ['Email', $user->email],
                ['Role', $user->role],
                ['Email Verified', $user->email_verified_at ? 'Yes' : 'No'],
                ['Password Hash', substr($user->password, 0, 20) . '...'],
            ]
        );
    }
}