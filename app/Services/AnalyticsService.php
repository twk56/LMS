<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\User;
use App\Models\CourseCategory;
use App\Models\LessonProgress;
use App\Models\QuizAttempt;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    public function getDashboardStats(): array
    {
        $totalUsers = User::count();
        $totalCourses = Course::count();
        $totalLessons = Lesson::count();
        $totalQuizzes = Quiz::count();
        
        // Calculate completion rate
        $totalEnrollments = DB::table('course_user')->count();
        $completedCourses = DB::table('course_user')->where('status', 'completed')->count();
        $completionRate = $totalEnrollments > 0 ? round(($completedCourses / $totalEnrollments) * 100, 2) : 0;

        return [
            'total_users' => $totalUsers,
            'total_courses' => $totalCourses,
            'total_lessons' => $totalLessons,
            'completion_rate' => $completionRate,
            'recent_activities' => $this->getRecentActivities(),
            'course_stats' => $this->getCourseStats(),
            'monthly_courses' => $this->getMonthlyCourses(),
            'user_growth' => $this->getUserGrowth(),
            'category_distribution' => $this->getCategoryDistribution(),
            'progress_trend' => $this->getProgressTrend(),
        ];
    }

    public function getCourseAnalytics(int $courseId): array
    {
        $course = Course::findOrFail($courseId);
        
        return [
            'course' => $course,
            'enrollment_stats' => $this->getCourseEnrollmentStats($courseId),
            'completion_rates' => $this->getCourseCompletionRates($courseId),
            'lesson_progress' => $this->getCourseLessonProgress($courseId),
            'student_engagement' => $this->getCourseStudentEngagement($courseId),
            'time_spent' => $this->getCourseTimeSpent($courseId),
            'quiz_scores' => $this->getCourseQuizScores($courseId),
        ];
    }

    public function getUserProgress(int $userId): array
    {
        $user = User::findOrFail($userId);
        
        return [
            'user' => $user,
            'overall_progress' => $this->calculateUserOverallProgress($userId),
            'courses_completed' => $user->completedCourses()->count(),
            'total_courses' => $user->enrolledCourses()->count(),
            'time_spent' => $this->calculateUserTimeSpent($userId),
            'average_score' => $this->getUserAverageQuizScore($userId),
            'learning_streak' => $this->calculateLearningStreak($userId),
            'course_progress' => $this->getUserCourseProgress($userId),
            'weekly_activity' => $this->getUserWeeklyActivity($userId),
            'skill_development' => $this->getUserSkillDevelopment($userId),
            'achievements' => $this->getUserAchievements($userId),
        ];
    }

    private function calculateCompletionRate(int $courseId): float
    {
        $totalEnrolled = DB::table('course_user')
            ->where('course_id', $courseId)
            ->where('status', 'enrolled')
            ->count();

        $totalCompleted = DB::table('course_user')
            ->where('course_id', $courseId)
            ->where('status', 'completed')
            ->count();

        return $totalEnrolled > 0 ? round(($totalCompleted / $totalEnrolled) * 100, 2) : 0;
    }

    private function calculateAverageScore(int $courseId): float
    {
        return DB::table('quiz_attempts')
            ->join('quizzes', 'quizzes.id', '=', 'quiz_attempts.quiz_id')
            ->where('quizzes.course_id', $courseId)
            ->whereNotNull('quiz_attempts.score')
            ->avg('quiz_attempts.score') ?? 0;
    }

    private function getLessonProgress(int $courseId): array
    {
        $lessons = Lesson::where('course_id', $courseId)->get();
        $progress = [];

        foreach ($lessons as $lesson) {
            $totalStudents = DB::table('course_user')
                ->where('course_id', $courseId)
                ->where('status', 'enrolled')
                ->count();

            $completedStudents = DB::table('lesson_progress')
                ->where('lesson_id', $lesson->id)
                ->whereNotNull('completed_at')
                ->count();

            $progress[] = [
                'lesson' => $lesson,
                'completion_rate' => $totalStudents > 0 ? round(($completedStudents / $totalStudents) * 100, 2) : 0,
            ];
        }

        return $progress;
    }

    private function getQuizPerformance(int $courseId): array
    {
        return DB::table('quiz_attempts')
            ->join('quizzes', 'quizzes.id', '=', 'quiz_attempts.quiz_id')
            ->where('quizzes.course_id', $courseId)
            ->select(
                'quizzes.title',
                DB::raw('COUNT(*) as total_attempts'),
                DB::raw('AVG(quiz_attempts.score) as average_score'),
                DB::raw('MAX(quiz_attempts.score) as highest_score')
            )
            ->groupBy('quizzes.id', 'quizzes.title')
            ->get()
            ->toArray();
    }

    private function getRecentActivity(int $courseId): array
    {
        return DB::table('lesson_progress')
            ->join('lessons', 'lessons.id', '=', 'lesson_progress.lesson_id')
            ->join('users', 'users.id', '=', 'lesson_progress.user_id')
            ->where('lessons.course_id', $courseId)
            ->whereNotNull('lesson_progress.completed_at')
            ->select('users.name', 'lessons.title as lesson_title', 'lesson_progress.completed_at')
            ->orderBy('lesson_progress.completed_at', 'desc')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getUserAverageQuizScore(int $userId): float
    {
        return DB::table('quiz_attempts')
            ->where('user_id', $userId)
            ->whereNotNull('score')
            ->avg('score') ?? 0;
    }

    private function calculateLearningStreak(int $userId): int
    {
        $activities = DB::table('lesson_progress')
            ->where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->orderBy('completed_at', 'desc')
            ->get();

        $streak = 0;
        $currentDate = Carbon::now();

        foreach ($activities as $activity) {
            $activityDate = Carbon::parse($activity->completed_at)->startOfDay();
            
            if ($currentDate->diffInDays($activityDate) <= 1) {
                $streak++;
                $currentDate = $activityDate;
            } else {
                break;
            }
        }

        return $streak;
    }

    private function getUserCourseProgress(int $userId): array
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

    // New methods for real data analytics

    private function getRecentActivities(): array
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
                'lesson_progress.completed_at as created_at',
                DB::raw("'completed_lesson' as description")
            )
            ->orderBy('lesson_progress.completed_at', 'desc')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getCourseStats(): array
    {
        return Course::with(['category', 'creator'])
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

    private function getMonthlyCourses(): array
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $count = Course::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            $months[] = [
                'month' => $date->format('M'),
                'courses' => $count,
            ];
        }
        return $months;
    }

    private function getUserGrowth(): array
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $count = User::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            $months[] = [
                'month' => $date->format('M'),
                'users' => $count,
            ];
        }
        return $months;
    }

    private function getCategoryDistribution(): array
    {
        return CourseCategory::withCount('courses')
            ->whereHas('courses')
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'value' => $category->courses_count,
                ];
            })
            ->toArray();
    }

    private function getProgressTrend(): array
    {
        $weeks = [];
        for ($i = 5; $i >= 0; $i--) {
            $startDate = Carbon::now()->subWeeks($i)->startOfWeek();
            $endDate = Carbon::now()->subWeeks($i)->endOfWeek();
            
            $completedLessons = LessonProgress::whereBetween('completed_at', [$startDate, $endDate])
                ->count();
            
            $weeks[] = [
                'week' => 'สัปดาห์ ' . (6 - $i),
                'progress' => $completedLessons * 10, // Convert to percentage-like scale
            ];
        }
        return $weeks;
    }

    // Course Analytics Methods

    private function getCourseEnrollmentStats(int $courseId): array
    {
        $weeks = [];
        for ($i = 5; $i >= 0; $i--) {
            $startDate = Carbon::now()->subWeeks($i)->startOfWeek();
            $endDate = Carbon::now()->subWeeks($i)->endOfWeek();
            
            $enrollments = DB::table('course_user')
                ->where('course_id', $courseId)
                ->whereBetween('enrolled_at', [$startDate, $endDate])
                ->count();
            
            $weeks[] = [
                'week' => 'สัปดาห์ ' . (6 - $i),
                'enrollments' => $enrollments,
            ];
        }
        return $weeks;
    }

    private function getCourseCompletionRates(int $courseId): array
    {
        $totalEnrolled = DB::table('course_user')->where('course_id', $courseId)->count();
        $completed = DB::table('course_user')
            ->where('course_id', $courseId)
            ->where('status', 'completed')
            ->count();
        
        return [
            ['rate' => $totalEnrolled > 0 ? round(($completed / $totalEnrolled) * 100, 2) : 0]
        ];
    }

    private function getCourseLessonProgress(int $courseId): array
    {
        return Lesson::where('course_id', $courseId)
            ->withCount(['progress as completed_count' => function ($query) {
                $query->whereNotNull('completed_at');
            }])
            ->get()
            ->map(function ($lesson, $index) {
                return [
                    'lesson' => 'บทที่ ' . ($index + 1),
                    'progress' => $lesson->completed_count * 10, // Convert to percentage-like scale
                ];
            })
            ->toArray();
    }

    private function getCourseStudentEngagement(int $courseId): array
    {
        $days = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
        $engagement = [];
        
        foreach ($days as $day) {
            $engagement[] = [
                'day' => $day,
                'engagement' => rand(50, 90) / 10, // Mock data for now
            ];
        }
        
        return $engagement;
    }

    private function getCourseTimeSpent(int $courseId): array
    {
        $totalTime = LessonProgress::whereHas('lesson', function ($query) use ($courseId) {
            $query->where('course_id', $courseId);
        })
        ->whereNotNull('completed_at')
        ->count() * 2; // Mock: 2 hours per completed lesson
        
        return [
            ['average' => $totalTime]
        ];
    }

    private function getCourseQuizScores(int $courseId): array
    {
        $scores = QuizAttempt::whereHas('quiz', function ($query) use ($courseId) {
            $query->where('course_id', $courseId);
        })
        ->whereNotNull('score')
        ->pluck('score')
        ->toArray();
        
        $ranges = [
            ['range' => '90-100', 'count' => 0],
            ['range' => '80-89', 'count' => 0],
            ['range' => '70-79', 'count' => 0],
            ['range' => '60-69', 'count' => 0],
            ['range' => 'ต่ำกว่า 60', 'count' => 0],
        ];
        
        foreach ($scores as $score) {
            if ($score >= 90) $ranges[0]['count']++;
            elseif ($score >= 80) $ranges[1]['count']++;
            elseif ($score >= 70) $ranges[2]['count']++;
            elseif ($score >= 60) $ranges[3]['count']++;
            else $ranges[4]['count']++;
        }
        
        return $ranges;
    }

    // User Progress Methods

    private function calculateUserOverallProgress(int $userId): int
    {
        $totalLessons = Lesson::whereHas('course', function ($query) use ($userId) {
            $query->whereHas('students', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            });
        })->count();
        
        $completedLessons = LessonProgress::where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->count();
        
        return $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;
    }

    private function calculateUserTimeSpent(int $userId): int
    {
        return LessonProgress::where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->count() * 2; // Mock: 2 hours per completed lesson
    }

    private function getUserWeeklyActivity(int $userId): array
    {
        $weeks = [];
        for ($i = 5; $i >= 0; $i--) {
            $startDate = Carbon::now()->subWeeks($i)->startOfWeek();
            $endDate = Carbon::now()->subWeeks($i)->endOfWeek();
            
            $completedLessons = LessonProgress::where('user_id', $userId)
                ->whereBetween('completed_at', [$startDate, $endDate])
                ->count();
            
            $weeks[] = [
                'week' => 'สัปดาห์ ' . (6 - $i),
                'hours' => $completedLessons * 2, // Mock: 2 hours per lesson
            ];
        }
        return $weeks;
    }

    private function getUserSkillDevelopment(int $userId): array
    {
        // Mock data for skill development
        return [
            ['skill' => 'Programming', 'level' => rand(60, 90)],
            ['skill' => 'Design', 'level' => rand(40, 80)],
            ['skill' => 'Database', 'level' => rand(30, 70)],
            ['skill' => 'DevOps', 'level' => rand(20, 60)],
        ];
    }

    private function getUserAchievements(int $userId): array
    {
        $completedCourses = DB::table('course_user')
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->count();
        
        $achievements = [];
        
        if ($completedCourses >= 1) {
            $achievements[] = [
                'title' => 'ผู้เรียนคนแรก',
                'description' => 'เสร็จสิ้นหลักสูตรแรก',
                'date' => 'เมื่อเร็วๆ นี้',
            ];
        }
        
        if ($completedCourses >= 3) {
            $achievements[] = [
                'title' => 'ผู้เรียนที่ขยัน',
                'description' => 'เสร็จสิ้น 3 หลักสูตร',
                'date' => 'เมื่อเร็วๆ นี้',
            ];
        }
        
        return $achievements;
    }
}
