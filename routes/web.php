<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\LessonFileController;
use App\Http\Controllers\CourseCategoryController;
use App\Http\Controllers\Api\ImageUploadController;
use App\Models\Course;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = Auth::user();
        if ($user->role === 'admin') {
            $courses = Course::with(['creator', 'lessons', 'students'])->get();
        } else {
            $courses = $user->enrolledCourses()->with(['creator', 'lessons'])->get();
        }
        return Inertia::render('dashboard', [
            'courses' => $courses,
            'isAdmin' => $user->role === 'admin',
        ]);
    })->name('dashboard');

    // Course routes
    Route::resource('courses', CourseController::class);
    Route::post('courses/{course}/enroll', [CourseController::class, 'enroll'])->name('courses.enroll');

    // Lesson routes
    Route::resource('courses.lessons', LessonController::class);
    Route::post('courses/{course}/lessons/{lesson}/complete', [LessonController::class, 'complete'])->name('courses.lessons.complete');

    // Quiz routes
    Route::get('courses/{course}/lessons/{lesson}/quiz', [QuizController::class, 'index'])->name('courses.lessons.quizzes.index');
    Route::get('courses/{course}/lessons/{lesson}/quiz/create', [QuizController::class, 'create'])->name('courses.lessons.quizzes.create');
    Route::post('courses/{course}/lessons/{lesson}/quiz', [QuizController::class, 'store'])->name('courses.lessons.quizzes.store');
    Route::get('courses/{course}/lessons/{lesson}/quiz/{quiz}', [QuizController::class, 'show'])->name('courses.lessons.quizzes.show');
    Route::post('courses/{course}/lessons/{lesson}/quiz/{quiz}/start', [QuizController::class, 'start'])->name('courses.lessons.quizzes.start');
    Route::post('courses/{course}/lessons/{lesson}/quiz/{quiz}/submit', [QuizController::class, 'submit'])->name('courses.lessons.quizzes.submit');
    Route::get('courses/{course}/lessons/{lesson}/quiz/{quiz}/result', [QuizController::class, 'result'])->name('courses.lessons.quizzes.result');

    // Certificate routes
    Route::get('certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::get('certificates/{certificate}', [CertificateController::class, 'show'])->name('certificates.show');
    Route::post('courses/{course}/certificate', [CertificateController::class, 'generate'])->name('certificates.generate');
    Route::get('certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');

    // Lesson File routes
    Route::resource('courses.lessons.files', LessonFileController::class);
    Route::get('courses/{course}/lessons/{lesson}/files/{file}/download', [LessonFileController::class, 'download'])->name('courses.lessons.files.download');

    // Category routes
    Route::resource('categories', CourseCategoryController::class);

    // API routes for rich text editor
    Route::post('api/upload-image', [ImageUploadController::class, 'store'])->name('api.upload-image');
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
