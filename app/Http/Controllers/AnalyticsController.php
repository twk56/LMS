<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use App\Services\PerformanceOptimizationService;
use App\Models\Course;
use App\Models\User;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\CourseCategory;
use App\Models\SimpleChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService,
        private PerformanceOptimizationService $performanceService
    ) {}

    public function dashboard()
    {
        try {
            Log::info('AnalyticsController@dashboard: Starting analytics dashboard load', [
                'user_id' => auth()->id(),
                'user_email' => auth()->user()?->email
            ]);

            $analytics = $this->getRealAnalyticsData();

            Log::info('AnalyticsController@dashboard: Successfully loaded analytics data', [
                'user_id' => auth()->id(),
                'total_courses' => $analytics['total_courses'],
                'total_users' => $analytics['total_users'],
                'total_lessons' => $analytics['total_lessons']
            ]);

            return Inertia::render('analytics/Dashboard', [
                'analytics' => $analytics,
            ]);

        } catch (\Exception $e) {
            Log::error('AnalyticsController@dashboard: Fatal error', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('analytics/Dashboard', [
                'analytics' => $this->getDefaultAnalyticsData(),
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลการวิเคราะห์'
            ]);
        }
    }

    public function courseAnalytics(int $courseId)
    {
        $analytics = $this->performanceService->getOptimizedCourseAnalytics($courseId);

        return Inertia::render('analytics/CourseAnalytics', [
            'analytics' => $analytics,
        ]);
    }

    public function userProgress(int $userId)
    {
        $progress = $this->performanceService->getOptimizedUserProgress($userId);

        return Inertia::render('analytics/UserProgress', [
            'progress' => $progress,
        ]);
    }

    public function apiDashboard()
    {
        return response()->json([
            'data' => $this->performanceService->getOptimizedDashboardStats(),
        ]);
    }

    public function apiCourseAnalytics(int $courseId)
    {
        return response()->json([
            'data' => $this->performanceService->getOptimizedCourseAnalytics($courseId),
        ]);
    }

    public function apiUserProgress(int $userId)
    {
        return response()->json([
            'data' => $this->performanceService->getOptimizedUserProgress($userId),
        ]);
    }

    /**
     * Get real analytics data from database
     */
    private function getRealAnalyticsData(): array
    {
        Log::info('AnalyticsController: Starting real data collection');
        
        // Basic counts
        $totalCourses = Course::count();
        $totalUsers = User::count();
        $totalLessons = Lesson::count();
        $totalCategories = CourseCategory::count();

        Log::info('AnalyticsController: Basic counts collected', [
            'courses' => $totalCourses,
            'users' => $totalUsers,
            'lessons' => $totalLessons,
            'categories' => $totalCategories
        ]);

        // Calculate completion rate
        $totalProgress = LessonProgress::where('status', 'completed')->count();
        $totalEnrollments = DB::table('course_user')->count();
        $completionRate = $totalEnrollments > 0 ? round(($totalProgress / $totalEnrollments) * 100, 1) : 0;

        Log::info('AnalyticsController: Progress data collected', [
            'completed_lessons' => $totalProgress,
            'total_enrollments' => $totalEnrollments,
            'completion_rate' => $completionRate
        ]);

        // Recent activities (last 10 activities)
        $recentActivities = $this->getRecentActivities();

        // Course statistics
        $courseStats = Course::with(['category', 'users'])
            ->withCount('users')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'status' => $course->status ?? 'draft',
                    'students_count' => $course->users_count,
                    'category' => $course->category?->name,
                    'created_at' => $course->created_at,
                ];
            });

        // Monthly courses data (last 6 months)
        $monthlyCourses = $this->getMonthlyCoursesData();

        // User growth data (last 6 months)
        $userGrowth = $this->getUserGrowthData();

        // Category distribution
        $categoryDistribution = CourseCategory::withCount('courses')
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'value' => $category->courses_count,
                ];
            });

        // Progress trend (last 6 weeks)
        $progressTrend = $this->getProgressTrendData();

        // Additional analytics data
        $totalEnrollments = DB::table('course_user')->count();
        $totalChatMessages = SimpleChatMessage::count();
        $activeUsers = User::where('last_login_at', '>=', now()->subDays(30))->count();
        $popularCourses = $this->getPopularCourses();
        $userEngagement = $this->getUserEngagementData();
        $systemHealth = $this->getSystemHealthData();
        $learningInsights = $this->getLearningInsights();

        return [
            'total_courses' => $totalCourses,
            'total_users' => $totalUsers,
            'total_lessons' => $totalLessons,
            'total_categories' => $totalCategories,
            'total_enrollments' => $totalEnrollments,
            'total_chat_messages' => $totalChatMessages,
            'active_users' => $activeUsers,
            'completion_rate' => $completionRate,
            'recent_activities' => $recentActivities,
            'course_stats' => $courseStats,
            'monthly_courses' => $monthlyCourses,
            'user_growth' => $userGrowth,
            'category_distribution' => $categoryDistribution,
            'progress_trend' => $progressTrend,
            'popular_courses' => $popularCourses,
            'user_engagement' => $userEngagement,
            'system_health' => $systemHealth,
            'learning_insights' => $learningInsights,
        ];
    }

    /**
     * Get recent activities
     */
    private function getRecentActivities(): array
    {
        Log::info('AnalyticsController: Collecting recent activities');
        $activities = [];

        try {
            // Recent course enrollments
            $recentEnrollments = DB::table('course_user')
                ->join('users', 'course_user.user_id', '=', 'users.id')
                ->join('courses', 'course_user.course_id', '=', 'courses.id')
                ->select('users.name as user_name', 'courses.title as course_title', 'course_user.enrolled_at as created_at')
                ->orderBy('course_user.enrolled_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($enrollment) {
                    // Ensure UTF-8 encoding for enrollment data
                    $courseTitle = $enrollment->course_title;
                    $userName = $enrollment->user_name;
                    
                    return [
                        'description' => "ลงทะเบียนหลักสูตร: {$courseTitle}",
                        'user_name' => $userName,
                        'created_at' => $enrollment->created_at,
                        'type' => 'enrollment'
                    ];
                });

            $activities = array_merge($activities, $recentEnrollments->toArray());

            Log::info('AnalyticsController: Recent enrollments collected', [
                'count' => $recentEnrollments->count()
            ]);
        } catch (\Exception $e) {
            Log::error('AnalyticsController: Error collecting enrollments', [
                'error' => $e->getMessage()
            ]);
        }

        try {
            // Recent chat messages
            $recentMessages = SimpleChatMessage::with('user')
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get()
                ->map(function ($message) {
                    // Ensure UTF-8 encoding for message content
                    $messageText = mb_substr($message->message, 0, 50, 'UTF-8');
                    $userName = $message->user?->name ?? 'ผู้ใช้';
                    
                    return [
                        'description' => "ส่งข้อความแชท: " . $messageText . "...",
                        'user_name' => $userName,
                        'created_at' => $message->created_at,
                        'type' => 'chat'
                    ];
                });

            $activities = array_merge($activities, $recentMessages->toArray());

            Log::info('AnalyticsController: Recent chat messages collected', [
                'count' => $recentMessages->count()
            ]);
        } catch (\Exception $e) {
            Log::error('AnalyticsController: Error collecting chat messages', [
                'error' => $e->getMessage()
            ]);
        }

        try {
            // Recent course creations
            $recentCourses = Course::with('creator')
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get()
                ->map(function ($course) {
                    // Ensure UTF-8 encoding for course title
                    $courseTitle = $course->title;
                    $creatorName = $course->creator?->name ?? 'Admin';
                    
                    return [
                        'description' => "สร้างหลักสูตรใหม่: {$courseTitle}",
                        'user_name' => $creatorName,
                        'created_at' => $course->created_at,
                        'type' => 'course'
                    ];
                });

            $activities = array_merge($activities, $recentCourses->toArray());

            Log::info('AnalyticsController: Recent course creations collected', [
                'count' => $recentCourses->count()
            ]);
        } catch (\Exception $e) {
            Log::error('AnalyticsController: Error collecting course creations', [
                'error' => $e->getMessage()
            ]);
        }

        // Sort by created_at and limit to 10
        usort($activities, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        // Ensure all activities have valid UTF-8 encoding
        $activities = array_map(function($activity) {
            if (isset($activity['description'])) {
                $activity['description'] = mb_convert_encoding($activity['description'], 'UTF-8', 'UTF-8');
            }
            if (isset($activity['user_name'])) {
                $activity['user_name'] = mb_convert_encoding($activity['user_name'], 'UTF-8', 'UTF-8');
            }
            return $activity;
        }, $activities);

        Log::info('AnalyticsController: Recent activities completed', [
            'total_activities' => count($activities)
        ]);

        return array_slice($activities, 0, 10);
    }

    /**
     * Get monthly courses data
     */
    private function getMonthlyCoursesData(): array
    {
        Log::info('AnalyticsController: Collecting monthly courses data');
        
        try {
            // SQLite compatible query
            $monthlyData = Course::select(
                    DB::raw('strftime("%m", created_at) as month'),
                    DB::raw('strftime("%Y", created_at) as year'),
                    DB::raw('COUNT(*) as courses')
                )
                ->where('created_at', '>=', now()->subMonths(6))
                ->groupBy('year', 'month')
                ->orderBy('year', 'asc')
                ->orderBy('month', 'asc')
                ->get();

            Log::info('AnalyticsController: Monthly courses data collected', [
                'data_points' => $monthlyData->count()
            ]);
        } catch (\Exception $e) {
            Log::error('AnalyticsController: Error collecting monthly courses data', [
                'error' => $e->getMessage()
            ]);
            return [];
        }

        $months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        $result = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthData = $monthlyData->where('month', $date->month)->where('year', $date->year)->first();
            
            $result[] = [
                'month' => $months[$date->month - 1],
                'courses' => $monthData ? $monthData->courses : 0,
            ];
        }

        return $result;
    }

    /**
     * Get user growth data
     */
    private function getUserGrowthData(): array
    {
        // SQLite compatible query
        $userGrowth = User::select(
                DB::raw('strftime("%m", created_at) as month'),
                DB::raw('strftime("%Y", created_at) as year'),
                DB::raw('COUNT(*) as users')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        $months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        $result = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthData = $userGrowth->where('month', $date->month)->where('year', $date->year)->first();
            
            $result[] = [
                'month' => $months[$date->month - 1],
                'users' => $monthData ? $monthData->users : 0,
            ];
        }

        return $result;
    }

    /**
     * Get progress trend data
     */
    private function getProgressTrendData(): array
    {
        // SQLite compatible query - use date instead of week
        $progressData = LessonProgress::select(
                DB::raw('strftime("%W", created_at) as week'),
                DB::raw('strftime("%Y", created_at) as year'),
                DB::raw('COUNT(*) as progress')
            )
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subWeeks(6))
            ->groupBy('year', 'week')
            ->orderBy('year', 'asc')
            ->orderBy('week', 'asc')
            ->get();

        $result = [];
        for ($i = 5; $i >= 0; $i--) {
            $week = now()->subWeeks($i);
            $weekData = $progressData->where('week', $week->weekOfYear)->where('year', $week->year)->first();
            
            $result[] = [
                'week' => "สัปดาห์ {$week->weekOfYear}",
                'progress' => $weekData ? $weekData->progress : 0,
            ];
        }

        return $result;
    }

    /**
     * Get popular courses
     */
    private function getPopularCourses(): array
    {
        return Course::with(['category'])
            ->withCount('users')
            ->orderBy('users_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'enrollments' => $course->users_count,
                    'category' => $course->category?->name,
                    'status' => $course->status ?? 'draft',
                ];
            })
            ->toArray();
    }

    /**
     * Get user engagement data
     */
    private function getUserEngagementData(): array
    {
        $totalUsers = User::count();
        $activeUsers = User::where('last_login_at', '>=', now()->subDays(30))->count();
        $newUsers = User::where('created_at', '>=', now()->subDays(30))->count();
        
        $engagementRate = $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100, 1) : 0;
        
        return [
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'new_users' => $newUsers,
            'engagement_rate' => $engagementRate,
            'avg_lessons_per_user' => $totalUsers > 0 ? round(LessonProgress::count() / $totalUsers, 1) : 0,
        ];
    }

    /**
     * Get system health data
     */
    private function getSystemHealthData(): array
    {
        $totalCourses = Course::count();
        $publishedCourses = Course::where('status', 'published')->count();
        $draftCourses = Course::where('status', 'draft')->count();
        
        $totalLessons = Lesson::count();
        $publishedLessons = Lesson::where('status', 'published')->count();
        
        $totalUsers = User::count();
        $adminUsers = User::where('role', 'admin')->count();
        $studentUsers = User::where('role', 'student')->count();
        
        return [
            'courses' => [
                'total' => $totalCourses,
                'published' => $publishedCourses,
                'draft' => $draftCourses,
                'publish_rate' => $totalCourses > 0 ? round(($publishedCourses / $totalCourses) * 100, 1) : 0,
            ],
            'lessons' => [
                'total' => $totalLessons,
                'published' => $publishedLessons,
                'publish_rate' => $totalLessons > 0 ? round(($publishedLessons / $totalLessons) * 100, 1) : 0,
            ],
            'users' => [
                'total' => $totalUsers,
                'admin' => $adminUsers,
                'student' => $studentUsers,
                'admin_ratio' => $totalUsers > 0 ? round(($adminUsers / $totalUsers) * 100, 1) : 0,
            ],
        ];
    }

    /**
     * Get learning insights
     */
    private function getLearningInsights(): array
    {
        $totalEnrollments = DB::table('course_user')->count();
        $completedLessons = LessonProgress::where('status', 'completed')->count();
        $totalLessons = Lesson::count();
        
        $avgCompletionTime = LessonProgress::where('status', 'completed')
            ->whereNotNull('completed_at')
            ->whereNotNull('started_at')
            ->get()
            ->map(function ($progress) {
                return $progress->started_at->diffInHours($progress->completed_at);
            })
            ->avg();
        
        $mostActiveUsers = User::withCount('chatMessages')
            ->orderBy('chat_messages_count', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($user) {
                return [
                    'name' => $user->name,
                    'messages' => $user->chat_messages_count,
                    'role' => $user->role,
                ];
            });
        
        return [
            'completion_insights' => [
                'total_enrollments' => $totalEnrollments,
                'completed_lessons' => $completedLessons,
                'completion_rate' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 1) : 0,
                'avg_completion_time_hours' => round($avgCompletionTime ?? 0, 1),
            ],
            'most_active_users' => $mostActiveUsers,
            'learning_trends' => [
                'peak_learning_hours' => $this->getPeakLearningHours(),
                'most_popular_categories' => $this->getMostPopularCategories(),
            ],
        ];
    }

    /**
     * Get peak learning hours
     */
    private function getPeakLearningHours(): array
    {
        // SQLite compatible query
        $hourlyData = LessonProgress::select(
                DB::raw('strftime("%H", created_at) as hour'),
                DB::raw('COUNT(*) as activities')
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('hour')
            ->orderBy('activities', 'desc')
            ->get();

        return $hourlyData->map(function ($data) {
            return [
                'hour' => $data->hour . ':00',
                'activities' => $data->activities,
            ];
        })->take(5)->toArray();
    }

    /**
     * Get most popular categories
     */
    private function getMostPopularCategories(): array
    {
        return CourseCategory::withCount(['courses' => function ($query) {
                $query->where('status', 'published');
            }])
            ->orderBy('courses_count', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'courses_count' => $category->courses_count,
                ];
            })
            ->toArray();
    }

    /**
     * Get default analytics data when error occurs
     */
    private function getDefaultAnalyticsData(): array
    {
        return [
            'total_courses' => 0,
            'total_users' => 0,
            'total_lessons' => 0,
            'total_categories' => 0,
            'total_enrollments' => 0,
            'total_chat_messages' => 0,
            'active_users' => 0,
            'completion_rate' => 0,
            'recent_activities' => [],
            'course_stats' => [],
            'monthly_courses' => [],
            'user_growth' => [],
            'category_distribution' => [],
            'progress_trend' => [],
            'popular_courses' => [],
            'user_engagement' => [],
            'system_health' => [],
            'learning_insights' => [],
        ];
    }
}
