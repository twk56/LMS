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
        Schema::create('course_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // ชื่อหมวดหมู่
            $table->string('slug')->unique(); // URL-friendly name
            $table->text('description')->nullable(); // คำอธิบาย
            $table->string('color')->default('#3b82f6'); // สีของหมวดหมู่
            $table->string('icon')->nullable(); // ไอคอน (ชื่อ icon class)
            $table->integer('order')->default(0); // ลำดับการแสดง
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['slug', 'is_active']);
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_categories');
    }
};
