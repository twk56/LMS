<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class CheckCourse extends Command
{
    protected $signature = 'check:course {id}';
    protected $description = 'Check specific course details';

    public function handle()
    {
        $courseId = $this->argument('id');
        $this->info("🔍 Checking Course ID: {$courseId}");
        
        try {
            // Check if course exists
            $course = Course::find($courseId);
            if (!$course) {
                $this->error("❌ Course ID {$courseId} not found");
                return 1;
            }

            $this->info("✅ Course found: {$course->title}");
            $this->line("  Status: " . ($course->status ?? 'draft'));
            $this->line("  Created by: " . ($course->created_by ?? 'N/A'));
            $this->line("  Category: " . ($course->category?->name ?? 'N/A'));
            $this->line("  Created at: " . $course->created_at);
            $this->line("  Updated at: " . $course->updated_at);

            // Check relationships
            $this->line("\n📚 Relationships:");
            $this->line("  Lessons count: " . $course->lessons()->count());
            $this->line("  Students count: " . $course->students()->count());
            $this->line("  Category: " . ($course->category ? $course->category->name : 'None'));

            // Test CourseController show method
            $this->line("\n🧪 Testing CourseController@show...");
            
            // Get admin user
            $admin = User::where('role', 'admin')->first();
            if (!$admin) {
                $this->error("❌ No admin user found");
                return 1;
            }

            // Login as admin
            Auth::login($admin);
            $this->info("✅ Logged in as admin: {$admin->name}");

            // Test controller
            $controller = app(\App\Http\Controllers\CourseController::class);
            
            try {
                $response = $controller->show($course);
                $this->info("    ✅ CourseController@show: OK");
                $this->line("    Response type: " . get_class($response));
            } catch (\Exception $e) {
                $this->error("    ❌ CourseController@show: Failed - " . $e->getMessage());
                $this->line("    Error trace: " . $e->getTraceAsString());
                return 1;
            }

            // Logout
            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("✅ Course check completed successfully!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            $this->line("Trace: " . $e->getTraceAsString());
            return 1;
        }
    }
}