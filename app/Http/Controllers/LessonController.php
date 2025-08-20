<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage; // Added for file handling

class LessonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Course $course): Response
    {
        return Inertia::render('lessons/create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Course $course)
    {
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
            'files.*' => 'nullable|file|max:2048', // 2MB max per file (reduced from 10MB)
            'file_titles.*' => 'nullable|string|max:255',
            'file_descriptions.*' => 'nullable|string',
        ]);

        try {
            $lesson = $course->lessons()->create([
                'title' => $request->title,
                'content' => $request->content,
                'content_type' => $request->content_type ?? 'text',
                'order' => $request->order ?? $course->lessons()->count(),
                'status' => $request->status,
                'youtube_url' => $request->youtube_url,
            ]);

            // Handle file uploads
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $index => $file) {
                    if ($file->isValid()) {
                        $filename = time() . '_' . $file->getClientOriginalName();
                        $filePath = $file->storeAs('lesson-files/' . $lesson->id, $filename, 'public');

                        // Determine file type
                        $mimeType = $file->getMimeType();
                        $fileType = $this->getFileType($mimeType);

                        $lesson->files()->create([
                            'filename' => $filename,
                            'original_name' => $file->getClientOriginalName(),
                            'file_path' => $filePath,
                            'file_type' => $fileType,
                            'mime_type' => $mimeType,
                            'file_size' => $file->getSize(),
                            'title' => $request->input("file_titles.{$index}"),
                            'description' => $request->input("file_descriptions.{$index}"),
                            'order' => $lesson->files()->count(),
                        ]);
                    } else {
                        Log::warning('Invalid file upload', [
                            'file' => $file->getClientOriginalName(),
                            'error' => $file->getError()
                        ]);
                    }
                }
            }

            return redirect()->route('courses.show', $course)->with('success', 'บทเรียนถูกสร้างสำเร็จ!');
        } catch (\Exception $e) {
            Log::error('Error creating lesson', [
                'course_id' => $course->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'เกิดข้อผิดพลาดในการสร้างบทเรียน: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course, Lesson $lesson): Response
    {
        $lesson->load('course');
        
        $nextLesson = $lesson->nextLesson();
        $previousLesson = $lesson->previousLesson();

        // Mark lesson as started for student
        $user = Auth::user();
        if ($user->role === 'student' && $lesson->isPublished()) {
            $user->startLesson($lesson->id);
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
    public function edit(Course $course, Lesson $lesson): Response
    {
        return Inertia::render('lessons/edit', [
            'lesson' => $lesson,
            'course' => $course,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course, Lesson $lesson)
    {
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

        return redirect()->route('courses.show', $course)->with('success', 'Lesson updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course, Lesson $lesson)
    {
        $lesson->delete();

        return redirect()->route('courses.show', $course)->with('success', 'Lesson deleted successfully!');
    }

    /**
     * Mark lesson as completed
     */
    public function complete(Course $course, Lesson $lesson)
    {
        $user = Auth::user();
        
        if ($user->role === 'student' && $lesson->isPublished()) {
            $user->completeLesson($lesson->id);
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
