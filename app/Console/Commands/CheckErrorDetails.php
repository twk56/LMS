<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CheckErrorDetails extends Command
{
    protected $signature = 'check:error-details';
    protected $description = 'Check detailed error information';

    public function handle()
    {
        $this->info('🔍 Checking Detailed Error Information...');
        
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

            // Test specific error scenarios
            $this->line("\n🧪 Testing Specific Error Scenarios...");

            // Test CourseController with invalid course
            $this->line("\n📚 Testing CourseController with invalid course...");
            try {
                $course = new Course();
                $course->id = 99999; // Non-existent course
                app(\App\Http\Controllers\CourseController::class)->show($course);
            } catch (\Exception $e) {
                $this->info("    ✅ CourseController error handling: OK");
                $this->line("    Error: " . $e->getMessage());
            }

            // Test LessonController with invalid lesson
            $this->line("\n📖 Testing LessonController with invalid lesson...");
            try {
                $lesson = new Lesson();
                $lesson->id = 99999; // Non-existent lesson
                app(\App\Http\Controllers\LessonController::class)->show($lesson);
            } catch (\Exception $e) {
                $this->info("    ✅ LessonController error handling: OK");
                $this->line("    Error: " . $e->getMessage());
            }

            // Test Database Connection
            $this->line("\n🗄️ Testing Database Connection...");
            try {
                $userCount = DB::table('users')->count();
                $this->info("    ✅ Database connection: OK (Users: {$userCount})");
            } catch (\Exception $e) {
                $this->error("    ❌ Database connection: Failed - " . $e->getMessage());
            }

            // Test Course Model
            $this->line("\n📚 Testing Course Model...");
            try {
                $courses = Course::all();
                $this->info("    ✅ Course model: OK (Courses: {$courses->count()})");
            } catch (\Exception $e) {
                $this->error("    ❌ Course model: Failed - " . $e->getMessage());
            }

            // Test Lesson Model
            $this->line("\n📖 Testing Lesson Model...");
            try {
                $lessons = Lesson::all();
                $this->info("    ✅ Lesson model: OK (Lessons: {$lessons->count()})");
            } catch (\Exception $e) {
                $this->error("    ❌ Lesson model: Failed - " . $e->getMessage());
            }

            // Test PerformanceOptimizationService
            $this->line("\n⚡ Testing PerformanceOptimizationService...");
            try {
                $service = app(\App\Services\PerformanceOptimizationService::class);
                $courseDetails = $service->getOptimizedCourseDetails(1, $admin->id);
                $this->info("    ✅ PerformanceOptimizationService: OK");
            } catch (\Exception $e) {
                $this->error("    ❌ PerformanceOptimizationService: Failed - " . $e->getMessage());
                $this->line("    Error details: " . $e->getTraceAsString());
            }

            // Test NotificationService
            $this->line("\n🔔 Testing NotificationService...");
            try {
                $service = app(\App\Services\NotificationService::class);
                $notifications = $service->getUnreadNotifications($admin);
                $this->info("    ✅ NotificationService: OK (Notifications: " . count($notifications) . ")");
            } catch (\Exception $e) {
                $this->error("    ❌ NotificationService: Failed - " . $e->getMessage());
            }

            // Test File Operations
            $this->line("\n📁 Testing File Operations...");
            try {
                $storagePath = storage_path('app/public');
                if (is_dir($storagePath)) {
                    $this->info("    ✅ Storage directory: OK");
                } else {
                    $this->error("    ❌ Storage directory: Not found");
                }
            } catch (\Exception $e) {
                $this->error("    ❌ File operations: Failed - " . $e->getMessage());
            }

            // Test Log Writing
            $this->line("\n📝 Testing Log Writing...");
            try {
                Log::info('CheckErrorDetails: Test log entry', [
                    'test' => true,
                    'timestamp' => now()
                ]);
                $this->info("    ✅ Log writing: OK");
            } catch (\Exception $e) {
                $this->error("    ❌ Log writing: Failed - " . $e->getMessage());
            }

            // Logout
            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("\n✅ Error details check completed!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Check failed: " . $e->getMessage());
            Log::error('CheckErrorDetails: Fatal error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}