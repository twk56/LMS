<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExportController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    public function courses()
    {
        $courses = Course::with(['creator', 'category', 'students'])
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'status' => $course->status,
                    'category' => $course->category?->name,
                    'creator' => $course->creator?->name,
                    'enrollment_count' => $course->students->count(),
                    'created_at' => $course->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $course->updated_at->format('Y-m-d H:i:s'),
                ];
            });

        $filename = 'courses_' . now()->format('Y-m-d_H-i-s') . '.json';
        $filepath = 'exports/' . $filename;

        Storage::put($filepath, json_encode($courses, JSON_PRETTY_PRINT));

        return response()->download(storage_path('app/' . $filepath), $filename)
            ->deleteFileAfterSend();
    }

    public function users()
    {
        $users = User::with(['enrolledCourses'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'enrolled_courses' => $user->enrolledCourses->count(),
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ];
            });

        $filename = 'users_' . now()->format('Y-m-d_H-i-s') . '.json';
        $filepath = 'exports/' . $filename;

        Storage::put($filepath, json_encode($users, JSON_PRETTY_PRINT));

        return response()->download(storage_path('app/' . $filepath), $filename)
            ->deleteFileAfterSend();
    }

    public function analytics()
    {
        $analytics = [
            'dashboard_stats' => $this->analyticsService->getDashboardStats(),
            'exported_at' => now()->format('Y-m-d H:i:s'),
        ];

        $filename = 'analytics_' . now()->format('Y-m-d_H-i-s') . '.json';
        $filepath = 'exports/' . $filename;

        Storage::put($filepath, json_encode($analytics, JSON_PRETTY_PRINT));

        return response()->download(storage_path('app/' . $filepath), $filename)
            ->deleteFileAfterSend();
    }
}









