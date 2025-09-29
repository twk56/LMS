<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class MyCoursesController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display user's enrolled courses
     */
    public function index()
    {
        try {
            Log::info('MyCoursesController@index: Starting my courses page load', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email
            ]);

            $user = Auth::user();
            
            if (!$user) {
                Log::warning('MyCoursesController@index: User not authenticated, redirecting to login');
                return redirect()->route('login');
            }

            // Get user's enrolled courses
            $courses = $user->courses()->with(['category', 'lessons'])->get()->map(function ($course) use ($user) {
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
                        'status' => $progressPercentage === 100 ? 'completed' : ($progressPercentage > 0 ? 'in_progress' : 'not_started'),
                    ];
                } catch (\Exception $e) {
                    Log::error('MyCoursesController@index: Error processing course', [
                        'course_id' => $course->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return null;
                }
            })->filter();

            Log::info('MyCoursesController@index: Successfully loaded my courses', [
                'user_id' => $user->id,
                'total_courses' => $courses->count()
            ]);

            return Inertia::render('MyCourses/Index', [
                'courses' => $courses,
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('MyCoursesController@index: Fatal error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('MyCourses/Index', [
                'courses' => [],
                'user' => Auth::user(),
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตรของฉัน'
            ]);
        }
    }
}