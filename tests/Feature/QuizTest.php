<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuizTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student;
    private Course $course;
    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->student = User::factory()->create(['role' => 'student']);
        $this->course = Course::factory()->create([
            'created_by' => $this->admin->id,
            'status' => 'published',
        ]);
        $this->lesson = Lesson::factory()->create([
            'course_id' => $this->course->id,
        ]);
    }

    public function test_admin_can_view_quiz_index(): void
    {
        $response = $this->actingAs($this->admin)->get("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('quizzes/index')
            ->has('quizzes')
            ->has('lesson')
            ->has('course')
        );
    }

    public function test_admin_can_view_create_quiz_page(): void
    {
        $response = $this->actingAs($this->admin)->get("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz/create");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('quizzes/create')
            ->has('lesson')
            ->has('course')
        );
    }

    public function test_student_cannot_view_create_quiz_page(): void
    {
        $response = $this->actingAs($this->student)->get("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz/create");

        $response->assertStatus(403);
    }

    public function test_admin_can_create_quiz(): void
    {
        $quizData = [
            'title' => 'Test Quiz',
            'description' => 'Test Description',
            'time_limit' => 30,
            'passing_score' => 70,
        ];

        $response = $this->actingAs($this->admin)->post("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz", $quizData);

        $response->assertRedirect("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz");
        $this->assertDatabaseHas('quizzes', [
            'title' => 'Test Quiz',
            'description' => 'Test Description',
            'time_limit' => 30,
            'passing_score' => 70,
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
        ]);
    }

    public function test_quiz_creation_requires_validation(): void
    {
        $response = $this->actingAs($this->admin)->post("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz", []);

        $response->assertSessionHasErrors(['title', 'description', 'time_limit', 'passing_score']);
    }

    public function test_admin_can_view_quiz_details(): void
    {
        $quiz = Quiz::factory()->create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
        ]);

        $response = $this->actingAs($this->admin)->get("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz/{$quiz->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('quizzes/show')
            ->has('quiz')
            ->has('lesson')
            ->has('course')
        );
    }

    public function test_student_can_start_quiz(): void
    {
        $quiz = Quiz::factory()->create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
        ]);

        // Enroll student in course first
        $this->course->students()->attach($this->student->id, ['status' => 'enrolled']);

        $response = $this->actingAs($this->student)->post("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz/{$quiz->id}/start");

        $response->assertRedirect("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz/{$quiz->id}");
        $this->assertDatabaseHas('quiz_attempts', [
            'quiz_id' => $quiz->id,
            'user_id' => $this->student->id,
            'started_at' => now(),
        ]);
    }

    public function test_student_cannot_start_quiz_without_enrollment(): void
    {
        $quiz = Quiz::factory()->create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
        ]);

        $response = $this->actingAs($this->student)->post("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz/{$quiz->id}/start");

        $response->assertStatus(403);
    }

    public function test_student_can_submit_quiz(): void
    {
        $quiz = Quiz::factory()->create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
        ]);

        // Enroll student and start quiz
        $this->course->students()->attach($this->student->id, ['status' => 'enrolled']);
        $attempt = $quiz->attempts()->create([
            'user_id' => $this->student->id,
            'started_at' => now(),
        ]);

        $submitData = [
            'answers' => [
                'question_1' => 'answer_1',
                'question_2' => 'answer_2',
            ],
        ];

        $response = $this->actingAs($this->student)->post("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz/{$quiz->id}/submit", $submitData);

        $response->assertRedirect("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz/{$quiz->id}/result");
        $this->assertDatabaseHas('quiz_attempts', [
            'id' => $attempt->id,
            'completed_at' => now(),
        ]);
    }

    public function test_student_can_view_quiz_result(): void
    {
        $quiz = Quiz::factory()->create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
        ]);

        // Enroll student and complete quiz
        $this->course->students()->attach($this->student->id, ['status' => 'enrolled']);
        $attempt = $quiz->attempts()->create([
            'user_id' => $this->student->id,
            'started_at' => now(),
            'completed_at' => now(),
            'score' => 85,
        ]);

        $response = $this->actingAs($this->student)->get("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quiz/{$quiz->id}/result");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('quizzes/result')
            ->has('quiz')
            ->has('attempt')
            ->has('lesson')
            ->has('course')
        );
    }
}
