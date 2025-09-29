<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class UserProgressController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display user progress page
     */
    public function index()
    {
        try {
            Log::info('UserProgressController@index: Starting user progress page load', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email
            ]);

            $user = Auth::user();
            
            if (!$user) {
                Log::warning('UserProgressController@index: User not authenticated, redirecting to login');
                return redirect()->route('login');
            }

            // Get user's enrolled courses with progress
            $courses = $user->courses()->with(['lessons', 'category'])->get()->map(function ($course) use ($user) {
                try {
                    $totalLessons = $course->lessons->count();
                    $completedLessons = $course->lessons()->whereHas('progress', function ($query) use ($user) {
                        $query->where('user_id', $user->id)->where('is_completed', true);
                    })->count();
                    
                    $progressPercentage = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 2) : 0;
                    
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'category' => $course->category?->name,
                        'total_lessons' => $totalLessons,
                        'completed_lessons' => $completedLessons,
                        'progress_percentage' => $progressPercentage,
                        'enrolled_at' => $course->pivot->created_at,
                    ];
                } catch (\Exception $e) {
                    Log::error('UserProgressController@index: Error processing course', [
                        'course_id' => $course->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return null;
                }
            })->filter();

            // Get overall statistics
            $totalCourses = $courses->count();
            $completedCourses = $courses->where('progress_percentage', 100)->count();
            $inProgressCourses = $courses->where('progress_percentage', '>', 0)->where('progress_percentage', '<', 100)->count();
            $averageProgress = $courses->avg('progress_percentage');

            Log::info('UserProgressController@index: Successfully loaded user progress', [
                'user_id' => $user->id,
                'total_courses' => $totalCourses,
                'completed_courses' => $completedCourses,
                'in_progress_courses' => $inProgressCourses,
                'average_progress' => $averageProgress
            ]);

            return Inertia::render('UserProgress/Index', [
                'courses' => $courses,
                'statistics' => [
                    'total_courses' => $totalCourses,
                    'completed_courses' => $completedCourses,
                    'in_progress_courses' => $inProgressCourses,
                    'average_progress' => round($averageProgress, 2),
                ],
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('UserProgressController@index: Fatal error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('UserProgress/Index', [
                'courses' => [],
                'statistics' => [
                    'total_courses' => 0,
                    'completed_courses' => 0,
                    'in_progress_courses' => 0,
                    'average_progress' => 0,
                ],
                'user' => Auth::user(),
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลความก้าวหน้า'
            ]);
        }
    }
}