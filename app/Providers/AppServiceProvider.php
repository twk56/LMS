<?php

namespace App\Providers;

use App\Console\Commands\ProdReportCommand;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production to avoid mixed-content issues behind proxies (e.g., Render)
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Initialize Sentry monitoring
        if (config('sentry.dsn') && !$this->app->runningInConsole()) {
            \Sentry\init([
                'dsn' => config('sentry.dsn'),
                'traces_sample_rate' => config('sentry.traces_sample_rate', 0.2),
                'profiles_sample_rate' => config('sentry.profiles_sample_rate', 0.2),
            ]);
        }

        if ($this->app->runningInConsole()) {
            $this->commands([
                ProdReportCommand::class,
            ]);
        }
    }
}
