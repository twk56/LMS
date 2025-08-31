<?php

namespace App\Http\Controllers;

use App\Services\AdvancedAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdvancedAnalyticsController extends Controller
{
    public function __construct(
        private AdvancedAnalyticsService $advancedAnalyticsService
    ) {}

    public function dashboard()
    {
        $predictiveInsights = $this->advancedAnalyticsService->getPredictiveInsights();
        $mlInsights = $this->advancedAnalyticsService->getMachineLearningInsights();
        $advancedReports = $this->advancedAnalyticsService->getAdvancedReports();

        return Inertia::render('AdvancedAnalytics/Dashboard', [
            'predictiveInsights' => $predictiveInsights,
            'mlInsights' => $mlInsights,
            'advancedReports' => $advancedReports,
        ]);
    }

    public function predictiveInsights()
    {
        $insights = $this->advancedAnalyticsService->getPredictiveInsights();

        return Inertia::render('AdvancedAnalytics/PredictiveInsights', [
            'insights' => $insights,
        ]);
    }

    public function machineLearning()
    {
        $insights = $this->advancedAnalyticsService->getMachineLearningInsights();

        return Inertia::render('AdvancedAnalytics/MachineLearning', [
            'insights' => $insights,
        ]);
    }

    public function advancedReports()
    {
        $reports = $this->advancedAnalyticsService->getAdvancedReports();

        return Inertia::render('AdvancedAnalytics/AdvancedReports', [
            'reports' => $reports,
        ]);
    }

    public function apiPredictiveInsights()
    {
        return response()->json([
            'data' => $this->advancedAnalyticsService->getPredictiveInsights(),
        ]);
    }

    public function apiMachineLearning()
    {
        return response()->json([
            'data' => $this->advancedAnalyticsService->getMachineLearningInsights(),
        ]);
    }

    public function apiAdvancedReports()
    {
        return response()->json([
            'data' => $this->advancedAnalyticsService->getAdvancedReports(),
        ]);
    }
}
