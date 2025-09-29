<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Http\Controllers\NotificationController;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class TestNotificationErrorFix extends Command
{
    protected $signature = 'test:notification-error-fix';
    protected $description = 'Test notification error fix';

    public function handle()
    {
        $this->info('🧪 Testing Notification Error Fix...');
        
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

            // Test 1: Valid notification ID
            $this->line("\n✅ Testing with valid notification ID...");
            try {
                $request = new Request(['notification_id' => 1]);
                $controller = app(NotificationController::class);
                $response = $controller->markAsRead($request);
                $data = json_decode($response->getContent(), true);
                
                $this->info("    ✅ markAsRead with valid ID: " . ($data['success'] ? 'OK' : 'Failed'));
            } catch (\Exception $e) {
                $this->error("    ❌ markAsRead with valid ID: Failed - " . $e->getMessage());
            }

            // Test 2: Invalid notification ID (null)
            $this->line("\n❌ Testing with null notification ID...");
            try {
                $request = new Request(['notification_id' => null]);
                $controller = app(NotificationController::class);
                $response = $controller->markAsRead($request);
                $data = json_decode($response->getContent(), true);
                
                $this->info("    ✅ markAsRead with null ID: " . ($data['success'] ? 'OK' : 'Failed (Expected)'));
                $this->line("    Response: " . $data['message']);
            } catch (\Exception $e) {
                $this->error("    ❌ markAsRead with null ID: Failed - " . $e->getMessage());
            }

            // Test 3: Invalid notification ID (empty string)
            $this->line("\n❌ Testing with empty string notification ID...");
            try {
                $request = new Request(['notification_id' => '']);
                $controller = app(NotificationController::class);
                $response = $controller->markAsRead($request);
                $data = json_decode($response->getContent(), true);
                
                $this->info("    ✅ markAsRead with empty string ID: " . ($data['success'] ? 'OK' : 'Failed (Expected)'));
                $this->line("    Response: " . $data['message']);
            } catch (\Exception $e) {
                $this->error("    ❌ markAsRead with empty string ID: Failed - " . $e->getMessage());
            }

            // Test 4: Invalid notification ID (non-numeric)
            $this->line("\n❌ Testing with non-numeric notification ID...");
            try {
                $request = new Request(['notification_id' => 'abc']);
                $controller = app(NotificationController::class);
                $response = $controller->markAsRead($request);
                $data = json_decode($response->getContent(), true);
                
                $this->info("    ✅ markAsRead with non-numeric ID: " . ($data['success'] ? 'OK' : 'Failed (Expected)'));
                $this->line("    Response: " . $data['message']);
            } catch (\Exception $e) {
                $this->error("    ❌ markAsRead with non-numeric ID: Failed - " . $e->getMessage());
            }

            // Test 5: Delete with valid notification ID
            $this->line("\n✅ Testing delete with valid notification ID...");
            try {
                $request = new Request(['notification_id' => 1]);
                $controller = app(NotificationController::class);
                $response = $controller->delete($request);
                $data = json_decode($response->getContent(), true);
                
                $this->info("    ✅ delete with valid ID: " . ($data['success'] ? 'OK' : 'Failed'));
            } catch (\Exception $e) {
                $this->error("    ❌ delete with valid ID: Failed - " . $e->getMessage());
            }

            // Test 6: Delete with null notification ID
            $this->line("\n❌ Testing delete with null notification ID...");
            try {
                $request = new Request(['notification_id' => null]);
                $controller = app(NotificationController::class);
                $response = $controller->delete($request);
                $data = json_decode($response->getContent(), true);
                
                $this->info("    ✅ delete with null ID: " . ($data['success'] ? 'OK' : 'Failed (Expected)'));
                $this->line("    Response: " . $data['message']);
            } catch (\Exception $e) {
                $this->error("    ❌ delete with null ID: Failed - " . $e->getMessage());
            }

            // Test 7: NotificationService direct calls
            $this->line("\n🔔 Testing NotificationService direct calls...");
            try {
                $service = app(NotificationService::class);
                
                // Valid call
                $result1 = $service->markNotificationAsRead($admin, 1);
                $this->info("    ✅ markNotificationAsRead(valid): " . ($result1 ? 'OK' : 'Failed'));
                
                // Invalid call with null
                $result2 = $service->markNotificationAsRead($admin, null);
                $this->info("    ✅ markNotificationAsRead(null): " . ($result2 ? 'OK' : 'Failed (Expected)'));
                
                // Invalid call with 0
                $result3 = $service->markNotificationAsRead($admin, 0);
                $this->info("    ✅ markNotificationAsRead(0): " . ($result3 ? 'OK' : 'Failed (Expected)'));
                
                // Valid delete call
                $result4 = $service->deleteNotification($admin, 1);
                $this->info("    ✅ deleteNotification(valid): " . ($result4 ? 'OK' : 'Failed'));
                
                // Invalid delete call with null
                $result5 = $service->deleteNotification($admin, null);
                $this->info("    ✅ deleteNotification(null): " . ($result5 ? 'OK' : 'Failed (Expected)'));
                
            } catch (\Exception $e) {
                $this->error("    ❌ NotificationService direct calls: Failed - " . $e->getMessage());
            }

            // Logout
            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("\n✅ Notification error fix test completed!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Test failed: " . $e->getMessage());
            Log::error('TestNotificationErrorFix: Fatal error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}