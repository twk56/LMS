<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Queue;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $startTime = microtime(true);
        
        $checks = [
            'app' => $this->checkApp(),
            'db' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
            'queue' => $this->checkQueue(),
        ];
        
        $totalTime = round((microtime(true) - $startTime) * 1000, 2);
        
        $allHealthy = collect($checks)->every(fn($check) => $check['status'] === 'ok');
        
        return response()->json([
            'app' => config('app.name'),
            'version' => app()->version(),
            'timestamp' => now()->toISOString(),
            'response_time_ms' => $totalTime,
            'status' => $allHealthy ? 'healthy' : 'unhealthy',
            'checks' => $checks,
        ], $allHealthy ? 200 : 503);
    }
    
    private function checkApp(): array
    {
        return [
            'status' => 'ok',
            'message' => 'Application is running',
            'environment' => config('app.env'),
            'debug' => config('app.debug'),
        ];
    }
    
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            return [
                'status' => 'ok',
                'message' => 'Database connection successful',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'fail',
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ];
        }
    }
    
    private function checkRedis(): array
    {
        try {
            Redis::connection()->ping();
            return [
                'status' => 'ok',
                'message' => 'Redis connection successful',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'fail',
                'message' => 'Redis connection failed: ' . $e->getMessage() . '. Check REDIS_HOST, REDIS_PORT, and REDIS_PASSWORD in .env',
            ];
        }
    }
    
    private function checkQueue(): array
    {
        try {
            // Simple queue check - try to get the default queue connection
            $connection = Queue::connection();
            return [
                'status' => 'ok',
                'message' => 'Queue connection successful',
                'driver' => config('queue.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'fail',
                'message' => 'Queue connection failed: ' . $e->getMessage(),
            ];
        }
    }
}
