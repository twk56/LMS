<?php

namespace App\Http\Controllers;

use App\Models\CourseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CourseCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', CourseCategory::class);

        $categories = CourseCategory::active()->ordered()->withCount('courses')->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', CourseCategory::class);

        return Inertia::render('Categories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', CourseCategory::class);

        $request->validate([
            'name' => 'required|string|max:255|unique:course_categories',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'icon' => 'nullable|string|max:50',
            'order' => 'integer|min:0',
        ]);

        CourseCategory::create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'color' => $request->input('color'),
            'icon' => $request->input('icon'),
            'order' => $request->input('order', 0),
        ]);

        return redirect()->route('categories.index')
            ->with('success', 'สร้างหมวดหมู่สำเร็จ');
    }

    /**
     * Display the specified resource.
     */
    public function show(CourseCategory $category): Response
    {
        $this->authorize('view', $category);

        $courses = $category->courses()->with('creator')->paginate(12);

        return Inertia::render('Categories/Show', [
            'category' => $category,
            'courses' => $courses,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CourseCategory $category): Response
    {
        $this->authorize('update', $category);

        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CourseCategory $category)
    {
        $this->authorize('update', $category);

        $request->validate([
            'name' => 'required|string|max:255|unique:course_categories,name,' . $category->id,
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'icon' => 'nullable|string|max:50',
            'order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $category->update([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'color' => $request->input('color'),
            'icon' => $request->input('icon'),
            'order' => $request->input('order', $category->order),
            'is_active' => $request->input('is_active', $category->is_active),
        ]);

        return redirect()->route('categories.index')
            ->with('success', 'อัปเดตหมวดหมู่สำเร็จ');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CourseCategory $category)
    {
        $this->authorize('delete', $category);

        // Check if category has courses
        if ($category->courses()->count() > 0) {
            return back()->with('error', 'ไม่สามารถลบหมวดหมู่ที่มีหลักสูตรอยู่ได้');
        }

        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'ลบหมวดหมู่สำเร็จ');
    }
}
