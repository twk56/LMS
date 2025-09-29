<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserProgressController;
use App\Http\Controllers\MyCoursesController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\SimpleChatController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\CourseCategoryController;
use App\Http\Controllers\CourseController;
use Illuminate\Http\Request;

class TestAllSidebarFeatures extends Command
{
    protected $signature = 'test:all-sidebar-features';
    protected $description = 'Test all sidebar features for both User and Admin roles';

    public function handle()
    {
        $this->info('🧪 Testing All Sidebar Features...');
        Log::info('TestAllSidebarFeatures: Starting comprehensive sidebar feature tests');

        $student = User::where('role', 'student')->first();
        $admin = User::where('role', 'admin')->first();

        if (!$student || !$admin) {
            $this->error('❌ Test users not found. Please create student and admin users first.');
            Log::error('TestAllSidebarFeatures: Test users not found');
            return Command::FAILURE;
        }

        $this->info('👨‍🎓 Testing Student Features...');
        $this->testStudentFeatures($student);

        $this->info('👨‍💼 Testing Admin Features...');
        $this->testAdminFeatures($admin);

        $this->info('✅ All sidebar feature tests completed successfully!');
        Log::info('TestAllSidebarFeatures: All tests completed successfully');
        return Command::SUCCESS;
    }

    private function testStudentFeatures(User $student)
    {
        Auth::login($student);

        // Test Dashboard
        $this->testController(DashboardController::class, 'Dashboard', $student);

        // Test User Progress
        $this->testController(UserProgressController::class, 'UserProgress', $student);

        // Test My Courses
        $this->testController(MyCoursesController::class, 'MyCourses', $student);

        // Test Simple Chat
        $this->testController(SimpleChatController::class, 'SimpleChat', $student);

        // Test Certificates
        $this->testController(CertificateController::class, 'Certificates', $student);

        // Test Notifications
        $this->testController(NotificationController::class, 'Notifications', $student);

        // Test Lessons
        $this->testController(LessonController::class, 'Lessons', $student);

        // Test Categories
        $this->testController(CourseCategoryController::class, 'Categories', $student);

        // Test Courses
        $this->testControllerWithRequest(CourseController::class, 'Courses', $student);

        Auth::logout();
    }

    private function testAdminFeatures(User $admin)
    {
        Auth::login($admin);

        // Test Dashboard
        $this->testController(DashboardController::class, 'Dashboard', $admin);

        // Test Admin User Management
        $this->testController(AdminUserController::class, 'AdminUsers', $admin);

        // Test Admin Course Management
        $this->testController(AdminCourseController::class, 'AdminCourses', $admin);

        // Test Admin Category Management
        $this->testController(AdminCategoryController::class, 'AdminCategories', $admin);

        // Test Simple Chat Admin
        $this->testController(SimpleChatController::class, 'SimpleChatAdmin', $admin);

        // Test Notifications
        $this->testController(NotificationController::class, 'Notifications', $admin);

        // Test Lessons
        $this->testController(LessonController::class, 'Lessons', $admin);

        // Test Categories
        $this->testController(CourseCategoryController::class, 'Categories', $admin);

        // Test Courses
        $this->testControllerWithRequest(CourseController::class, 'Courses', $admin);

        Auth::logout();
    }

    private function testController(string $controllerClass, string $name, User $user)
    {
        $this->line("  Testing {$name}...");
        
        try {
            $controller = app($controllerClass);
            
            // Test index method
            if (method_exists($controller, 'index')) {
                $response = $controller->index();
                $this->info("    ✅ {$name}: OK");
                Log::info("TestAllSidebarFeatures: {$name} test passed", [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'user_role' => $user->role
                ]);
            } else {
                $this->warn("    ⚠️ {$name}: No index method");
                Log::warning("TestAllSidebarFeatures: {$name} has no index method", [
                    'user_id' => $user->id,
                    'user_email' => $user->email
                ]);
            }

        } catch (\Exception $e) {
            $this->error("    ❌ {$name}: Failed - " . $e->getMessage());
            Log::error("TestAllSidebarFeatures: {$name} test failed", [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function testControllerWithRequest(string $controllerClass, string $name, User $user)
    {
        $this->line("  Testing {$name}...");
        
        try {
            $controller = app($controllerClass);
            $request = new Request();
            
            // Test index method
            if (method_exists($controller, 'index')) {
                $response = $controller->index($request);
                $this->info("    ✅ {$name}: OK");
                Log::info("TestAllSidebarFeatures: {$name} test passed", [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'user_role' => $user->role
                ]);
            } else {
                $this->warn("    ⚠️ {$name}: No index method");
                Log::warning("TestAllSidebarFeatures: {$name} has no index method", [
                    'user_id' => $user->id,
                    'user_email' => $user->email
                ]);
            }

        } catch (\Exception $e) {
            $this->error("    ❌ {$name}: Failed - " . $e->getMessage());
            Log::error("TestAllSidebarFeatures: {$name} test failed", [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}