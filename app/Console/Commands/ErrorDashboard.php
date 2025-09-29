<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ErrorDashboard extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'error:dashboard {--hours=24 : Number of hours to analyze}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Display a comprehensive error dashboard';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hours = $this->option('hours');
        
        $this->info("📊 Error Dashboard - Last {$hours} hours");
        $this->line('');
        
        $this->displaySystemStatus();
        $this->displayErrorTrends($hours);
        $this->displayTopErrors($hours);
        $this->displayControllerHealth($hours);
        $this->displayRecommendations($hours);
        
        return Command::SUCCESS;
    }

    private function displaySystemStatus()
    {
        $this->info("🖥️  System Status");
        $this->line("Application: " . config('app.name'));
        $this->line("Environment: " . config('app.env'));
        $this->line("Debug Mode: " . (config('app.debug') ? 'ON' : 'OFF'));
        $this->line("Log Level: " . config('logging.level', 'debug'));
        $this->line('');
    }

    private function displayErrorTrends($hours)
    {
        $this->info("📈 Error Trends");
        
        $logFile = storage_path('logs/laravel.log');
        if (!File::exists($logFile)) {
            $this->warn("No log file found");
            return;
        }

        $lines = File::lines($logFile);
        $cutoffTime = now()->subHours($hours);
        
        $hourlyErrors = [];
        $hourlyWarnings = [];
        $hourlyInfo = [];

        foreach ($lines as $line) {
            if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $line, $matches)) {
                $logTime = \Carbon\Carbon::parse($matches[1]);
                
                if ($logTime->lt($cutoffTime)) {
                    continue;
                }

                $hour = $logTime->format('Y-m-d H:00');
                
                if (str_contains($line, '.ERROR:')) {
                    $hourlyErrors[$hour] = ($hourlyErrors[$hour] ?? 0) + 1;
                } elseif (str_contains($line, '.WARNING:')) {
                    $hourlyWarnings[$hour] = ($hourlyWarnings[$hour] ?? 0) + 1;
                } elseif (str_contains($line, '.INFO:')) {
                    $hourlyInfo[$hour] = ($hourlyInfo[$hour] ?? 0) + 1;
                }
            }
        }

        $this->table(
            ['Hour', 'Errors', 'Warnings', 'Info'],
            collect($hourlyErrors)->map(function ($errors, $hour) use ($hourlyWarnings, $hourlyInfo) {
                return [
                    $hour,
                    $errors,
                    $hourlyWarnings[$hour] ?? 0,
                    $hourlyInfo[$hour] ?? 0,
                ];
            })->sortBy('Hour')->values()->toArray()
        );
        
        $this->line('');
    }

    private function displayTopErrors($hours)
    {
        $this->info("🔝 Top Errors");
        
        $logFile = storage_path('logs/laravel.log');
        if (!File::exists($logFile)) {
            return;
        }

        $lines = File::lines($logFile);
        $cutoffTime = now()->subHours($hours);
        $errorMessages = [];

        foreach ($lines as $line) {
            if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $line, $matches)) {
                $logTime = \Carbon\Carbon::parse($matches[1]);
                
                if ($logTime->lt($cutoffTime)) {
                    continue;
                }

                if (str_contains($line, '.ERROR:')) {
                    if (preg_match('/ERROR: (.+?)(?:\s+{|\s*$)/', $line, $matches)) {
                        $message = substr($matches[1], 0, 80);
                        $errorMessages[$message] = ($errorMessages[$message] ?? 0) + 1;
                    }
                }
            }
        }

        $topErrors = collect($errorMessages)
            ->sortDesc()
            ->take(5)
            ->map(function ($count, $message) {
                return [$message, $count];
            })
            ->values()
            ->toArray();

        if (empty($topErrors)) {
            $this->line("No errors found in the specified time period");
        } else {
            $this->table(['Error Message', 'Count'], $topErrors);
        }
        
        $this->line('');
    }

    private function displayControllerHealth($hours)
    {
        $this->info("🏥 Controller Health");
        
        $logFile = storage_path('logs/laravel.log');
        if (!File::exists($logFile)) {
            return;
        }

        $lines = File::lines($logFile);
        $cutoffTime = now()->subHours($hours);
        $controllerStats = [];

        foreach ($lines as $line) {
            if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $line, $matches)) {
                $logTime = \Carbon\Carbon::parse($matches[1]);
                
                if ($logTime->lt($cutoffTime)) {
                    continue;
                }

                if (preg_match('/(\w+Controller@\w+):/', $line, $matches)) {
                    $controller = $matches[1];
                    
                    if (!isset($controllerStats[$controller])) {
                        $controllerStats[$controller] = ['errors' => 0, 'warnings' => 0, 'info' => 0];
                    }
                    
                    if (str_contains($line, '.ERROR:')) {
                        $controllerStats[$controller]['errors']++;
                    } elseif (str_contains($line, '.WARNING:')) {
                        $controllerStats[$controller]['warnings']++;
                    } elseif (str_contains($line, '.INFO:')) {
                        $controllerStats[$controller]['info']++;
                    }
                }
            }
        }

        $healthData = collect($controllerStats)->map(function ($stats, $controller) {
            $total = $stats['errors'] + $stats['warnings'] + $stats['info'];
            $healthScore = $total > 0 ? round((($stats['info'] - $stats['errors']) / $total) * 100) : 100;
            
            return [
                $controller,
                $stats['errors'],
                $stats['warnings'],
                $stats['info'],
                $healthScore . '%'
            ];
        })->sortByDesc(function ($item) {
            return $item[1]; // Sort by error count
        })->values()->toArray();

        if (empty($healthData)) {
            $this->line("No controller activity found in the specified time period");
        } else {
            $this->table(
                ['Controller', 'Errors', 'Warnings', 'Info', 'Health Score'],
                $healthData
            );
        }
        
        $this->line('');
    }

    private function displayRecommendations($hours)
    {
        $this->info("💡 Recommendations");
        
        $logFile = storage_path('logs/laravel.log');
        if (!File::exists($logFile)) {
            $this->line("No log file found for analysis");
            return;
        }

        $lines = File::lines($logFile);
        $cutoffTime = now()->subHours($hours);
        $errorCount = 0;
        $warningCount = 0;

        foreach ($lines as $line) {
            if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $line, $matches)) {
                $logTime = \Carbon\Carbon::parse($matches[1]);
                
                if ($logTime->lt($cutoffTime)) {
                    continue;
                }

                if (str_contains($line, '.ERROR:')) {
                    $errorCount++;
                } elseif (str_contains($line, '.WARNING:')) {
                    $warningCount++;
                }
            }
        }

        if ($errorCount > 20) {
            $this->line("🔴 High error count detected! Consider:");
            $this->line("   - Reviewing error patterns");
            $this->line("   - Checking application stability");
            $this->line("   - Implementing better error handling");
        } elseif ($errorCount > 10) {
            $this->line("🟡 Moderate error count. Monitor closely.");
        } else {
            $this->line("🟢 Error count is within acceptable range.");
        }

        if ($warningCount > 50) {
            $this->line("🟡 High warning count. Consider reviewing logs.");
        }

        $this->line("📝 Run 'php artisan error:monitor' for detailed analysis");
        $this->line("🧹 Run 'php artisan error:cleanup' to clean old logs");
        $this->line("🚨 Run 'php artisan error:alert' to set up alerts");
    }
}