<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected CourseCategory $category;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test user
        $this->user = User::factory()->create([
            'role' => 'admin',
        ]);
        
        // Create test categories
        $this->category = CourseCategory::factory()->create([
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);
    }

    public function test_course_creation_endpoint()
    {
        $response = $this->actingAs($this->user)
            ->post('/courses', [
                'title' => 'Test Course',
                'description' => 'Test Description',
                'image' => 'https://example.com/image.jpg',
                'category_option' => 'existing',
                'category_id' => $this->category->id,
                'status' => 'draft',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('courses', [
            'title' => 'Test Course',
            'description' => 'Test Description',
            'created_by' => $this->user->id,
        ]);
    }

    public function test_course_categories_endpoint()
    {
        $response = $this->actingAs($this->user)
            ->get('/courses/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('categories')
        );
    }

    public function test_course_validation()
    {
        $response = $this->actingAs($this->user)
            ->post('/courses', [
                'title' => '', // Missing required field
                'status' => 'invalid_status', // Invalid status
            ]);

        $response->assertSessionHasErrors(['title', 'status']);
    }
}
