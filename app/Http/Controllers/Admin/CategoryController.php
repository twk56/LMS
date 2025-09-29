<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('can:admin');
    }

    /**
     * Display admin category management page
     */
    public function index()
    {
        try {
            Log::info('Admin\CategoryController@index: Starting admin category management page load', [
                'admin_user_id' => auth()->id(),
                'admin_user_email' => auth()->user()?->email
            ]);

            $categories = CourseCategory::withCount('courses')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($category) {
                    try {
                        return [
                            'id' => $category->id,
                            'name' => $category->name,
                            'description' => $category->description,
                            'courses_count' => $category->courses_count,
                            'created_at' => $category->created_at,
                            'updated_at' => $category->updated_at,
                        ];
                    } catch (\Exception $e) {
                        Log::error('Admin\CategoryController@index: Error processing category', [
                            'category_id' => $category->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        return null;
                    }
                })->filter();

            $statistics = [
                'total_categories' => CourseCategory::count(),
                'categories_with_courses' => CourseCategory::has('courses')->count(),
                'empty_categories' => CourseCategory::doesntHave('courses')->count(),
            ];

            Log::info('Admin\CategoryController@index: Successfully loaded admin category management', [
                'admin_user_id' => auth()->id(),
                'total_categories' => $categories->count(),
                'statistics' => $statistics
            ]);

            return Inertia::render('Admin/Categories/Index', [
                'categories' => $categories,
                'statistics' => $statistics,
            ]);

        } catch (\Exception $e) {
            Log::error('Admin\CategoryController@index: Fatal error', [
                'admin_user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Admin/Categories/Index', [
                'categories' => [],
                'statistics' => [
                    'total_categories' => 0,
                    'categories_with_courses' => 0,
                    'empty_categories' => 0,
                ],
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่'
            ]);
        }
    }
}