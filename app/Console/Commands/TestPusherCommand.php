<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Pusher\Pusher;
use Illuminate\Support\Facades\Log;

class TestPusherCommand extends Command
{
    protected $signature = 'pusher:test {--message=Hello from Laravel!}';
    protected $description = 'Test Pusher connection and send a test message';

    public function handle()
    {
        $this->info('🧪 Testing Pusher Connection...');
        $this->newLine();

        // Check if Pusher is configured
        $pusherKey = config('broadcasting.connections.pusher.key');
        $pusherSecret = config('broadcasting.connections.pusher.secret');
        $pusherAppId = config('broadcasting.connections.pusher.app_id');
        $pusherCluster = config('broadcasting.connections.pusher.options.cluster');

        if (!$pusherKey || !$pusherSecret || !$pusherAppId) {
            $this->error('❌ Pusher is not configured properly!');
            $this->line('Please check your .env file and ensure PUSHER_APP_KEY, PUSHER_APP_SECRET, and PUSHER_APP_ID are set.');
            return 1;
        }

        if ($pusherKey === 'your_app_key' || $pusherSecret === 'your_app_secret' || $pusherAppId === 'your_app_id') {
            $this->error('❌ Pusher is using default placeholder values!');
            $this->line('Please update your .env file with actual Pusher credentials from https://dashboard.pusher.com/');
            return 1;
        }

        $this->info('✅ Pusher credentials found');
        $this->line("   App ID: {$pusherAppId}");
        $this->line("   Key: {$pusherKey}");
        $this->line("   Cluster: {$pusherCluster}");
        $this->newLine();

        try {
            // Initialize Pusher
            $pusher = new Pusher(
                $pusherKey,
                $pusherSecret,
                $pusherAppId,
                [
                    'cluster' => $pusherCluster,
                    'encrypted' => true,
                    'useTLS' => true,
                    'timeout' => 30,
                    'debug' => true,
                ]
            );

            $this->info('🔄 Initializing Pusher connection...');

            // Test connection
            $testMessage = $this->option('message');
            $channel = 'test-channel';
            $event = 'test-event';

            $this->line("   Sending message: '{$testMessage}'");
            $this->line("   Channel: {$channel}");
            $this->line("   Event: {$event}");

            $result = $pusher->trigger($channel, $event, [
                'message' => $testMessage,
                'timestamp' => now()->toISOString(),
                'source' => 'Laravel Command',
            ]);

            if ($result) {
                $this->info('✅ Pusher connection successful!');
                $this->line('   Message sent successfully');
                $this->line('   Check your Pusher dashboard or frontend to see the message');
            } else {
                $this->error('❌ Failed to send message via Pusher');
                return 1;
            }

        } catch (\Exception $e) {
            $this->error('❌ Pusher connection failed!');
            $this->line("   Error: {$e->getMessage()}");
            
            Log::error('Pusher test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return 1;
        }

        $this->newLine();
        $this->info('🎉 Pusher is working correctly!');
        $this->line('Your real-time chat should now work properly.');
        
        return 0;
    }
}

