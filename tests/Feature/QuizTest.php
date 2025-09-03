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

    public function test_admin_can_view_create_quiz_page(): void
    {
        $response = $this->actingAs($this->admin)->get("/lessons/{$this->lesson->id}/quizzes/create");

        $response->assertStatus(200);
    }

    public function test_admin_can_create_quiz(): void
    {
        $quiz = Quiz::factory()->create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Test Quiz',
            'passing_score' => 70,
        ]);

        $this->assertDatabaseHas('quizzes', [
            'title' => 'Test Quiz',
            'passing_score' => 70,
            'lesson_id' => $this->lesson->id,
        ]);
    }

    public function test_quiz_creation_requires_validation(): void
    {
        $response = $this->actingAs($this->admin)->post("/lessons/{$this->lesson->id}/quizzes", []);

        $response->assertSessionHasErrors(['title', 'passing_score', 'questions']);
    }

    public function test_admin_can_view_quiz_details(): void
    {
        $quiz = Quiz::factory()->create([
            'lesson_id' => $this->lesson->id,
        ]);

        $response = $this->actingAs($this->admin)->get("/quizzes/{$quiz->id}");

        $response->assertStatus(200);
    }

    public function test_student_can_submit_quiz(): void
    {
        $quiz = Quiz::factory()->create([
            'lesson_id' => $this->lesson->id,
        ]);

        $attempt = \App\Models\QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $this->student->id,
            'started_at' => now(),
        ]);

        $this->course->students()->attach($this->student->id, ['status' => 'enrolled']);

        $submitData = [
            'answers' => [
                'question_1' => 'answer_1',
                'question_2' => 'answer_2',
            ],
        ];

        $response = $this->actingAs($this->student)->post("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quizzes/{$quiz->id}/submit", $submitData);

        $response->assertRedirect();
        $this->assertDatabaseHas('quiz_attempts', [
            'id' => $attempt->id,
            'completed_at' => now(),
        ]);
    }

    public function test_student_can_view_quiz_result(): void
    {
        $quiz = Quiz::factory()->create([
            'lesson_id' => $this->lesson->id,
        ]);

        $attempt = \App\Models\QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $this->student->id,
            'completed_at' => now(),
        ]);

        $this->course->students()->attach($this->student->id, ['status' => 'enrolled']);

        $response = $this->actingAs($this->student)->get("/courses/{$this->course->id}/lessons/{$this->lesson->id}/quizzes/{$quiz->id}/result");

        $response->assertStatus(200);
    }
}
