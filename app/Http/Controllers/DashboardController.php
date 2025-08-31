<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with optimized queries
     */
    public function index(): Response
    {
        try {
            $user = Auth::user();
            
            if ($user->role === 'admin') {
                // Admin dashboard - show all courses with eager loading
                $courses = Course::with([
                    'creator:id,name,email',
                    'category:id,name,color',
                    'lessons:id,course_id,title,order,status',
                    'students:id,name,email',
                    'certificates:id,course_id,user_id,issued_at'
                ])
                ->where('created_by', $user->id)
                ->withCount(['lessons', 'students', 'certificates'])
                ->orderBy('created_at', 'desc')
                ->get();

                // Get statistics
                $stats = $this->getAdminStats($user->id);
                
            } else {
                // Student dashboard - show enrolled courses with eager loading
                $courses = $user->enrolledCourses()
                    ->with([
                        'creator:id,name,email',
                        'category:id,name,color',
                        'lessons:id,course_id,title,order,status',
                        'certificates' => function ($query) use ($user) {
                            $query->where('user_id', $user->id);
                        }
                    ])
                    ->withCount(['lessons', 'certificates'])
                    ->orderBy('pivot_enrolled_at', 'desc')
                    ->get();

                // Get student progress
                $stats = $this->getStudentStats($user->id);
            }

            return Inertia::render('dashboard', [
                'courses' => $courses,
                'isAdmin' => $user->role === 'admin',
                'stats' => $stats,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in DashboardController@index', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('dashboard', [
                'courses' => [],
                'isAdmin' => Auth::user()->role === 'admin',
                'stats' => [],
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
            ]);
        }
    }

    /**
     * Get admin statistics
     */
    private function getAdminStats(int $userId): array
    {
        $stats = DB::select("
            SELECT 
                COUNT(DISTINCT c.id) as total_courses,
                COUNT(DISTINCT l.id) as total_lessons,
                COUNT(DISTINCT cu.user_id) as total_students,
                COUNT(DISTINCT cert.id) as total_certificates,
                ROUND(
                    (COUNT(DISTINCT CASE WHEN cu.status = 'completed' THEN cu.user_id END) * 100.0) / 
                    NULLIF(COUNT(DISTINCT cu.user_id), 0), 2
                ) as avg_completion
            FROM courses c
            LEFT JOIN lessons l ON c.id = l.course_id
            LEFT JOIN course_user cu ON c.id = cu.course_id
            LEFT JOIN certificates cert ON c.id = cert.course_id
            WHERE c.created_by = ?
        ", [$userId]);

        $recentActivity = DB::table('course_user')
            ->join('courses', 'course_user.course_id', '=', 'courses.id')
            ->join('users', 'course_user.user_id', '=', 'users.id')
            ->select('users.name', 'courses.title as course_title', 'course_user.enrolled_at')
            ->where('courses.created_by', $userId)
            ->orderBy('course_user.enrolled_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'total_courses' => $stats[0]->total_courses ?? 0,
            'total_lessons' => $stats[0]->total_lessons ?? 0,
            'total_students' => $stats[0]->total_students ?? 0,
            'total_certificates' => $stats[0]->total_certificates ?? 0,
            'avg_completion' => round($stats[0]->avg_completion ?? 0, 2),
            'recent_activity' => $recentActivity
        ];
    }

    /**
     * Get student statistics
     */
    private function getStudentStats(int $userId): array
    {
        $stats = DB::select("
            SELECT 
                COUNT(DISTINCT cu.course_id) as enrolled_courses,
                COUNT(DISTINCT lp.lesson_id) as completed_lessons,
                COUNT(DISTINCT cert.id) as earned_certificates,
                ROUND(
                    (COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.lesson_id END) * 100.0) / 
                    NULLIF(COUNT(DISTINCT lp.lesson_id), 0), 2
                ) as avg_progress
            FROM course_user cu
            LEFT JOIN lesson_progress lp ON cu.user_id = lp.user_id 
                AND lp.lesson_id IN (
                    SELECT id FROM lessons WHERE course_id = cu.course_id
                )
            LEFT JOIN certificates cert ON cu.course_id = cert.course_id AND cert.user_id = cu.user_id
            WHERE cu.user_id = ?
        ", [$userId]);

        $recentProgress = DB::table('lesson_progress')
            ->join('lessons', 'lesson_progress.lesson_id', '=', 'lessons.id')
            ->join('courses', 'lessons.course_id', '=', 'courses.id')
            ->select('courses.title as course_title', 'lessons.title as lesson_title', 'lesson_progress.completed_at')
            ->where('lesson_progress.user_id', $userId)
            ->where('lesson_progress.status', 'completed')
            ->orderBy('lesson_progress.completed_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'enrolled_courses' => $stats[0]->enrolled_courses ?? 0,
            'completed_lessons' => $stats[0]->completed_lessons ?? 0,
            'earned_certificates' => $stats[0]->earned_certificates ?? 0,
            'avg_progress' => round($stats[0]->avg_progress ?? 0, 2),
            'recent_progress' => $recentProgress
        ];
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
}
