<?php

namespace App\Http\Controllers;

use App\Services\PerformanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerformanceController extends Controller
{
    public function __construct(
        private PerformanceService $performanceService
    ) {}

    public function dashboard()
    {
        $metrics = $this->performanceService->getSystemMetrics();
        $dbPerformance = $this->performanceService->getDatabasePerformance();
        $cachePerformance = $this->performanceService->getCachePerformance();

        return Inertia::render('Performance/Dashboard', [
            'metrics' => $metrics,
            'database' => $dbPerformance,
            'cache' => $cachePerformance,
        ]);
    }

    public function apiMetrics()
    {
        return response()->json([
            'data' => [
                'system' => $this->performanceService->getSystemMetrics(),
                'database' => $this->performanceService->getDatabasePerformance(),
                'cache' => $this->performanceService->getCachePerformance(),
            ],
        ]);
    }

    public function logMetrics()
    {
        $this->performanceService->logPerformanceMetrics();
        
        return response()->json([
            'message' => 'Performance metrics logged successfully',
        ]);
    }
}
