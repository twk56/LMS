<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Auth\Access\AuthorizationException;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $user = Auth::user();
            $search = $request->get('search');
            
            if (!$user) {
                // Guest users see only published courses
                $courses = Course::with(['creator', 'category'])
                    ->where('status', 'published')
                    ->when($search, function ($query, $search) {
                        $query->where('title', 'like', "%{$search}%")
                              ->orWhere('description', 'like', "%{$search}%");
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();
                
                return Inertia::render('courses/index', [
                    'courses' => $courses,
                    'isAdmin' => false,
                    'search' => $search,
                ]);
            }
            
            if ($user->role === 'admin') {
                $courses = Course::with(['creator', 'category'])
                    ->where('created_by', $user->id)
                    ->when($search, function ($query, $search) {
                        $query->where('title', 'like', "%{$search}%")
                              ->orWhere('description', 'like', "%{$search}%");
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                $courses = Course::with(['creator', 'category'])
                    ->where('status', 'published')
                    ->when($search, function ($query, $search) {
                        $query->where('title', 'like', "%{$search}%")
                              ->orWhere('description', 'like', "%{$search}%");
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();
            }

            return Inertia::render('courses/index', [
                'courses' => $courses,
                'isAdmin' => $user->role === 'admin',
                'search' => $request->get('search'),
            ]);
        } catch (Exception $e) {
            Log::error('Error in CourseController@index', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('courses/index', [
                'courses' => [],
                'isAdmin' => Auth::user()->role === 'admin',
                'search' => $request->get('search'),
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตร'
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        try {
            $this->authorize('create', Course::class);
            
            $categories = CourseCategory::active()->ordered()->get();
            
            return Inertia::render('courses/create', [
                'categories' => $categories,
            ]);
        } catch (AuthorizationException $e) {
            abort(403, 'คุณไม่มีสิทธิ์สร้างหลักสูตร');
        } catch (Exception $e) {
            Log::error('Error in CourseController@create', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('courses/create', [
                'categories' => [],
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่'
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseRequest $request)
    {
        try {
            $this->authorize('create', Course::class);
            
            $course = Course::create([
                'title' => $request->validated('title'),
                'description' => $request->validated('description'),
                'image' => $request->validated('image'),
                'category_id' => $request->validated('category_id'),
                'status' => $request->validated('status'),
                'created_by' => Auth::id(),
            ]);

            Log::info('Course created successfully', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'title' => $course->title
            ]);

            return Redirect::route('courses.show', $course)
                ->with('success', 'Course created successfully!');
        } catch (AuthorizationException $e) {
            abort(403, 'คุณไม่มีสิทธิ์สร้างหลักสูตร');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course): Response
    {
        try {
            $this->authorize('view', $course);

            $course->load(['lessons' => function ($query) {
                $query->orderBy('order');
            }, 'creator', 'category']);

            $user = Auth::user();
            $isEnrolled = $user->enrolledCourses()->where('course_id', $course->id)->exists();

            return Inertia::render('courses/show', [
                'course' => $course,
                'isAdmin' => $user->role === 'admin',
                'isEnrolled' => $isEnrolled,
            ]);
        } catch (AuthorizationException $e) {
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงหลักสูตรนี้');
        } catch (Exception $e) {
            Log::error('Error in CourseController@show', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตร');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id): Response
    {
        try {
            // Manual model loading instead of route model binding
            $course = Course::findOrFail($id);
            
            $this->authorize('update', $course);
            
            $categories = CourseCategory::active()->ordered()->get();
            
            return Inertia::render('courses/edit', [
                'course' => $course,
                'categories' => $categories,
            ]);
        } catch (Exception $e) {
            Log::error('Error in CourseController@edit', [
                'course_id' => $id ?? 'unknown',
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตร');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseRequest $request, $id)
    {
        try {
            // Manual model loading instead of route model binding
            $course = Course::findOrFail($id);
            
            $this->authorize('update', $course);

            $course->update($request->validated());

            Log::info('Course updated successfully', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'title' => $course->title
            ]);

            return Redirect::route('courses.show', $course)
                ->with('success', 'Course updated successfully!');
        } catch (Exception $e) {
            Log::error('Error updating course', [
                'course_id' => $id ?? 'unknown',
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'เกิดข้อผิดพลาดในการอัปเดตหลักสูตร');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            // Manual model loading instead of route model binding
            $course = Course::findOrFail($id);
            
            $this->authorize('delete', $course);

            // Check if course has enrolled students
            if ($course->students()->count() > 0) {
                return redirect()->back()
                    ->withErrors(['error' => 'ไม่สามารถลบหลักสูตรที่มีผู้เรียนลงทะเบียนอยู่ได้']);
            }

            $courseTitle = $course->title;
            $course->delete();

            Log::info('Course deleted successfully', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'title' => $courseTitle
            ]);

            return redirect()->route('courses.index')
                ->with('success', 'ลบหลักสูตรสำเร็จ!');

        } catch (Exception $e) {
            Log::error('Error deleting course', [
                'course_id' => $id ?? 'unknown',
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'เกิดข้อผิดพลาดในการลบหลักสูตร: ' . $e->getMessage()]);
        }
    }

    /**
     * Enroll user in a course
     */
    public function enroll($id)
    {
        try {
            // Manual model loading instead of route model binding
            $course = Course::findOrFail($id);
            
            $user = Auth::user();
            
            // Check if user is already enrolled
            if ($user->enrolledCourses()->where('course_id', $course->id)->exists()) {
                return redirect()->back()
                    ->with('info', 'คุณได้ลงทะเบียนหลักสูตรนี้แล้ว');
            }

            // Check if course is published
            if (!$course->isPublished()) {
                abort(403, 'ไม่สามารถลงทะเบียนหลักสูตรที่ยังไม่เผยแพร่ได้');
            }

            $user->enrolledCourses()->attach($course->id, [
                'status' => 'enrolled',
                'enrolled_at' => now(),
            ]);

            Log::info('User enrolled in course', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'course_title' => $course->title
            ]);

            return redirect()->route('courses.show', $course)
                ->with('success', 'ลงทะเบียนหลักสูตรสำเร็จ!');

        } catch (Exception $e) {
            Log::error('Error enrolling user in course', [
                'user_id' => Auth::id(),
                'course_id' => $id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'เกิดข้อผิดพลาดในการลงทะเบียน: ' . $e->getMessage()]);
        }
    }
}
