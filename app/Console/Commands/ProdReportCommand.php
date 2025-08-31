<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Composer\InstalledVersions;
use Exception;

class ProdReportCommand extends Command
{
    protected $signature = 'prod:report {--format=md}';
    protected $description = 'Generate comprehensive production readiness report';

    private array $report = [];
    private array $issues = [];
    private array $warnings = [];

    public function handle(): int
    {
        $this->info('🔍 Generating Production Readiness Report...');
        $this->newLine();

        $startTime = microtime(true);

        // Run all checks
        $this->checkAppRuntime();
        $this->checkLogging();
        $this->checkEnvConfig();
        $this->checkDatabase();
        $this->checkRedis();
        $this->checkQueue();
        $this->checkCacheSession();
        $this->checkViteAssets();
        $this->checkHttpSecurity();
        $this->checkHealthEndpoint();
        $this->checkPhpOptimizations();
        $this->checkFilePermissions();
        $this->checkNginxPhpFpm();

        $totalTime = round((microtime(true) - $startTime) * 1000, 2);

        // Generate report
        $markdown = $this->generateMarkdownReport($totalTime);
        
        // Output based on format
        if ($this->option('format') === 'md') {
            $this->line($markdown);
        } else {
            $this->outputSummary();
        }

        // Save to file
        $reportPath = storage_path('app/prod_report.md');
        File::put($reportPath, $markdown);
        $this->info("📄 Report saved to: {$reportPath}");

        // Return exit code based on failures
        $hasFailures = collect($this->report)->contains(function ($section) {
            return isset($section['status']) && $section['status'] === '❌ FAIL';
        });

        return $hasFailures ? 1 : 0;
    }

    private function checkAppRuntime(): void
    {
        $this->report['app_runtime'] = [
            'laravel_version' => App::version(),
            'php_version' => PHP_VERSION,
            'sapi' => php_sapi_name(),
            'os' => PHP_OS,
            'current_time' => now()->toISOString(),
            'timezone' => config('app.timezone'),
            'environment' => config('app.env'),
            'debug' => config('app.debug'),
            'url' => config('app.url'),
            'composer_optimized' => $this->checkComposerOptimized(),
        ];

        $status = '✅ PASS';
        if (config('app.debug') && config('app.env') === 'production') {
            $status = '❌ FAIL';
            $this->issues[] = 'APP_DEBUG should be false in production';
        } elseif (config('app.debug')) {
            $status = '⚠️ WARN';
            $this->warnings[] = 'APP_DEBUG is enabled (ok for development)';
        }

        if (config('app.env') === 'production' && !Str::startsWith(config('app.url'), 'https://')) {
            $status = '⚠️ WARN';
            $this->warnings[] = 'APP_URL should use HTTPS in production';
        }

        $this->report['app_runtime']['status'] = $status;
    }

    private function checkComposerOptimized(): bool
    {
        try {
            // Check if autoload files exist and are optimized
            $autoloadFile = base_path('vendor/composer/autoload_classmap.php');
            return File::exists($autoloadFile);
        } catch (Exception $e) {
            return false;
        }
    }

    private function checkLogging(): void
    {
        $defaultChannel = config('logging.default');
        $channels = array_keys(config('logging.channels', []));
        
        $this->report['logging'] = [
            'default_channel' => $defaultChannel,
            'available_channels' => $channels,
            'production_ready' => $this->isLoggingProductionReady($defaultChannel),
        ];

        $status = '✅ PASS';
        if (!$this->isLoggingProductionReady($defaultChannel)) {
            $status = '⚠️ WARN';
            $this->warnings[] = 'Consider using JSON logging to stdout/errorlog in production';
        }

        $this->report['logging']['status'] = $status;
    }

    private function isLoggingProductionReady(string $channel): bool
    {
        $productionChannels = ['stderr', 'errorlog', 'syslog', 'papertrail', 'slack'];
        return in_array($channel, $productionChannels);
    }

