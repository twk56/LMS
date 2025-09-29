<?php

namespace App\Console\Commands;

use App\Services\PerformanceOptimizationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PerformanceMonitor extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'performance:monitor {--clear-cache : Clear all performance caches}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor and optimize application performance';

    /**
     * Execute the console command.
     */
    public function handle(PerformanceOptimizationService $performanceService)
    {
        if ($this->option('clear-cache')) {
            $this->clearPerformanceCaches($performanceService);
            return;
        }

        $this->info('🔍 Performance Monitoring Report');
        $this->newLine();

        // Check database performance
        $this->checkDatabasePerformance();

        // Check cache performance
        $this->checkCachePerformance();

        // Check slow queries
        $this->checkSlowQueries();

        // Performance recommendations
        $this->showRecommendations();
    }

    private function checkDatabasePerformance()
    {
        $this->info('📊 Database Performance:');
        
        // Check table sizes
        $tables = ['users', 'courses', 'lessons', 'course_user', 'lesson_progress', 'quiz_attempts'];
        
        foreach ($tables as $table) {
            try {
                $count = DB::table($table)->count();
                $this->line("  • {$table}: {$count} records");
            } catch (\Exception $e) {
                $this->line("  • {$table}: Table not found");
            }
        }

        $this->newLine();
    }

    private function checkCachePerformance()
    {
        $this->info('💾 Cache Performance:');
        
        $cacheKeys = [
            'dashboard_stats',
        ];

        $totalKeys = 0;
        foreach ($cacheKeys as $key) {
            $exists = Cache::has($key);
            $this->line("  • {$key}: " . ($exists ? 'Cached' : 'Not cached'));
            if ($exists) $totalKeys++;
        }

        $this->line("  • Total cached items: {$totalKeys}");
        $this->newLine();
    }

    private function checkSlowQueries()
    {
        $this->info('🐌 Slow Query Analysis:');
        
        // Enable query logging
        DB::enableQueryLog();
        
        // Simulate some common operations
        $this->line('  • Testing dashboard queries...');
        $performanceService = app(PerformanceOptimizationService::class);
        $performanceService->getOptimizedDashboardStats();
        
        $this->line('  • Testing course listing...');
        $performanceService->getOptimizedCourses();
        
        // Get query log
        $queries = DB::getQueryLog();
        $slowQueries = array_filter($queries, function ($query) {
            return $query['time'] > 50; // Queries taking more than 50ms
        });

        if (empty($slowQueries)) {
            $this->line('  ✅ No slow queries detected');
        } else {
            $this->line("  ⚠️  Found " . count($slowQueries) . " slow queries:");
            foreach ($slowQueries as $query) {
                $this->line("    • Time: {$query['time']}ms");
                $this->line("    • Query: " . substr($query['query'], 0, 100) . '...');
            }
        }

        $this->newLine();
    }

    private function showRecommendations()
    {
        $this->info('💡 Performance Recommendations:');
        
        $recommendations = [
            'Enable Redis for better cache performance',
            'Consider database connection pooling',
            'Implement query result caching for heavy operations',
            'Use database indexes for frequently queried columns',
            'Consider implementing database read replicas for read-heavy operations',
            'Monitor memory usage and optimize PHP memory limits',
            'Use CDN for static assets',
            'Implement lazy loading for large datasets',
        ];

        foreach ($recommendations as $i => $recommendation) {
            $this->line("  " . ($i + 1) . ". {$recommendation}");
        }

        $this->newLine();
    }

    private function clearPerformanceCaches(PerformanceOptimizationService $performanceService)
    {
        $this->info('🧹 Clearing Performance Caches...');
        
        $performanceService->clearDashboardCache();
        
        // Clear user-specific caches
        $users = DB::table('users')->pluck('id');
        foreach ($users as $userId) {
            $performanceService->clearUserCache($userId);
        }
        
        // Clear course-specific caches
        $courses = DB::table('courses')->pluck('id');
        foreach ($courses as $courseId) {
            $performanceService->clearCourseCache($courseId);
        }
        
        $this->info('✅ All performance caches cleared!');
    }
}