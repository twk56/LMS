<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Http\Controllers\NotificationController;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class TestAllNotifications extends Command
{
    protected $signature = 'test:all-notifications';
    protected $description = 'Test all notifications features';

    public function handle()
    {
        $this->info('🧪 Testing All Notifications Features...');
        
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

            // Test 1: Main Notifications Page
            $this->line("\n📋 Testing Main Notifications Page...");
            try {
                $controller = app(NotificationController::class);
                $response = $controller->index();
                
                $this->info("    ✅ GET /notifications: OK");
                $this->line("    Response type: " . get_class($response));
                
            } catch (\Exception $e) {
                $this->error("    ❌ GET /notifications: Failed - " . $e->getMessage());
                return 1;
            }

            // Test 2: Mark as Read
            $this->line("\n👁️ Testing Mark as Read...");
            try {
                $request = new Request(['notification_id' => 1]);
                $response = $controller->markAsRead($request);
                $data = json_decode($response->getContent(), true);
                
                $this->info("    ✅ POST /notifications/mark-as-read: " . ($data['success'] ? 'OK' : 'Failed'));
                
            } catch (\Exception $e) {
                $this->error("    ❌ POST /notifications/mark-as-read: Failed - " . $e->getMessage());
            }

            // Test 3: Mark All as Read
            $this->line("\n✅ Testing Mark All as Read...");
            try {
                $response = $controller->markAllAsRead();
                $data = json_decode($response->getContent(), true);
                
                $this->info("    ✅ POST /notifications/mark-all-as-read: " . ($data['success'] ? 'OK' : 'Failed'));
                
            } catch (\Exception $e) {
                $this->error("    ❌ POST /notifications/mark-all-as-read: Failed - " . $e->getMessage());
            }

            // Test 4: Delete Notification
            $this->line("\n🗑️ Testing Delete Notification...");
            try {
                $request = new Request(['notification_id' => 1]);
                $response = $controller->delete($request);
                $data = json_decode($response->getContent(), true);
                
                $this->info("    ✅ DELETE /notifications/delete: " . ($data['success'] ? 'OK' : 'Failed'));
                
            } catch (\Exception $e) {
                $this->error("    ❌ DELETE /notifications/delete: Failed - " . $e->getMessage());
            }

            // Test 5: Preferences Page
            $this->line("\n⚙️ Testing Preferences Page...");
            try {
                $response = $controller->preferences();
                
                $this->info("    ✅ GET /notifications/preferences: OK");
                $this->line("    Response type: " . get_class($response));
                
            } catch (\Exception $e) {
                $this->error("    ❌ GET /notifications/preferences: Failed - " . $e->getMessage());
            }

            // Test 6: Update Preferences
            $this->line("\n💾 Testing Update Preferences...");
            try {
                $request = new Request([
                    'email_notifications' => true,
                    'push_notifications' => false,
                    'sms_notifications' => false,
                    'course_completion' => true,
                    'lesson_reminders' => true,
                    'quiz_reminders' => false,
                    'achievements' => true,
                    'streaks' => false,
                    'dropout_risk' => true,
                    'new_courses' => true,
                    'system_maintenance' => false,
                ]);
                $response = $controller->updatePreferences($request);
                $data = json_decode($response->getContent(), true);
                
                $this->info("    ✅ PUT /notifications/preferences: " . ($data['success'] ? 'OK' : 'Failed'));
                
            } catch (\Exception $e) {
                $this->error("    ❌ PUT /notifications/preferences: Failed - " . $e->getMessage());
            }

            // Test 7: API Endpoints
            $this->line("\n🌐 Testing API Endpoints...");
            try {
                $apiResponse = $controller->apiNotifications();
                $this->info("    ✅ GET /api/notifications: OK");
                
                $prefsResponse = $controller->apiPreferences();
                $this->info("    ✅ GET /api/notifications/preferences: OK");
                
            } catch (\Exception $e) {
                $this->error("    ❌ API endpoints: Failed - " . $e->getMessage());
            }

            // Test 8: NotificationService Features
            $this->line("\n🔔 Testing NotificationService Features...");
            try {
                $service = app(NotificationService::class);
                
                // Test sending different types of notifications
                $this->info("    Testing notification sending...");
                
                // Test course completion notification
                $course = \App\Models\Course::first();
                if ($course) {
                    $service->sendCourseCompletionNotification($admin, $course);
                    $this->info("    ✅ Course completion notification: OK");
                }
                
                // Test lesson reminder notification
                $lesson = \App\Models\Lesson::first();
                if ($lesson) {
                    $service->sendLessonReminderNotification($admin, $lesson);
                    $this->info("    ✅ Lesson reminder notification: OK");
                }
                
                // Test achievement notification
                $service->sendAchievementNotification($admin, 'First Course Completed');
                $this->info("    ✅ Achievement notification: OK");
                
                // Test streak notification
                $service->sendStreakNotification($admin, 7);
                $this->info("    ✅ Streak notification: OK");
                
                // Test new course notification
                if ($course) {
                    $service->sendNewCourseNotification($admin, $course);
                    $this->info("    ✅ New course notification: OK");
                }
                
                // Test system maintenance notification
                $service->sendSystemMaintenanceNotification(
                    $admin, 
                    'System will be under maintenance from 2:00 AM to 4:00 AM',
                    now()->addHours(2)
                );
                $this->info("    ✅ System maintenance notification: OK");
                
            } catch (\Exception $e) {
                $this->error("    ❌ NotificationService features: Failed - " . $e->getMessage());
            }

            // Test 9: Data Validation
            $this->line("\n📊 Testing Data Validation...");
            try {
                $service = app(NotificationService::class);
                
                // Test getUnreadNotifications
                $notifications = $service->getUnreadNotifications($admin);
                $this->info("    ✅ getUnreadNotifications: Found " . count($notifications) . " notifications");
                
                // Validate notification structure
                if (!empty($notifications)) {
                    $notification = $notifications[0];
                    $requiredFields = ['id', 'title', 'message', 'type', 'read', 'timestamp', 'priority'];
                    $missingFields = array_diff($requiredFields, array_keys($notification));
                    
                    if (empty($missingFields)) {
                        $this->info("    ✅ Notification structure: Valid");
                    } else {
                        $this->error("    ❌ Notification structure: Missing fields - " . implode(', ', $missingFields));
                    }
                }
                
                // Test getNotificationPreferences
                $preferences = $service->getNotificationPreferences($admin);
                $this->info("    ✅ getNotificationPreferences: OK");
                
                // Validate preferences structure
                $requiredPrefs = [
                    'email_notifications', 'push_notifications', 'sms_notifications',
                    'course_completion', 'lesson_reminders', 'quiz_reminders',
                    'achievements', 'streaks', 'dropout_risk', 'new_courses', 'system_maintenance'
                ];
                $missingPrefs = array_diff($requiredPrefs, array_keys($preferences));
                
                if (empty($missingPrefs)) {
                    $this->info("    ✅ Preferences structure: Valid");
                } else {
                    $this->error("    ❌ Preferences structure: Missing fields - " . implode(', ', $missingPrefs));
                }
                
            } catch (\Exception $e) {
                $this->error("    ❌ Data validation: Failed - " . $e->getMessage());
            }

            // Logout
            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("\n✅ All notifications features test completed!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Test failed: " . $e->getMessage());
            Log::error('TestAllNotifications: Fatal error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}