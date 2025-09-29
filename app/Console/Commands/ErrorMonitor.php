<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

class ErrorMonitor extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'error:monitor {--hours=24 : Number of hours to check back}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor and analyze error logs for the application';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hours = $this->option('hours');
        $this->info("🔍 Monitoring errors from the last {$hours} hours...");
        
        $logFile = storage_path('logs/laravel.log');
        
        if (!File::exists($logFile)) {
            $this->error('❌ Log file not found: ' . $logFile);
            return Command::FAILURE;
        }

        $this->analyzeLogFile($logFile, $hours);
        
        return Command::SUCCESS;
    }

    private function analyzeLogFile($logFile, $hours)
    {
        $lines = File::lines($logFile);
        $cutoffTime = now()->subHours($hours);
        $errors = [];
        $warnings = [];
        $info = [];
        $errorCount = 0;
        $warningCount = 0;
        $infoCount = 0;

        foreach ($lines as $line) {
            if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $line, $matches)) {
                $logTime = \Carbon\Carbon::parse($matches[1]);
                
                if ($logTime->lt($cutoffTime)) {
                    continue;
                }

                if (str_contains($line, '.ERROR:')) {
                    $errorCount++;
                    $errors[] = $this->extractErrorInfo($line);
                } elseif (str_contains($line, '.WARNING:')) {
                    $warningCount++;
                    $warnings[] = $this->extractWarningInfo($line);
                } elseif (str_contains($line, '.INFO:')) {
                    $infoCount++;
                    $info[] = $this->extractInfo($line);
                }
            }
        }

        $this->displaySummary($errorCount, $warningCount, $infoCount);
        
        if ($errorCount > 0) {
            $this->displayErrors($errors);
        }
        
        if ($warningCount > 0) {
            $this->displayWarnings($warnings);
        }

        $this->displayRecommendations($errorCount, $warningCount);
    }

    private function extractErrorInfo($line)
    {
        // Extract controller and method from error
        if (preg_match('/(\w+Controller@\w+):/', $line, $matches)) {
            $controller = $matches[1];
        } else {
            $controller = 'Unknown';
        }

        // Extract error message
        if (preg_match('/ERROR: (.+?)(?:\s+{|\s*$)/', $line, $matches)) {
            $message = $matches[1];
        } else {
            $message = 'Unknown error';
        }

        return [
            'controller' => $controller,
            'message' => $message,
            'line' => $line
        ];
    }

    private function extractWarningInfo($line)
    {
        if (preg_match('/(\w+Controller@\w+):/', $line, $matches)) {
            $controller = $matches[1];
        } else {
            $controller = 'Unknown';
        }

        if (preg_match('/WARNING: (.+?)(?:\s+{|\s*$)/', $line, $matches)) {
            $message = $matches[1];
        } else {
            $message = 'Unknown warning';
        }

        return [
            'controller' => $controller,
            'message' => $message,
            'line' => $line
        ];
    }

    private function extractInfo($line)
    {
        if (preg_match('/(\w+Controller@\w+):/', $line, $matches)) {
            $controller = $matches[1];
        } else {
            $controller = 'Unknown';
        }

        return [
            'controller' => $controller,
            'line' => $line
        ];
    }

    private function displaySummary($errorCount, $warningCount, $infoCount)
    {
        $this->info('📊 Error Summary:');
        $this->table(
            ['Type', 'Count'],
            [
                ['Errors', $errorCount],
                ['Warnings', $warningCount],
                ['Info', $infoCount],
            ]
        );
    }

    private function displayErrors($errors)
    {
        $this->error('🚨 Recent Errors:');
        
        $errorGroups = collect($errors)->groupBy('controller');
        
        foreach ($errorGroups as $controller => $controllerErrors) {
            $this->line("  📁 {$controller}:");
            foreach ($controllerErrors->take(3) as $error) {
                $this->line("    ❌ " . substr($error['message'], 0, 100) . '...');
            }
            if ($controllerErrors->count() > 3) {
                $this->line("    ... and " . ($controllerErrors->count() - 3) . " more errors");
            }
        }
    }

    private function displayWarnings($warnings)
    {
        $this->warn('⚠️  Recent Warnings:');
        
        $warningGroups = collect($warnings)->groupBy('controller');
        
        foreach ($warningGroups as $controller => $controllerWarnings) {
            $this->line("  📁 {$controller}:");
            foreach ($controllerWarnings->take(2) as $warning) {
                $this->line("    ⚠️  " . substr($warning['message'], 0, 100) . '...');
            }
            if ($controllerWarnings->count() > 2) {
                $this->line("    ... and " . ($controllerWarnings->count() - 2) . " more warnings");
            }
        }
    }

    private function displayRecommendations($errorCount, $warningCount)
    {
        $this->info('💡 Recommendations:');
        
        if ($errorCount > 10) {
            $this->line('  🔴 High error count detected! Check application stability.');
        } elseif ($errorCount > 5) {
            $this->line('  🟡 Moderate error count. Monitor closely.');
        } else {
            $this->line('  🟢 Error count is within acceptable range.');
        }

        if ($warningCount > 20) {
            $this->line('  🟡 High warning count. Consider reviewing logs.');
        }

        if ($errorCount === 0 && $warningCount === 0) {
            $this->line('  ✅ No errors or warnings found! System is running smoothly.');
        }

        $this->line('  📝 Run "php artisan error:monitor --hours=1" for recent activity');
        $this->line('  🔍 Check specific controllers with high error rates');
    }
}