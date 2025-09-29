<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;

class ErrorAlert extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'error:alert {--email= : Email to send alerts to} {--threshold=5 : Error threshold}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send error alerts when error count exceeds threshold';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $threshold = (int) $this->option('threshold');
        $email = $this->option('email');
        
        $this->info("🚨 Checking for errors above threshold: {$threshold}");
        
        $errorCount = $this->getRecentErrorCount();
        
        if ($errorCount >= $threshold) {
            $this->warn("⚠️  Error count ({$errorCount}) exceeds threshold ({$threshold})");
            
            $this->sendAlert($errorCount, $email);
            
            $this->info("📧 Alert sent successfully");
        } else {
            $this->info("✅ Error count ({$errorCount}) is within acceptable range");
        }
        
        return Command::SUCCESS;
    }

    private function getRecentErrorCount()
    {
        $logFile = storage_path('logs/laravel.log');
        
        if (!File::exists($logFile)) {
            return 0;
        }

        $lines = File::lines($logFile);
        $cutoffTime = now()->subMinutes(30); // Last 30 minutes
        $errorCount = 0;

        foreach ($lines as $line) {
            if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $line, $matches)) {
                $logTime = \Carbon\Carbon::parse($matches[1]);
                
                if ($logTime->lt($cutoffTime)) {
                    continue;
                }

                if (str_contains($line, '.ERROR:')) {
                    $errorCount++;
                }
            }
        }

        return $errorCount;
    }

    private function sendAlert($errorCount, $email)
    {
        $alertData = [
            'error_count' => $errorCount,
            'timestamp' => now(),
            'application' => config('app.name'),
            'environment' => config('app.env'),
        ];

        // Log the alert
        Log::critical('Error Alert Triggered', $alertData);

        // Send email if provided
        if ($email) {
            try {
                Mail::raw($this->getAlertMessage($alertData), function ($message) use ($email) {
                    $message->to($email)
                           ->subject('🚨 Error Alert - ' . config('app.name'));
                });
            } catch (\Exception $e) {
                Log::error('Failed to send error alert email', [
                    'email' => $email,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Display alert in console
        $this->displayAlert($alertData);
    }

    private function getAlertMessage($alertData)
    {
        return "
🚨 ERROR ALERT 🚨

Application: {$alertData['application']}
Environment: {$alertData['environment']}
Error Count: {$alertData['error_count']}
Time: {$alertData['timestamp']}

The application has exceeded the error threshold.
Please check the logs for more details.

Log file: storage/logs/laravel.log
        ";
    }

    private function displayAlert($alertData)
    {
        $this->error('🚨 ERROR ALERT TRIGGERED 🚨');
        $this->line('');
        $this->line("Application: {$alertData['application']}");
        $this->line("Environment: {$alertData['environment']}");
        $this->line("Error Count: {$alertData['error_count']}");
        $this->line("Time: {$alertData['timestamp']}");
        $this->line('');
        $this->line('Please check the logs for more details.');
    }
}