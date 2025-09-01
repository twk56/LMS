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

        if ($this->app->runningInConsole()) {
            $this->commands([
                ProdReportCommand::class,
            ]);
        }
    }
}
