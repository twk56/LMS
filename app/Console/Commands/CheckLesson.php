<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class CheckLesson extends Command
{
    protected $signature = 'check:lesson {id}';
    protected $description = 'Check specific lesson details';

    public function handle()
    {
        $lessonId = $this->argument('id');
        $this->info("🔍 Checking Lesson ID: {$lessonId}");
        
        try {
            // Check if lesson exists
            $lesson = Lesson::find($lessonId);
            if (!$lesson) {
                $this->error("❌ Lesson ID {$lessonId} not found");
                return 1;
            }

            $this->info("✅ Lesson found: {$lesson->title}");
            $this->line("  Course: " . ($lesson->course?->title ?? 'N/A'));
            $this->line("  Status: " . ($lesson->status ?? 'draft'));
            $this->line("  Content Type: " . ($lesson->content_type ?? 'N/A'));
            $this->line("  Order: " . ($lesson->order ?? 'N/A'));
            $this->line("  Created at: " . $lesson->created_at);
            $this->line("  Updated at: " . $lesson->updated_at);

            // Check relationships
            $this->line("\n📚 Relationships:");
            $this->line("  Course: " . ($lesson->course ? $lesson->course->title : 'None'));
            $this->line("  Files count: " . $lesson->files()->count());
            $this->line("  Progress count: " . $lesson->progress()->count());

            // Test files relationship
            $this->line("\n🧪 Testing files relationship...");
            try {
                $files = $lesson->files;
                $this->info("    ✅ Files relationship: OK (count: {$files->count()})");
            } catch (\Exception $e) {
                $this->error("    ❌ Files relationship: Failed - " . $e->getMessage());
            }

            // Test LessonController show method
            $this->line("\n🧪 Testing LessonController@show...");
            
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
            $controller = app(\App\Http\Controllers\LessonController::class);
            
            try {
                $response = $controller->show($lesson);
                $this->info("    ✅ LessonController@show: OK");
                $this->line("    Response type: " . get_class($response));
            } catch (\Exception $e) {
                $this->error("    ❌ LessonController@show: Failed - " . $e->getMessage());
                $this->line("    Error trace: " . $e->getTraceAsString());
                return 1;
            }

            // Logout
            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("✅ Lesson check completed successfully!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            $this->line("Trace: " . $e->getTraceAsString());
            return 1;
        }
    }
}