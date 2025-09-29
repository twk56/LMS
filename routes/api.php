<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\SwaggerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint
Route::get('/health', [SwaggerController::class, 'health']);
Route::get('/version', [SwaggerController::class, 'version']);

// Public API routes
Route::middleware('throttle:60,1')->group(function () {
    // Swagger Documentation
    Route::get('/docs', function () {
        return redirect('/api/documentation');
    });
    
    Route::get('/documentation', function () {
        return view('l5-swagger::index');
    });
});

// Protected API routes
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    
    // Analytics API Routes
    Route::prefix('analytics')->name('api.analytics.')->group(function () {
        Route::get('/dashboard', [AnalyticsController::class, 'apiDashboard'])->name('dashboard');
        Route::get('/courses/{course}', [AnalyticsController::class, 'apiCourseAnalytics'])->name('courses.show');
        Route::get('/users/{user}/progress', [AnalyticsController::class, 'apiUserProgress'])->name('users.progress');
    });

    // Notification API Routes
    Route::prefix('notifications')->name('api.notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'apiNotifications'])->name('index');
        Route::get('/preferences', [NotificationController::class, 'apiPreferences'])->name('preferences');
    });

    // Removed unused API routes: advanced-analytics, aiml, enterprise, performance
});
