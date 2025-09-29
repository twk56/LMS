<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ErrorCleanup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'error:cleanup {--days=7 : Number of days to keep logs} {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old error logs to prevent disk space issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $dryRun = $this->option('dry-run');
        
        $this->info("🧹 Cleaning up logs older than {$days} days...");
        
        if ($dryRun) {
            $this->warn("🔍 DRY RUN MODE - No files will be deleted");
        }
        
        $logPath = storage_path('logs');
        $cutoffDate = now()->subDays($days);
        
        $deletedFiles = 0;
        $deletedSize = 0;
        
        if (File::exists($logPath)) {
            $files = File::allFiles($logPath);
            
            foreach ($files as $file) {
                $fileDate = \Carbon\Carbon::createFromTimestamp($file->getMTime());
                
                if ($fileDate->lt($cutoffDate)) {
                    $fileSize = $file->getSize();
                    
                    if ($dryRun) {
                        $this->line("Would delete: {$file->getRelativePathname()} ({$this->formatBytes($fileSize)})");
                    } else {
                        File::delete($file->getPathname());
                        $this->line("Deleted: {$file->getRelativePathname()} ({$this->formatBytes($fileSize)})");
                    }
                    
                    $deletedFiles++;
                    $deletedSize += $fileSize;
                }
            }
        }
        
        if ($deletedFiles === 0) {
            $this->info("✅ No old log files found to clean up");
        } else {
            $this->info("📊 Cleanup Summary:");
            $this->line("  Files deleted: {$deletedFiles}");
            $this->line("  Space freed: " . $this->formatBytes($deletedSize));
        }
        
        // Rotate current log file if it's too large
        $this->rotateLargeLogFile();
        
        return Command::SUCCESS;
    }

    private function rotateLargeLogFile()
    {
        $logFile = storage_path('logs/laravel.log');
        $maxSize = 10 * 1024 * 1024; // 10MB
        
        if (File::exists($logFile) && File::size($logFile) > $maxSize) {
            $this->info("🔄 Rotating large log file...");
            
            $timestamp = now()->format('Y-m-d_H-i-s');
            $rotatedFile = storage_path("logs/laravel-{$timestamp}.log");
            
            File::move($logFile, $rotatedFile);
            File::put($logFile, '');
            
            $this->line("Rotated: laravel.log -> laravel-{$timestamp}.log");
        }
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}