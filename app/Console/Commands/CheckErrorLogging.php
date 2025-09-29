<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CheckErrorLogging extends Command
{
    protected $signature = 'check:error-logging';
    protected $description = 'Check error logging in all controllers';

    public function handle()
    {
        $this->info('🔍 Checking Error Logging in All Controllers...');
        
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

            // Test Controllers with Error Logging
            $this->line("\n📋 Testing Controllers with Error Logging...");

            // Test CourseController
            $this->testController('CourseController', function() {
                $course = Course::first();
                if ($course) {
                    app(\App\Http\Controllers\CourseController::class)->show($course);
                }
            });

            // Test LessonController
            $this->testController('LessonController', function() {
                $lesson = Lesson::first();
                if ($lesson) {
                    app(\App\Http\Controllers\LessonController::class)->show($lesson);
                }
            });

            // Test NotificationController
            $this->testController('NotificationController', function() {
                app(\App\Http\Controllers\NotificationController::class)->index();
            });

            // Test SimpleChatController
            $this->testController('SimpleChatController', function() {
                app(\App\Http\Controllers\SimpleChatController::class)->index();
            });

            // Test DashboardController
            $this->testController('DashboardController', function() {
                app(\App\Http\Controllers\DashboardController::class)->index();
            });

            // Test AnalyticsController
            $this->testController('AnalyticsController', function() {
                app(\App\Http\Controllers\AnalyticsController::class)->dashboard();
            });

            // Test UserProgressController
            $this->testController('UserProgressController', function() {
                app(\App\Http\Controllers\UserProgressController::class)->index();
            });

            // Test MyCoursesController
            $this->testController('MyCoursesController', function() {
                app(\App\Http\Controllers\MyCoursesController::class)->index();
            });

            // Test Admin Controllers
            $this->testController('Admin\UserController', function() {
                app(\App\Http\Controllers\Admin\UserController::class)->index();
            });

            $this->testController('Admin\CourseController', function() {
                app(\App\Http\Controllers\Admin\CourseController::class)->index();
            });

            $this->testController('Admin\CategoryController', function() {
                app(\App\Http\Controllers\Admin\CategoryController::class)->index();
            });

            // Test CertificateController
            $this->testController('CertificateController', function() {
                app(\App\Http\Controllers\CertificateController::class)->index();
            });

            // Test CourseCategoryController
            $this->testController('CourseCategoryController', function() {
                app(\App\Http\Controllers\CourseCategoryController::class)->index();
            });

            // Logout
            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("\n✅ Error logging check completed!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Check failed: " . $e->getMessage());
            Log::error('CheckErrorLogging: Fatal error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    private function testController(string $controllerName, callable $testFunction)
    {
        try {
            $this->line("  Testing {$controllerName}...");
            $testFunction();
            $this->info("    ✅ {$controllerName}: OK");
        } catch (\Exception $e) {
            $this->error("    ❌ {$controllerName}: Failed - " . $e->getMessage());
            Log::error("CheckErrorLogging: {$controllerName} test failed", [
                'controller' => $controllerName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}