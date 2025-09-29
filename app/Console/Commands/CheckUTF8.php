<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SimpleChatMessage;
use App\Models\Course;
use App\Models\User;

class CheckUTF8 extends Command
{
    protected $signature = 'check:utf8';
    protected $description = 'Check UTF-8 encoding issues';

    public function handle()
    {
        $this->info('🔍 Checking UTF-8 encoding issues...');
        
        // Check Chat Messages
        $this->line('Checking Chat Messages...');
        $messages = SimpleChatMessage::all();
        foreach($messages as $msg) {
            $isValid = mb_check_encoding($msg->message, 'UTF-8');
            if (!$isValid) {
                $this->error("❌ Invalid UTF-8 in message ID {$msg->id}: " . substr($msg->message, 0, 50));
                $this->line("Raw bytes: " . bin2hex(substr($msg->message, 0, 20)));
            } else {
                $this->line("✅ Message ID {$msg->id}: Valid UTF-8");
            }
        }
        
        // Check Courses
        $this->line('Checking Courses...');
        $courses = Course::all();
        foreach($courses as $course) {
            $isValid = mb_check_encoding($course->title, 'UTF-8');
            if (!$isValid) {
                $this->error("❌ Invalid UTF-8 in course title: " . $course->title);
            } else {
                $this->line("✅ Course '{$course->title}': Valid UTF-8");
            }
        }
        
        // Check Users
        $this->line('Checking Users...');
        $users = User::all();
        foreach($users as $user) {
            $isValid = mb_check_encoding($user->name, 'UTF-8');
            if (!$isValid) {
                $this->error("❌ Invalid UTF-8 in user name: " . $user->name);
            } else {
                $this->line("✅ User '{$user->name}': Valid UTF-8");
            }
        }
        
        $this->info('✅ UTF-8 check completed!');
        return 0;
    }
}