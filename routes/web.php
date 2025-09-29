<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CourseCategoryController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\SwaggerController;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
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

// Health check endpoint - removed

// Avatar API - Keep only essential web API routes
Route::prefix('api')->middleware('throttle:60,1')->group(function () {
    Route::get('/avatars/{id}', [\App\Http\Controllers\Api\AvatarController::class, 'show']);
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('home');

Route::middleware([
    'auth:web',
    'verified',
])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Analytics Routes
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/', [AnalyticsController::class, 'dashboard'])->name('dashboard');
        Route::get('/courses/{course}', [AnalyticsController::class, 'courseAnalytics'])->name('courses.show');
        Route::get('/users/{user}/progress', [AnalyticsController::class, 'userProgress'])->name('users.progress');
    });

    // Removed unused routes: advanced-analytics, aiml, performance, videos

    // Simple Chat Routes
    Route::prefix('simple-chat')->name('simple-chat.')->group(function () {
        Route::get('/', [\App\Http\Controllers\SimpleChatController::class, 'index'])->name('index');
        Route::get('/messages', [\App\Http\Controllers\SimpleChatController::class, 'getMessages'])->name('messages');
        Route::post('/send', [\App\Http\Controllers\SimpleChatController::class, 'sendMessage'])
            ->middleware('throttle:20,1')
            ->name('send');
        Route::post('/mark-read', [\App\Http\Controllers\SimpleChatController::class, 'markAsRead'])
            ->middleware('throttle:30,1')
            ->name('mark-read');
        Route::get('/unread-count', [\App\Http\Controllers\SimpleChatController::class, 'getUnreadCount'])
            ->name('unread-count');
        
        // Admin routes
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('/', [\App\Http\Controllers\SimpleChatController::class, 'adminIndex'])->name('index');
            Route::get('/conversation/{user}', [\App\Http\Controllers\SimpleChatController::class, 'adminConversation'])->name('conversation');
            Route::get('/conversation/{user}/messages', [\App\Http\Controllers\SimpleChatController::class, 'getMessages'])->name('conversation.messages');
            Route::post('/send/{user}', [\App\Http\Controllers\SimpleChatController::class, 'adminSendMessage'])
                ->middleware('throttle:20,1')
                ->name('send');
        });
    });

    // User Progress Routes
    Route::get('/user-progress', [\App\Http\Controllers\UserProgressController::class, 'index'])->name('user-progress');

    // My Courses Routes
    Route::get('/my-courses', [\App\Http\Controllers\MyCoursesController::class, 'index'])->name('my-courses');

    // Admin Management Routes
    Route::prefix('admin')->name('admin.')->middleware('can:admin')->group(function () {
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users');
        Route::get('/courses', [\App\Http\Controllers\Admin\CourseController::class, 'index'])->name('courses');
        Route::get('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('categories');
    });

    // Notification Routes (Phase 3)
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/mark-as-read', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-as-read');
        Route::delete('/delete', [NotificationController::class, 'delete'])->name('delete');
        Route::get('/preferences', [NotificationController::class, 'preferences'])->name('preferences');
        Route::put('/preferences', [NotificationController::class, 'updatePreferences'])->name('update-preferences');
    });

    // Removed enterprise routes

    // API Routes - Moved to separate API routes file for better organization
    // These will be handled by api.php

    // Course Routes - Public access for viewing courses
    Route::get('/courses', [CourseController::class, 'index'])
        ->middleware('throttle:30,1')
        ->name('courses.index');
    
    // Protected course routes
    Route::resource('courses', CourseController::class)->except(['index']);
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll'])
        ->middleware('throttle:10,1')
        ->name('courses.enroll');
    Route::post('/courses/{course}/unenroll', [CourseController::class, 'unenroll'])
        ->middleware('throttle:10,1')
        ->name('courses.unenroll');
    
    // Lesson Routes
    Route::resource('courses.lessons', LessonController::class)->shallow();
    Route::get('/lessons', [LessonController::class, 'index'])
        ->middleware('throttle:30,1')
        ->name('lessons.index');
    Route::post('/courses/{course}/lessons/{lesson}/complete', [LessonController::class, 'complete'])
        ->middleware('throttle:20,1')
        ->name('lessons.complete');
    
    // Lesson Files Routes
    Route::get('/lessons/{lesson}/files', [LessonController::class, 'files'])
        ->middleware('throttle:30,1')
        ->name('lessons.files');
    Route::post('/lessons/{lesson}/files', [LessonController::class, 'storeFile'])
        ->middleware('throttle:10,1')
        ->name('lessons.files.store');
    Route::put('/lessons/{lesson}/files/{file}', [LessonController::class, 'updateFile'])
        ->middleware('throttle:10,1')
        ->name('lessons.files.update');
    Route::delete('/lessons/{lesson}/files/{file}', [LessonController::class, 'destroyFile'])
        ->middleware('throttle:10,1')
        ->name('lessons.files.destroy');
    
    // Removed lesson files and quiz routes

    // Category Routes
    Route::resource('categories', CourseCategoryController::class);

    // Certificate Routes
    Route::resource('certificates', CertificateController::class)->only(['index', 'show']);

    // Removed export routes

    // Removed help routes
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
