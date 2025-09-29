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
        Schema::table('course_user', function (Blueprint $table) {
            // Add missing status values
            $table->dropColumn('status');
        });
        
        Schema::table('course_user', function (Blueprint $table) {
            $table->enum('status', ['enrolled', 'in_progress', 'completed', 'dropped'])->default('enrolled')->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_user', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        
        Schema::table('course_user', function (Blueprint $table) {
            $table->enum('status', ['enrolled', 'completed'])->default('enrolled')->after('user_id');
        });
    }
};