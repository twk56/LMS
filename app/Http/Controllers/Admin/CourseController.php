<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('can:admin');
    }

    /**
     * Display admin course management page
     */
    public function index()
    {
        try {
            Log::info('Admin\CourseController@index: Starting admin course management page load', [
                'admin_user_id' => auth()->id(),
                'admin_user_email' => auth()->user()?->email
            ]);

            $courses = Course::with(['category', 'lessons', 'users'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($course) {
                    try {
                        return [
                            'id' => $course->id,
                            'title' => $course->title,
                            'description' => $course->description,
                            'category' => $course->category?->name,
                            'total_lessons' => $course->lessons->count(),
                            'enrolled_users' => $course->users->count(),
                            'status' => $course->status ?? 'draft',
                            'created_at' => $course->created_at,
                            'updated_at' => $course->updated_at,
                        ];
                    } catch (\Exception $e) {
                        Log::error('Admin\CourseController@index: Error processing course', [
                            'course_id' => $course->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        return null;
                    }
                })->filter();

            $statistics = [
                'total_courses' => Course::count(),
                'published_courses' => Course::where('status', 'published')->count(),
                'draft_courses' => Course::where('status', 'draft')->count(),
                'total_enrollments' => Course::withCount('users')->get()->sum('users_count'),
            ];

            // Get recent activities for admin
            $recentActivities = $this->getRecentCourseActivities();

            Log::info('Admin\CourseController@index: Successfully loaded admin course management', [
                'admin_user_id' => auth()->id(),
                'total_courses' => $courses->count(),
                'statistics' => $statistics
            ]);

            return Inertia::render('Admin/Courses/Index', [
                'courses' => $courses,
                'statistics' => $statistics,
                'recentActivities' => $recentActivities,
            ]);

        } catch (\Exception $e) {
            Log::error('Admin\CourseController@index: Fatal error', [
                'admin_user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Admin/Courses/Index', [
                'courses' => [],
                'statistics' => [
                    'total_courses' => 0,
                    'published_courses' => 0,
                    'draft_courses' => 0,
                    'total_enrollments' => 0,
                ],
                'recentActivities' => [],
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตร'
            ]);
        }
    }

    /**
     * Get recent course activities for admin dashboard
     */
    private function getRecentCourseActivities(): array
    {
        try {
            Log::info('Admin\CourseController@getRecentCourseActivities: Starting to collect recent course activities');

            $activities = [];

            // Recent course enrollments
            $recentEnrollments = \DB::table('course_user')
                ->join('users', 'course_user.user_id', '=', 'users.id')
                ->join('courses', 'course_user.course_id', '=', 'courses.id')
                ->select('users.name as user_name', 'courses.title as course_title', 'course_user.created_at')
                ->orderBy('course_user.created_at', 'desc')
                ->limit(5)
                ->get();

            foreach ($recentEnrollments as $enrollment) {
                $activities[] = [
                    'type' => 'enrollment',
                    'message' => "{$enrollment->user_name} ลงทะเบียนหลักสูตร {$enrollment->course_title}",
                    'created_at' => $enrollment->created_at,
                    'icon' => 'user-plus'
                ];
            }

            // Recent course completions
            $recentCompletions = \DB::table('lesson_progress')
                ->join('users', 'lesson_progress.user_id', '=', 'users.id')
                ->join('lessons', 'lesson_progress.lesson_id', '=', 'lessons.id')
                ->join('courses', 'lessons.course_id', '=', 'courses.id')
                ->where('lesson_progress.completed', true)
                ->select('users.name as user_name', 'lessons.title as lesson_title', 'courses.title as course_title', 'lesson_progress.updated_at')
                ->orderBy('lesson_progress.updated_at', 'desc')
                ->limit(5)
                ->get();

            foreach ($recentCompletions as $completion) {
                $activities[] = [
                    'type' => 'completion',
                    'message' => "{$completion->user_name} เรียนจบบทเรียน {$completion->lesson_title} ในหลักสูตร {$completion->course_title}",
                    'created_at' => $completion->updated_at,
                    'icon' => 'check-circle'
                ];
            }

            // Sort by created_at desc and limit to 10
            usort($activities, function($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });

            $activities = array_slice($activities, 0, 10);

            Log::info('Admin\CourseController@getRecentCourseActivities: Successfully collected recent course activities', [
                'activities_count' => count($activities)
            ]);

            return $activities;

        } catch (\Exception $e) {
            Log::error('Admin\CourseController@getRecentCourseActivities: Error collecting recent course activities', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }
}