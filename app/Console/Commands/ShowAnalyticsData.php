<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\AnalyticsController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ShowAnalyticsData extends Command
{
    protected $signature = 'analytics:show';
    protected $description = 'Show real analytics data from database';

    public function handle()
    {
        $this->info('📊 Showing Real Analytics Data...');
        
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

            // Get Analytics Controller
            $controller = app(AnalyticsController::class);
            
            // Use reflection to call private method
            $reflection = new \ReflectionClass($controller);
            $method = $reflection->getMethod('getRealAnalyticsData');
            $method->setAccessible(true);
            
            $analytics = $method->invoke($controller);
            
            // Display basic stats
            $this->line('');
            $this->info('📈 Basic Statistics:');
            $this->line("  📚 Total Courses: {$analytics['total_courses']}");
            $this->line("  👥 Total Users: {$analytics['total_users']}");
            $this->line("  📖 Total Lessons: {$analytics['total_lessons']}");
            $this->line("  🏷️  Total Categories: {$analytics['total_categories']}");
            $this->line("  📝 Total Enrollments: {$analytics['total_enrollments']}");
            $this->line("  💬 Total Chat Messages: {$analytics['total_chat_messages']}");
            $this->line("  🔥 Active Users: {$analytics['active_users']}");
            $this->line("  ✅ Completion Rate: {$analytics['completion_rate']}%");
            
            // Display recent activities
            $this->line('');
            $this->info('🔄 Recent Activities:');
            foreach ($analytics['recent_activities'] as $index => $activity) {
                $this->line("  " . ($index + 1) . ". {$activity['description']} - {$activity['user_name']} ({$activity['created_at']})");
            }
            
            // Display course stats
            $this->line('');
            $this->info('📚 Course Statistics:');
            foreach ($analytics['course_stats'] as $index => $course) {
                $this->line("  " . ($index + 1) . ". {$course['title']} - {$course['students_count']} students - {$course['category']}");
            }
            
            // Logout
            Auth::logout();
            $this->info('✅ Logged out');

            $this->info('✅ Analytics data display completed!');
            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            return 1;
        }
    }
}