<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PerformanceService
{
    public function getSystemMetrics(): array
    {
        return [
            'database_connections' => $this->getDatabaseConnections(),
            'cache_hit_rate' => $this->getCacheHitRate(),
            'memory_usage' => $this->getMemoryUsage(),
            'disk_usage' => $this->getDiskUsage(),
            'response_times' => $this->getAverageResponseTime(),
            'error_rate' => $this->getErrorRate(),
        ];
    }

    public function getDatabasePerformance(): array
    {
        $startTime = microtime(true);
        
        // Test database connection
        DB::connection()->getPdo();
        
        $connectionTime = (microtime(true) - $startTime) * 1000;

        return [
            'connection_time_ms' => round($connectionTime, 2),
            'active_connections' => DB::connection()->select('SHOW STATUS LIKE "Threads_connected"')[0]->Value ?? 0,
            'slow_queries' => $this->getSlowQueries(),
            'table_sizes' => $this->getTableSizes(),
        ];
    }

    public function getCachePerformance(): array
    {
        $testKey = 'performance_test_' . time();
        $testValue = 'test_value';

        // Test cache write
        $writeStart = microtime(true);
        Cache::put($testKey, $testValue, 60);
        $writeTime = (microtime(true) - $writeStart) * 1000;

        // Test cache read
        $readStart = microtime(true);
        $retrievedValue = Cache::get($testKey);
        $readTime = (microtime(true) - $readStart) * 1000;

        // Clean up
        Cache::forget($testKey);

        return [
            'write_time_ms' => round($writeTime, 2),
            'read_time_ms' => round($readTime, 2),
            'cache_hit_rate' => $this->getCacheHitRate(),
            'cache_size' => $this->getCacheSize(),
        ];
    }

    public function logPerformanceMetrics(): void
    {
        $metrics = $this->getSystemMetrics();
        
        Log::info('Performance Metrics', [
            'timestamp' => Carbon::now()->toISOString(),
            'metrics' => $metrics,
        ]);
    }

    public function getSlowQueries(): array
    {
        try {
            return DB::select("
                SELECT 
                    sql_text,
                    COUNT(*) as execution_count,
                    AVG(duration) as avg_duration,
                    MAX(duration) as max_duration
                FROM mysql.slow_log 
                WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 DAY)
                GROUP BY sql_text
                ORDER BY avg_duration DESC
                LIMIT 10
            ");
        } catch (\Exception $e) {
            return [];
        }
    }

    public function getTableSizes(): array
    {
        try {
            return DB::select("
                SELECT 
                    table_name,
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb'
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
                ORDER BY (data_length + index_length) DESC
                LIMIT 10
            ");
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getDatabaseConnections(): int
    {
        try {
            $result = DB::select('SHOW STATUS LIKE "Threads_connected"');
            return $result[0]->Value ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getCacheHitRate(): float
    {
        // This would need to be implemented based on your cache driver
        // For Redis, you could use INFO stats command
        return 0.0;
    }

    private function getMemoryUsage(): array
    {
        $memoryLimit = ini_get('memory_limit');
        $memoryUsage = memory_get_usage(true);
        $peakMemoryUsage = memory_get_peak_usage(true);

        return [
            'current_usage_mb' => round($memoryUsage / 1024 / 1024, 2),
            'peak_usage_mb' => round($peakMemoryUsage / 1024 / 1024, 2),
            'limit' => $memoryLimit,
            'usage_percentage' => $this->calculateMemoryUsagePercentage($memoryLimit, $memoryUsage),
        ];
    }

    private function getDiskUsage(): array
    {
        $path = storage_path();
        $totalSpace = disk_total_space($path);
        $freeSpace = disk_free_space($path);
        $usedSpace = $totalSpace - $freeSpace;

        return [
            'total_gb' => round($totalSpace / 1024 / 1024 / 1024, 2),
            'used_gb' => round($usedSpace / 1024 / 1024 / 1024, 2),
            'free_gb' => round($freeSpace / 1024 / 1024 / 1024, 2),
            'usage_percentage' => round(($usedSpace / $totalSpace) * 100, 2),
        ];
    }

    private function getAverageResponseTime(): float
    {
        // This would need to be implemented with actual request timing
        // You could use Laravel's built-in timing or a custom middleware
        return 0.0;
    }

    private function getErrorRate(): float
    {
        // This would need to be implemented based on your error logging
        // You could count errors in the logs or use a monitoring service
        return 0.0;
    }

    private function getCacheSize(): int
    {
        // This would need to be implemented based on your cache driver
        return 0;
    }

    private function calculateMemoryUsagePercentage(string $limit, int $usage): float
    {
        $limitBytes = $this->convertToBytes($limit);
        return $limitBytes > 0 ? round(($usage / $limitBytes) * 100, 2) : 0;
    }

    private function convertToBytes(string $size): int
    {
        $unit = strtolower(substr($size, -1));
        $value = (int) substr($size, 0, -1);

        return match($unit) {
            'k' => $value * 1024,
            'm' => $value * 1024 * 1024,
            'g' => $value * 1024 * 1024 * 1024,
            default => $value,
        };
    }
}
