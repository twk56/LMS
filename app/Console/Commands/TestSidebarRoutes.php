<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Http\Controllers\UserProgressController;
use App\Http\Controllers\MyCoursesController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\SimpleChatController;

class TestSidebarRoutes extends Command
{
    protected $signature = 'test:sidebar-routes';
    protected $description = 'Test sidebar routes functionality';

    public function handle()
    {
        $this->info('Testing Sidebar Routes...');
        
        try {
            // Test User Progress Controller
            $this->info('Testing UserProgressController...');
            $user = User::where('role', 'student')->first();
            if ($user) {
                Auth::login($user);
                $controller = new UserProgressController();
                $response = $controller->index();
                $this->info('✅ UserProgressController: OK');
                Log::info('TestSidebarRoutes: UserProgressController test passed', [
                    'user_id' => $user->id,
                    'user_email' => $user->email
                ]);
                Auth::logout();
            } else {
                $this->warn('⚠️ No student user found for testing');
            }

            // Test My Courses Controller
            $this->info('Testing MyCoursesController...');
            if ($user) {
                Auth::login($user);
                $controller = new MyCoursesController();
                $response = $controller->index();
                $this->info('✅ MyCoursesController: OK');
                Log::info('TestSidebarRoutes: MyCoursesController test passed', [
                    'user_id' => $user->id,
                    'user_email' => $user->email
                ]);
                Auth::logout();
            }

            // Test Admin User Controller
            $this->info('Testing Admin\UserController...');
            $admin = User::where('role', 'admin')->first();
            if ($admin) {
                Auth::login($admin);
                $controller = new AdminUserController();
                $response = $controller->index();
                $this->info('✅ Admin\UserController: OK');
                Log::info('TestSidebarRoutes: Admin\UserController test passed', [
                    'admin_id' => $admin->id,
                    'admin_email' => $admin->email
                ]);
                Auth::logout();
            } else {
                $this->warn('⚠️ No admin user found for testing');
            }

            // Test Simple Chat Controller
            $this->info('Testing SimpleChatController...');
            if ($user) {
                Auth::login($user);
                $controller = new SimpleChatController();
                $response = $controller->index();
                $this->info('✅ SimpleChatController: OK');
                Log::info('TestSidebarRoutes: SimpleChatController test passed', [
                    'user_id' => $user->id,
                    'user_email' => $user->email
                ]);
                Auth::logout();
            }

            $this->info('✅ All sidebar route tests completed successfully!');
            Log::info('TestSidebarRoutes: All tests completed successfully');

        } catch (\Exception $e) {
            $this->error('❌ Test failed: ' . $e->getMessage());
            Log::error('TestSidebarRoutes: Test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}