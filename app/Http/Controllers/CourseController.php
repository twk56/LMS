<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
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
                'search' => $search,
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
            $categories = CourseCategory::active()->ordered()->get();
            
            return Inertia::render('courses/create', [
                'categories' => $categories,
            ]);
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
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'image' => 'nullable|string|max:500',
                'category_id' => 'nullable|exists:course_categories,id',
                'status' => 'required|in:draft,published',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withInput()
                    ->withErrors($validator);
            }

            $course = Course::create([
                'title' => $request->title,
                'description' => $request->description,
                'image' => $request->image,
                'category_id' => $request->category_id,
                'status' => $request->status,
                'created_by' => Auth::id(),
            ]);

            Log::info('Course created successfully', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'title' => $course->title
            ]);

            return redirect()->route('courses.show', $course)
                ->with('success', 'สร้างหลักสูตรสำเร็จ!');

        } catch (Exception $e) {
            Log::error('Error creating course', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'เกิดข้อผิดพลาดในการสร้างหลักสูตร: ' . $e->getMessage()]);
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
    public function edit(Course $course): Response
    {
        try {
            $this->authorize('update', $course);
            
            $categories = CourseCategory::active()->ordered()->get();
            
            return Inertia::render('courses/edit', [
                'course' => $course,
                'categories' => $categories,
            ]);
        } catch (Exception $e) {
            Log::error('Error in CourseController@edit', [
                'course_id' => $course->id,
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
    public function update(Request $request, Course $course)
    {
        try {
            $this->authorize('update', $course);

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'image' => 'nullable|string|max:500',
                'category_id' => 'nullable|exists:course_categories,id',
                'status' => 'required|in:draft,published',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withInput()
                    ->withErrors($validator);
            }

            $course->update($request->only(['title', 'description', 'image', 'category_id', 'status']));

            Log::info('Course updated successfully', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'title' => $course->title
            ]);

            return redirect()->route('courses.show', $course)
                ->with('success', 'อัปเดตหลักสูตรสำเร็จ!');

        } catch (Exception $e) {
            Log::error('Error updating course', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'เกิดข้อผิดพลาดในการอัปเดตหลักสูตร: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        try {
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
                'course_id' => $course->id,
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
    public function enroll(Course $course)
    {
        try {
            $user = Auth::user();
            
            // Check if user is already enrolled
            if ($user->enrolledCourses()->where('course_id', $course->id)->exists()) {
                return redirect()->back()
                    ->with('info', 'คุณได้ลงทะเบียนหลักสูตรนี้แล้ว');
            }

            // Check if course is published
            if (!$course->isPublished()) {
                return redirect()->back()
                    ->withErrors(['error' => 'ไม่สามารถลงทะเบียนหลักสูตรที่ยังไม่เผยแพร่ได้']);
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
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'เกิดข้อผิดพลาดในการลงทะเบียน: ' . $e->getMessage()]);
        }
    }
}
