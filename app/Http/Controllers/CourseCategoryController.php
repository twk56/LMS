<?php

namespace App\Http\Controllers;

use App\Models\CourseCategory;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
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
    public function store(StoreCategoryRequest $request)
    {
        $this->authorize('create', CourseCategory::class);

        CourseCategory::create($request->validated());

        return Redirect::route('categories.index')
            ->with('success', 'Category created successfully!');
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
    public function update(UpdateCategoryRequest $request, CourseCategory $category)
    {
        $this->authorize('update', $category);

        $category->update($request->validated());

        return Redirect::route('categories.index')
            ->with('success', 'Category updated successfully!');
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

        return Redirect::route('categories.index')
            ->with('success', 'Category deleted successfully!');
    }
}
