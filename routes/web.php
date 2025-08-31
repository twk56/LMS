<?php

use App\Http\Controllers\AdvancedAnalyticsController;
use App\Http\Controllers\AIMLController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CourseCategoryController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnterpriseController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LessonFileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\QuizController;
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

// Health check endpoint
Route::get('/health', HealthController::class);

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
    'auth:sanctum',
    'verified',
])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Analytics Routes
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/', [AnalyticsController::class, 'dashboard'])->name('dashboard');
        Route::get('/courses/{course}', [AnalyticsController::class, 'courseAnalytics'])->name('courses.show');
        Route::get('/users/{user}/progress', [AnalyticsController::class, 'userProgress'])->name('users.progress');
    });

    // Advanced Analytics Routes (Phase 3)
    Route::prefix('advanced-analytics')->name('advanced-analytics.')->group(function () {
        Route::get('/', [AdvancedAnalyticsController::class, 'dashboard'])->name('dashboard');
        Route::get('/predictive-insights', [AdvancedAnalyticsController::class, 'predictiveInsights'])->name('predictive-insights');
        Route::get('/machine-learning', [AdvancedAnalyticsController::class, 'machineLearning'])->name('machine-learning');
        Route::get('/advanced-reports', [AdvancedAnalyticsController::class, 'advancedReports'])->name('advanced-reports');
    });

    // AI/ML Routes (Phase 5)
    Route::prefix('aiml')->name('aiml.')->group(function () {
        Route::get('/', [AIMLController::class, 'dashboard'])->name('dashboard');
        Route::get('/recommendations', [AIMLController::class, 'personalizedRecommendations'])->name('recommendations');
        Route::get('/performance-prediction/{course}', [AIMLController::class, 'performancePrediction'])->name('performance-prediction');
        Route::get('/learning-patterns', [AIMLController::class, 'learningPatterns'])->name('learning-patterns');
        Route::get('/predictive-insights', [AIMLController::class, 'predictiveInsights'])->name('predictive-insights');
        Route::post('/learning-path-optimization', [AIMLController::class, 'learningPathOptimization'])->name('learning-path-optimization');
        Route::get('/sentiment-analysis', [AIMLController::class, 'sentimentAnalysis'])->name('sentiment-analysis');
    });

    // Performance Routes
    Route::prefix('performance')->name('performance.')->group(function () {
        Route::get('/', [PerformanceController::class, 'dashboard'])->name('dashboard');
        Route::post('/log', [PerformanceController::class, 'logMetrics'])->name('log');
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

    // Enterprise Routes (Phase 4)
    Route::prefix('enterprise')->name('enterprise.')->group(function () {
        Route::get('/', [EnterpriseController::class, 'dashboard'])->name('dashboard');
        
        // Tenant Management
        Route::prefix('tenants')->name('tenants.')->group(function () {
            Route::get('/', [EnterpriseController::class, 'tenantManagement'])->name('index');
            Route::post('/', [EnterpriseController::class, 'createTenant'])->name('create');
            Route::put('/{tenant}', [EnterpriseController::class, 'updateTenant'])->name('update');
            Route::post('/{tenant}/suspend', [EnterpriseController::class, 'suspendTenant'])->name('suspend');
            Route::post('/{tenant}/activate', [EnterpriseController::class, 'activateTenant'])->name('activate');
            Route::get('/{tenant}/usage', [EnterpriseController::class, 'tenantUsage'])->name('usage');
        });

        // Security Management
        Route::prefix('security')->name('security.')->group(function () {
            Route::get('/', [EnterpriseController::class, 'securityDashboard'])->name('dashboard');
            Route::get('/settings', [EnterpriseController::class, 'securitySettings'])->name('settings');
            Route::put('/settings', [EnterpriseController::class, 'updateSecuritySettings'])->name('update-settings');
        });

        // Compliance Management
        Route::prefix('compliance')->name('compliance.')->group(function () {
            Route::get('/', [EnterpriseController::class, 'complianceDashboard'])->name('dashboard');
            Route::get('/gdpr', [EnterpriseController::class, 'gdprReport'])->name('gdpr');
            Route::get('/ferpa', [EnterpriseController::class, 'ferpaReport'])->name('ferpa');
            Route::post('/data-subject-request', [EnterpriseController::class, 'dataSubjectRequest'])->name('data-subject-request');
        });

        // Consent Management
        Route::prefix('consent')->name('consent.')->group(function () {
            Route::get('/', [EnterpriseController::class, 'consentManagement'])->name('index');
            Route::put('/users/{user}', [EnterpriseController::class, 'updateUserConsent'])->name('update');
        });

        // Audit Logs
        Route::get('/audit-logs', [EnterpriseController::class, 'auditLogs'])->name('audit-logs');

        // Billing Management
        Route::prefix('billing')->name('billing.')->group(function () {
            Route::get('/', [EnterpriseController::class, 'billingManagement'])->name('index');
            Route::post('/upgrade', [EnterpriseController::class, 'upgradePlan'])->name('upgrade');
        });
    });

    // API Analytics Routes
    Route::prefix('api/analytics')->name('api.analytics.')->group(function () {
        Route::get('/dashboard', [AnalyticsController::class, 'apiDashboard'])->name('dashboard');
        Route::get('/courses/{course}', [AnalyticsController::class, 'apiCourseAnalytics'])->name('courses.show');
        Route::get('/users/{user}/progress', [AnalyticsController::class, 'apiUserProgress'])->name('users.progress');
    });

    // API Advanced Analytics Routes (Phase 3)
    Route::prefix('api/advanced-analytics')->name('api.advanced-analytics.')->group(function () {
        Route::get('/predictive-insights', [AdvancedAnalyticsController::class, 'apiPredictiveInsights'])->name('predictive-insights');
        Route::get('/machine-learning', [AdvancedAnalyticsController::class, 'apiMachineLearning'])->name('machine-learning');
        Route::get('/advanced-reports', [AdvancedAnalyticsController::class, 'apiAdvancedReports'])->name('advanced-reports');
    });

    // API AI/ML Routes (Phase 5)
    Route::prefix('api/aiml')->name('api.aiml.')->group(function () {
        Route::get('/recommendations', [AIMLController::class, 'apiPersonalizedRecommendations'])->name('recommendations');
        Route::get('/performance-prediction/{course}', [AIMLController::class, 'apiPerformancePrediction'])->name('performance-prediction');
        Route::get('/learning-patterns', [AIMLController::class, 'apiLearningPatterns'])->name('learning-patterns');
        Route::get('/predictive-insights', [AIMLController::class, 'apiPredictiveInsights'])->name('predictive-insights');
        Route::post('/learning-path-optimization', [AIMLController::class, 'apiLearningPathOptimization'])->name('learning-path-optimization');
        Route::get('/sentiment-analysis', [AIMLController::class, 'apiSentimentAnalysis'])->name('sentiment-analysis');
        Route::get('/user-recommendations/{user}', [AIMLController::class, 'apiUserRecommendations'])->name('user-recommendations');
        Route::get('/course-recommendations/{course}', [AIMLController::class, 'apiCourseRecommendations'])->name('course-recommendations');
        Route::get('/tenant-insights/{tenant}', [AIMLController::class, 'apiTenantInsights'])->name('tenant-insights');
        Route::get('/learning-analytics', [AIMLController::class, 'apiLearningAnalytics'])->name('learning-analytics');
    });

    // API Performance Routes
    Route::prefix('api/performance')->name('api.performance.')->group(function () {
        Route::get('/metrics', [PerformanceController::class, 'apiMetrics'])->name('metrics');
    });

    // API Notification Routes (Phase 3)
    Route::prefix('api/notifications')->name('api.notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'apiNotifications'])->name('index');
        Route::get('/preferences', [NotificationController::class, 'apiPreferences'])->name('preferences');
    });

    // API Enterprise Routes (Phase 4)
    Route::prefix('api/enterprise')->name('api.enterprise.')->group(function () {
        Route::get('/tenants/{tenant}/usage', [EnterpriseController::class, 'apiTenantUsage'])->name('tenants.usage');
        Route::get('/security/report', [EnterpriseController::class, 'apiSecurityReport'])->name('security.report');
        Route::get('/compliance/report', [EnterpriseController::class, 'apiComplianceReport'])->name('compliance.report');
        Route::get('/tenants/{tenant}/report', [EnterpriseController::class, 'apiTenantReport'])->name('tenants.report');
    });

    // Course Routes
    Route::resource('courses', CourseController::class);
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll'])->name('courses.enroll');
    Route::post('/courses/{course}/unenroll', [CourseController::class, 'unenroll'])->name('courses.unenroll');

    // Category Routes
    Route::resource('categories', CourseCategoryController::class);

    // Lesson Routes
    Route::resource('courses.lessons', LessonController::class)->shallow();
    Route::get('/lessons', [LessonController::class, 'index'])->name('lessons.index');
    Route::post('/courses/{course}/lessons/{lesson}/complete', [LessonController::class, 'complete'])->name('lessons.complete');

    // Lesson File Routes
    Route::resource('lessons.files', LessonFileController::class)->shallow();

    // Quiz Routes
    Route::resource('lessons.quizzes', QuizController::class)->shallow();
    Route::post('/courses/{course}/lessons/{lesson}/quizzes/{quiz}/start', [QuizController::class, 'start'])->name('quizzes.start');
    Route::post('/courses/{course}/lessons/{lesson}/quizzes/{quiz}/submit', [QuizController::class, 'submit'])->name('quizzes.submit');
    Route::get('/courses/{course}/lessons/{lesson}/quizzes/{quiz}/result', [QuizController::class, 'result'])->name('quizzes.result');

    // Certificate Routes
    Route::resource('certificates', CertificateController::class)->only(['index', 'show']);

    // Export Routes
    Route::get('/export', [ExportController::class, 'index'])->name('export.index');
    Route::get('/export/courses', [ExportController::class, 'courses'])->name('export.courses');
    Route::get('/export/users', [ExportController::class, 'users'])->name('export.users');
    Route::get('/export/analytics', [ExportController::class, 'analytics'])->name('export.analytics');

    // Help Routes
    Route::get('/help', function () {
        return Inertia::render('help/index', [
            'faqs' => []
        ]);
    })->name('help.index');
    Route::get('/help/docs', function () {
        return Inertia::render('help/docs');
    })->name('help.docs');
    Route::get('/help/faq', function () {
        return Inertia::render('help/faq');
    })->name('help.faq');
    Route::get('/help/contact', function () {
        return Inertia::render('help/contact');
    })->name('help.contact');
    Route::get('/help/tutorials', function () {
        return Inertia::render('help/tutorials');
    })->name('help.tutorials');
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
