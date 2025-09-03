<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Sentry\Laravel\Integration;
use Sentry\Laravel\Tracing\ServiceProvider as TracingServiceProvider;
use Sentry\Transaction;

class SentryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        if (config('sentry.dsn')) {
            $this->app->register(TracingServiceProvider::class);
        }
    }

    public function boot(): void
    {
        if (config('sentry.dsn')) {
            // Configure Sentry with custom callbacks
            \Sentry\configureScope(function (\Sentry\State\Scope $scope): void {
                $scope->setTag('environment', config('app.env'));
                $scope->setTag('version', config('app.version', '1.0.0'));
            });
        }
    }
}
