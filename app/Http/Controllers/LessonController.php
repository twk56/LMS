<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonFile;
use App\Http\Requests\StoreLessonRequest;
use App\Http\Requests\StoreLessonFileRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LessonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(?Course $course = null)
    {
        try {
            Log::info('LessonController@index: Starting lessons page load', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'course_id' => $course?->id
            ]);

            $user = Auth::user();
            if (!$user) {
                Log::warning('LessonController@index: User not authenticated, redirecting to login');
                return redirect()->route('login');
            }

            if ($course) {
                // Course-specific lessons
                $lessons = $course->lessons()->orderBy('order')->get();
                
                // Calculate stats for this course
                $stats = [
                    'total_lessons' => $lessons->count(),
                'published_lessons' => $lessons->where('status', 'published')->count(),
                'draft_lessons' => $lessons->where('status', 'draft')->count(),
                'video_lessons' => $lessons->where('content_type', 'video')->count(),
                'document_lessons' => $lessons->where('content_type', 'document')->count(),
            ];
            
            return Inertia::render('lessons/index', [
                'course' => $course,
                'lessons' => $lessons,
                'stats' => $stats,
                'isAdmin' => Auth::user()->role === 'admin',
            ]);
        } else {
            // All lessons across all courses
            $user = Auth::user();
            $lessons = Lesson::with(['course'])
                ->when($user->role !== 'admin', function ($query) {
                    $query->whereHas('course', function ($q) {
                        $q->where('status', 'published');
                    });
                })
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Calculate stats for all lessons
            $stats = [
                'total_lessons' => $lessons->count(),
                'published_lessons' => $lessons->where('status', 'published')->count(),
                'draft_lessons' => $lessons->where('status', 'draft')->count(),
                'video_lessons' => $lessons->where('content_type', 'video')->count(),
                'document_lessons' => $lessons->where('content_type', 'document')->count(),
            ];
            
            return Inertia::render('lessons/index', [
                'lessons' => $lessons,
                'stats' => $stats,
                'isAdmin' => $user->role === 'admin',
            ]);
        }

        } catch (\Exception $e) {
            Log::error('LessonController@index: Fatal error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('lessons/index', [
                'lessons' => [],
                'isAdmin' => Auth::user()?->role === 'admin',
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลบทเรียน'
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Course $course): Response
    {
        $this->authorize('create', Lesson::class);
        
        return Inertia::render('lessons/create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLessonRequest $request, Course $course)
    {
        try {
            Log::info('LessonController@store: Starting lesson creation', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'lesson_title' => $request->input('title')
            ]);

            $lesson = $course->lessons()->create($request->validated());

            Log::info('LessonController@store: Lesson created successfully', [
                'lesson_id' => $lesson->id,
                'course_id' => $course->id,
                'user_id' => Auth::id()
            ]);

            return Redirect::route('courses.lessons.index', $course)
                ->with('success', 'Lesson created.');

        } catch (\Exception $e) {
            Log::error('LessonController@store: Fatal error', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Redirect::route('courses.lessons.index', $course)
                ->with('error', 'เกิดข้อผิดพลาดในการสร้างบทเรียน: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Lesson $lesson): Response
    {
        try {
            Log::info('LessonController@show: Starting lesson details load', [
                'lesson_id' => $lesson->id,
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email
            ]);

            $this->authorize('view', $lesson);
            
            $course = $lesson->course;
            $lesson->load('course');
            
            $nextLesson = $lesson->nextLesson();
            $previousLesson = $lesson->previousLesson();

            // Mark lesson as started for student
            $user = Auth::user();
            if ($user->role === 'student' && $lesson->isPublished()) {
                // Check if user has started this lesson
                \App\Models\LessonProgress::firstOrCreate([
                    'user_id' => $user->id,
                    'lesson_id' => $lesson->id,
                ], [
                    'started_at' => now(),
                ]);
            }

            // Get user's progress for this lesson
            $userProgress = $lesson->getUserProgress($user->id);

            Log::info('LessonController@show: Successfully loaded lesson details', [
                'lesson_id' => $lesson->id,
                'user_id' => $user->id,
                'course_id' => $course->id
            ]);

            return Inertia::render('lessons/show', [
                'lesson' => $lesson,
                'course' => $course,
                'nextLesson' => $nextLesson,
                'previousLesson' => $previousLesson,
                'isAdmin' => $user->role === 'admin',
                'userProgress' => $userProgress,
            ]);

        } catch (\Exception $e) {
            Log::error('LessonController@show: Fatal error', [
                'lesson_id' => $lesson->id,
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('lessons/show', [
                'lesson' => $lesson,
                'course' => $lesson->course,
                'nextLesson' => null,
                'previousLesson' => null,
                'isAdmin' => Auth::user()?->role === 'admin',
                'userProgress' => null,
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลบทเรียน: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lesson $lesson): Response
    {
        try {
            Log::info('LessonController@edit: Starting lesson edit page load', [
                'lesson_id' => $lesson->id,
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email
            ]);

            $this->authorize('update', $lesson);
            
            $course = $lesson->course;

            Log::info('LessonController@edit: Successfully loaded lesson edit page', [
                'lesson_id' => $lesson->id,
                'course_id' => $course->id,
                'user_id' => Auth::id()
            ]);

            return Inertia::render('lessons/edit', [
                'lesson' => $lesson,
                'course' => $course,
            ]);

        } catch (\Exception $e) {
            Log::error('LessonController@edit: Fatal error', [
                'lesson_id' => $lesson->id,
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('lessons/edit', [
                'lesson' => $lesson,
                'course' => $lesson->course,
                'error' => 'เกิดข้อผิดพลาดในการโหลดหน้าดูแก้ไขบทเรียน: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lesson $lesson)
    {
        $this->authorize('update', $lesson);
        
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'content_type' => 'nullable|in:text,rich_text,video,file',
                'order' => 'nullable|integer|min:0',
                'status' => 'required|in:draft,published',
                'youtube_url' => [
                    'nullable',
                    'url',
                    'regex:/^https:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+$|^https:\/\/youtu\.be\/[a-zA-Z0-9_-]+$/'
                ],
            ]);

            $lesson->update($request->only(['title', 'content', 'content_type', 'order', 'status', 'youtube_url']));

            return redirect()->route('lessons.show', $lesson)->with('success', 'Lesson updated successfully!');
            
        } catch (ValidationException $e) {
            Log::error('Lesson update validation failed', [
                'lesson_id' => $lesson->id,
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            
            return back()->withErrors($e->errors())->withInput();
            
        } catch (\Exception $e) {
            Log::error('Lesson update failed', [
                'lesson_id' => $lesson->id,
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            
            return back()->with('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lesson $lesson)
    {
        $this->authorize('delete', $lesson);
        
        $lesson->delete();

        return redirect()->route('lessons.index')->with('success', 'Lesson deleted successfully!');
    }

    /**
     * Mark lesson as completed
     */
    public function complete(Course $course, Lesson $lesson)
    {
        $this->authorize('view', $lesson);
        
        $user = Auth::user();
        
        if ($user->role === 'student' && $lesson->isPublished()) {
            // Check if user is enrolled in the course
            if (!\Illuminate\Support\Facades\DB::table('course_user')
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->exists()) {
                return redirect()->back()->with('error', 'You must be enrolled in this course to complete lessons.');
            }
            
            // Mark lesson as completed
            $progress = \App\Models\LessonProgress::updateOrCreate([
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
            ], [
                'status' => 'completed',
                'completed_at' => now(),
            ]);
            
            if ($progress) {
                return redirect()->back()->with('success', 'Lesson marked as completed!');
            } else {
                return redirect()->back()->with('error', 'Unable to mark lesson as completed.');
            }
        }

        return redirect()->back()->with('error', 'Unable to mark lesson as completed.');
    }

    /**
     * Determine file type from MIME type
     */
    private function getFileType($mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        } elseif ($mimeType === 'application/pdf') {
            return 'pdf';
        } else {
            return 'document';
        }
    }

    /**
     * Display lesson files
     */
    public function files(Lesson $lesson)
    {
        try {
            Log::info('LessonController@files: Starting lesson files load', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'lesson_id' => $lesson->id,
                'lesson_title' => $lesson->title
            ]);

            $user = Auth::user();
            if (!$user) {
                Log::warning('LessonController@files: User not authenticated, redirecting to login');
                return redirect()->route('login');
            }

            // Check if user has access to this lesson
            $this->authorize('view', $lesson);

            // Get lesson files (empty collection since LessonFile model was removed)
            $files = $lesson->files;

            Log::info('LessonController@files: Successfully loaded lesson files', [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
                'files_count' => $files->count()
            ]);

            return Inertia::render('lessons/files', [
                'lesson' => $lesson,
                'files' => $files,
                'isAdmin' => $user->role === 'admin',
            ]);

        } catch (\Exception $e) {
            Log::error('LessonController@files: Fatal error', [
                'user_id' => Auth::id(),
                'lesson_id' => $lesson->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('lessons/files', [
                'lesson' => $lesson,
                'files' => collect([]),
                'isAdmin' => Auth::user()?->role === 'admin',
                'error' => 'เกิดข้อผิดพลาดในการโหลดไฟล์บทเรียน: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Store a newly uploaded file
     */
    public function storeFile(StoreLessonFileRequest $request, Lesson $lesson)
    {
        try {
            Log::info('LessonController@storeFile: Starting file upload', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'lesson_id' => $lesson->id,
                'lesson_title' => $lesson->title,
                'file_name' => $request->file('file')->getClientOriginalName(),
                'file_size' => $request->file('file')->getSize()
            ]);

            $user = Auth::user();
            if (!$user) {
                Log::warning('LessonController@storeFile: User not authenticated');
                return redirect()->route('login');
            }

            // Check authorization
            $this->authorize('update', $lesson);

            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $filePath = 'lesson-files/' . $lesson->id . '/' . $filename;
            
            // Store file
            $storedPath = $file->storeAs('lesson-files/' . $lesson->id, $filename, 'public');
            
            if (!$storedPath) {
                Log::error('LessonController@storeFile: Failed to store file', [
                    'lesson_id' => $lesson->id,
                    'filename' => $filename
                ]);
                return redirect()->back()->with('error', 'ไม่สามารถอัปโหลดไฟล์ได้');
            }

            // Determine file type
            $mimeType = $file->getMimeType();
            $fileType = $this->getFileType($mimeType);

            // Create lesson file record
            $lessonFile = LessonFile::create([
                'lesson_id' => $lesson->id,
                'filename' => $filename,
                'original_name' => $originalName,
                'file_path' => $storedPath,
                'file_type' => $fileType,
                'mime_type' => $mimeType,
                'file_size' => $file->getSize(),
                'title' => $request->input('title', $originalName),
                'description' => $request->input('description'),
                'order' => $request->input('order', 0),
                'is_active' => true,
            ]);

            Log::info('LessonController@storeFile: File uploaded successfully', [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
                'file_id' => $lessonFile->id,
                'file_path' => $storedPath
            ]);

            return redirect()->back()->with('success', 'อัปโหลดไฟล์เรียบร้อยแล้ว');

        } catch (\Exception $e) {
            Log::error('LessonController@storeFile: Fatal error', [
                'user_id' => Auth::id(),
                'lesson_id' => $lesson->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' . $e->getMessage());
        }
    }

    /**
     * Update lesson file
     */
    public function updateFile(Request $request, Lesson $lesson, LessonFile $file)
    {
        try {
            Log::info('LessonController@updateFile: Starting file update', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'lesson_id' => $lesson->id,
                'file_id' => $file->id
            ]);

            $user = Auth::user();
            if (!$user) {
                Log::warning('LessonController@updateFile: User not authenticated');
                return redirect()->route('login');
            }

            // Check authorization
            $this->authorize('update', $lesson);

            $request->validate([
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string|max:1000',
                'order' => 'nullable|integer|min:0',
                'is_active' => 'nullable|boolean',
            ]);

            $file->update([
                'title' => $request->input('title', $file->title),
                'description' => $request->input('description', $file->description),
                'order' => $request->input('order', $file->order),
                'is_active' => $request->input('is_active', $file->is_active),
            ]);

            Log::info('LessonController@updateFile: File updated successfully', [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
                'file_id' => $file->id
            ]);

            return redirect()->back()->with('success', 'อัปเดตไฟล์เรียบร้อยแล้ว');

        } catch (\Exception $e) {
            Log::error('LessonController@updateFile: Fatal error', [
                'user_id' => Auth::id(),
                'lesson_id' => $lesson->id,
                'file_id' => $file->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'เกิดข้อผิดพลาดในการอัปเดตไฟล์: ' . $e->getMessage());
        }
    }

    /**
     * Delete lesson file
     */
    public function destroyFile(Lesson $lesson, LessonFile $file)
    {
        try {
            Log::info('LessonController@destroyFile: Starting file deletion', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'lesson_id' => $lesson->id,
                'file_id' => $file->id,
                'file_path' => $file->file_path
            ]);

            $user = Auth::user();
            if (!$user) {
                Log::warning('LessonController@destroyFile: User not authenticated');
                return redirect()->route('login');
            }

            // Check authorization
            $this->authorize('update', $lesson);

            // Delete file from storage
            if (Storage::disk('public')->exists($file->file_path)) {
                Storage::disk('public')->delete($file->file_path);
            }

            // Delete database record
            $file->delete();

            Log::info('LessonController@destroyFile: File deleted successfully', [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
                'file_id' => $file->id
            ]);

            return redirect()->back()->with('success', 'ลบไฟล์เรียบร้อยแล้ว');

        } catch (\Exception $e) {
            Log::error('LessonController@destroyFile: Fatal error', [
                'user_id' => Auth::id(),
                'lesson_id' => $lesson->id,
                'file_id' => $file->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'เกิดข้อผิดพลาดในการลบไฟล์: ' . $e->getMessage());
        }
    }
}
