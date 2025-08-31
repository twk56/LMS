<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    public function dashboard()
    {
        $stats = $this->analyticsService->getDashboardStats();

        return Inertia::render('Analytics/Dashboard', [
            'stats' => $stats,
        ]);
    }

    public function courseAnalytics(int $courseId)
    {
        $analytics = $this->analyticsService->getCourseAnalytics($courseId);

        return Inertia::render('Analytics/CourseAnalytics', [
            'analytics' => $analytics,
        ]);
    }

    public function userProgress(int $userId)
    {
        $progress = $this->analyticsService->getUserProgress($userId);

        return Inertia::render('Analytics/UserProgress', [
            'progress' => $progress,
        ]);
    }

    public function apiDashboard()
    {
        return response()->json([
            'data' => $this->analyticsService->getDashboardStats(),
        ]);
    }

    public function apiCourseAnalytics(int $courseId)
    {
        return response()->json([
            'data' => $this->analyticsService->getCourseAnalytics($courseId),
        ]);
    }

    public function apiUserProgress(int $userId)
    {
        return response()->json([
            'data' => $this->analyticsService->getUserProgress($userId),
        ]);
    }
}
