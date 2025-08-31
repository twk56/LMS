<?php

namespace Database\Factories;

use App\Models\CourseCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(['draft', 'published', 'archived']),
            'image' => null,
            'created_by' => User::factory(),
            'category_id' => CourseCategory::factory(),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'updated_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
        ]);
    }
}
