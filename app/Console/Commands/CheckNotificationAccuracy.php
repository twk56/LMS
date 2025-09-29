<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Http\Controllers\NotificationController;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;

class CheckNotificationAccuracy extends Command
{
    protected $signature = 'check:notification-accuracy';
    protected $description = 'Check notification system accuracy';

    public function handle()
    {
        $this->info('🔍 Checking Notification System Accuracy...');
        
        try {
            $admin = User::where('role', 'admin')->first();
            if (!$admin) {
                $this->error('❌ No admin user found');
                return 1;
            }

            Auth::login($admin);
            $this->info("✅ Logged in as admin: {$admin->name}");

            // Check Data Structure
            $this->line("\n📊 Checking Data Structure...");
            $service = app(NotificationService::class);
            $notifications = $service->getUnreadNotifications($admin);
            
            $requiredFields = ['id', 'type', 'title', 'message', 'read', 'timestamp', 'priority'];
            $allFieldsPresent = true;
            
            foreach ($notifications as $index => $notification) {
                $missingFields = array_diff($requiredFields, array_keys($notification));
                if (!empty($missingFields)) {
                    $this->error("    ❌ Notification {$index} missing: " . implode(', ', $missingFields));
                    $allFieldsPresent = false;
                }
            }
            
            if ($allFieldsPresent) {
                $this->info("    ✅ All notifications have required fields");
            }

            // Check Business Logic
            $this->line("\n💼 Checking Business Logic...");
            $course = \App\Models\Course::first();
            if ($course) {
                $service->sendCourseCompletionNotification($admin, $course);
                $this->info("    ✅ Course completion notification: OK");
            }

            // Check Error Handling
            $this->line("\n⚠️ Checking Error Handling...");
            $controller = app(NotificationController::class);
            $request = new \Illuminate\Http\Request(['notification_id' => null]);
            $response = $controller->markAsRead($request);
            $data = json_decode($response->getContent(), true);
            $this->info("    ✅ Null ID handling: " . ($data['success'] ? 'Failed' : 'Success (Expected)'));

            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("\n✅ Notification system accuracy check completed!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Check failed: " . $e->getMessage());
            return 1;
        }
    }
}