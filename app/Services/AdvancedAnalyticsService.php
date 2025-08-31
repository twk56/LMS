<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdvancedAnalyticsService
{
    public function getPredictiveInsights(): array
    {
        return [
            'course_completion_prediction' => $this->predictCourseCompletion(),
            'user_engagement_forecast' => $this->forecastUserEngagement(),
            'revenue_prediction' => $this->predictRevenue(),
            'dropout_risk_assessment' => $this->assessDropoutRisk(),
            'content_recommendations' => $this->generateContentRecommendations(),
        ];
    }

    public function getMachineLearningInsights(): array
    {
        return [
            'user_segmentation' => $this->segmentUsers(),
            'content_effectiveness' => $this->analyzeContentEffectiveness(),
            'learning_patterns' => $this->analyzeLearningPatterns(),
            'performance_correlation' => $this->analyzePerformanceCorrelation(),
            'optimization_suggestions' => $this->generateOptimizationSuggestions(),
        ];
    }

    public function getAdvancedReports(): array
    {
        return [
            'learning_analytics' => $this->generateLearningAnalytics(),
            'engagement_metrics' => $this->calculateEngagementMetrics(),
            'retention_analysis' => $this->analyzeRetention(),
            'conversion_funnel' => $this->analyzeConversionFunnel(),
            'roi_analysis' => $this->calculateROI(),
        ];
    }

    private function generateLearningAnalytics(): array
    {
        return [
            'total_learning_hours' => $this->calculateTotalLearningHours(),
            'average_session_duration' => $this->calculateAverageSessionDuration(),
            'learning_velocity' => $this->calculateLearningVelocity(),
            'knowledge_retention_rate' => $this->calculateKnowledgeRetentionRate(),
        ];
    }

    private function calculateEngagementMetrics(): array
    {
        $users = User::with(['enrolledCourses', 'lessonProgress'])->get();
        
        return [
            'daily_active_users' => $this->calculateDailyActiveUsers(),
            'weekly_active_users' => $this->calculateWeeklyActiveUsers(),
            'monthly_active_users' => $this->calculateMonthlyActiveUsers(),
            'engagement_score' => $this->calculateOverallEngagementScore($users),
        ];
    }

    private function analyzeRetention(): array
    {
        return [
            'day_1_retention' => $this->calculateDay1Retention(),
            'day_7_retention' => $this->calculateDay7Retention(),
            'day_30_retention' => $this->calculateDay30Retention(),
            'churn_rate' => $this->calculateChurnRate(),
        ];
    }

    private function analyzeConversionFunnel(): array
    {
        return [
            'awareness' => $this->calculateAwarenessStage(),
            'interest' => $this->calculateInterestStage(),
            'consideration' => $this->calculateConsiderationStage(),
            'enrollment' => $this->calculateEnrollmentStage(),
            'completion' => $this->calculateCompletionStage(),
        ];
    }

    private function calculateROI(): array
    {
        return [
            'total_investment' => $this->calculateTotalInvestment(),
            'total_revenue' => $this->calculateTotalRevenue(),
            'roi_percentage' => $this->calculateROIPercentage(),
            'break_even_point' => $this->calculateBreakEvenPoint(),
        ];
    }

    // Additional helper methods for advanced reports
    private function calculateTotalLearningHours(): float
    {
        // Simulate calculation
        return 1250.5;
    }

    private function calculateAverageSessionDuration(): float
    {
        // Simulate calculation
        return 25.3;
    }

    private function calculateLearningVelocity(): float
    {
        // Simulate calculation
        return 2.1;
    }

    private function calculateKnowledgeRetentionRate(): float
    {
        // Simulate calculation
        return 78.5;
    }

    private function calculateDailyActiveUsers(): int
    {
        // Simulate calculation
        return 150;
    }

    private function calculateWeeklyActiveUsers(): int
    {
        // Simulate calculation
        return 450;
    }

    private function calculateMonthlyActiveUsers(): int
    {
        // Simulate calculation
        return 1200;
    }

    private function calculateOverallEngagementScore($users): float
    {
        // Simulate calculation
        return 72.3;
    }

    private function calculateDay1Retention(): float
    {
        // Simulate calculation
        return 85.2;
    }

    private function calculateDay7Retention(): float
    {
        // Simulate calculation
        return 65.8;
    }

    private function calculateDay30Retention(): float
    {
        // Simulate calculation
        return 45.3;
    }

    private function calculateChurnRate(): float
    {
        // Simulate calculation
        return 12.5;
    }

    private function calculateAwarenessStage(): int
    {
        // Simulate calculation
        return 5000;
    }

    private function calculateInterestStage(): int
    {
        // Simulate calculation
        return 2500;
    }

    private function calculateConsiderationStage(): int
    {
        // Simulate calculation
        return 1000;
    }

    private function calculateEnrollmentStage(): int
    {
        // Simulate calculation
        return 500;
    }

    private function calculateCompletionStage(): int
    {
        // Simulate calculation
        return 350;
    }

    private function calculateTotalInvestment(): float
    {
        // Simulate calculation
        return 50000.0;
    }

    private function calculateTotalRevenue(): float
    {
        // Simulate calculation
        return 75000.0;
    }

    private function calculateROIPercentage(): float
    {
        // Simulate calculation
        return 50.0;
    }

    private function calculateBreakEvenPoint(): string
    {
        // Simulate calculation
        return 'Month 8';
    }

    private function predictCourseCompletion(): array
    {
        $courses = Course::with(['students', 'lessons'])->get();
        $predictions = [];

        foreach ($courses as $course) {
            $totalStudents = $course->students->count();
            $completedStudents = $course->students->where('pivot.status', 'completed')->count();
            $completionRate = $totalStudents > 0 ? ($completedStudents / $totalStudents) * 100 : 0;
            
            // Simple prediction based on current completion rate and engagement
            $predictedCompletion = min(100, $completionRate * 1.2);
            
            $predictions[] = [
                'course_id' => $course->id,
                'course_title' => $course->title,
                'current_completion_rate' => round($completionRate, 2),
                'predicted_completion_rate' => round($predictedCompletion, 2),
                'confidence_level' => $this->calculateConfidenceLevel($totalStudents),
            ];
        }

        return $predictions;
    }

    private function forecastUserEngagement(): array
    {
        $users = User::with(['enrolledCourses', 'lessonProgress'])->get();
        $engagementForecast = [];

        foreach ($users as $user) {
            $totalCourses = $user->enrolledCourses->count();
            $completedLessons = $user->lessonProgress->whereNotNull('completed_at')->count();
            $totalLessons = $user->enrolledCourses->sum(function ($course) {
                return $course->lessons->count();
            });
            
            $engagementScore = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;
            $predictedEngagement = min(100, $engagementScore * 1.15);

            $engagementForecast[] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'current_engagement' => round($engagementScore, 2),
                'predicted_engagement' => round($predictedEngagement, 2),
                'engagement_trend' => $this->calculateEngagementTrend($user),
            ];
        }

        return $engagementForecast;
    }

    private function predictRevenue(): array
    {
        // Simulate revenue prediction based on course enrollments
        $courses = Course::with('students')->get();
        $revenuePrediction = [];

        foreach ($courses as $course) {
            $currentEnrollments = $course->students->count();
            $monthlyGrowth = 0.1; // 10% monthly growth
            $coursePrice = 100; // Simulated course price
            
            $currentRevenue = $currentEnrollments * $coursePrice;
            $predictedRevenue = $currentRevenue * (1 + $monthlyGrowth) * 12; // Annual prediction

            $revenuePrediction[] = [
                'course_id' => $course->id,
                'course_title' => $course->title,
                'current_revenue' => $currentRevenue,
                'predicted_annual_revenue' => round($predictedRevenue, 2),
                'growth_rate' => $monthlyGrowth * 100,
            ];
        }

        return $revenuePrediction;
    }

    private function assessDropoutRisk(): array
    {
        $users = User::with(['enrolledCourses', 'lessonProgress'])->get();
        $dropoutRisk = [];

        foreach ($users as $user) {
            $riskFactors = [];
            $totalRisk = 0;

            // Factor 1: Low engagement
            $engagement = $this->calculateUserEngagement($user);
            if ($engagement < 30) {
                $riskFactors[] = 'Low engagement';
                $totalRisk += 30;
            }

            // Factor 2: Long inactivity
            $lastActivity = $user->lessonProgress->max('updated_at');
            if ($lastActivity && $lastActivity->diffInDays(now()) > 30) {
                $riskFactors[] = 'Long inactivity';
                $totalRisk += 25;
            }

            // Factor 3: Failed quizzes
            $failedQuizzes = $user->quizAttempts()->where('score', '<', 70)->count();
            if ($failedQuizzes > 3) {
                $riskFactors[] = 'Multiple failed quizzes';
                $totalRisk += 20;
            }

            $dropoutRisk[] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'risk_score' => min(100, $totalRisk),
                'risk_level' => $this->getRiskLevel($totalRisk),
                'risk_factors' => $riskFactors,
                'recommendations' => $this->getDropoutPreventionRecommendations($riskFactors),
            ];
        }

        return $dropoutRisk;
    }

    private function generateContentRecommendations(): array
    {
        $courses = Course::with(['lessons', 'students'])->get();
        $recommendations = [];

        foreach ($courses as $course) {
            $courseRecommendations = [];

            // Analyze lesson completion rates
            foreach ($course->lessons as $lesson) {
                $completionRate = $this->calculateLessonCompletionRate($lesson);
                
                if ($completionRate < 50) {
                    $courseRecommendations[] = [
                        'type' => 'lesson_improvement',
                        'lesson_id' => $lesson->id,
                        'lesson_title' => $lesson->title,
                        'issue' => 'Low completion rate',
                        'suggestion' => 'Consider simplifying content or adding more interactive elements',
                    ];
                }
            }

            // Analyze quiz performance
            $quizPerformance = $this->analyzeQuizPerformance($course);
            if ($quizPerformance['average_score'] < 70) {
                $courseRecommendations[] = [
                    'type' => 'quiz_improvement',
                    'issue' => 'Low quiz scores',
                    'suggestion' => 'Review quiz difficulty and provide additional study materials',
                ];
            }

            $recommendations[] = [
                'course_id' => $course->id,
                'course_title' => $course->title,
                'recommendations' => $courseRecommendations,
            ];
        }

        return $recommendations;
    }

    private function segmentUsers(): array
    {
        $users = User::with(['enrolledCourses', 'lessonProgress'])->get();
        $segments = [
            'high_achievers' => [],
            'active_learners' => [],
            'casual_learners' => [],
            'at_risk' => [],
        ];

        foreach ($users as $user) {
            $engagement = $this->calculateUserEngagement($user);
            $completionRate = $this->calculateUserCompletionRate($user);
            $quizPerformance = $this->calculateUserQuizPerformance($user);

            if ($completionRate > 80 && $quizPerformance > 85) {
                $segments['high_achievers'][] = $user;
            } elseif ($engagement > 60) {
                $segments['active_learners'][] = $user;
            } elseif ($engagement < 30) {
                $segments['at_risk'][] = $user;
            } else {
                $segments['casual_learners'][] = $user;
            }
        }

        return [
            'high_achievers' => count($segments['high_achievers']),
            'active_learners' => count($segments['active_learners']),
            'casual_learners' => count($segments['casual_learners']),
            'at_risk' => count($segments['at_risk']),
            'total_users' => $users->count(),
        ];
    }

    private function analyzeContentEffectiveness(): array
    {
        $lessons = Lesson::with(['course', 'progress'])->get();
        $effectiveness = [];

        foreach ($lessons as $lesson) {
            $completionRate = $this->calculateLessonCompletionRate($lesson);
            $avgTimeSpent = $this->calculateAverageTimeSpent($lesson);
            $quizScores = $this->getQuizScoresAfterLesson($lesson);

            $effectiveness[] = [
                'lesson_id' => $lesson->id,
                'lesson_title' => $lesson->title,
                'course_title' => $lesson->course->title,
                'completion_rate' => $completionRate,
                'average_time_spent' => $avgTimeSpent,
                'average_quiz_score' => $quizScores['average'],
                'effectiveness_score' => $this->calculateEffectivenessScore($completionRate, $quizScores['average']),
                'recommendations' => $this->getContentRecommendations($completionRate, $quizScores['average']),
            ];
        }

        return $effectiveness;
    }

    private function analyzeLearningPatterns(): array
    {
        $users = User::with(['lessonProgress'])->get();
        $patterns = [];

        foreach ($users as $user) {
            $learningSessions = $user->lessonProgress()
                ->whereNotNull('completed_at')
                ->orderBy('completed_at')
                ->get();

            $patterns[] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'preferred_learning_time' => $this->analyzePreferredLearningTime($learningSessions),
                'learning_pace' => $this->analyzeLearningPace($learningSessions),
                'session_duration' => $this->analyzeSessionDuration($learningSessions),
                'content_preferences' => $this->analyzeContentPreferences($user),
            ];
        }

        return $patterns;
    }

    private function analyzePerformanceCorrelation(): array
    {
        $correlations = [];

        // Analyze correlation between engagement and quiz performance
        $users = User::with(['enrolledCourses', 'lessonProgress', 'quizAttempts'])->get();
        
        $engagementScores = [];
        $quizScores = [];

        foreach ($users as $user) {
            $engagement = $this->calculateUserEngagement($user);
            $quizPerformance = $this->calculateUserQuizPerformance($user);
            
            $engagementScores[] = $engagement;
            $quizScores[] = $quizPerformance;
        }

        $correlation = $this->calculateCorrelation($engagementScores, $quizScores);

        $correlations[] = [
            'factor_1' => 'User Engagement',
            'factor_2' => 'Quiz Performance',
            'correlation_coefficient' => $correlation,
            'strength' => $this->getCorrelationStrength($correlation),
            'interpretation' => $this->interpretCorrelation($correlation, 'engagement', 'quiz_performance'),
        ];

        return $correlations;
    }

    private function generateOptimizationSuggestions(): array
    {
        return [
            'course_optimization' => [
                'suggest_adaptive_learning' => true,
                'recommend_gamification' => true,
                'suggest_microlearning' => false,
            ],
            'content_optimization' => [
                'improve_video_quality' => true,
                'add_interactive_elements' => true,
                'optimize_reading_materials' => false,
            ],
            'user_experience' => [
                'implement_personalization' => true,
                'add_progress_tracking' => true,
                'improve_mobile_experience' => true,
            ],
            'performance_optimization' => [
                'implement_caching' => true,
                'optimize_database_queries' => true,
                'add_cdn' => false,
            ],
        ];
    }

    // Helper methods
    private function calculateConfidenceLevel(int $sampleSize): string
    {
        if ($sampleSize >= 100) return 'High';
        if ($sampleSize >= 50) return 'Medium';
        return 'Low';
    }

    private function calculateEngagementTrend(User $user): string
    {
        // Simulate trend calculation
        return 'Increasing';
    }

    private function calculateUserEngagement(User $user): float
    {
        $totalLessons = $user->enrolledCourses->sum(function ($course) {
            return $course->lessons->count();
        });
        
        $completedLessons = $user->lessonProgress->whereNotNull('completed_at')->count();
        
        return $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;
    }

    private function getRiskLevel(int $riskScore): string
    {
        if ($riskScore >= 70) return 'High';
        if ($riskScore >= 40) return 'Medium';
        return 'Low';
    }

    private function getDropoutPreventionRecommendations(array $riskFactors): array
    {
        $recommendations = [];
        
        if (in_array('Low engagement', $riskFactors)) {
            $recommendations[] = 'Send personalized engagement emails';
        }
        
        if (in_array('Long inactivity', $riskFactors)) {
            $recommendations[] = 'Re-engage with course reminders';
        }
        
        if (in_array('Multiple failed quizzes', $riskFactors)) {
            $recommendations[] = 'Provide additional study resources';
        }
        
        return $recommendations;
    }

    private function calculateLessonCompletionRate(Lesson $lesson): float
    {
        $totalStudents = $lesson->course->students->count();
        $completedStudents = $lesson->progress->whereNotNull('completed_at')->count();
        
        return $totalStudents > 0 ? ($completedStudents / $totalStudents) * 100 : 0;
    }

    private function analyzeQuizPerformance(Course $course): array
    {
        $quizzes = $course->lessons->flatMap->quizzes;
        $scores = [];
        
        foreach ($quizzes as $quiz) {
            $attempts = $quiz->attempts;
            foreach ($attempts as $attempt) {
                $scores[] = $attempt->score;
            }
        }
        
        return [
            'average_score' => count($scores) > 0 ? array_sum($scores) / count($scores) : 0,
            'total_attempts' => count($scores),
        ];
    }

    private function calculateUserCompletionRate(User $user): float
    {
        $totalCourses = $user->enrolledCourses->count();
        $completedCourses = $user->enrolledCourses->where('pivot.status', 'completed')->count();
        
        return $totalCourses > 0 ? ($completedCourses / $totalCourses) * 100 : 0;
    }

    private function calculateUserQuizPerformance(User $user): float
    {
        $attempts = $user->quizAttempts;
        if ($attempts->count() === 0) return 0;
        
        return $attempts->avg('score') ?? 0;
    }

    private function calculateAverageTimeSpent(Lesson $lesson): float
    {
        // Simulate time calculation
        return 15.5; // minutes
    }

    private function getQuizScoresAfterLesson(Lesson $lesson): array
    {
        // Simulate quiz score analysis
        return ['average' => 75.5];
    }

    private function calculateEffectivenessScore(float $completionRate, float $quizScore): float
    {
        return ($completionRate * 0.6) + ($quizScore * 0.4);
    }

    private function getContentRecommendations(float $completionRate, float $quizScore): array
    {
        $recommendations = [];
        
        if ($completionRate < 50) {
            $recommendations[] = 'Simplify content structure';
        }
        
        if ($quizScore < 70) {
            $recommendations[] = 'Add more practice exercises';
        }
        
        return $recommendations;
    }

    private function analyzePreferredLearningTime($learningSessions): string
    {
        // Simulate time analysis
        return 'Evening (6-9 PM)';
    }

    private function analyzeLearningPace($learningSessions): string
    {
        // Simulate pace analysis
        return 'Moderate';
    }

    private function analyzeSessionDuration($learningSessions): float
    {
        // Simulate duration analysis
        return 25.0; // minutes
    }

    private function analyzeContentPreferences(User $user): array
    {
        // Simulate content preference analysis
        return ['video', 'interactive'];
    }

    private function calculateCorrelation(array $x, array $y): float
    {
        if (count($x) !== count($y) || count($x) === 0) return 0;
        
        $n = count($x);
        $sumX = array_sum($x);
        $sumY = array_sum($y);
        $sumXY = 0;
        $sumX2 = 0;
        $sumY2 = 0;
        
        for ($i = 0; $i < $n; $i++) {
            $sumXY += $x[$i] * $y[$i];
            $sumX2 += $x[$i] * $x[$i];
            $sumY2 += $y[$i] * $y[$i];
        }
        
        $numerator = ($n * $sumXY) - ($sumX * $sumY);
        $denominator = sqrt((($n * $sumX2) - ($sumX * $sumX)) * (($n * $sumY2) - ($sumY * $sumY)));
        
        return $denominator != 0 ? $numerator / $denominator : 0;
    }

    private function getCorrelationStrength(float $correlation): string
    {
        $absCorrelation = abs($correlation);
        if ($absCorrelation >= 0.7) return 'Strong';
        if ($absCorrelation >= 0.3) return 'Moderate';
        return 'Weak';
    }

    private function interpretCorrelation(float $correlation, string $factor1, string $factor2): string
    {
        if ($correlation > 0.5) {
            return "Strong positive correlation between {$factor1} and {$factor2}";
        } elseif ($correlation < -0.5) {
            return "Strong negative correlation between {$factor1} and {$factor2}";
        } else {
            return "Weak correlation between {$factor1} and {$factor2}";
        }
    }
}