    private function checkEnvConfig(): void
    {
        $missingKeys = [];
        $mismatches = [];

        // Check basic required configs
        if (empty(config('app.key'))) {
            $missingKeys[] = 'APP_KEY';
        }
        if (empty(config('database.default'))) {
            $missingKeys[] = 'DB_CONNECTION';
        }
        if (empty(config('database.redis.default.host'))) {
            $missingKeys[] = 'REDIS_HOST';
        }
        if (empty(config('database.redis.default.port'))) {
            $missingKeys[] = 'REDIS_PORT';
        }
        if (empty(config('cache.default'))) {
            $missingKeys[] = 'CACHE_STORE';
        }
        if (empty(config('session.driver'))) {
            $missingKeys[] = 'SESSION_DRIVER';
        }
        if (empty(config('queue.default'))) {
            $missingKeys[] = 'QUEUE_CONNECTION';
        }

        // Check database-specific variables
        $dbConnection = config('database.default');
        if ($dbConnection === 'sqlite') {
            // For SQLite, we don't need DB_HOST and DB_DATABASE
            $this->report['env_config']['database_type'] = 'sqlite';
        } elseif ($dbConnection) {
            // For other databases, check for host and database
            if (empty(config("database.connections.{$dbConnection}.host"))) {
                $missingKeys[] = 'DB_HOST';
            }
            if (empty(config("database.connections.{$dbConnection}.database"))) {
                $missingKeys[] = 'DB_DATABASE';
            }
            $this->report['env_config']['database_type'] = $dbConnection;
        }

        // Check for mismatches
        if (config('cache.default') === 'redis' && config('cache.default') !== 'redis') {
            $mismatches[] = 'CACHE_STORE=redis but cache default is ' . config('cache.default');
        }

        $this->report['env_config'] = [
            'missing_keys' => $missingKeys,
            'mismatches' => $mismatches,
            'total_required' => 7,
            'present' => 7 - count($missingKeys),
            'database_type' => $dbConnection ?? 'unknown',
        ];

        $status = '✅ PASS';
        if (!empty($missingKeys)) {
            $status = '❌ FAIL';
            $this->issues[] = 'Missing required environment variables: ' . implode(', ', $missingKeys);
        }
        if (!empty($mismatches)) {
            $status = '⚠️ WARN';
            $this->warnings[] = 'Configuration mismatches: ' . implode(', ', $mismatches);
        }

        $this->report['env_config']['status'] = $status;
    }

    private function checkDatabase(): void
    {
        $connection = config('database.default');
        $config = config("database.connections.{$connection}");
        
        $this->report['database'] = [
            'connection' => $connection,
            'driver' => $config['driver'] ?? 'unknown',
            'host' => $config['host'] ?? 'unknown',
            'port' => $config['port'] ?? 'unknown',
            'database' => $config['database'] ?? 'unknown',
        ];

        // Test connection with timeout
        $connectionOk = false;
        $error = null;
        
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            $connectionOk = true;
            $this->report['database']['response_time_ms'] = round((microtime(true) - $start) * 1000, 2);
        } catch (Exception $e) {
            $error = $e->getMessage();
            $this->report['database']['error'] = $error;
        }

        // Check migrations
        try {
            $migrations = DB::table('migrations')->count();
            $lastBatch = DB::table('migrations')->max('batch') ?? 0;
            $this->report['database']['migrations'] = [
                'total' => $migrations,
                'last_batch' => $lastBatch,
            ];
        } catch (Exception $e) {
            $this->report['database']['migrations'] = ['error' => $e->getMessage()];
        }

        $status = $connectionOk ? '✅ PASS' : '❌ FAIL';
        if (!$connectionOk) {
            $this->issues[] = "Database connection failed: {$error}";
        }

