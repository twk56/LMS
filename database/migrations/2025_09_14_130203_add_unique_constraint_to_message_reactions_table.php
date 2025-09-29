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
        Schema::table('message_reactions', function (Blueprint $table) {
            // Add unique constraint to prevent duplicate reactions from same user
            $table->unique(['message_id', 'user_id'], 'unique_user_reaction_per_message');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('message_reactions', function (Blueprint $table) {
            // Drop unique constraint
            $table->dropUnique('unique_user_reaction_per_message');
        });
    }
};
