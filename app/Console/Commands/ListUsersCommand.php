<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ListUsersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:list {--role=} {--format=table}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all users in the system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('📋 Listing all users...');
        $this->newLine();

        // Get role filter if provided
        $roleFilter = $this->option('role');
        $format = $this->option('format');

        // Build query
        $query = User::query();
        
        if ($roleFilter) {
            $query->where('role', $roleFilter);
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        if ($users->isEmpty()) {
            $this->warn('No users found.');
            return 0;
        }

        // Display based on format
        if ($format === 'json') {
            $this->displayAsJson($users);
        } elseif ($format === 'csv') {
            $this->displayAsCsv($users);
        } else {
            $this->displayAsTable($users);
        }

        // Show summary
        $this->newLine();
        $this->info("📊 Total users: {$users->count()}");
        
        if (!$roleFilter) {
            $roleCounts = $users->groupBy('role')->map->count();
            foreach ($roleCounts as $role => $count) {
                $this->line("  - {$role}: {$count}");
            }
        }

        return 0;
    }

    private function displayAsTable($users)
    {
        $headers = ['ID', 'Name', 'Email', 'Role', 'Email Verified', 'Created At'];
        
        $data = $users->map(function ($user) {
            return [
                $user->id,
                $user->name,
                $user->email,
                $user->role,
                $user->email_verified_at ? '✅ Yes' : '❌ No',
                $user->created_at->format('Y-m-d H:i:s'),
            ];
        });

        $this->table($headers, $data);
    }

    private function displayAsJson($users)
    {
        $jsonData = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];
        });

        $this->line(json_encode($jsonData, JSON_PRETTY_PRINT));
    }

    private function displayAsCsv($users)
    {
        $this->line('ID,Name,Email,Role,Email Verified,Created At');
        
        foreach ($users as $user) {
            $verified = $user->email_verified_at ? 'Yes' : 'No';
            $this->line("{$user->id},{$user->name},{$user->email},{$user->role},{$verified},{$user->created_at->format('Y-m-d H:i:s')}");
        }
    }
}
