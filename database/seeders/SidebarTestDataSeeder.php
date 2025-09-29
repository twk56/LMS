<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Support\Facades\Hash;

class SidebarTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories
        $categories = [
            ['name' => 'Web Development', 'description' => 'Learn web development technologies'],
            ['name' => 'Mobile Development', 'description' => 'Learn mobile app development'],
            ['name' => 'Data Science', 'description' => 'Learn data science and analytics'],
            ['name' => 'Design', 'description' => 'Learn UI/UX design'],
        ];

        foreach ($categories as $categoryData) {
            CourseCategory::firstOrCreate(
                ['name' => $categoryData['name']],
                $categoryData
            );
        }

        // Get categories
        $webCategory = CourseCategory::where('name', 'Web Development')->first();
        $mobileCategory = CourseCategory::where('name', 'Mobile Development')->first();

        // Get or create test users first
        $admin = User::firstOrCreate(
            ['email' => 'kk@kk'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('1234'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'last_login_at' => now()->subHours(2),
            ]
        );

        // Create courses
        $courses = [
            [
                'title' => 'Laravel Fundamentals',
                'description' => 'Learn the basics of Laravel framework',
                'category_id' => $webCategory->id,
                'status' => 'published',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'React.js Complete Guide',
                'description' => 'Master React.js from beginner to advanced',
                'category_id' => $webCategory->id,
                'status' => 'published',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Flutter Mobile Development',
                'description' => 'Build mobile apps with Flutter',
                'category_id' => $mobileCategory->id,
                'status' => 'published',
                'created_by' => $admin->id,
            ],
        ];

        foreach ($courses as $courseData) {
            Course::firstOrCreate(
                ['title' => $courseData['title']],
                $courseData
            );
        }

        // Get courses after creation
        $laravelCourse = Course::where('title', 'Laravel Fundamentals')->first();
        $reactCourse = Course::where('title', 'React.js Complete Guide')->first();

        $lessons = [
            // Laravel lessons
            [
                'course_id' => $laravelCourse->id,
                'title' => 'Introduction to Laravel',
                'content' => 'Learn about Laravel framework basics',
                'order' => 1,
            ],
            [
                'course_id' => $laravelCourse->id,
                'title' => 'Routing in Laravel',
                'content' => 'Understanding Laravel routing system',
                'order' => 2,
            ],
            [
                'course_id' => $laravelCourse->id,
                'title' => 'Database with Eloquent',
                'content' => 'Working with databases using Eloquent ORM',
                'order' => 3,
            ],
            // React lessons
            [
                'course_id' => $reactCourse->id,
                'title' => 'React Components',
                'content' => 'Learn about React components',
                'order' => 1,
            ],
            [
                'course_id' => $reactCourse->id,
                'title' => 'State Management',
                'content' => 'Managing state in React applications',
                'order' => 2,
            ],
        ];

        foreach ($lessons as $lessonData) {
            Lesson::firstOrCreate(
                [
                    'course_id' => $lessonData['course_id'],
                    'title' => $lessonData['title'],
                ],
                $lessonData
            );
        }


        $student = User::firstOrCreate(
            ['email' => 'test@test'],
            [
                'name' => 'Test Student',
                'password' => Hash::make('1234'),
                'role' => 'student',
                'email_verified_at' => now(),
                'last_login_at' => now()->subMinutes(30),
            ]
        );

        // Enroll student in courses
        $student->courses()->syncWithoutDetaching([
            $laravelCourse->id => [
                'status' => 'in_progress',
                'enrolled_at' => now()->subDays(5),
            ],
            $reactCourse->id => [
                'status' => 'enrolled',
                'enrolled_at' => now()->subDays(2),
            ],
        ]);

        // Create lesson progress for student
        $laravelLessons = $laravelCourse->lessons;
        $reactLessons = $reactCourse->lessons;

        // Complete first Laravel lesson
        LessonProgress::firstOrCreate(
            [
                'user_id' => $student->id,
                'lesson_id' => $laravelLessons->first()->id,
            ],
            [
                'status' => 'completed',
                'is_completed' => true,
                'started_at' => now()->subDays(4),
                'completed_at' => now()->subDays(3),
                'time_spent' => 3600, // 1 hour
            ]
        );

        // In progress second Laravel lesson
        LessonProgress::firstOrCreate(
            [
                'user_id' => $student->id,
                'lesson_id' => $laravelLessons->skip(1)->first()->id,
            ],
            [
                'status' => 'in_progress',
                'is_completed' => false,
                'started_at' => now()->subDays(2),
                'time_spent' => 1800, // 30 minutes
            ]
        );

        // Create some chat messages
        \App\Models\SimpleChatMessage::create([
            'user_id' => $student->id,
            'message' => 'สวัสดีครับ ผมมีคำถามเกี่ยวกับ Laravel',
            'sender_type' => 'user',
            'is_read' => false,
        ]);

        \App\Models\SimpleChatMessage::create([
            'user_id' => $student->id,
            'admin_id' => $admin->id,
            'message' => 'สวัสดีครับ ยินดีให้ความช่วยเหลือครับ',
            'sender_type' => 'admin',
            'is_read' => true,
            'read_at' => now()->subMinutes(10),
        ]);

        $this->command->info('Sidebar test data seeded successfully!');
        $this->command->info('Admin: kk@kk / 1234');
        $this->command->info('Student: test@test / 1234');
    }
}