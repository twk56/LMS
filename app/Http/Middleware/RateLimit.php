<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class RateLimit
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, int $maxAttempts = 60, int $decayMinutes = 1): Response
    {
        $key = $this->resolveRequestSignature($request);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return response()->json([
                'error' => 'Too many requests',
                'message' => 'Please try again later.',
                'retry_after' => RateLimiter::availableIn($key)
            ], 429);
        }

        RateLimiter::hit($key, $decayMinutes * 60);

        $response = $next($request);

        return $response->header('X-RateLimit-Limit', $maxAttempts)
                       ->header('X-RateLimit-Remaining', RateLimiter::remaining($key, $maxAttempts));
    }

    /**
     * Resolve request signature.
     */
    protected function resolveRequestSignature(Request $request): string
    {
        $user = $request->user();
        $ip = $request->ip();
        $userAgent = $request->userAgent();

        if ($user) {
            return sha1($user->id . '|' . $ip . '|' . $userAgent);
        }

        return sha1($ip . '|' . $userAgent);
    }
}
