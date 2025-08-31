<?php

namespace Database\Seeders;

use App\Models\CourseCategory;
use Illuminate\Database\Seeder;

class CreateCourseCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'การพัฒนาเว็บไซต์',
                'description' => 'หลักสูตรเกี่ยวกับการพัฒนาเว็บไซต์และแอปพลิเคชัน',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'name' => 'การออกแบบกราฟิก',
                'description' => 'หลักสูตรเกี่ยวกับการออกแบบกราฟิกและศิลปะดิจิทัล',
                'is_active' => true,
                'order' => 2,
            ],
            [
                'name' => 'การตลาดดิจิทัล',
                'description' => 'หลักสูตรเกี่ยวกับการตลาดออนไลน์และโซเชียลมีเดีย',
                'is_active' => true,
                'order' => 3,
            ],
            [
                'name' => 'การจัดการธุรกิจ',
                'description' => 'หลักสูตรเกี่ยวกับการจัดการและบริหารธุรกิจ',
                'is_active' => true,
                'order' => 4,
            ],
            [
                'name' => 'ภาษาและการสื่อสาร',
                'description' => 'หลักสูตรเกี่ยวกับภาษาและการพัฒนาทักษะการสื่อสาร',
                'is_active' => true,
                'order' => 5,
            ],
            [
                'name' => 'เทคโนโลยีและนวัตกรรม',
                'description' => 'หลักสูตรเกี่ยวกับเทคโนโลยีใหม่และนวัตกรรม',
                'is_active' => true,
                'order' => 6,
            ],
        ];

        foreach ($categories as $category) {
            $slug = \Illuminate\Support\Str::slug($category['name']);
            CourseCategory::updateOrCreate(
                ['slug' => $slug],
                array_merge($category, [
                    'slug' => $slug,
                    'color' => '#3B82F6', // Default blue color
                ])
            );
        }

        echo "Created/Updated " . count($categories) . " course categories.\n";
    }
}
