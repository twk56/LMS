<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lesson;
use App\Models\LessonFile;

class LessonFileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $lessons = Lesson::all();

        foreach ($lessons as $lesson) {
            // สร้างไฟล์ตัวอย่างสำหรับแต่ละบทเรียน
            $files = [
                [
                    'filename' => 'sample_document.pdf',
                    'original_name' => 'เอกสารตัวอย่าง.pdf',
                    'file_path' => 'lesson-files/' . $lesson->id . '/sample_document.pdf',
                    'file_type' => 'pdf',
                    'mime_type' => 'application/pdf',
                    'file_size' => 1024000, // 1MB
                    'title' => 'เอกสารตัวอย่าง',
                    'description' => 'เอกสารตัวอย่างสำหรับบทเรียนนี้',
                    'order' => 1,
                    'is_active' => true,
                ],
                [
                    'filename' => 'sample_image.jpg',
                    'original_name' => 'รูปภาพตัวอย่าง.jpg',
                    'file_path' => 'lesson-files/' . $lesson->id . '/sample_image.jpg',
                    'file_type' => 'image',
                    'mime_type' => 'image/jpeg',
                    'file_size' => 512000, // 500KB
                    'title' => 'รูปภาพตัวอย่าง',
                    'description' => 'รูปภาพประกอบบทเรียน',
                    'order' => 2,
                    'is_active' => true,
                ],
                [
                    'filename' => 'sample_video.mp4',
                    'original_name' => 'วิดีโอตัวอย่าง.mp4',
                    'file_path' => 'lesson-files/' . $lesson->id . '/sample_video.mp4',
                    'file_type' => 'video',
                    'mime_type' => 'video/mp4',
                    'file_size' => 5242880, // 5MB
                    'title' => 'วิดีโอตัวอย่าง',
                    'description' => 'วิดีโอประกอบบทเรียน',
                    'order' => 3,
                    'is_active' => true,
                ],
            ];

            foreach ($files as $fileData) {
                LessonFile::create(array_merge($fileData, [
                    'lesson_id' => $lesson->id,
                ]));
            }
        }
    }
}
