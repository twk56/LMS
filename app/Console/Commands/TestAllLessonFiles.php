<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TestAllLessonFiles extends Command
{
    protected $signature = 'test:all-lesson-files';
    protected $description = 'Test all lesson files routes';

    public function handle()
    {
        $this->info('🧪 Testing All Lesson Files Routes...');
        
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

            // Get all lessons
            $lessons = Lesson::all();
            $this->info("📚 Found {$lessons->count()} lessons");

            // Test each lesson files route
            foreach ($lessons as $lesson) {
                $this->line("  Testing Lesson ID {$lesson->id}: {$lesson->title}");
                
                try {
                    // Test LessonController files method
                    $controller = app(\App\Http\Controllers\LessonController::class);
                    $response = $controller->files($lesson);
                    
                    $this->info("    ✅ Lesson ID {$lesson->id}: OK");
                    
                    Log::info('TestAllLessonFiles: Lesson files test passed', [
                        'lesson_id' => $lesson->id,
                        'lesson_title' => $lesson->title,
                        'admin_user_id' => $admin->id
                    ]);
                    
                } catch (\Exception $e) {
                    $this->error("    ❌ Lesson ID {$lesson->id}: Failed - " . $e->getMessage());
                    
                    Log::error('TestAllLessonFiles: Lesson files test failed', [
                        'lesson_id' => $lesson->id,
                        'lesson_title' => $lesson->title,
                        'admin_user_id' => $admin->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            // Logout
            Auth::logout();
            $this->info('✅ Logged out');

            $this->info('✅ All lesson files routes test completed!');
            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Test failed: ' . $e->getMessage());
            Log::error('TestAllLessonFiles: Fatal error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}