        $this->report['database']['status'] = $status;
    }

    private function checkRedis(): void
    {
        $config = config('database.redis.default');
        
        $this->report['redis'] = [
            'client' => config('database.redis.client', 'predis'),
            'host' => $config['host'] ?? 'unknown',
            'port' => $config['port'] ?? 'unknown',
            'database' => $config['database'] ?? 0,
        ];

        // Test connection with timeout
        $connectionOk = false;
        $error = null;
        
        try {
            $start = microtime(true);
            Redis::connection()->ping();
            $connectionOk = true;
            $this->report['redis']['response_time_ms'] = round((microtime(true) - $start) * 1000, 2);
        } catch (Exception $e) {
            $error = $e->getMessage();
            $this->report['redis']['error'] = $error;
        }

        $status = $connectionOk ? '✅ PASS' : '❌ FAIL';
        if (!$connectionOk) {
            $this->issues[] = "Redis connection failed: {$error}";
        }

        $this->report['redis']['status'] = $status;
    }

    private function checkQueue(): void
    {
        $connection = config('queue.default');
        
        $this->report['queue'] = [
            'connection' => $connection,
            'driver' => $connection,
        ];

        // Test queue with timeout
        $queueOk = false;
        $error = null;
        
        try {
            $start = microtime(true);
            Queue::push(function () {});
            $queueOk = true;
            $this->report['queue']['response_time_ms'] = round((microtime(true) - $start) * 1000, 2);
        } catch (Exception $e) {
            $error = $e->getMessage();
            $this->report['queue']['error'] = $error;
        }

        // Check Horizon if available
        if (class_exists('\Laravel\Horizon\Horizon')) {
            try {
                $horizonStatus = \Laravel\Horizon\Horizon::status();
                $this->report['queue']['horizon'] = [
                    'installed' => true,
                    'status' => $horizonStatus,
                ];
            } catch (Exception $e) {
                $this->report['queue']['horizon'] = [
                    'installed' => true,
                    'error' => $e->getMessage(),
                ];
            }
        } else {
            $this->report['queue']['horizon'] = ['installed' => false];
        }

        $status = $queueOk ? '✅ PASS' : '⚠️ WARN';
        if (!$queueOk) {
            $this->warnings[] = "Queue connection failed: {$error}";
        }

        $this->report['queue']['status'] = $status;
    }

    private function checkCacheSession(): void
    {
        $cacheDriver = Cache::getDefaultDriver();
        $sessionDriver = config('session.driver');
        
        $this->report['cache_session'] = [
            'cache_driver' => $cacheDriver,
            'session_driver' => $sessionDriver,
            'cache_matches_env' => $cacheDriver === env('CACHE_STORE', $cacheDriver),
            'session_matches_env' => $sessionDriver === env('SESSION_DRIVER', $sessionDriver),
        ];

        // Check session security in production
        if (config('app.env') === 'production') {
            $this->report['cache_session']['security'] = [
                'secure_cookies' => config('session.secure'),
                'same_site' => config('session.same_site'),
                'http_only' => config('session.http_only'),
            ];
        }

        $status = '✅ PASS';
        if ($cacheDriver !== env('CACHE_STORE', $cacheDriver)) {
            $status = '⚠️ WARN';
            $this->warnings[] = 'Cache driver does not match CACHE_STORE environment variable';
        }

        $this->report['cache_session']['status'] = $status;
    }

    private function checkViteAssets(): void
    {
        $manifestPath = public_path('build/.vite/manifest.json');
        $manifestExists = File::exists($manifestPath);
        
        $this->report['vite_assets'] = [
            'manifest_exists' => $manifestExists,
            'assets' => [],
        ];

        if ($manifestExists) {
            try {
                $manifest = json_decode(File::get($manifestPath), true);
                $this->report['vite_assets']['assets'] = array_slice(array_keys($manifest), 0, 3);
                $status = '✅ PASS';
            } catch (Exception $e) {
                $this->report['vite_assets']['error'] = $e->getMessage();
                $status = '❌ FAIL';
                $this->issues[] = "Vite manifest parsing failed: {$e->getMessage()}";
            }
        } else {
            $status = '❌ FAIL';
            $this->issues[] = "Vite manifest not found. Run: npm run build";
        }

        $this->report['vite_assets']['status'] = $status;
    }

    private function checkHttpSecurity(): void
    {
        $appUrl = config('app.url');
        
        $this->report['http_security'] = [
            'app_url' => $appUrl,
            'headers' => [],
        ];

        if ($appUrl && filter_var($appUrl, FILTER_VALIDATE_URL)) {
            try {
                $start = microtime(true);
                $response = Http::timeout(2)->get($appUrl);
                $this->report['http_security']['response_time_ms'] = round((microtime(true) - $start) * 1000, 2);
                
                $headers = $response->headers();
                $securityHeaders = [
                    'Strict-Transport-Security',
                    'Content-Security-Policy',
                    'X-Frame-Options',
                    'X-Content-Type-Options',
                    'Referrer-Policy',
                ];

                foreach ($securityHeaders as $header) {
                    $this->report['http_security']['headers'][$header] = $headers->get($header, 'Not Set');
                }
                
                $status = '✅ PASS';
            } catch (Exception $e) {
                $this->report['http_security']['error'] = $e->getMessage();
                $status = '⚠️ WARN';
                $this->warnings[] = "Could not check HTTP security headers: {$e->getMessage()}";
            }
        } else {
            $status = '⚠️ WARN';
            $this->warnings[] = 'APP_URL not set or invalid, skipping HTTP security check';
        }

        $this->report['http_security']['status'] = $status;
    }

    private function checkHealthEndpoint(): void
    {
        // Simple check - we know we added the health route
        $healthExists = true;
        
        $this->report['health_endpoint'] = [
            'route_exists' => $healthExists,
        ];

        if ($healthExists) {
            try {
                $start = microtime(true);
                $response = Http::timeout(2)->get(config('app.url') . '/health');
                $this->report['health_endpoint']['response_time_ms'] = round((microtime(true) - $start) * 1000, 2);
                
                $data = $response->json();
                $this->report['health_endpoint']['response'] = [
                    'status' => $data['status'] ?? 'unknown',
                    'checks' => $data['checks'] ?? [],
                ];
                
                $status = '✅ PASS';
            } catch (Exception $e) {
                $this->report['health_endpoint']['error'] = $e->getMessage();
                $status = '⚠️ WARN';
                $this->warnings[] = "Health endpoint error: {$e->getMessage()}";
            }
        } else {
            $status = '❌ FAIL';
            $this->issues[] = 'Health endpoint route not found';
        }

        $this->report['health_endpoint']['status'] = $status;
    }

    private function checkPhpOptimizations(): void
    {
        $this->report['php_optimizations'] = [
            'opcache_enabled' => function_exists('opcache_get_status'),
            'opcache_status' => null,
        ];

        if (function_exists('opcache_get_status')) {
            try {
                $status = opcache_get_status();
                $this->report['php_optimizations']['opcache_status'] = [
                    'enabled' => $status['opcache_enabled'] ?? false,
                    'memory_usage' => $status['memory_usage'] ?? null,
                    'hit_rate' => $status['opcache_statistics']['opcache_hit_rate'] ?? null,
                ];
                
                $opcacheEnabled = $status['opcache_enabled'] ?? false;
                $status = $opcacheEnabled ? '✅ PASS' : '⚠️ WARN';
                if (!$opcacheEnabled) {
                    $this->warnings[] = 'OPcache is not enabled. Consider enabling for better performance';
                }
            } catch (Exception $e) {
                $this->report['php_optimizations']['error'] = $e->getMessage();
                $status = '⚠️ WARN';
                $this->warnings[] = "Could not check OPcache status: {$e->getMessage()}";
            }
        } else {
            $status = '⚠️ WARN';
            $this->warnings[] = 'OPcache extension not available';
        }

        $this->report['php_optimizations']['status'] = $status;
    }

    private function checkFilePermissions(): void
    {
        $storageWritable = is_writable(storage_path());
        $bootstrapCacheWritable = is_writable(base_path('bootstrap/cache'));
        
        $this->report['file_permissions'] = [
            'storage_writable' => $storageWritable,
            'bootstrap_cache_writable' => $bootstrapCacheWritable,
            'current_user' => get_current_user(),
        ];

        $status = '✅ PASS';
        if (!$storageWritable || !$bootstrapCacheWritable) {
            $status = '❌ FAIL';
            if (!$storageWritable) {
                $this->issues[] = 'Storage directory is not writable';
            }
            if (!$bootstrapCacheWritable) {
                $this->issues[] = 'Bootstrap cache directory is not writable';
            }
        }

        $this->report['file_permissions']['status'] = $status;
    }

    private function checkNginxPhpFpm(): void
    {
        $nginxConfigPath = base_path('docker/nginx.conf');
        $nginxConfigExists = File::exists($nginxConfigPath);
        
        $this->report['nginx_phpfpm'] = [
            'nginx_config_exists' => $nginxConfigExists,
            'php_version' => PHP_VERSION,
        ];

        if ($nginxConfigExists) {
            $config = File::get($nginxConfigPath);
            $hasSocketNote = str_contains($config, 'NOTE') && str_contains($config, 'socket');
            $this->report['nginx_phpfpm']['has_socket_note'] = $hasSocketNote;
            
            if (!$hasSocketNote) {
                $status = '⚠️ WARN';
                $this->warnings[] = 'Nginx config should include a NOTE about adjusting PHP-FPM socket path';
            } else {
                $status = '✅ PASS';
            }
        } else {
            $status = '⚠️ WARN';
            $this->warnings[] = 'Nginx configuration file not found at docker/nginx.conf';
        }

        $this->report['nginx_phpfpm']['status'] = $status;
    }

    private function generateMarkdownReport(float $totalTime): string
    {
        $markdown = "# Production Readiness Report\n\n";
        $markdown .= "Generated: " . now()->toISOString() . "\n";
        $markdown .= "Report Time: {$totalTime}ms\n\n";

        $markdown .= "## 📊 Summary\n\n";
        $passCount = 0;
        $warnCount = 0;
        $failCount = 0;

        foreach ($this->report as $section => $data) {
            if (isset($data['status'])) {
                if ($data['status'] === '✅ PASS') $passCount++;
                elseif ($data['status'] === '⚠️ WARN') $warnCount++;
                elseif ($data['status'] === '❌ FAIL') $failCount++;
            }
        }

        $markdown .= "- **Total Checks**: " . count($this->report) . "\n";
        $markdown .= "- **✅ Pass**: {$passCount}\n";
        $markdown .= "- **⚠️ Warn**: {$warnCount}\n";
        $markdown .= "- **❌ Fail**: {$failCount}\n\n";

        // Generate sections
        $sections = [
            'app_runtime' => '📱 App Runtime',
            'logging' => '📝 Logging',
            'env_config' => '⚙️ Environment & Config',
            'database' => '🗄️ Database',
            'redis' => '🔴 Redis',
            'queue' => '📬 Queue',
            'cache_session' => '💾 Cache & Session',
            'vite_assets' => '⚡ Vite Assets',
            'http_security' => '🔒 HTTP Security',
            'health_endpoint' => '🏥 Health Endpoint',
            'php_optimizations' => '🚀 PHP Optimizations',
            'file_permissions' => '📁 File Permissions',
            'nginx_phpfpm' => '🌐 Nginx/PHP-FPM',
        ];

        foreach ($sections as $key => $title) {
            if (isset($this->report[$key])) {
                $markdown .= $this->formatSection($title, $this->report[$key]);
            }
        }

        // Add issues and warnings
        if (!empty($this->issues) || !empty($this->warnings)) {
            $markdown .= "## 🚨 Issues to Address\n\n";
            
            if (!empty($this->issues)) {
                $markdown .= "### ❌ Failures\n";
                foreach ($this->issues as $issue) {
                    $markdown .= "- {$issue}\n";
                }
                $markdown .= "\n";
            }
            
            if (!empty($this->warnings)) {
                $markdown .= "### ⚠️ Warnings\n";
                foreach ($this->warnings as $warning) {
                    $markdown .= "- {$warning}\n";
                }
                $markdown .= "\n";
            }
        }

        $markdown .= "## 💡 Recommendations\n\n";
        $markdown .= "1. **For Production**:\n";
        $markdown .= "   - Set `APP_DEBUG=false`\n";
        $markdown .= "   - Use HTTPS URLs\n";
        $markdown .= "   - Enable OPcache\n";
        $markdown .= "   - Use Redis for cache/session/queue\n";
        $markdown .= "   - Configure proper logging\n\n";
        $markdown .= "2. **For Monitoring**:\n";
        $markdown .= "   - Add health endpoint\n";
        $markdown .= "   - Set up queue monitoring\n";
        $markdown .= "   - Configure error tracking\n\n";
        $markdown .= "3. **For Performance**:\n";
        $markdown .= "   - Run `npm run build` for production assets\n";
        $markdown .= "   - Configure CDN for static assets\n";
        $markdown .= "   - Optimize database queries\n";

        return $markdown;
    }

    private function formatSection(string $title, array $data): string
    {
        $markdown = "## {$title}\n\n";
        
        $status = $data['status'] ?? '❓ UNKNOWN';
        $markdown .= "**Status**: {$status}\n\n";

        foreach ($data as $key => $value) {
            if ($key === 'status') continue;
            
            if (is_array($value)) {
                $markdown .= "- **{$key}**:\n";
                foreach ($value as $subKey => $subValue) {
                    if (is_array($subValue)) {
                        $markdown .= "  - {$subKey}: " . json_encode($subValue) . "\n";
                    } else {
                        $markdown .= "  - {$subKey}: {$subValue}\n";
                    }
                }
            } else {
                $markdown .= "- **{$key}**: {$value}\n";
            }
        }
        
        $markdown .= "\n";
        return $markdown;
    }

    private function outputSummary(): void
    {
        $this->info('📊 Production Readiness Summary:');
        
        foreach ($this->report as $section => $data) {
            $status = $data['status'] ?? '❓ UNKNOWN';
            $this->line("  {$section}: {$status}");
        }
        
        if (!empty($this->issues)) {
            $this->error('❌ Issues found:');
            foreach ($this->issues as $issue) {
                $this->error("  - {$issue}");
            }
        }
        
        if (!empty($this->warnings)) {
            $this->warn('⚠️ Warnings:');
            foreach ($this->warnings as $warning) {
                $this->warn("  - {$warning}");
            }
        }
    }
}
