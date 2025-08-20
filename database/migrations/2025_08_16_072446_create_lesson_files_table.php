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
        Schema::create('lesson_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->string('filename'); // ชื่อไฟล์ที่อัปโหลด
            $table->string('original_name'); // ชื่อไฟล์เดิม
            $table->string('file_path'); // path ของไฟล์ใน storage
            $table->string('file_type'); // pdf, video, image
            $table->string('mime_type'); // application/pdf, video/mp4, image/jpeg
            $table->bigInteger('file_size'); // ขนาดไฟล์เป็น bytes
            $table->string('title')->nullable(); // ชื่อที่แสดง
            $table->text('description')->nullable(); // คำอธิบาย
            $table->integer('order')->default(0); // ลำดับการแสดง
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['lesson_id', 'file_type']);
            $table->index(['file_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_files');
    }
};
