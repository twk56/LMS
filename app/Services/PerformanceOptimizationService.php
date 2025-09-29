<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use App\Models\LessonProgress;
use App\Models\QuizAttempt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;

class PerformanceOptimizationService
{
    /**
     * Optimize course listing with eager loading
     */
    public function getOptimizedCourses($userId = null, $search = null): Collection
    {
        $query = Course::with([
            'creator:id,name,email',
            'category:id,name,color',
            'students' => function ($query) {
                $query->select('users.id', 'users.name')
                      ->wherePivot('status', 'enrolled');
            }
        ]);

        if ($userId) {
            $query->where('created_by', $userId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Optimize course details with eager loading
     */
    public function getOptimizedCourseDetails($courseId, $userId = null): Course
    {
        try {
            \Log::info('PerformanceOptimizationService: Getting course details', [
                'course_id' => $courseId,
                'user_id' => $userId
            ]);

            $course = Course::with([
                'creator:id,name,email',
                'category:id,name,color',
                'lessons' => function ($query) {
                    $query->orderBy('order');
                },
                'students' => function ($query) {
                    $query->select('users.id', 'users.name', 'users.email')
                          ->wherePivot('status', 'enrolled');
                }
            ])->findOrFail($courseId);

            \Log::info('PerformanceOptimizationService: Course found', [
                'course_id' => $courseId,
                'course_title' => $course->title,
                'lessons_count' => $course->lessons->count(),
                'students_count' => $course->students->count()
            ]);

            // Add enrollment status if user is provided
            if ($userId) {
                $course->is_enrolled = $course->students()->where('user_id', $userId)->exists();
                \Log::info('PerformanceOptimizationService: Enrollment status checked', [
                    'course_id' => $courseId,
                    'user_id' => $userId,
                    'is_enrolled' => $course->is_enrolled
                ]);
            }

            return $course;

        } catch (\Exception $e) {
            \Log::error('PerformanceOptimizationService: Error getting course details', [
                'course_id' => $courseId,
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Optimize dashboard statistics with single query
     */
    public function getOptimizedDashboardStats(): array
    {
        return Cache::remember('dashboard_stats', 300, function () {
            $stats = DB::select("
                SELECT 
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM courses WHERE status = 'published') as total_courses,
                    (SELECT COUNT(*) FROM lessons) as total_lessons,
                    (SELECT COUNT(*) FROM course_user WHERE status = 'completed') as completed_enrollments,
                    (SELECT COUNT(*) FROM course_user) as total_enrollments
            ")[0];

            $completionRate = $stats->total_enrollments > 0 
                ? round(($stats->completed_enrollments / $stats->total_enrollments) * 100, 2) 
                : 0;

            return [
                'total_users' => $stats->total_users,
                'total_courses' => $stats->total_courses,
                'total_lessons' => $stats->total_lessons,
                'completion_rate' => $completionRate,
                'recent_activities' => $this->getRecentActivitiesOptimized(),
                'course_stats' => $this->getCourseStatsOptimized(),
            ];
        });
    }

    /**
     * Optimize student dashboard with single query
     */
    public function getOptimizedStudentDashboard($userId): array
    {
        return Cache::remember("student_dashboard_{$userId}", 300, function () use ($userId) {
            $stats = DB::select("
                SELECT 
                    COUNT(DISTINCT cu.course_id) as enrolled_courses,
                    COUNT(DISTINCT CASE WHEN cu.status = 'completed' THEN cu.course_id END) as completed_courses,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN cu.status = 'completed' THEN cu.course_id END) * 100.0) /
                        NULLIF(COUNT(DISTINCT cu.course_id), 0), 2
                    ) as course_completion_rate,
                    COUNT(DISTINCT lp.lesson_id) as total_lessons,
                    COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.lesson_id END) as completed_lessons,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.lesson_id END) * 100.0) /
                        NULLIF(COUNT(DISTINCT lp.lesson_id), 0), 2
                    ) as lesson_completion_rate
                FROM course_user cu
                LEFT JOIN lesson_progress lp ON lp.user_id = cu.user_id
                WHERE cu.user_id = ?
            ", [$userId])[0];

            return [
                'enrolled_courses' => $stats->enrolled_courses,
                'completed_courses' => $stats->completed_courses,
                'course_completion_rate' => $stats->course_completion_rate,
                'total_lessons' => $stats->total_lessons,
                'completed_lessons' => $stats->completed_lessons,
                'lesson_completion_rate' => $stats->lesson_completion_rate,
                'enrolled_courses_data' => $this->getEnrolledCoursesOptimized($userId),
                'recent_completions' => $this->getRecentCompletionsOptimized($userId),
                'upcoming_lessons' => $this->getUpcomingLessonsOptimized($userId),
            ];
        });
    }

    /**
     * Optimize course analytics with single query
     */
    public function getOptimizedCourseAnalytics($courseId): array
    {
        return Cache::remember("course_analytics_{$courseId}", 600, function () use ($courseId) {
            $analytics = DB::select("
                SELECT 
                    COUNT(DISTINCT cu.user_id) as total_enrollments,
                    COUNT(DISTINCT CASE WHEN cu.status = 'completed' THEN cu.user_id END) as completed_enrollments,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.lesson_id END) * 100.0) / 
                        NULLIF(COUNT(DISTINCT l.id), 0), 2
                    ) as avg_completion,
                    COUNT(DISTINCT l.id) as total_lessons,
                    COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.lesson_id END) as completed_lessons
                FROM course_user cu
                LEFT JOIN lessons l ON l.course_id = cu.course_id
                LEFT JOIN lesson_progress lp ON cu.user_id = lp.user_id AND lp.lesson_id = l.id
                WHERE cu.course_id = ?
            ", [$courseId])[0];

            return [
                'total_enrollments' => $analytics->total_enrollments,
                'completed_enrollments' => $analytics->completed_enrollments,
                'avg_completion' => $analytics->avg_completion,
                'total_lessons' => $analytics->total_lessons,
                'completed_lessons' => $analytics->completed_lessons,
                'lesson_progress' => $this->getLessonProgressOptimized($courseId),
            ];
        });
    }

    /**
     * Optimize user progress with single query
     */
    public function getOptimizedUserProgress($userId): array
    {
        return Cache::remember("user_progress_{$userId}", 300, function () use ($userId) {
            $progress = DB::select("
                SELECT 
                    COUNT(DISTINCT cu.course_id) as total_courses,
                    COUNT(DISTINCT CASE WHEN cu.status = 'completed' THEN cu.course_id END) as completed_courses,
                    COUNT(DISTINCT lp.lesson_id) as total_lessons,
                    COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.lesson_id END) as completed_lessons,
                    ROUND(AVG(qa.score), 2) as avg_quiz_score
                FROM course_user cu
                LEFT JOIN lesson_progress lp ON lp.user_id = cu.user_id
                LEFT JOIN quiz_attempts qa ON qa.user_id = cu.user_id
                WHERE cu.user_id = ?
            ", [$userId])[0];

            return [
                'total_courses' => $progress->total_courses,
                'completed_courses' => $progress->completed_courses,
                'total_lessons' => $progress->total_lessons,
                'completed_lessons' => $progress->completed_lessons,
                'avg_quiz_score' => $progress->avg_quiz_score,
                'course_progress' => $this->getUserCourseProgressOptimized($userId),
            ];
        });
    }

    /**
     * Get recent activities with optimized query
     */
    private function getRecentActivitiesOptimized(): array
    {
        return DB::table('lesson_progress')
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
    }

    /**
     * Get course stats with optimized query
     */
    private function getCourseStatsOptimized(): array
    {
        return Course::with(['category:id,name', 'creator:id,name'])
            ->withCount('students')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($course) {
                return [
                    'title' => $course->title,
                    'status' => $course->status,
                    'students_count' => $course->students_count,
                    'category_name' => $course->category?->name ?? 'ไม่มีหมวดหมู่',
                    'created_at' => $course->created_at,
                ];
            })
            ->toArray();
    }

    /**
     * Get enrolled courses with optimized query
     */
    private function getEnrolledCoursesOptimized($userId): array
    {
        return DB::table('course_user')
            ->join('courses', 'courses.id', '=', 'course_user.course_id')
            ->leftJoin('lesson_progress', function ($join) use ($userId) {
                $join->on('lesson_progress.user_id', '=', 'course_user.user_id')
                     ->on('lesson_progress.lesson_id', '=', DB::raw('(SELECT id FROM lessons WHERE course_id = courses.id LIMIT 1)'));
            })
            ->where('course_user.user_id', $userId)
            ->select(
                'courses.id',
                'courses.title',
                'courses.description',
                'courses.image',
                'course_user.status',
                'course_user.enrolled_at',
                DB::raw('COUNT(lesson_progress.id) as completed_lessons'),
                DB::raw('(SELECT COUNT(*) FROM lessons WHERE course_id = courses.id) as total_lessons')
            )
            ->groupBy('courses.id', 'courses.title', 'courses.description', 'courses.image', 'course_user.status', 'course_user.enrolled_at')
            ->get()
            ->map(function ($course) {
                $course->progress_percentage = $course->total_lessons > 0 
                    ? round(($course->completed_lessons / $course->total_lessons) * 100, 2) 
                    : 0;
                $course->is_completed = $course->status === 'completed';
                return $course;
            })
            ->toArray();
    }

    /**
     * Get recent completions with optimized query
     */
    private function getRecentCompletionsOptimized($userId): array
    {
        return DB::table('lesson_progress')
            ->join('lessons', 'lessons.id', '=', 'lesson_progress.lesson_id')
            ->join('courses', 'courses.id', '=', 'lessons.course_id')
            ->where('lesson_progress.user_id', $userId)
            ->where('lesson_progress.status', 'completed')
            ->select(
                'courses.title as course_title',
                'lessons.title as lesson_title',
                'lesson_progress.completed_at'
            )
            ->orderBy('lesson_progress.completed_at', 'desc')
            ->limit(5)
            ->get()
            ->toArray();
    }

    /**
     * Get upcoming lessons with optimized query
     */
    private function getUpcomingLessonsOptimized($userId): array
    {
        return DB::table('lessons')
            ->join('courses', 'courses.id', '=', 'lessons.course_id')
            ->join('course_user', 'course_user.course_id', '=', 'courses.id')
            ->leftJoin('lesson_progress', function ($join) use ($userId) {
                $join->on('lesson_progress.lesson_id', '=', 'lessons.id')
                     ->where('lesson_progress.user_id', $userId);
            })
            ->where('course_user.user_id', $userId)
            ->where('course_user.status', 'enrolled')
            ->whereNull('lesson_progress.id')
            ->select(
                'courses.title as course_title',
                'lessons.title as lesson_title',
                'lessons.order',
                'lessons.created_at'
            )
            ->orderBy('lessons.order')
            ->limit(5)
            ->get()
            ->toArray();
    }

    /**
     * Get lesson progress with optimized query
     */
    private function getLessonProgressOptimized($courseId): array
    {
        return DB::table('lessons')
            ->leftJoin('lesson_progress', function ($join) {
                $join->on('lessons.id', '=', 'lesson_progress.lesson_id')
                     ->where('lesson_progress.status', 'completed');
            })
            ->where('lessons.course_id', $courseId)
            ->select(
                'lessons.id',
                'lessons.title',
                'lessons.order',
                DB::raw('COUNT(lesson_progress.id) as completion_count')
            )
            ->groupBy('lessons.id', 'lessons.title', 'lessons.order')
            ->orderBy('lessons.order')
            ->get()
            ->toArray();
    }

    /**
     * Get user course progress with optimized query
     */
    private function getUserCourseProgressOptimized($userId): array
    {
        return DB::table('course_user')
            ->join('courses', 'courses.id', '=', 'course_user.course_id')
            ->where('course_user.user_id', $userId)
            ->select(
                'courses.title',
                'course_user.status',
                'course_user.enrolled_at',
                DB::raw('(SELECT COUNT(*) FROM lesson_progress WHERE lesson_progress.user_id = course_user.user_id AND lesson_progress.lesson_id IN (SELECT id FROM lessons WHERE course_id = courses.id)) as lessons_completed'),
                DB::raw('(SELECT COUNT(*) FROM lessons WHERE course_id = courses.id) as total_lessons')
            )
            ->get()
            ->toArray();
    }

    /**
     * Clear cache for specific user
     */
    public function clearUserCache($userId): void
    {
        Cache::forget("student_dashboard_{$userId}");
        Cache::forget("user_progress_{$userId}");
    }

    /**
     * Clear cache for specific course
     */
    public function clearCourseCache($courseId): void
    {
        Cache::forget("course_analytics_{$courseId}");
    }

    /**
     * Clear all dashboard cache
     */
    public function clearDashboardCache(): void
    {
        Cache::forget('dashboard_stats');
    }
}
