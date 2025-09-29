<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), unload=()');
        // Build CSP based on environment
        $csp = $this->buildCsp($request);
        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }

    /**
     * Build Content Security Policy based on environment
     */
    private function buildCsp(Request $request): string
    {
        $isDevelopment = app()->environment('local', 'development');
        
        // Base CSP directives
        $directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.bunny.net",
            "font-src 'self' https://fonts.bunny.net",
            "img-src 'self' data: https:",
            "frame-src 'self' https://www.youtube.com https://youtube.com",
            "connect-src 'self' https://*.pusher.com https://*.pusherapp.com wss://*.pusher.com wss://*.pusherapp.com",
        ];

        // Add development-specific directives for Vite
        if ($isDevelopment) {
            $directives[1] = "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 ws://localhost:5173 http://localhost:5174 ws://localhost:5174";
            $directives[6] = "connect-src 'self' http://localhost:5173 ws://localhost:5173 http://localhost:5174 ws://localhost:5174 https://*.pusher.com https://*.pusherapp.com wss://*.pusher.com wss://*.pusherapp.com";
        }

        return implode('; ', $directives);
    }
}
