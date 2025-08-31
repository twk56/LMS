<?php

namespace App\Http\Controllers;

use App\Services\AIMLService;
use App\Models\User;
use App\Models\Course;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AIMLController extends Controller
{
    public function __construct(
        private AIMLService $aimlService
    ) {}

    public function dashboard()
    {
        $user = Auth::user();
        $tenant = app('current_tenant');
        
        $personalizedRecommendations = $this->aimlService->generatePersonalizedRecommendations($user);
        $learningPatterns = $this->aimlService->analyzeLearningPatterns($user);
        $sentimentAnalysis = $this->aimlService->analyzeSentiment($user);
        
        if ($tenant) {
            $predictiveInsights = $this->aimlService->generatePredictiveInsights($tenant);
        } else {
            $predictiveInsights = null;
        }

        return Inertia::render('AIML/Dashboard', [
            'personalizedRecommendations' => $personalizedRecommendations,
            'learningPatterns' => $learningPatterns,
            'sentimentAnalysis' => $sentimentAnalysis,
            'predictiveInsights' => $predictiveInsights,
        ]);
    }

    public function personalizedRecommendations()
    {
        $user = Auth::user();
        $recommendations = $this->aimlService->generatePersonalizedRecommendations($user);

        return Inertia::render('AIML/PersonalizedRecommendations', [
            'recommendations' => $recommendations,
        ]);
    }

    public function performancePrediction(Request $request, Course $course)
    {
        $user = Auth::user();
        $prediction = $this->aimlService->predictUserPerformance($user, $course);

        return Inertia::render('AIML/PerformancePrediction', [
            'course' => $course,
            'prediction' => $prediction,
        ]);
    }

    public function learningPatterns()
    {
        $user = Auth::user();
        $patterns = $this->aimlService->analyzeLearningPatterns($user);

        return Inertia::render('AIML/LearningPatterns', [
            'patterns' => $patterns,
        ]);
    }

    public function predictiveInsights()
    {
        $tenant = app('current_tenant');
        
        if (!$tenant) {
            return redirect()->route('dashboard')->with('error', 'Tenant not found');
        }

        $insights = $this->aimlService->generatePredictiveInsights($tenant);

        return Inertia::render('AIML/PredictiveInsights', [
            'insights' => $insights,
        ]);
    }

    public function learningPathOptimization(Request $request)
    {
        $user = Auth::user();
        $goals = $request->validate([
            'goals' => 'required|array',
            'goals.*' => 'string',
        ])['goals'];

        $optimizedPath = $this->aimlService->optimizeLearningPath($user, $goals);

        return Inertia::render('AIML/LearningPathOptimization', [
            'goals' => $goals,
            'optimizedPath' => $optimizedPath,
        ]);
    }

    public function sentimentAnalysis()
    {
        $user = Auth::user();
        $sentiment = $this->aimlService->analyzeSentiment($user);

        return Inertia::render('AIML/SentimentAnalysis', [
            'sentiment' => $sentiment,
        ]);
    }

    public function apiPersonalizedRecommendations()
    {
        $user = Auth::user();
        $recommendations = $this->aimlService->generatePersonalizedRecommendations($user);
        
        return response()->json([
            'data' => $recommendations,
        ]);
    }

    public function apiPerformancePrediction(Request $request, Course $course)
    {
        $user = Auth::user();
        $prediction = $this->aimlService->predictUserPerformance($user, $course);
        
        return response()->json([
            'data' => $prediction,
        ]);
    }

    public function apiLearningPatterns()
    {
        $user = Auth::user();
        $patterns = $this->aimlService->analyzeLearningPatterns($user);
        
        return response()->json([
            'data' => $patterns,
        ]);
    }

    public function apiPredictiveInsights()
    {
        $tenant = app('current_tenant');
        
        if (!$tenant) {
            return response()->json([
                'error' => 'Tenant not found',
            ], 404);
        }

        $insights = $this->aimlService->generatePredictiveInsights($tenant);
        
        return response()->json([
            'data' => $insights,
        ]);
    }

    public function apiLearningPathOptimization(Request $request)
    {
        $user = Auth::user();
        $goals = $request->validate([
            'goals' => 'required|array',
            'goals.*' => 'string',
        ])['goals'];

        $optimizedPath = $this->aimlService->optimizeLearningPath($user, $goals);
        
        return response()->json([
            'data' => $optimizedPath,
        ]);
    }

    public function apiSentimentAnalysis()
    {
        $user = Auth::user();
        $sentiment = $this->aimlService->analyzeSentiment($user);
        
        return response()->json([
            'data' => $sentiment,
        ]);
    }

    public function apiUserRecommendations(User $user)
    {
        $recommendations = $this->aimlService->generatePersonalizedRecommendations($user);
        
        return response()->json([
            'data' => $recommendations,
        ]);
    }

    public function apiCourseRecommendations(Course $course)
    {
        $user = Auth::user();
        $recommendations = $this->aimlService->generatePersonalizedRecommendations($user);
        
        // Filter recommendations for similar courses
        $similarCourses = array_filter($recommendations['recommended_courses'], function ($rec) use ($course) {
            return $rec['category'] === $course->category || $rec['difficulty'] === $course->difficulty;
        });
        
        return response()->json([
            'data' => [
                'similar_courses' => array_values($similarCourses),
                'course_insights' => [
                    'difficulty_level' => $course->difficulty ?? 'intermediate',
                    'estimated_completion_time' => '4-6 weeks',
                    'success_rate' => 0.85,
                    'user_satisfaction' => 4.5,
                ],
            ],
        ]);
    }

    public function apiTenantInsights(Tenant $tenant)
    {
        $insights = $this->aimlService->generatePredictiveInsights($tenant);
        
        return response()->json([
            'data' => $insights,
        ]);
    }

    public function apiLearningAnalytics()
    {
        $user = Auth::user();
        $patterns = $this->aimlService->analyzeLearningPatterns($user);
        $sentiment = $this->aimlService->analyzeSentiment($user);
        
        return response()->json([
            'data' => [
                'learning_patterns' => $patterns,
                'sentiment_analysis' => $sentiment,
                'engagement_metrics' => [
                    'study_frequency' => $patterns['optimal_study_times']['frequency'] ?? 'daily',
                    'average_session_duration' => $patterns['attention_span'] ?? 45,
                    'completion_rate' => 0.85,
                    'satisfaction_score' => $sentiment['satisfaction_score'] ?? 4.5,
                ],
            ],
        ]);
    }
}
