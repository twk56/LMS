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
        Schema::table('lessons', function (Blueprint $table) {
            // Check if status column doesn't exist before adding it
            if (!Schema::hasColumn('lessons', 'status')) {
                $table->enum('status', ['draft', 'published'])->default('draft')->after('order');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            // Only drop if column exists
            if (Schema::hasColumn('lessons', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
