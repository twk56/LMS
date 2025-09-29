<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Http\Controllers\NotificationController;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CheckNotificationReality extends Command
{
    protected $signature = 'check:notification-reality';
    protected $description = 'Check notification system reality and accuracy';

    public function handle()
    {
        $this->info('🔍 Checking Notification System Reality...');
        
        try {
            $admin = User::where('role', 'admin')->first();
            if (!$admin) {
                $this->error('❌ No admin user found');
                return 1;
            }

            Auth::login($admin);
            $this->info("✅ Logged in as admin: {$admin->name}");

            // Check Database Tables
            $this->line("\n📊 Checking Database Tables...");
            $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%notification%'");
            $this->info("    📋 Notification tables: " . count($tables));
            
            $hasNotificationsTable = collect($tables)->contains('name', 'notifications');
            if ($hasNotificationsTable) {
                $notificationCount = DB::table('notifications')->count();
                $this->info("    📊 Real notifications: {$notificationCount}");
            } else {
                $this->line("    ⚠️ Using simulated data");
            }

            // Check Service Reality
            $this->line("\n🔔 Checking NotificationService...");
            $service = app(NotificationService::class);
            $notifications = $service->getUnreadNotifications($admin);
            $this->info("    📨 Notifications returned: " . count($notifications));
            
            if (!empty($notifications)) {
                $notification = $notifications[0];
                $this->info("    📋 Sample notification:");
                $this->line("        - ID: " . ($notification['id'] ?? 'N/A'));
                $this->line("        - Title: " . ($notification['title'] ?? 'N/A'));
                $this->line("        - Type: " . ($notification['type'] ?? 'N/A'));
                $this->line("        - Read: " . ($notification['read'] ? 'Yes' : 'No'));
            }

            // Check Controller Functionality
            $this->line("\n🎮 Checking Controller...");
            $controller = app(NotificationController::class);
            
            $indexResponse = $controller->index();
            $this->info("    ✅ Index method: " . get_class($indexResponse));
            
            $preferencesResponse = $controller->preferences();
            $this->info("    ✅ Preferences method: " . get_class($preferencesResponse));

            // Check Business Logic
            $this->line("\n💼 Checking Business Logic...");
            $course = \App\Models\Course::first();
            if ($course) {
                $service->sendCourseCompletionNotification($admin, $course);
                $this->info("    ✅ Course completion notification: OK");
            }
            
            $lesson = \App\Models\Lesson::first();
            if ($lesson) {
                $service->sendLessonReminderNotification($admin, $lesson);
                $this->info("    ✅ Lesson reminder notification: OK");
            }

            // Check Error Handling
            $this->line("\n⚠️ Checking Error Handling...");
            $request = new \Illuminate\Http\Request(['notification_id' => null]);
            $response = $controller->markAsRead($request);
            $data = json_decode($response->getContent(), true);
            $this->info("    ✅ Null ID handling: " . ($data['success'] ? 'Failed' : 'Success (Expected)'));

            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("\n✅ Notification system reality check completed!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Check failed: " . $e->getMessage());
            return 1;
        }
    }
}