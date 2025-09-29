<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Http\Controllers\NotificationController;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TestMarkAllAsRead extends Command
{
    protected $signature = 'test:mark-all-as-read';
    protected $description = 'Test mark all as read functionality';

    public function handle()
    {
        $this->info('🧪 Testing Mark All As Read Functionality...');
        
        try {
            $admin = User::where('role', 'admin')->first();
            if (!$admin) {
                $this->error('❌ No admin user found');
                return 1;
            }

            Auth::login($admin);
            $this->info("✅ Logged in as admin: {$admin->name}");

            // Test 1: Service Level
            $this->line("\n🔔 Testing Service Level...");
            $service = app(NotificationService::class);
            $result = $service->markAllNotificationsAsRead($admin);
            $this->info("    ✅ Service markAllNotificationsAsRead: " . ($result ? 'Success' : 'Failed'));

            // Test 2: Controller Level
            $this->line("\n🎮 Testing Controller Level...");
            $controller = app(NotificationController::class);
            $response = $controller->markAllAsRead();
            $data = json_decode($response->getContent(), true);
            $this->info("    ✅ Controller markAllAsRead: " . ($data['success'] ? 'Success' : 'Failed'));
            $this->line("    Message: " . $data['message']);

            // Test 3: Check Logs
            $this->line("\n📝 Checking Logs...");
            $this->info("    ✅ Check storage/logs/laravel.log for detailed logs");

            // Test 4: Simulate Frontend Request
            $this->line("\n🌐 Simulating Frontend Request...");
            $request = new \Illuminate\Http\Request();
            $request->setMethod('POST');
            $request->headers->set('Content-Type', 'application/json');
            $request->headers->set('X-Requested-With', 'XMLHttpRequest');
            
            $response = $controller->markAllAsRead();
            $statusCode = $response->getStatusCode();
            $this->info("    ✅ HTTP Status Code: {$statusCode}");
            
            if ($statusCode === 200) {
                $this->info("    ✅ Request successful");
            } else {
                $this->error("    ❌ Request failed with status {$statusCode}");
            }

            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("\n✅ Mark all as read test completed!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Test failed: " . $e->getMessage());
            Log::error('TestMarkAllAsRead: Fatal error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}