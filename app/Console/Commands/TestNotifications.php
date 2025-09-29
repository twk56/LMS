<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Http\Controllers\NotificationController;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TestNotifications extends Command
{
    protected $signature = 'test:notifications';
    protected $description = 'Test notifications functionality';

    public function handle()
    {
        $this->info('🧪 Testing Notifications System...');
        
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

            // Test NotificationController@index
            $this->line("\n📋 Testing NotificationController@index...");
            try {
                $controller = app(NotificationController::class);
                $response = $controller->index();
                
                $this->info("    ✅ NotificationController@index: OK");
                $this->line("    Response type: " . get_class($response));
                
                Log::info('TestNotifications: Notifications index test passed', [
                    'admin_user_id' => $admin->id
                ]);
                
            } catch (\Exception $e) {
                $this->error("    ❌ NotificationController@index: Failed - " . $e->getMessage());
                $this->line("    Error trace: " . $e->getTraceAsString());
                
                Log::error('TestNotifications: Notifications index test failed', [
                    'admin_user_id' => $admin->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return 1;
            }

            // Test NotificationService
            $this->line("\n🔔 Testing NotificationService...");
            try {
                $service = app(NotificationService::class);
                
                // Test getUnreadNotifications
                $notifications = $service->getUnreadNotifications($admin);
                $this->info("    ✅ getUnreadNotifications: Found " . count($notifications) . " notifications");
                
                // Test getNotificationPreferences
                $preferences = $service->getNotificationPreferences($admin);
                $this->info("    ✅ getNotificationPreferences: OK");
                
                // Test markNotificationAsRead
                $markResult = $service->markNotificationAsRead($admin, 1);
                $this->info("    ✅ markNotificationAsRead: " . ($markResult ? 'OK' : 'Failed'));
                
                // Test markAllNotificationsAsRead
                $markAllResult = $service->markAllNotificationsAsRead($admin);
                $this->info("    ✅ markAllNotificationsAsRead: " . ($markAllResult ? 'OK' : 'Failed'));
                
                // Test deleteNotification
                $deleteResult = $service->deleteNotification($admin, 1);
                $this->info("    ✅ deleteNotification: " . ($deleteResult ? 'OK' : 'Failed'));
                
                Log::info('TestNotifications: NotificationService test passed', [
                    'admin_user_id' => $admin->id,
                    'notifications_count' => count($notifications)
                ]);
                
            } catch (\Exception $e) {
                $this->error("    ❌ NotificationService: Failed - " . $e->getMessage());
                $this->line("    Error trace: " . $e->getTraceAsString());
                
                Log::error('TestNotifications: NotificationService test failed', [
                    'admin_user_id' => $admin->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return 1;
            }

            // Test API endpoints
            $this->line("\n🌐 Testing API endpoints...");
            try {
                // Test apiNotifications
                $apiResponse = $controller->apiNotifications();
                $this->info("    ✅ apiNotifications: OK");
                
                // Test apiPreferences
                $prefsResponse = $controller->apiPreferences();
                $this->info("    ✅ apiPreferences: OK");
                
                Log::info('TestNotifications: API endpoints test passed', [
                    'admin_user_id' => $admin->id
                ]);
                
            } catch (\Exception $e) {
                $this->error("    ❌ API endpoints: Failed - " . $e->getMessage());
                $this->line("    Error trace: " . $e->getTraceAsString());
                
                Log::error('TestNotifications: API endpoints test failed', [
                    'admin_user_id' => $admin->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return 1;
            }

            // Logout
            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("\n✅ Notifications system test completed successfully!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Test failed: " . $e->getMessage());
            Log::error('TestNotifications: Fatal error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}