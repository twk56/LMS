<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes for better performance (only if they don't exist)
        try {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasIndex('users', 'users_email_index')) {
                    $table->index('email');
                }
                if (!Schema::hasIndex('users', 'users_role_index')) {
                    $table->index('role');
                }
            });
        } catch (Exception $e) {
            // Index might already exist
        }

        try {
            Schema::table('courses', function (Blueprint $table) {
                if (!Schema::hasIndex('courses', 'courses_created_by_index')) {
                    $table->index('created_by');
                }
                if (!Schema::hasIndex('courses', 'courses_status_index')) {
                    $table->index('status');
                }
            });
        } catch (Exception $e) {
            // Index might already exist
        }

        try {
            Schema::table('lessons', function (Blueprint $table) {
                if (!Schema::hasIndex('lessons', 'lessons_status_index')) {
                    $table->index('status');
                }
            });
        } catch (Exception $e) {
            // Index might already exist
        }

        try {
            Schema::table('lesson_progress', function (Blueprint $table) {
                if (!Schema::hasIndex('lesson_progress', 'lesson_progress_user_id_lesson_id_index')) {
                    $table->index(['user_id', 'lesson_id']);
                }
                if (!Schema::hasIndex('lesson_progress', 'lesson_progress_status_index')) {
                    $table->index('status');
                }
            });
        } catch (Exception $e) {
            // Index might already exist
        }

        try {
            Schema::table('quiz_attempts', function (Blueprint $table) {
                if (!Schema::hasIndex('quiz_attempts', 'quiz_attempts_user_id_quiz_id_index')) {
                    $table->index(['user_id', 'quiz_id']);
                }
                if (!Schema::hasIndex('quiz_attempts', 'quiz_attempts_completed_at_index')) {
                    $table->index('completed_at');
                }
            });
        } catch (Exception $e) {
            // Index might already exist
        }

        try {
            Schema::table('appearance_settings', function (Blueprint $table) {
                if (!Schema::hasIndex('appearance_settings', 'appearance_settings_user_id_index')) {
                    $table->index('user_id');
                }
            });
        } catch (Exception $e) {
            // Index might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropIndex(['role']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex(['category_id']);
            $table->dropIndex(['created_by']);
            $table->dropIndex(['status']);
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->dropIndex(['course_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('lesson_progress', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'lesson_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'quiz_id']);
            $table->dropIndex(['completed_at']);
        });

        Schema::table('appearance_settings', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });
    }
};
