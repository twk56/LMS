<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student;
    private Course $course;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->student = User::factory()->create(['role' => 'student']);
        $this->course = Course::factory()->create([
            'created_by' => $this->admin->id,
            'status' => 'published',
        ]);
    }

    public function test_admin_can_view_lessons_index(): void
    {
        $response = $this->actingAs($this->admin)->get("/courses/{$this->course->id}/lessons");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('lessons/index')
            ->has('lessons')
            ->has('course')
        );
    }

    public function test_student_can_view_lessons_index(): void
    {
        $response = $this->actingAs($this->student)->get("/courses/{$this->course->id}/lessons");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('lessons/index')
            ->has('lessons')
            ->has('course')
        );
    }

    public function test_admin_can_view_create_lesson_page(): void
    {
        $response = $this->actingAs($this->admin)->get("/courses/{$this->course->id}/lessons/create");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('lessons/create')
            ->has('course')
        );
    }

    public function test_student_cannot_view_create_lesson_page(): void
    {
        $response = $this->actingAs($this->student)->get("/courses/{$this->course->id}/lessons/create");

        $response->assertStatus(403);
    }

    public function test_admin_can_create_lesson(): void
    {
        $lessonData = [
            'title' => 'Test Lesson',
            'content' => 'Test Content',
            'order' => 1,
            'content_type' => 'text',
        ];

        $response = $this->actingAs($this->admin)->post("/courses/{$this->course->id}/lessons", $lessonData);

        $response->assertRedirect("/courses/{$this->course->id}/lessons");
        $this->assertDatabaseHas('lessons', [
            'title' => 'Test Lesson',
            'content' => 'Test Content',
            'order' => 1,
            'content_type' => 'text',
            'course_id' => $this->course->id,
        ]);
    }

    public function test_lesson_creation_requires_validation(): void
    {
        $response = $this->actingAs($this->admin)->post("/courses/{$this->course->id}/lessons", []);

        $response->assertSessionHasErrors(['title', 'content', 'order']);
    }

    public function test_admin_can_view_lesson_details(): void
    {
        $lesson = Lesson::factory()->create([
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->admin)->get("/lessons/{$lesson->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('lessons/show')
            ->has('lesson')
            ->has('course')
        );
    }

    public function test_admin_can_edit_lesson(): void
    {
        $lesson = Lesson::factory()->create([
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->admin)->get("/lessons/{$lesson->id}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('lessons/edit')
            ->has('lesson')
            ->has('course')
        );
    }

    public function test_admin_can_update_lesson(): void
    {
        $lesson = Lesson::factory()->create([
            'course_id' => $this->course->id,
        ]);

        $updateData = [
            'title' => 'Updated Lesson',
            'content' => 'Updated Content',
            'order' => 2,
            'content_type' => 'video',
            'status' => 'published',
        ];

        $response = $this->actingAs($this->admin)->put("/lessons/{$lesson->id}", $updateData);

        $response->assertRedirect("/lessons/{$lesson->id}");
        $this->assertDatabaseHas('lessons', [
            'id' => $lesson->id,
            'title' => 'Updated Lesson',
            'content' => 'Updated Content',
            'order' => 2,
            'content_type' => 'video',
        ]);
    }

    public function test_admin_can_delete_lesson(): void
    {
        $lesson = Lesson::factory()->create([
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/lessons/{$lesson->id}");

        $response->assertRedirect("/lessons");
        $this->assertDatabaseMissing('lessons', ['id' => $lesson->id]);
    }

    public function test_student_can_complete_lesson(): void
    {
        $lesson = Lesson::factory()->create([
            'course_id' => $this->course->id,
            'status' => 'published',
        ]);

        $this->course->students()->attach($this->student->id, ['status' => 'enrolled']);

        $response = $this->actingAs($this->student)->post("/courses/{$this->course->id}/lessons/{$lesson->id}/complete");

        $response->assertRedirect();
        $this->assertDatabaseHas('lesson_progress', [
            'lesson_id' => $lesson->id,
            'user_id' => $this->student->id,
            'completed_at' => now(),
        ]);
    }

    public function test_student_cannot_complete_lesson_without_enrollment(): void
    {
        $lesson = Lesson::factory()->create([
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->student)->post("/courses/{$this->course->id}/lessons/{$lesson->id}/complete");

        $response->assertStatus(403);
    }
}
