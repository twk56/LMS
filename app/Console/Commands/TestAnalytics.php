<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\AnalyticsController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TestAnalytics extends Command
{
    protected $signature = 'test:analytics';
    protected $description = 'Test Analytics functionality';

    public function handle()
    {
        $this->info('🧪 Testing Analytics Functionality...');
        
        try {
            // Get admin user
            $admin = User::where('role', 'admin')->first();
            if (!$admin) {
                $this->error('❌ No admin user found');
                return 1;
            }

            // Login as admin
            Auth::login($admin);
            $this->info("✅ Logged in as admin: {$admin->name}");

            // Test Analytics Controller
            $this->line('  Testing AnalyticsController@dashboard...');
            $controller = app(AnalyticsController::class);
            
            try {
                $response = $controller->dashboard();
                $this->info('    ✅ AnalyticsController@dashboard: OK');
                
                // Log success
                Log::info('TestAnalytics: Analytics test passed', [
                    'admin_user_id' => $admin->id,
                    'admin_user_email' => $admin->email
                ]);
                
            } catch (\Exception $e) {
                $this->error("    ❌ AnalyticsController@dashboard: Failed - " . $e->getMessage());
                Log::error('TestAnalytics: Analytics test failed', [
                    'admin_user_id' => $admin->id,
                    'admin_user_email' => $admin->email,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return 1;
            }

            // Logout
            Auth::logout();
            $this->info('✅ Logged out');

            $this->info('✅ Analytics functionality test completed successfully!');
            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Test failed: ' . $e->getMessage());
            Log::error('TestAnalytics: Fatal error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}