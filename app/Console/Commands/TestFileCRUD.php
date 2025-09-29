<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Lesson;
use App\Models\LessonFile;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TestFileCRUD extends Command
{
    protected $signature = 'test:file-crud {lesson_id}';
    protected $description = 'Test file CRUD operations';

    public function handle()
    {
        $lessonId = $this->argument('lesson_id');
        $this->info("🧪 Testing File CRUD for Lesson ID: {$lessonId}");
        
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

            // Test CREATE
            $this->line("\n📁 Testing CREATE operation...");
            try {
                $testFile = LessonFile::create([
                    'lesson_id' => $lesson->id,
                    'filename' => 'test-file-' . time() . '.txt',
                    'original_name' => 'test-file.txt',
                    'file_path' => 'lesson-files/' . $lesson->id . '/test-file.txt',
                    'file_type' => 'document',
                    'mime_type' => 'text/plain',
                    'file_size' => 1024,
                    'title' => 'Test File',
                    'description' => 'This is a test file',
                    'order' => 0,
                    'is_active' => true,
                ]);

                $this->info("    ✅ CREATE: File created with ID {$testFile->id}");
                
                Log::info('TestFileCRUD: CREATE test passed', [
                    'lesson_id' => $lesson->id,
                    'file_id' => $testFile->id,
                    'admin_user_id' => $admin->id
                ]);

            } catch (\Exception $e) {
                $this->error("    ❌ CREATE: Failed - " . $e->getMessage());
                Log::error('TestFileCRUD: CREATE test failed', [
                    'lesson_id' => $lesson->id,
                    'admin_user_id' => $admin->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return 1;
            }

            // Test READ
            $this->line("\n📖 Testing READ operation...");
            try {
                $files = $lesson->files;
                $this->info("    ✅ READ: Found {$files->count()} files");
                
                foreach ($files as $file) {
                    $this->line("      - {$file->title} ({$file->file_type})");
                }
                
                Log::info('TestFileCRUD: READ test passed', [
                    'lesson_id' => $lesson->id,
                    'files_count' => $files->count(),
                    'admin_user_id' => $admin->id
                ]);

            } catch (\Exception $e) {
                $this->error("    ❌ READ: Failed - " . $e->getMessage());
                Log::error('TestFileCRUD: READ test failed', [
                    'lesson_id' => $lesson->id,
                    'admin_user_id' => $admin->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return 1;
            }

            // Test UPDATE
            $this->line("\n✏️ Testing UPDATE operation...");
            try {
                $testFile->update([
                    'title' => 'Updated Test File',
                    'description' => 'This is an updated test file',
                    'order' => 1,
                ]);

                $this->info("    ✅ UPDATE: File updated successfully");
                
                Log::info('TestFileCRUD: UPDATE test passed', [
                    'lesson_id' => $lesson->id,
                    'file_id' => $testFile->id,
                    'admin_user_id' => $admin->id
                ]);

            } catch (\Exception $e) {
                $this->error("    ❌ UPDATE: Failed - " . $e->getMessage());
                Log::error('TestFileCRUD: UPDATE test failed', [
                    'lesson_id' => $lesson->id,
                    'file_id' => $testFile->id,
                    'admin_user_id' => $admin->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return 1;
            }

            // Test DELETE
            $this->line("\n🗑️ Testing DELETE operation...");
            try {
                $fileId = $testFile->id;
                $testFile->delete();

                $this->info("    ✅ DELETE: File deleted successfully");
                
                Log::info('TestFileCRUD: DELETE test passed', [
                    'lesson_id' => $lesson->id,
                    'file_id' => $fileId,
                    'admin_user_id' => $admin->id
                ]);

            } catch (\Exception $e) {
                $this->error("    ❌ DELETE: Failed - " . $e->getMessage());
                Log::error('TestFileCRUD: DELETE test failed', [
                    'lesson_id' => $lesson->id,
                    'file_id' => $testFile->id,
                    'admin_user_id' => $admin->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return 1;
            }

            // Logout
            Auth::logout();
            $this->info("✅ Logged out");

            $this->info("\n✅ File CRUD test completed successfully!");
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Test failed: " . $e->getMessage());
            Log::error('TestFileCRUD: Fatal error', [
                'lesson_id' => $lessonId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}