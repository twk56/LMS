<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QueryOptimization
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Enable query logging in development
        if (app()->environment('local', 'testing')) {
            DB::enableQueryLog();
        }

        $response = $next($request);

        // Log slow queries in development
        if (app()->environment('local', 'testing')) {
            $queries = DB::getQueryLog();
            $slowQueries = array_filter($queries, function ($query) {
                return $query['time'] > 100; // Queries taking more than 100ms
            });

            if (!empty($slowQueries)) {
                Log::warning('Slow queries detected', [
                    'url' => $request->url(),
                    'method' => $request->method(),
                    'queries' => $slowQueries,
                ]);
            }
        }

        return $response;
    }
}
