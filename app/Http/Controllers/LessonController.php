<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Http\Requests\StoreLessonRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage; // Added for file handling

class LessonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Course $course = null): Response
    {
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
            $lessons = Lesson::with(['course', 'creator'])
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
        $course->lessons()->create($request->validated());
        return Redirect::route('courses.lessons.index', $course)
            ->with('success', 'Lesson created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Lesson $lesson): Response
    {
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

        return Inertia::render('lessons/show', [
            'lesson' => $lesson,
            'course' => $course,
            'nextLesson' => $nextLesson,
            'previousLesson' => $previousLesson,
            'isAdmin' => $user->role === 'admin',
            'userProgress' => $userProgress,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lesson $lesson): Response
    {
        $this->authorize('update', $lesson);
        
        $course = $lesson->course;
        return Inertia::render('lessons/edit', [
            'lesson' => $lesson,
            'course' => $course,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lesson $lesson)
    {
        $this->authorize('update', $lesson);
        
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
            \App\Models\LessonProgress::updateOrCreate([
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
            ], [
                'completed_at' => now(),
            ]);
            return redirect()->back()->with('success', 'Lesson marked as completed!');
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
}
