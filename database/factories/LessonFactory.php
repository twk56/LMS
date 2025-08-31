<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

class LessonFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'content' => fake()->paragraphs(3, true),
            'order' => fake()->numberBetween(1, 100),
            'content_type' => fake()->randomElement(['text', 'video', 'audio', 'document']),
            'youtube_url' => null,
            'course_id' => Course::factory(),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'updated_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    public function text(): static
    {
        return $this->state(fn (array $attributes) => [
            'content_type' => 'text',
        ]);
    }

    public function video(): static
    {
        return $this->state(fn (array $attributes) => [
            'content_type' => 'video',
            'youtube_url' => 'https://www.youtube.com/watch?v=' . fake()->regexify('[A-Za-z0-9]{11}'),
        ]);
    }

    public function audio(): static
    {
        return $this->state(fn (array $attributes) => [
            'content_type' => 'audio',
        ]);
    }

    public function document(): static
    {
        return $this->state(fn (array $attributes) => [
            'content_type' => 'document',
        ]);
    }
}
