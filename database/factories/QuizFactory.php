<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuizFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'time_limit' => fake()->numberBetween(15, 120),
            'passing_score' => fake()->numberBetween(60, 90),
            'course_id' => Course::factory(),
            'lesson_id' => Lesson::factory(),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'updated_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    public function short(): static
    {
        return $this->state(fn (array $attributes) => [
            'time_limit' => fake()->numberBetween(15, 30),
        ]);
    }

    public function long(): static
    {
        return $this->state(fn (array $attributes) => [
            'time_limit' => fake()->numberBetween(60, 120),
        ]);
    }

    public function easy(): static
    {
        return $this->state(fn (array $attributes) => [
            'passing_score' => fake()->numberBetween(50, 70),
        ]);
    }

    public function hard(): static
    {
        return $this->state(fn (array $attributes) => [
            'passing_score' => fake()->numberBetween(80, 95),
        ]);
    }
}
