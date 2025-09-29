<?php

namespace App\Providers;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Policies\CoursePolicy;
use App\Policies\CourseCategoryPolicy;
use App\Policies\AdminPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Course::class => CoursePolicy::class,
        CourseCategory::class => CourseCategoryPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Register admin gate
        \Gate::define('admin', function ($user) {
            return $user->role === 'admin';
        });
    }
}
