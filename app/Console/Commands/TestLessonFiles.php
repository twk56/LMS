<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TestLessonFiles extends Command
{
    protected $signature = 'test:lesson-files {id}';
    protected $description = 'Test lesson files route';

    public function handle()
    {
        $lessonId = $this->argument('id');
        $this->info("🧪 Testing Lesson Files Route for ID: {$lessonId}");
        
        try {
            // Check if lesson exists
            $lesson = Lesson::find($lessonId);
            if (!$lesson) {
                $this->error("❌ Lesson ID {$lessonId} not found");
                return 1;
            }

            $this->info("✅ Lesson found: {$lesson->title}");

            // Get admin user
            $admin = User::where('role', 'admin')->first();
            if (!$admin) {
                $this->error("❌ No admin user found");
                return 1;
            }

            // Login as admin
            Auth::login($admin);
            $this->info("✅ Logged in as admin: {$admin->name}");

            // Test LessonController files method
            $this->line("  Testing LessonController@files...");
            $controller = app(\App\Http\Controllers\LessonController::class);
            
            try {
                $response = $controller->files($lesson);
                $this->info("    ✅ LessonController@files: OK");
                $this->line("    Response type: " . get_class($response));
                
                Log::info('TestLessonFiles: Lesson files test passed', [
                    'lesson_id' => $lesson->id,
                    'lesson_title' => $lesson->title,
                    'admin_user_id' => $admin->id
                ]);
                
            } catch (\Exception $e) {
                $this->error("    ❌ LessonController@files: Failed - " . $e->getMessage());
                $this->line("    Error trace: " . $e->getTraceAsString());
                
                Log::error('TestLessonFiles: Lesson files test failed', [
                    'lesson_id' => $lesson->id,
                    'lesson_title' => $lesson->title,
                    'admin_user_id' => $admin->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return 1;
            }

            // Logout
            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("✅ Lesson files test completed successfully!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Test failed: " . $e->getMessage());
            Log::error('TestLessonFiles: Fatal error', [
                'lesson_id' => $lessonId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}