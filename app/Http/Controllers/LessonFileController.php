<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LessonFileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Course $course, Lesson $lesson): Response
    {
        $this->authorize('view', $course);

        $files = $lesson->files()
            ->orderBy('order')
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'filename' => $file->filename,
                    'original_name' => $file->original_name,
                    'file_path' => $file->file_path,
                    'file_type' => $file->file_type,
                    'mime_type' => $file->mime_type,
                    'file_size' => $file->file_size,
                    'title' => $file->title,
                    'description' => $file->description,
                    'order' => $file->order,
                    'is_active' => $file->is_active,
                    'url' => $file->url,
                    'formatted_size' => $file->formatted_size,
                    'icon' => $file->icon,
                    'created_at' => $file->created_at,
                    'updated_at' => $file->updated_at,
                ];
            });

        return Inertia::render('lessons/files/index', [
            'course' => $course,
            'lesson' => $lesson,
            'files' => $files,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Course $course, Lesson $lesson): Response
    {
        $this->authorize('update', $course);

        return Inertia::render('lessons/files/create', [
            'course' => $course,
            'lesson' => $lesson,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Course $course, Lesson $lesson)
    {
        $this->authorize('update', $course);

        $request->validate([
            'files.*' => 'required|file|max:10240', // 10MB max
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $uploadedFiles = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filename = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('lesson-files/' . $lesson->id, $filename, 'public');

                // Determine file type
                $mimeType = $file->getMimeType();
                $fileType = $this->getFileType($mimeType);

                $lessonFile = $lesson->files()->create([
                    'filename' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'file_type' => $fileType,
                    'mime_type' => $mimeType,
                    'file_size' => $file->getSize(),
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'order' => $lesson->files()->count(),
                ]);

                $uploadedFiles[] = $lessonFile;
            }
        }

        return redirect()->route('courses.lessons.files.index', [$course, $lesson])
            ->with('success', count($uploadedFiles) . ' ไฟล์ถูกอัปโหลดสำเร็จ');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course, Lesson $lesson, LessonFile $file): Response
    {
        $this->authorize('view', $course);

        $fileData = [
            'id' => $file->id,
            'filename' => $file->filename,
            'original_name' => $file->original_name,
            'file_path' => $file->file_path,
            'file_type' => $file->file_type,
            'mime_type' => $file->mime_type,
            'file_size' => $file->file_size,
            'title' => $file->title,
            'description' => $file->description,
            'order' => $file->order,
            'is_active' => $file->is_active,
            'url' => $file->url,
            'formatted_size' => $file->formatted_size,
            'icon' => $file->icon,
            'created_at' => $file->created_at,
            'updated_at' => $file->updated_at,
        ];

        return Inertia::render('lessons/files/show', [
            'course' => $course,
            'lesson' => $lesson,
            'file' => $fileData,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course, Lesson $lesson, LessonFile $file): Response
    {
        $this->authorize('update', $course);

        $fileData = [
            'id' => $file->id,
            'filename' => $file->filename,
            'original_name' => $file->original_name,
            'file_path' => $file->file_path,
            'file_type' => $file->file_type,
            'mime_type' => $file->mime_type,
            'file_size' => $file->file_size,
            'title' => $file->title,
            'description' => $file->description,
            'order' => $file->order,
            'is_active' => $file->is_active,
            'url' => $file->url,
            'formatted_size' => $file->formatted_size,
            'icon' => $file->icon,
            'created_at' => $file->created_at,
            'updated_at' => $file->updated_at,
        ];

        return Inertia::render('lessons/files/edit', [
            'course' => $course,
            'lesson' => $lesson,
            'file' => $fileData,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course, Lesson $lesson, LessonFile $file)
    {
        $this->authorize('update', $course);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order' => 'integer|min:0',
        ]);

        $file->update([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'order' => $request->input('order', $file->order),
        ]);

        return redirect()->route('courses.lessons.files.index', [$course, $lesson])
            ->with('success', 'อัปเดตไฟล์สำเร็จ');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course, Lesson $lesson, LessonFile $file)
    {
        $this->authorize('update', $course);

        // Delete file from storage
        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }

        $file->delete();

        return redirect()->route('courses.lessons.files.index', [$course, $lesson])
            ->with('success', 'ลบไฟล์สำเร็จ');
    }

    /**
     * Download the file
     */
    public function download(Course $course, Lesson $lesson, LessonFile $file)
    {
        $this->authorize('view', $course);

        if (!Storage::disk('public')->exists($file->file_path)) {
            abort(404);
        }

        return Storage::disk('public')->download($file->file_path, $file->original_name);
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
