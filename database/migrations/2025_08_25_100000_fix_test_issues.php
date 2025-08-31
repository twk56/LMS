<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Added missing import

return new class extends Migration
{
    public function up(): void
    {
        // Fix course_user table - add enrolled_at column
        if (!Schema::hasColumn('course_user', 'enrolled_at')) {
            Schema::table('course_user', function (Blueprint $table) {
                $table->timestamp('enrolled_at')->nullable();
            });
        }

        // Fix quizzes table - add course_id column
        if (!Schema::hasColumn('quizzes', 'course_id')) {
            Schema::table('quizzes', function (Blueprint $table) {
                $table->foreignId('course_id')->constrained()->onDelete('cascade');
            });
        }

        // Fix lessons table - update content_type constraint (SQLite safe)
        if (Schema::hasColumn('lessons', 'content_type')) {
            // For SQLite, we need to recreate the table
            if (config('database.default') === 'sqlite') {
                $this->recreateLessonsTableForSQLite();
            } else {
                // For other databases, we can modify the column
                Schema::table('lessons', function (Blueprint $table) {
                    $table->string('content_type')->default('text')->change();
                });
            }
        }
    }

    public function down(): void
    {
        // Remove enrolled_at column
        if (Schema::hasColumn('course_user', 'enrolled_at')) {
            Schema::table('course_user', function (Blueprint $table) {
                $table->dropColumn('enrolled_at');
            });
        }

        // Remove course_id column from quizzes
        if (Schema::hasColumn('quizzes', 'course_id')) {
            Schema::table('quizzes', function (Blueprint $table) {
                $table->dropForeign(['course_id']);
                $table->dropColumn('course_id');
            });
        }
    }

    private function recreateLessonsTableForSQLite(): void
    {
        // Get existing data
        $lessons = DB::table('lessons')->get();
        
        // Drop the old table
        Schema::dropIfExists('lessons');
        
        // Recreate with proper structure
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->integer('order');
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->string('content_type')->default('text');
            $table->string('youtube_url')->nullable();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
        
        // Reinsert data
        foreach ($lessons as $lesson) {
            DB::table('lessons')->insert([
                'id' => $lesson->id,
                'title' => $lesson->title,
                'content' => $lesson->content,
                'order' => $lesson->order,
                'status' => $lesson->status ?? 'draft',
                'content_type' => $lesson->content_type ?? 'text',
                'youtube_url' => $lesson->youtube_url,
                'course_id' => $lesson->course_id,
                'created_at' => $lesson->created_at,
                'updated_at' => $lesson->updated_at,
            ]);
        }
    }
};
