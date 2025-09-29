<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckTables extends Command
{
    protected $signature = 'check:tables';
    protected $description = 'Check database tables';

    public function handle()
    {
        $this->info('🔍 Checking Database Tables...');
        
        try {
            $tables = DB::select('SELECT name FROM sqlite_master WHERE type="table"');
            
            $this->line('📊 Found ' . count($tables) . ' tables:');
            foreach ($tables as $table) {
                $this->line('  - ' . $table->name);
            }
            
            // Check if lesson_files exists
            $lessonFilesExists = collect($tables)->contains('name', 'lesson_files');
            if ($lessonFilesExists) {
                $this->info('✅ lesson_files table exists');
                
                // Check table structure
                $columns = DB::select('PRAGMA table_info(lesson_files)');
                $this->line('📋 lesson_files columns:');
                foreach ($columns as $column) {
                    $this->line('  - ' . $column->name . ' (' . $column->type . ')');
                }
            } else {
                $this->warn('⚠️ lesson_files table does not exist');
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            return 1;
        }
    }
}