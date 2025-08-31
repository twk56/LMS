<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    public function getDashboardStats(): array
    {
        return [
            'total_users' => User::count(),
            'total_courses' => Course::count(),
            'total_lessons' => Lesson::count(),
            'total_quizzes' => Quiz::count(),
            'active_enrollments' => DB::table('course_user')->where('status', 'enrolled')->count(),
            'completed_courses' => DB::table('course_user')->where('status', 'completed')->count(),
        ];
    }

    public function getCourseAnalytics(int $courseId): array
    {
        $course = Course::findOrFail($courseId);
        
        return [
            'course' => $course,
            'enrollment_count' => $course->students()->count(),
            'completion_rate' => $this->calculateCompletionRate($courseId),
            'average_score' => $this->calculateAverageScore($courseId),
            'lesson_progress' => $this->getLessonProgress($courseId),
            'quiz_performance' => $this->getQuizPerformance($courseId),
            'recent_activity' => $this->getRecentActivity($courseId),
        ];
    }

    public function getUserProgress(int $userId): array
    {
        $user = User::findOrFail($userId);
        
        return [
            'user' => $user,
            'enrolled_courses' => $user->enrolledCourses()->count(),
            'completed_courses' => $user->completedCourses()->count(),
            'total_lessons_completed' => $user->lessonProgress()->count(),
            'average_quiz_score' => $this->getUserAverageQuizScore($userId),
            'learning_streak' => $this->calculateLearningStreak($userId),
            'course_progress' => $this->getUserCourseProgress($userId),
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
}
