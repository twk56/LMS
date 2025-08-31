<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_are_present(): void
    {
        $response = $this->get('/');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->assertHeader('Content-Security-Policy');
    }

    public function test_csrf_protection_is_enabled(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->post('/courses', [
            'title' => 'Test Course',
            'description' => 'Test Description',
        ]);

        $response->assertStatus(419); // CSRF token mismatch
    }

    public function test_rate_limiting_on_api_endpoints(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        // Make multiple requests to trigger rate limiting
        for ($i = 0; $i < 35; $i++) {
            $response = $this->actingAs($user)->post('/api/upload-image', [
                'image' => 'test',
            ]);
        }

        $response->assertStatus(429); // Too Many Requests
    }

    public function test_sql_injection_protection(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->get('/courses?search=1%27%20OR%201%3D1%20--');

        $response->assertStatus(200);
        // Should not crash or expose data
    }

    public function test_xss_protection(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->post('/courses', [
            'title' => '<script>alert("xss")</script>',
            'description' => 'Test Description',
            'status' => 'published',
            'category_id' => 1,
        ]);

        $response->assertStatus(422); // Validation error
    }

    public function test_file_upload_validation(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->post('/api/upload-image', [
            'image' => 'not_a_file',
        ]);

        $response->assertStatus(422); // Validation error
    }

    public function test_authentication_required_for_protected_routes(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');

        $response = $this->get('/courses');
        $response->assertRedirect('/login');

        $response = $this->get('/settings/profile');
        $response->assertRedirect('/login');
    }

    public function test_authorization_checks(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($student)->get('/courses/create');
        $response->assertStatus(403);

        $response = $this->actingAs($student)->get('/categories/create');
        $response->assertStatus(403);
    }

    public function test_password_validation(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    public function test_email_validation(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_session_security(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertStatus(200);

        // Simulate session expiration
        $this->app['session']->flush();

        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');
    }
}
