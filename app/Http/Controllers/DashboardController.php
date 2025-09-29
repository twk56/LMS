<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use App\Services\PerformanceOptimizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class DashboardController extends Controller
{
    public function __construct(
        private PerformanceOptimizationService $performanceService
    ) {}

    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        try {
            $user = Auth::user();
            
            Log::info('DashboardController@index: Starting dashboard load', [
                'user_id' => $user?->id,
                'user_email' => $user?->email,
                'user_role' => $user?->role
            ]);
            
            if ($user->role === 'admin') {
                return $this->adminDashboard();
            } else {
                return $this->studentDashboard();
            }
        } catch (\Exception $e) {
            Log::error('DashboardController@index: Fatal error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('dashboard', [
                'user' => Auth::user(),
                'isAdmin' => false,
                'stats' => [],
                'error' => 'เกิดข้อผิดพลาดในการโหลดหน้าหลัก'
            ]);
        }
    }

    /**
     * Admin Dashboard
     */
    private function adminDashboard(): Response
    {
        try {
            $user = Auth::user();
            
            Log::info('DashboardController@adminDashboard: Loading admin dashboard', [
                'admin_user_id' => $user->id,
                'admin_user_email' => $user->email
            ]);
            
            // Use optimized dashboard stats
            $stats = $this->performanceService->getOptimizedDashboardStats();
            
            // Get additional admin data
            $recentActivities = $this->getRecentActivities();
            $courseStats = $this->getCourseStats();
            $userStats = $this->getUserStats();

            Log::info('DashboardController@adminDashboard: Successfully loaded admin dashboard', [
                'admin_user_id' => $user->id,
                'stats_keys' => array_keys($stats),
                'recent_activities_count' => count($recentActivities),
                'course_stats_count' => count($courseStats)
            ]);

            return Inertia::render('dashboard', [
                'user' => $user,
                'isAdmin' => true,
                'stats' => $stats,
                'recentActivities' => $recentActivities,
                'courseStats' => $courseStats,
                'userStats' => $userStats,
            ]);
        } catch (\Exception $e) {
            Log::error('DashboardController@adminDashboard: Error loading admin dashboard', [
                'admin_user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('dashboard', [
                'user' => Auth::user(),
                'isAdmin' => true,
                'stats' => [],
                'recentActivities' => [],
                'courseStats' => [],
                'userStats' => [],
                'error' => 'เกิดข้อผิดพลาดในการโหลดหน้าหลัก Admin'
            ]);
        }
    }

    /**
     * Student Dashboard
     */
    private function studentDashboard(): Response
    {
        try {
            $user = Auth::user();
            
            Log::info('DashboardController@studentDashboard: Loading student dashboard', [
                'student_user_id' => $user->id,
                'student_user_email' => $user->email
            ]);
            
            // Use optimized student dashboard stats
            $stats = $this->performanceService->getOptimizedStudentDashboard($user->id);
            
            // Get additional student data
            $enrolledCourses = $stats['enrolled_courses_data'] ?? [];
            $recentCompletions = $stats['recent_completions'] ?? [];
            $upcomingLessons = $stats['upcoming_lessons'] ?? [];
            $recentActivities = $this->getStudentRecentActivities($user->id);

            Log::info('DashboardController@studentDashboard: Successfully loaded student dashboard', [
                'student_user_id' => $user->id,
                'stats_keys' => array_keys($stats),
                'enrolled_courses_count' => count($enrolledCourses),
                'recent_completions_count' => count($recentCompletions),
                'upcoming_lessons_count' => count($upcomingLessons)
            ]);

            return Inertia::render('dashboard', [
                'user' => $user,
                'isAdmin' => false,
                'stats' => $stats,
                'enrolledCourses' => $enrolledCourses,
                'recentCompletions' => $recentCompletions,
                'upcomingLessons' => $upcomingLessons,
                'recentActivities' => $recentActivities,
            ]);
        } catch (\Exception $e) {
            Log::error('DashboardController@studentDashboard: Error loading student dashboard', [
                'student_user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('dashboard', [
                'user' => Auth::user(),
                'isAdmin' => false,
                'stats' => [],
                'enrolledCourses' => [],
                'recentCompletions' => [],
                'upcomingLessons' => [],
                'recentActivities' => [],
                'error' => 'เกิดข้อผิดพลาดในการโหลดหน้าหลัก Student'
            ]);
        }
    }


    /**
     * Get course analytics for admin
     */
    public function courseAnalytics(Course $course): Response
    {
        $this->authorize('view', $course);

        try {
            $analytics = DB::select("
                SELECT 
                    COUNT(DISTINCT cu.user_id) as total_enrollments,
                    COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN cu.user_id END) as completed_enrollments,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.lesson_id END) * 100.0) / 
                        NULLIF(COUNT(DISTINCT lp.lesson_id), 0), 2
                    ) as avg_completion,
                    COUNT(DISTINCT lp.lesson_id) as total_lessons_started,
                    COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.lesson_id END) as total_lessons_completed
                FROM course_user cu
                LEFT JOIN lesson_progress lp ON cu.user_id = lp.user_id 
                    AND lp.lesson_id IN (
                        SELECT id FROM lessons WHERE course_id = cu.course_id
                    )
                WHERE cu.course_id = ?
            ", [$course->id]);

            $lessonProgress = DB::table('lessons')
                ->leftJoin('lesson_progress', function ($join) {
                    $join->on('lessons.id', '=', 'lesson_progress.lesson_id')
                         ->where('lesson_progress.status', 'completed');
                })
                ->select(
                    'lessons.id',
                    'lessons.title',
                    'lessons.order',
                    DB::raw('COUNT(lesson_progress.id) as completion_count')
                )
                ->where('lessons.course_id', $course->id)
                ->groupBy('lessons.id', 'lessons.title', 'lessons.order')
                ->orderBy('lessons.order')
                ->get();

            return Inertia::render('courses/analytics', [
                'course' => $course->load(['creator', 'category']),
                'analytics' => $analytics[0] ?? [],
                'lessonProgress' => $lessonProgress,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in DashboardController@courseAnalytics', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'เกิดข้อผิดพลาดในการโหลดข้อมูลวิเคราะห์');
        }
    }

    /**
     * Get recent activities for admin dashboard
     */
    private function getRecentActivities(): array
    {
        try {
            Log::info('DashboardController@getRecentActivities: Starting to fetch recent activities');
            
            $activities = DB::table('lesson_progress')
                ->join('lessons', 'lessons.id', '=', 'lesson_progress.lesson_id')
                ->join('users', 'users.id', '=', 'lesson_progress.user_id')
                ->join('courses', 'courses.id', '=', 'lessons.course_id')
                ->whereNotNull('lesson_progress.completed_at')
                ->select(
                    'users.name as user_name',
                    'courses.title as course_title',
                    'lessons.title as lesson_title',
                    'lesson_progress.completed_at as created_at'
                )
                ->orderBy('lesson_progress.completed_at', 'desc')
                ->limit(10)
                ->get()
                ->toArray();
            
            Log::info('DashboardController@getRecentActivities: Successfully fetched activities', [
                'count' => count($activities)
            ]);
            
            return $activities;
        } catch (\Exception $e) {
            Log::error('DashboardController@getRecentActivities: Error fetching recent activities', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return [];
        }
    }

    /**
     * Get course statistics for admin dashboard
     */
    private function getCourseStats(): array
    {
        try {
            Log::info('DashboardController@getCourseStats: Starting to fetch course statistics');
            
            $courseStats = DB::table('courses')
                ->leftJoin('course_categories', 'courses.category_id', '=', 'course_categories.id')
                ->leftJoin('course_user', 'courses.id', '=', 'course_user.course_id')
                ->select(
                    'courses.id',
                    'courses.title',
                    'courses.status',
                    'courses.created_at',
                    'course_categories.name as category_name',
                    DB::raw('COUNT(course_user.user_id) as students_count')
                )
                ->groupBy('courses.id', 'courses.title', 'courses.status', 'courses.created_at', 'course_categories.name')
                ->orderBy('courses.created_at', 'desc')
                ->limit(6)
                ->get()
                ->toArray();
            
            Log::info('DashboardController@getCourseStats: Successfully fetched course statistics', [
                'count' => count($courseStats)
            ]);
            
            return $courseStats;
        } catch (\Exception $e) {
            Log::error('DashboardController@getCourseStats: Error fetching course statistics', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return [];
        }
    }

    /**
     * Get user statistics for admin dashboard
     */
    private function getUserStats(): array
    {
        try {
            Log::info('DashboardController@getUserStats: Starting to fetch user statistics');
            
            $userStats = [
                'total_users' => DB::table('users')->count(),
                'admin_users' => DB::table('users')->where('role', 'admin')->count(),
                'student_users' => DB::table('users')->where('role', 'student')->count(),
                'active_users' => DB::table('users')
                    ->where('last_login_at', '>=', now()->subDays(30))
                    ->count(),
                'new_users_this_month' => DB::table('users')
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->count(),
            ];
            
            Log::info('DashboardController@getUserStats: Successfully fetched user statistics', $userStats);
            
            return $userStats;
        } catch (\Exception $e) {
            Log::error('DashboardController@getUserStats: Error fetching user statistics', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return [
                'total_users' => 0,
                'admin_users' => 0,
                'student_users' => 0,
                'active_users' => 0,
                'new_users_this_month' => 0,
            ];
        }
    }

    /**
     * Get student recent activities
     */
    private function getStudentRecentActivities(int $userId): array
    {
        try {
            Log::info('DashboardController@getStudentRecentActivities: Starting to fetch student activities', [
                'user_id' => $userId
            ]);
            
            $activities = DB::table('lesson_progress')
                ->join('lessons', 'lessons.id', '=', 'lesson_progress.lesson_id')
                ->join('courses', 'courses.id', '=', 'lessons.course_id')
                ->where('lesson_progress.user_id', $userId)
                ->where('lesson_progress.status', 'completed')
                ->select(
                    'courses.title as course_title',
                    'lessons.title as lesson_title',
                    'lesson_progress.completed_at as created_at'
                )
                ->orderBy('lesson_progress.completed_at', 'desc')
                ->limit(5)
                ->get()
                ->toArray();
            
            Log::info('DashboardController@getStudentRecentActivities: Successfully fetched student activities', [
                'user_id' => $userId,
                'count' => count($activities)
            ]);
            
            return $activities;
        } catch (\Exception $e) {
            Log::error('DashboardController@getStudentRecentActivities: Error fetching student activities', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return [];
        }
    }
}
