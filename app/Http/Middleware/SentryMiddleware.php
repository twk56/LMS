<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class SentryMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (config('sentry.dsn')) {
            // Set user context for Sentry
            if (Auth::check()) {
                \Sentry\configureScope(function (\Sentry\State\Scope $scope) {
                    $user = Auth::user();
                    $scope->setUser([
                        'id' => $user->id,
                        'email' => '***@***.***', // Mask email for privacy
                        'role' => $user->role,
                    ]);
                });
            }

            // Set transaction name
            \Sentry\configureScope(function (\Sentry\State\Scope $scope) use ($request) {
                $scope->setTag('route', $request->route()?->getName() ?? $request->path());
            });
        }

        return $next($request);
    }
}
