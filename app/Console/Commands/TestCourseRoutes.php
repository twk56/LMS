<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TestCourseRoutes extends Command
{
    protected $signature = 'test:course-routes';
    protected $description = 'Test all course routes';

    public function handle()
    {
        $this->info('🧪 Testing Course Routes...');
        
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

            // Get all courses
            $courses = Course::all();
            $this->info("📚 Found {$courses->count()} courses");

            // Test each course
            foreach ($courses as $course) {
                $this->line("  Testing Course ID {$course->id}: {$course->title}");
                
                try {
                    // Test CourseController show method
                    $controller = app(\App\Http\Controllers\CourseController::class);
                    $response = $controller->show($course);
                    
                    $this->info("    ✅ Course ID {$course->id}: OK");
                    
                    Log::info('TestCourseRoutes: Course test passed', [
                        'course_id' => $course->id,
                        'course_title' => $course->title,
                        'admin_user_id' => $admin->id
                    ]);
                    
                } catch (\Exception $e) {
                    $this->error("    ❌ Course ID {$course->id}: Failed - " . $e->getMessage());
                    
                    Log::error('TestCourseRoutes: Course test failed', [
                        'course_id' => $course->id,
                        'course_title' => $course->title,
                        'admin_user_id' => $admin->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            // Logout
            Auth::logout();
            $this->info('✅ Logged out');

            $this->info('✅ Course routes test completed!');
            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Test failed: ' . $e->getMessage());
            Log::error('TestCourseRoutes: Fatal error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}